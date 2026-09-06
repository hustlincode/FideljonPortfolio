import { useState, useRef, useCallback, useEffect } from "react";

const TTS_STORAGE_KEY = "aether_tts_muted";

const stripForSpeech = (text) => {
  if (!text) return "";
  return text
    .replace(/\*\*.*?\*\*/g, (m) => m.replace(/\*/g, ""))
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[#*_`>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
};

const loadMuted = () => {
  try {
    const raw = window.localStorage.getItem(TTS_STORAGE_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
  } catch {}
  return false; // C1 unmuted by default
};

const saveMuted = (val) => {
  try {
    window.localStorage.setItem(TTS_STORAGE_KEY, String(val));
  } catch {}
};

const useSpeechSynthesis = () => {
  const isSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMutedState] = useState(() => {
    if (!isSupported) return true;
    try { return loadMuted(); } catch { return false; }
  });
  const [voices, setVoices] = useState([]);
  const utteranceRef = useRef(null);

  useEffect(() => {
    if (!isSupported) return undefined;
    const synth = window.speechSynthesis;
    const loadVoices = () => setVoices(synth.getVoices() || []);
    loadVoices();
    // Chrome loads voices async
    if (typeof synth.onvoiceschanged !== "undefined") {
      synth.onvoiceschanged = loadVoices;
    }
    window.addEventListener("voiceschanged", loadVoices);
    return () => window.removeEventListener("voiceschanged", loadVoices);
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) return;
    saveMuted(isMuted);
    if (isMuted) {
      try { window.speechSynthesis.cancel(); } catch {}
      setIsSpeaking(false);
    }
  }, [isMuted, isSupported]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {}
    setIsSpeaking(false);
    utteranceRef.current = null;
  }, [isSupported]);

  const setIsMuted = useCallback((val) => {
    const next = typeof val === "function" ? val(isMuted) : !!val;
    setIsMutedState(next);
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMutedState((prev) => {
      const next = !prev;
      saveMuted(next);
      if (next) {
        try { window.speechSynthesis.cancel(); } catch {}
        setIsSpeaking(false);
      }
      return next;
    });
  }, []);

  const speak = useCallback((text) => {
    if (!isSupported || isMuted) return;
    const clean = stripForSpeech(text);
    if (!clean) return;

    // barge-in: cancel previous
    try { window.speechSynthesis.cancel(); } catch {}

    const utterance = new window.SpeechSynthesisUtterance(clean);
    utteranceRef.current = utterance;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.lang = "en-US";

    // Prefer natural Google voice if available
    if (voices.length > 0) {
      const preferred =
        voices.find((v) => /Google US English/i.test(v.name) && v.lang.startsWith("en")) ||
        voices.find((v) => v.lang === "en-US" && /Female|Google|Natural/i.test(v.name)) ||
        voices.find((v) => v.lang.startsWith("en-US")) ||
        voices.find((v) => v.lang.startsWith("en")) ||
        null;
      if (preferred) utterance.voice = preferred;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, [isSupported, isMuted, voices]);

  // cleanup on unmount: stop speaking
  useEffect(() => () => {
    try { window.speechSynthesis.cancel(); } catch {}
  }, []);

  return {
    isSupported,
    isSpeaking,
    isMuted,
    voices,
    speak,
    cancel,
    setIsMuted,
    toggleMute,
  };
};

export default useSpeechSynthesis;
