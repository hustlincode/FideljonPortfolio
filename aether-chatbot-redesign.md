# Chatbot Redesign — "Chat with Aether"

## Overview
Redesign the existing portfolio chatbot ("Chat with Fildejon") into **"Chat with Aether"** — a named AI assistant persona that engages leads and potential clients in conversation, learns what they need, and communicates my approach and expertise as an AI Software Engineer.

---

## 1. Branding Changes

| Element | Current | New |
|---|---|---|
| Chat header/title | "Chat with Fildejon" | **"Chat with Aether"** |
| Assistant name | Fildejon (implied as me) | **Aether** — my named AI Assistant |
| User avatar/icon | (existing/default) | Use current site favicon: `favicon-v2.svg` |

### Icon Implementation Notes
- Use `favicon-v2.svg` as the **user-facing avatar icon** for the assistant in the chat widget (chat bubble icon, header icon, and/or message avatar next to Aether's replies).
- Ensure the SVG scales cleanly at small sizes (e.g., 24px–40px) typically used for chat avatars — verify no clipping or loss of detail.
- Maintain existing favicon usage elsewhere (browser tab, etc.) — this is an *additional* usage, not a replacement of its original purpose.

---

## 2. Renaming Tasks (Codebase)
- [ ] Update all UI copy/strings from `"Chat with Fildejon"` → `"Chat with Aether"`
- [ ] Rename any internal variables/components referencing the old bot name (e.g., `FildejonBot`, `chatbotName`, etc.) to `Aether` where applicable, for code clarity
- [ ] Update system prompt / persona name used in the AI backend to `Aether`
- [ ] Update any greeting message to introduce itself as Aether (see sample greeting below)

---

## 3. Chatbot Purpose & Persona

Aether should act as a **conversational lead-qualifier and portfolio guide** — not just an FAQ bot. Its goals:

1. **Engage visitors** in natural conversation to understand who they are and what they're looking for (recruiter, client, collaborator, fellow dev, etc.)
2. **Represent me accurately** — my skills, experience, and engineering philosophy — by answering questions about my background
3. **Surface my approach to AI Software Engineering**, specifically around system design/architecture standards and practical AI usage in daily engineering work
4. **Qualify leads** — gently ask questions back to understand the visitor's needs (project type, timeline, role, etc.) so I can follow up meaningfully

---

## 4. Sample Conversation Starters / Prompts

Aether should be able to initiate or respond to prompts like:

- "Tell me about yourself" → Should give a concise, personable summary of who I am, my role, and specialties
- "What do you do?" → Should explain my work as an AI Software Engineer in plain terms
- "What's your approach to system design and architecture?" → Should explain standards-based/methodical approach (see Section 5)
- "How do you use AI in your work?" → Should explain daily AI usage for developing and maintaining systems, and building AI integrations (see Section 6)
- "Can you help with [project type]?" → Should transition into lead-qualifying questions (e.g., "What kind of project are you working on?", "What's your timeline?", "Are you looking for a specific tech stack?")

Aether should also **proactively ask visitors** simple qualifying questions if the conversation goes quiet or after an intro, e.g.:
- "What brings you here today — are you exploring a project, hiring, or just browsing?"
- "What kind of system or product are you working on?"

---

## 5. Context: System Design & Architecture Approach

Aether should be able to explain that as an AI Software Engineer, I follow a **standards-based approach** to system design and architecture, which may include (customize/expand as needed):

- Following established architectural patterns (e.g., clean architecture, microservices vs. monolith trade-offs, domain-driven design) rather than ad-hoc solutions
- Designing for scalability, maintainability, and observability from the start
- Documenting decisions (e.g., ADRs — Architecture Decision Records) so systems remain understandable as they grow
- Balancing pragmatism with best practices — choosing the right level of complexity for the problem at hand
- Applying consistent standards across projects (naming conventions, API design, error handling, testing strategy)

> **Note to self:** Flesh out specifics here — e.g., preferred architecture patterns, tools (Docker, CI/CD, cloud providers), and any personal frameworks/checklists used when starting a new system design.

---

## 6. Context: AI Usage in Daily Engineering Work

Aether should communicate that AI isn't just a buzzword for me — it's actively integrated into daily engineering work:

- **Development & maintenance** — Using AI tools (e.g., Claude, Copilot, etc.) to accelerate coding, debugging, refactoring, and maintaining existing systems
- **Leveraging AI through integrations** — Building useful AI-powered integrations into products/systems (not just using AI as a coding assistant, but embedding AI capabilities into the systems being built)
- **Practical, not hype-driven** — Framing AI as a tool that improves engineering velocity and system capability, grounded in real daily use rather than trend-chasing

> **Note to self:** Add specific examples/case studies here if available — e.g., "Built an AI-powered [feature] for [project]" — to make this concrete and credible rather than generic.

---

## 7. Sample Greeting Message (Draft)

> "Hey, I'm **Aether** — Fildejon's AI Assistant. I can tell you about his background, how he approaches system design and architecture, or how he uses AI in his day-to-day engineering work. What would you like to know?"

---

## 8. Open Questions / To Decide
- [ ] Should Aether persist conversation history per visitor session, or reset each visit?
- [ ] Should Aether capture lead info (name/email) if the conversation signals strong interest, and if so, how (inline form vs. asking conversationally)?
- [ ] Tone: professional, casual-professional, or more playful/personality-driven?
- [ ] Should there be quick-reply buttons for common questions (e.g., "Tell me about yourself", "System design approach", "How do you use AI") to reduce typing friction?

---

## 9. Visual Theme & Interaction Trends (2026)

Based on current (2026) chatbot UI/UX research, the redesign will adopt three core design directions: **Glassmorphism**, **Capability Transparency**, and **Personalization/Context-Awareness**. Below is how each should be implemented for Aether.

### 9.1 Glassmorphism (Visual Theme)

A frosted-glass aesthetic — soft blur, translucency, and subtle layering — paired with a dark theme for a premium, modern feel that fits an AI-Software-Engineer portfolio.

**Implementation notes:**
- Chat window background: semi-transparent panel (e.g., `rgba(20, 20, 30, 0.6)`–`0.75` range) with `backdrop-filter: blur(16px–24px)`
- Thin, subtle border (`1px solid rgba(255,255,255,0.08–0.15)`) to define the glass edge
- Soft drop shadow for depth (`box-shadow: 0 8px 32px rgba(0,0,0,0.25)`)
- Accent color (brand/portfolio primary color) used sparingly — e.g., glowing border on the launcher button, gradient on Aether's message bubbles, or a soft glow behind the Aether avatar
- Message bubbles: 
  - **Aether's messages** — glass-panel style bubble (translucent, blurred), left-aligned, with the `favicon-v2.svg` avatar
  - **User's messages** — solid or slightly more opaque bubble, right-aligned, to visually distinguish from Aether without breaking the glass theme
- Dark mode should be the default state of the widget (regardless of the rest of the portfolio's theme), since glassmorphism reads best against dark backgrounds
- Keep it subtle — avoid overusing blur/transparency to the point of hurting text legibility or accessibility (contrast ratios must still meet WCAG AA)

### 9.2 Capability Transparency

Aether should clearly communicate **what it can and can't help with** right from the first interaction, instead of an open-ended "Ask me anything."

**Implementation notes:**
- **Opening message** should briefly state Aether's purpose (see Section 7 greeting) *plus* a short capability list or suggested-prompt chips, e.g.:
  - "Tell me about Fildejon"
  - "System design & architecture approach"
  - "How AI is used day-to-day"
- Avoid vague framing — Aether should not imply it can do things outside its scope (e.g., booking calls, accessing external systems) unless that's actually built
- If Aether doesn't understand a query or it's out of scope, it should **gracefully redirect** rather than give a generic "I don't understand," e.g.:
  - "I'm best at answering questions about Fildejon's background, engineering approach, and AI experience — want to ask about one of those, or would you rather leave a message for a direct follow-up?"
- Optional: a persistent small label/badge near the header (e.g., "AI Assistant" or "Powered by AI") so visitors always know they're talking to an AI, reinforcing trust

### 9.3 Personalization / Context-Awareness

Aether should adapt the conversation based on **who the visitor seems to be** and **what they're trying to do**, rather than giving the same static flow to everyone.

**Implementation notes:**
- **Visitor-type branching** — Early in the conversation (via the opening prompts or a quick question), determine if the visitor is a:
  - Recruiter / hiring manager
  - Potential client (project-based work)
  - Fellow developer / collaborator
  - Just browsing
  
  Then adapt tone and follow-up questions accordingly (e.g., a recruiter gets asked about role type/seniority; a client gets asked about project scope/timeline)

- **Contextual suggested prompts** — Suggested-prompt chips can update dynamically based on the conversation so far (e.g., after Aether explains the system-design approach, offer a follow-up chip like "See a project example" or "What tools does he use?")

- **Session memory (within a visit)** — Aether should remember earlier answers within the same session so it doesn't re-ask the same qualifying questions (e.g., if the visitor already said they're a client, don't ask again later in the conversation)

- **Light personalization touches** (optional, based on scope/budget):
  - Time-of-day-aware greeting (e.g., "Good evening!")
  - Returning-visitor recognition within the same session/browser (e.g., "Welcome back!") — no persistent cross-session tracking unless explicitly wanted (privacy consideration)

### 9.4 Summary Direction

| Principle | Core Idea | Key Deliverable |
|---|---|---|
| Glassmorphism | Frosted-glass, dark-mode-first visual theme | Blurred translucent panels, subtle borders/glow, favicon-based Aether avatar |
| Capability Transparency | Visitor always knows what Aether can/can't do | Clear intro + suggested prompts + graceful fallback messaging |
| Personalization/Context-Awareness | Conversation adapts to visitor type & flow | Visitor-type branching, dynamic follow-up prompts, in-session memory |

---

## 10. Rate Limiting (Abuse Prevention)

Since Aether is powered by an AI API (token-based cost per request), the portfolio needs rate limiting to prevent visitors — accidental or malicious — from abusing it and running up costs or degrading service for other visitors.

### 10.1 Goals
- Prevent a single visitor (or bot/script) from spamming Aether with excessive requests
- Protect against cost blowouts from API usage
- Keep the experience smooth for legitimate visitors while blocking abuse
- Fail gracefully — visitors should get a clear, friendly message when limited, not a broken widget

### 10.2 Suggested Rate Limit Layers

**1. Per-session / per-visitor limits (primary layer)**
- Limit number of messages per visitor within a time window, e.g.:
  - **X messages per minute** (e.g., 5–10/min) — stops rapid-fire spam
  - **X messages per session/day** (e.g., 30–50/day) — stops sustained abuse from one visitor
- Identify visitors via a combination of:
  - Session/browser identifier (e.g., cookie or `localStorage`-based session ID) — lightweight, no login required
  - IP address (server-side) — as a backstop, since session IDs can be cleared/reset

**2. Global rate limit (secondary/safety layer)**
- A site-wide cap on total Aether requests per time window (e.g., X requests/minute across all visitors) to protect against coordinated abuse or unexpected traffic spikes
- Acts as a circuit breaker — if hit, Aether can temporarily show a "high traffic, please try again shortly" message

**3. Message length / input validation**
- Cap max input length per message (e.g., 500–1000 characters) to prevent oversized prompts from inflating token usage
- Optionally cap max conversation length (e.g., after N exchanges, prompt visitor to leave contact info for a direct follow-up instead of continuing indefinitely)

**4. Cooldown / backoff on limit hit**
- When a visitor hits the rate limit, show a clear in-chat message (not a silent failure), e.g.:
  - "You've reached the message limit for now — feel free to try again in a few minutes, or [leave your contact info] and Fildejon will follow up directly."
- Consider a short exponential backoff or fixed cooldown period (e.g., 1–5 minutes) before the visitor can send more messages

### 10.3 Implementation Notes
- Enforce rate limits **server-side** (e.g., in the backend/API route that proxies requests to the AI API) — never rely on client-side checks alone, since those can be bypassed
- Store rate-limit counters in a lightweight store suited to the hosting setup (e.g., in-memory store for low traffic, or Redis/Upstash for serverless/edge environments where state needs to persist across function invocations)
- Log/monitor rate-limit hits to spot patterns (e.g., a single IP repeatedly maxing out) for future blocking if abuse continues
- Consider combining with basic bot-detection (e.g., simple honeypot field, or requiring a minimal interaction like clicking "open chat" before the first message is accepted) to filter out non-human traffic before it reaches the API

### 10.4 Suggested Starting Limits — Adjusted for Google Gemini Free Tier

Since Aether runs on the **Google Gemini API free tier**, limits should be set well below Google's actual quota ceilings. As of 2026, Gemini's free tier (Flash models — the practical choice for this use case, since Pro models were moved to paid-only in April 2026) is generally reported around:

- **~10–15 requests per minute (RPM)**
- **~250,000 tokens per minute (TPM)**
- **~250–1,500 requests per day (RPD)**, depending on the specific Flash model and current Google policy

> ⚠️ Google adjusts these numbers periodically without much notice (they were cut significantly in December 2025 and again in April 2026), and exact figures vary by model and region. **Always check the live numbers in Google AI Studio** rather than relying on this table — the values below are deliberately conservative so the widget stays safely under quota even if Google tightens limits further.

| Limit Type | Suggested Value (Gemini Free Tier) | Purpose |
|---|---|---|
| Messages per minute (per visitor) | 2 | Well under the ~10–15 RPM ceiling even with a few concurrent visitors |
| Messages per session/day (per visitor) | 10 | Prevents one visitor from consuming a large share of the daily RPD cap |
| Global requests per minute (site-wide) | 8 | Hard ceiling below Gemini's RPM limit, leaving buffer for retries/latency |
| Global requests per day (site-wide) | ~150–200 (≈70–80% of the lowest expected RPD tier) | Leaves headroom below the daily cap so Aether doesn't go dark for the rest of the day |
| Max message length | 300–500 characters | Keeps individual requests small — helps stay under TPM and reduces output token usage |
| Max conversation length before redirect | 6–8 exchanges, then prompt to leave contact info | Limits how much of the daily/session quota one conversation can consume |
| Cooldown after limit hit | 5–10 minutes | Matches Gemini's rolling-window RPM reset behavior |

**Gemini-specific notes:**
- Use a **Flash or Flash-Lite model** (not Pro) for the free tier — Pro was removed from free access in April 2026 and now requires billing.
- Gemini enforces limits across **three dimensions simultaneously** — RPM, TPM, and RPD. Exceeding *any one* triggers a `429 RESOURCE_EXHAUSTED` error, so the app should catch 429s and show Aether's friendly "reached today's limit" fallback message (Section 10.2/10.3) rather than a broken widget.
- RPD limits typically **reset on a fixed daily schedule** (commonly around midnight Pacific Time) — track your daily counter against that reset window, not local time.
- Implement **exponential backoff** (e.g., 1s → 2s → 4s → 8s) when retrying after a 429 from an RPM/TPM hit, since these are short-window limits that clear quickly — but don't retry RPD (daily quota) errors, since those won't clear until the next reset.
- Free-tier Gemini usage may have prompts/responses used by Google to improve their models — worth a quick mention in a privacy note if visitors share personal info during the chat.
- Since your exact quota depends on the specific Flash model and account status, confirm the live numbers in **Google AI Studio → your project → rate limits** before finalizing the table above, and adjust the global RPM/RPD values to sit comfortably below what's actually shown there.

> **Note to self:** Log into Google AI Studio, check the exact RPM/TPM/RPD numbers for the specific Gemini model in use, and tighten or loosen the global limits above accordingly before implementation.
