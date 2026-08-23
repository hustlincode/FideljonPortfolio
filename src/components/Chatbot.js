import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ThreeDots } from "react-loader-spinner";
import { FaArrowRight, FaTimes } from "react-icons/fa";
import aetherAvatar from "../Assets/aether-avatar.svg";
import chatbotData from "../config/chatbotConfig.json";
import "../Chatbot.css";

import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/genai";

const BOT_NAME = "Aether";
const OWNER_NAME = "Fildejon";
const MODEL = "gemini-3.6-flash";

const LIMITS = {
  PER_MINUTE: 2,
  PER_DAY: 10,
  COOLDOWN_MS: 5 * 60 * 1000,
  MAX_CHARS: 500,
  MAX_EXCHANGES: 8,
};

const RL_STORAGE_KEY = "aether_rate_limits";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadLimitState = () => {
  const today = new Date().toDateString();
  try {
    const raw = JSON.parse(window.localStorage.getItem(RL_STORAGE_KEY)) || {};
    const sameDay = raw.day === today;
    return {
      day: today,
      dayCount: sameDay ? raw.dayCount || 0 : 0,
      timestamps: Array.isArray(raw.timestamps) ? raw.timestamps : [],
      blockedUntil: typeof raw.blockedUntil === "number" ? raw.blockedUntil : 0,
    };
  } catch {
    return { day: today, dayCount: 0, timestamps: [], blockedUntil: 0 };
  }
};

const saveLimitState = (state) => {
  try {
    window.localStorage.setItem(RL_STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning!";
  if (h < 18) return "Good afternoon!";
  return "Good evening!";
};

const detectVisitorType = (text) => {
  const t = text.toLowerCase();
  if (/\b(hire|hiring|recruit|recruiting|vacanc|job|position|role|opportunit|resume|\bcv\b)\w*\b/.test(t)) return "recruiter";
  if (/(\bmy|\bour|\ba new|\ban existing)\b.{0,24}\b(project|website|web ?app|app|application|system|platform|saas|tool)\b/.test(t)) return "client";
  if (/\b(budget|quote|quotation|proposal|pricing|rates?|freelance|consult)\w*\b/.test(t)) return "client";
  if (/\b(collaborat|open.?source|contribute|team.?up|partner)\w*\b/.test(t)) return "developer";
  if (/just (browsing|looking around|exploring)|nothing specific/.test(t)) return "browsing";
  return null;
};

const detectTopics = (text) => {
  const t = text.toLowerCase();
  const topics = [];
  if (/\b(about|background|experience|career|who is|introduce|yourself)\b/.test(t)) topics.push("about");
  if (/\b(design|architect|approach|standards?)\b/.test(t)) topics.push("design");
  if (/\bai\b|artificial intelligence|day.to.day|automation/.test(t)) topics.push("ai");
  return topics;
};

const isRateLimitError = (error) =>
  error?.status === 429 ||
  String(error?.message || "").includes("429") ||
  String(error?.message || "").includes("RESOURCE_EXHAUSTED") ||
  String(error?.message || "").toLowerCase().includes("quota");

let aiClient = null;
const getAiClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.REACT_APP_GEMINI_API_KEY });
  }
  return aiClient;
};

