## RHOAM Architecture — Non-Negotiable Rules (VC-Grade Standard)

All assistants (Copilot, Gemini, Grok, any future agent) **MUST** obey these rules at all times. Violation of any rule invalidates the entire change and requires a rollback. This document reflects all **145 finalized decisions (ADRs)**.

### I. Machine-to-Machine Communication Standard (Agent Prefix)

1.  Every message from Grok begins with: `GROK here, `
2.  Every message from Gemini begins with: `GEMINI here, `
3.  Every message from GitHub Copilot terminal output begins with: `Copilot Terminal Output: `
4.  No assistant may omit its prefix under any circumstances.
5.  Temperature = 0.0 for all code-related communication. Zero motivational language allowed.

### II. Machine-to-Human Communication Standard (GOLDOVAL Protocol)

1.  The human is addressed exclusively as **GOLDOVAL**.
2.  Before any code block that must be executed, the assistant writes exactly:
    `GOLDOVAL, paste this into <exact location> and press Enter:`
3.  All instructions are optimized for minimum GOLDOVAL keystrokes and clicks (**Least Moves Mandate**).
4.  Clarity always overrides token economy. Never omit context to save tokens.

### III. RHOAM CORE TECHNICAL & SECURITY RULES

These rules implement the **Fail-Safe Structure (Q3.4)**, **Encryption (Q1)**, and **Architecture Isolation (Q6)**.

1.  **Project Branding:** Public strings only: "Cline" → **"RHOAM"**, "cline" → **"rhoam"**. Internal identifiers remain unchanged.
2.  **Core Tooling (Q11.1):** RHOAM Core uses **Zero External Dependencies** for API calls (`native fetch`), encryption (`Node.js crypto`), and file I/O (`Node.js fs`).
3.  **Security (Q1.2, Q5.4):**
    * The master encryption key is derived via **PBKDF2 (600,000 iterations)** from the key stored in the **VS Code Secret Storage API**.
    * Encrypted settings persistence uses the **Atomic Write Strategy (write-to-temp-and-rename)** to prevent file corruption.
    * API keys are obscured in the Settings Grid by defaulting to `type="password"`.
4.  **Error Handling (Q3.3, Q14.2):** If any bot records **3 consecutive fatal errors (401/403/400)**, the RHOAM Core sets its status to `INACTIVE`. The main chat input must then be **disabled** until the error is fixed.
5.  **Build Automation (Q18.1):** The main `compile` script must use **`concurrently`** to automate the separate builds of the Node.js Core and the Svelte Webview.

### IV. RHOAM COUNCIL IMPLEMENTATION SPECIFICATION

This defines the **3x3 Grid** and the strict **Communication Contract (Q13)**.

1.  **Council Configuration:**
    * Maximum 9 bots, fixed configuration slots (0-8).
    * Configuration state is persisted as a single encrypted JSON in `globalStorageUri` key: **`rhoam.config.enc`**.
    * Chat History is stored separately in: **`rhoam.history.json`** (non-encrypted).
2.  **Bot Indexing (Q4.2):** Each bot has an immutable `id` property (`0` through `8`).
3.  **Input/Output Contract (Q4.1):** The response array from the `BotOrchestrator` is **always 9 elements long** and maintains the order **index = botId** (Q4.5).
4.  **Rate Limiting (Q2.2, Q12.1):** The `BotOrchestrator` must instantiate a dedicated **Token Bucket Rate Limiter** instance for *each individual API key* to ensure true concurrency independence.
5.  **Webview UI Visuals (Q16.3):**
    * Each message block must include the bot's immutable color code (HEX value) as metadata.
    * The Webview applies `border-left: 4px solid BOT_COLOR_HEX` based on this color metadata.
6.  **Message Prefix (RETIRED):** The legacy "bot1" prefix system is retired. All rendering is based on the **color metadata** and the **9-element array index**.
7.  **Talking Stick (Retained):** Round-robin is the default. `@0`–`@8` or `@all` overrides from the input box.

### V. File: webview/src/constants/botColors.ts (Single Source of Truth)

This file contains the **canonical, immutable color palette (Q16.1)**.

```ts
// 9 most eye-friendly colors in scientific order
// Source: VS Code token colors + IBM Carbon + 2024 eye-strain studies
export const BOT_COLORS = [
  "#75BEFF", // Soft Sky Blue
  "#79E7B8", // Mint Green
  "#A7EE8C2", // Pale Mint
  "#FFD399", // Soft Peach
  "#FFB3E6", // Light Magenta
  "#C3C3FB", // Lavender
  "#FF9DE6", // Bubblegum Pink
  "#B3E5FC", // Baby Blue
  "#C2F0C2", // Very Light Green
] as const;

export type BotIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // Updated to 0-based
export const getBotColor = (index: BotIndex): string => BOT_COLORS[index]; // Updated to 0-based access
