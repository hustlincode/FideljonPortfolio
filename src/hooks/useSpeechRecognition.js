import { useState, useRef, useCallback, useEffect } from "react";

const getSpeechRecognition = () => {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
};

const useSpeechRecognition = ({ lang = "en-US" } = {}) => {
  const SpeechRecognition = getSpeechRecognition();
  const isSupported = !!SpeechRecognition;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const shouldListenRef = useRef(false);
  // refs to avoid stale closure in onend
  const transcriptRef = useRef("");
  const interimRef = useRef("");
  const restartTimeoutRef = useRef(null);
  const networkRetryCountRef = useRef(0);
  const MAX_NETWORK_RETRIES = 1;

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);
  useEffect(() => {
    interimRef.current = interimTranscript;
  }, [interimTranscript]);

  const resetTranscript = useCallback(() => {
    transcriptRef.current = "";
    interimRef.current = "";
    networkRetryCountRef.current = 0;
    setTranscript("");
    setInterimTranscript("");
    setError(null);
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldListenRef.current = false;
    networkRetryCountRef.current = 0;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
    const rec = recognitionRef.current;
    if (rec) {
      try {
        rec.stop();
      } catch {}
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError("not-supported");
      return;
    }
    const rec = recognitionRef.current;
    if (!rec) {
      setError("not-supported");
      return;
    }
    // secure context check
    if (typeof window !== "undefined" && window.isSecureContext === false) {
      setError("not-allowed");
      console.warn("[STT] Insecure context - mic requires HTTPS or localhost");
      return;
    }

    resetTranscript();
    shouldListenRef.current = true;
    setError(null);
    try {
      rec.lang = lang;
      // console.debug("[STT] start", lang);
      rec.start();
    } catch (e) {
      console.warn("[STT] start error", e);
      if (e?.name === "InvalidStateError") {
        try { rec.abort(); } catch {}
        try { rec.stop(); } catch {}
        restartTimeoutRef.current = setTimeout(() => {
          if (shouldListenRef.current) {
            try {
              rec.lang = lang;
              rec.start();
            } catch (err) {
              setError(err?.name || "unknown");
              setIsListening(false);
            }
          }
        }, 250);
      } else {
        setError(e?.name || "unknown");
        shouldListenRef.current = false;
      }
    }
  }, [isSupported, lang, resetTranscript]);

  useEffect(() => {
    if (!isSupported) return undefined;

    const RecCtor = getSpeechRecognition();
    if (!RecCtor) return undefined;

    const recognition = new RecCtor();
    // half-duplex: single utterance then auto-stop, but we handle interim promotion
    // keep continuous false for true push-to-talk; onend restart logic keeps mic open if needed
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = lang;

    recognition.onstart = () => {
      // console.debug("[STT] onstart");
      networkRetryCountRef.current = 0;
      setIsListening(true);
      setError(null);
    };

    recognition.onaudiostart = () => {
      // console.debug("[STT] onaudiostart");
    };

    recognition.onspeechstart = () => {
      // console.debug("[STT] onspeechstart");
    };

    recognition.onend = () => {
      // console.debug("[STT] onend", { shouldListen: shouldListenRef.current, transcript: transcriptRef.current, interim: interimRef.current });
      setIsListening(false);
      // B1 fix: if ended with only interim (no final), promote interim to transcript so hybrid can send
      if (transcriptRef.current === "" && interimRef.current.trim() !== "") {
        const promoted = interimRef.current.trim();
        transcriptRef.current = promoted;
        setTranscript(promoted);
        setInterimTranscript("");
      }
      // If user still wants listening (tapped mic but got no-speech / quick end), keep mic open once
      // Prevent "suddenly stops" on brief silence: auto-restart once if no transcript yet and no hard error
      if (
        shouldListenRef.current &&
        transcriptRef.current === "" &&
        interimRef.current === "" &&
        !restartTimeoutRef.current
      ) {
        // Allow one auto-restart for no-speech case; hard errors (not-allowed/audio-capture) already set shouldListen false
        restartTimeoutRef.current = setTimeout(() => {
          restartTimeoutRef.current = null;
          if (shouldListenRef.current && transcriptRef.current === "") {
            try {
              recognition.lang = lang;
              recognition.start();
              // console.debug("[STT] auto-restart after empty end");
            } catch (e) {
              // ignore
            }
          }
        }, 300);
      } else {
        // user has transcript -> keep shouldListen false so auto-send can fire
        // hybrid effect watches transcript && !isListening
        if (transcriptRef.current !== "") {
          shouldListenRef.current = false;
        }
      }
    };

    recognition.onerror = (event) => {
      // console.warn("[STT] onerror", event.error, event.message);
      const err = event.error || "unknown";
      // no-speech is not fatal - keep shouldListen true to allow retry via onend
      if (err === "no-speech") {
        setError("no-speech");
        // let onend handle promotion / restart; do not hard stop
        return;
      }
      if (err === "aborted") {
        // aborted due to stop() call - ignore
        setIsListening(false);
        return;
      }
      if (err === "network") {
        const online = typeof navigator !== "undefined" ? navigator.onLine : true;
        console.warn("[STT] network error", { online, error: event.error, message: event.message, retry: networkRetryCountRef.current });
        // silent retry once before surfacing error to UI - prevents Chatbot loop
        if (online && shouldListenRef.current && networkRetryCountRef.current < MAX_NETWORK_RETRIES && !restartTimeoutRef.current) {
          networkRetryCountRef.current += 1;
          console.warn(`[STT] silent retry ${networkRetryCountRef.current}/${MAX_NETWORK_RETRIES} after network error`);
          restartTimeoutRef.current = setTimeout(() => {
            restartTimeoutRef.current = null;
            if (shouldListenRef.current) {
              try {
                recognition.lang = lang;
                recognition.start();
                // do not setError yet - keep UI clean until final failure
              } catch (e) {
                console.warn("[STT] retry failed", e);
                shouldListenRef.current = false;
                setError("network");
                setIsListening(false);
              }
            }
          }, 1000);
          // keep shouldListen true for retry, do NOT setError network yet (prevents Chatbot message loop)
          setIsListening(false);
          return;
        }
        // final failure after retries
        networkRetryCountRef.current = 0;
        setError("network");
        setIsListening(false);
        shouldListenRef.current = false;
        if (restartTimeoutRef.current) {
          clearTimeout(restartTimeoutRef.current);
          restartTimeoutRef.current = null;
        }
        return;
      }
      setError(err);
      setIsListening(false);
      shouldListenRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript || "";
        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }
      // console.debug("[STT] onresult", { finalText, interimText });
      if (finalText) {
        const trimmed = finalText.trim();
        networkRetryCountRef.current = 0;
        transcriptRef.current = transcriptRef.current ? `${transcriptRef.current} ${trimmed}`.trim() : trimmed;
        setTranscript(transcriptRef.current);
        interimRef.current = "";
        setInterimTranscript("");
      } else if (interimText) {
        networkRetryCountRef.current = 0;
        interimRef.current = interimText;
        setInterimTranscript(interimText);
      }
    };

    recognition.onspeechend = () => {
      // console.debug("[STT] onspeechend");
      // let onend handle promotion
    };

    recognitionRef.current = recognition;

    return () => {
      shouldListenRef.current = false;
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      try { recognition.stop(); } catch {}
      try { recognition.abort(); } catch {}
      recognitionRef.current = null;
    };
  }, [isSupported, lang]);

  // update lang live if prop changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = lang;
    }
  }, [lang]);

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};

export default useSpeechRecognition;