const ChatBot = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [visitorType, setVisitorType] = useState(null);
  const [coveredTopics, setCoveredTopics] = useState([]);
  const [projectScopeAsked, setProjectScopeAsked] = useState(false);
  const [, setCooldownTick] = useState(0);

  const messagesEndRef = useRef(null);
  const historyRef = useRef([]);
  const limitRef = useRef(loadLimitState());
  const nudgedRef = useRef(false);
  const visitorTypeRef = useRef(null);
  const coveredRef = useRef([]);

  const greetingText = useMemo(
    () =>
      `${getTimeGreeting()} I'm ${BOT_NAME} — ${OWNER_NAME}'s AI Assistant. I can tell you about his background, how he approaches system design and architecture, or how he uses AI in his day-to-day engineering work. What would you like to know?`,
    []
  );

  const [messages, setMessages] = useState([{ sender: "bot", text: greetingText }]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const interval = setInterval(() => {
      const remaining = limitRef.current.blockedUntil - Date.now();
      if (remaining <= 0 && limitRef.current.blockedUntil !== 0) {
        limitRef.current.blockedUntil = 0;
        saveLimitState(limitRef.current);
      }
      setCooldownTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const toggleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setClosing(false);
    }, 300);
  };

  const goToContact = (e) => {
    e.preventDefault();
    toggleClose();
    if (window.location.pathname !== "/") {
      navigate("/");
    }
    setTimeout(() => {
      const el = document.getElementById("contact");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.hash = "#contact";
      }
    }, 400);
  };

  const exchangeCount = messages.filter((m) => m.sender === "user").length;

  const buildSystemInstruction = () => {
    const known = [];
    if (visitorTypeRef.current) known.push(`Visitor type: ${visitorTypeRef.current} (do not ask their type again — adapt to it instead)`);
    if (coveredRef.current.includes("design")) known.push("Already explained the system design & architecture approach — don't repeat unless asked");
    if (coveredRef.current.includes("ai")) known.push("Already explained AI usage in daily work — don't repeat unless asked");
    if (coveredRef.current.includes("about")) known.push("Already introduced Fildejon's background — don't repeat unless asked");

    return `
${chatbotData.system_instruction_template}

--- SYSTEM DESIGN & ARCHITECTURE APPROACH (explain when asked, in Aether's own voice about Fildejon) ---
${chatbotData.system_design_approach.map((point) => `- ${point}`).join("\n")}

--- HOW FILDEJON USES AI IN DAILY ENGINEERING WORK ---
- ${chatbotData.ai_usage_philosophy.summary}
- ${chatbotData.ai_usage_philosophy.development_maintenance}
- ${chatbotData.ai_usage_philosophy.integrations}
- ${chatbotData.ai_usage_philosophy.stance}

--- QUALIFYING QUESTIONS BY VISITOR TYPE (use naturally, one at a time) ---
Recruiter: ${chatbotData.qualifying_questions.recruiter.join(" | ")}
Client: ${chatbotData.qualifying_questions.client.join(" | ")}
Developer: ${chatbotData.qualifying_questions.developer.join(" | ")}
Browsing: ${chatbotData.qualifying_questions.browsing.join(" | ")}

--- KNOWN CONTEXT ABOUT THIS VISITOR ---
${known.length > 0 ? known.join("\n") : "Nothing yet — learn naturally through conversation."}

--- FACTUAL DATA (your single source of truth; never contradict or invent beyond this) ---
Summary: ${chatbotData.professional_summary}
Info: ${JSON.stringify(chatbotData.personal_info)}
Skillset: ${JSON.stringify(chatbotData.skillset)}
Career: ${JSON.stringify(chatbotData.career_journey)}
Projects: ${JSON.stringify(chatbotData.projects)}
Contributions: ${JSON.stringify(chatbotData.contributions)}
Traits: ${JSON.stringify(chatbotData.personal_traits)}
`.trim();
  };

  const config = {
    topP: 1,
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ],
    systemInstruction: buildSystemInstruction(),
  };

  const addMessage = (sender, text, link) => {
    setMessages((prev) => [...prev, link ? { sender, text, link } : { sender, text }]);
  };

  const checkRateLimit = () => {
    const now = Date.now();
    const state = limitRef.current;
    if (state.blockedUntil && state.blockedUntil > now) {
      return { ok: false, reason: "cooldown", until: state.blockedUntil };
    }
    if (state.day !== new Date().toDateString()) {
      limitRef.current = { ...loadLimitState(), day: new Date().toDateString(), dayCount: 0 };
    }
    const current = limitRef.current;
    current.timestamps = current.timestamps.filter((t) => now - t < 60000);
    if (current.timestamps.length >= LIMITS.PER_MINUTE) {
      current.blockedUntil = now + LIMITS.COOLDOWN_MS;
      saveLimitState(current);
      return { ok: false, reason: "minute" };
    }
    if (current.dayCount >= LIMITS.PER_DAY) {
      return { ok: false, reason: "day" };
    }
    return { ok: true };
  };

  const recordMessageSent = () => {
    const state = limitRef.current;
    const today = new Date().toDateString();
    if (state.day !== today) {
      state.day = today;
      state.dayCount = 0;
      state.timestamps = [];
    }
    state.timestamps.push(Date.now());
    state.dayCount += 1;
    saveLimitState(state);
  };

  const updateProfileFromMessage = (text) => {
    const detectedType = detectVisitorType(text);
    if (detectedType && !visitorTypeRef.current) {
      visitorTypeRef.current = detectedType;
      setVisitorType(detectedType);
    }
    const topics = detectTopics(text).filter((t) => !coveredRef.current.includes(t));
    if (topics.length > 0) {
      coveredRef.current = [...coveredRef.current, ...topics];
      setCoveredTopics(coveredRef.current);
    }
  };

  const maybeNudgeContact = () => {
    if (nudgedRef.current || exchangeCount < LIMITS.MAX_EXCHANGES) return;
    nudgedRef.current = true;
    addMessage(
      "bot",
      `We've covered a lot! If you'd like a direct answer from ${OWNER_NAME} himself, leave your details in the contact form below or email him directly.`,
      { href: "#contact", label: "Go to contact form" }
    );
  };

  const sendToGemini = async (userInput) => {
    setIsTyping(true);
    historyRef.current.push({ role: "user", parts: [{ text: userInput }] });

    let reply = "";
    let started = false;
    let attempt = 0;

    const appendChunk = (chunkText) => {
      reply += chunkText;
      const snapshot = reply;
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { sender: "bot", text: snapshot };
        return next;
      });
    };

    while (true) {
      try {
        const contents = historyRef.current.slice(-16);
        const stream = await getAiClient().models.generateContentStream({
          model: MODEL,
          config,
          contents,
        });

        for await (const chunk of stream) {
          if (!chunk.text) continue;
          if (!started) {
            started = true;
            setIsTyping(false);
            addMessage("bot", "");
          }
          appendChunk(chunk.text);
        }

        if (!started) {
          setIsTyping(false);
          addMessage(
            "bot",
            `I'm best at answering questions about ${OWNER_NAME}'s background, engineering approach, and AI experience — want to ask about one of those?`
          );
        } else {
          historyRef.current.push({ role: "model", parts: [{ text: reply }] });
          maybeNudgeContact();
        }
        setIsTyping(false);
        return;
      } catch (error) {
        if (isRateLimitError(error) && attempt < 3) {
          attempt += 1;
          await sleep(1000 * 2 ** (attempt - 1));
          continue;
        }
        console.error("Error talking to Gemini:", error);
        setIsTyping(false);
        if (isRateLimitError(error)) {
          addMessage(
            "bot",
            "Aether's hit today's message limit — thanks for understanding! Feel free to come back later, or leave your details and Fildejon will follow up directly.",
            { href: "#contact", label: "Leave your details" }
          );
        } else {
          addMessage("bot", "Oops! Something went wrong on my end. Mind trying that again?");
        }
        return;
      }
    }
  };

  const sendMessage = (rawText) => {
    const text = (typeof rawText === "string" ? rawText : input).trim();
    if (!text || isTyping) return;
    if (text.length > LIMITS.MAX_CHARS) return;
    if (!isOpen) return;

    const gate = checkRateLimit();
    if (!gate.ok) {
      if (gate.reason === "cooldown") {
        const mins = Math.ceil((gate.until - Date.now()) / 60000);
        addMessage("bot", `You've reached the message limit for now — try again in ~${mins} more minute${mins === 1 ? "" : "s"}, or reach Fildejon via the contact form and he'll follow up directly.`);
      } else if (gate.reason === "minute") {
        addMessage("bot", "You're sending those fast! Give me about 5 minutes to catch up — or use the contact form below and Fildejon will get back to you directly.");
      } else {
        addMessage(
          "bot",
          "You've reached today's message limit — I really appreciate the great conversation though! Leave your contact info below and Fildejon will be happy to continue this personally.",
          { href: "#contact", label: "Leave your details" }
        );
      }
      setInput("");
      return;
    }

    recordMessageSent();

    if (/^(web app \/ website project|ai integration project|something else)$/i.test(text)) {
      setProjectScopeAsked(true);
    }

    updateProfileFromMessage(text);
    addMessage("user", text);
    setInput("");
    sendToGemini(text);
  };

  const getSuggestions = () => {
    if (!isOpen || isTyping) return [];
    const ex = exchangeCount;
    if (ex >= LIMITS.MAX_EXCHANGES + 1) return [];

    if (ex === 0 && !visitorType) {
      return chatbotData.conversation_starters.map((s) => s.label);
    }
    if (visitorType === "client" && !projectScopeAsked) {
      return chatbotData.follow_up_prompts.client;
    }
    for (const topic of ["design", "ai", "about"]) {
      if (coveredTopics.includes(topic)) {
        return chatbotData.follow_up_prompts[topic];
      }
    }
    if (!visitorType && ex > 0) {
      return ["I'm hiring", "I need a project built", "Just exploring"];
    }
    if (visitorType && chatbotData.qualifying_questions[visitorType]) {
      return chatbotData.qualifying_questions[visitorType].slice(0, 3);
    }
    return [];
  };

  const suggestions = getSuggestions();
  const cooldownActive = limitRef.current.blockedUntil > Date.now();
  const inputDisabled = cooldownActive;

  return (
    <>
      <button
        className={`chat-toggle ${isOpen ? "is-open" : ""}`}
        onClick={() => {
          if (isOpen) toggleClose();
          else setIsOpen(true);
        }}
        aria-label={isOpen ? "Close chat with Aether" : "Open chat with Aether"}
      >
        <img src={aetherAvatar} alt="" className="chat-toggle-avatar" />
        {isOpen ? "Hide Aether" : "Chat with Aether"}
      </button>

      {isOpen && (
        <div className={`chat-window ${closing ? "fade-out" : "fade-in"}`} role="dialog" aria-label={`Chat with ${BOT_NAME}`}>
          <div className="chat-header">
            <div className="chat-header-profile">
              <img src={aetherAvatar} alt={`${BOT_NAME} avatar`} className="bot-avatar" />
              <div className="chat-header-info">
                <h5>Chat with {BOT_NAME}</h5>
                <span className="status">
                  <span className="online-dot"></span> Online · AI Assistant · Powered by Gemini
                </span>
              </div>
            </div>
            <button className="close-btn" onClick={toggleClose} aria-label="Close chat">
              <FaTimes />
            </button>
          </div>

          <div className="chat-body" aria-live="polite">
            {messages.map((msg, idx) => {
              const isBot = msg.sender === "bot";
              return (
                <div key={idx} className={`message ${msg.sender}`}>
                  <div className="message-name">
                    {isBot && <img src={aetherAvatar} alt="" className="message-avatar" />}
                    <span>{isBot ? BOT_NAME : "You"}</span>
                  </div>
                  <div className={`message-text ${isBot ? "left" : "right"}`}>
                    {msg.text}
                    {msg.link && (
                      <a href={msg.link.href} className="message-link" onClick={goToContact}>
                        {msg.link.label}
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="message bot">
                <img src={aetherAvatar} alt="" className="message-avatar" />
                <div className="message-text typing">
                  <ThreeDots height="15" width="30" radius="9" color="#f5f5f3" />
                </div>
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="suggestion-row">
                {suggestions.map((label) => (
                  <button
                    key={label}
                    className="suggestion-chip"
                    onClick={() => sendMessage(label)}
                    disabled={inputDisabled}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-footer">
            <input
              type="text"
              placeholder={inputDisabled ? "Cooling down — try again shortly..." : `Ask ${BOT_NAME} anything...`}
              value={input}
              maxLength={LIMITS.MAX_CHARS}
              disabled={inputDisabled}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              aria-label="Message"
            />
            <button onClick={() => sendMessage()} disabled={inputDisabled || !input.trim()} aria-label="Send message">
              <FaArrowRight />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
