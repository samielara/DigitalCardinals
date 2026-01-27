/**
 * AI Assistant Logic for Digital Cardinal
 * Powered by a local knowledge base (100% Free)
 */

document.addEventListener("includesLoaded", () => {
  const toggleBtn = document.getElementById("ai-toggle-btn");
  const closeBtn = document.getElementById("ai-close-btn");
  const chatWindow = document.getElementById("ai-chat-window");
  const chatForm = document.getElementById("ai-form");
  const chatInput = document.getElementById("ai-input");
  const messagesContainer = document.getElementById("ai-messages");
  const suggestionBtns = document.querySelectorAll(".suggestion-btn");

  if (!toggleBtn || !chatWindow) return;

  // Toggle Chat Window
  toggleBtn.addEventListener("click", () => {
    chatWindow.classList.toggle("open");
    if (chatWindow.classList.contains("open")) {
      chatInput.focus();
      // Remove notification dot if exists
      const dot = toggleBtn.querySelector("span");
      if (dot) dot.remove();
    }
  });

  closeBtn.addEventListener("click", () => {
    chatWindow.classList.remove("open");
  });

  // Handle Quick Suggestions
  suggestionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.innerText;
      handleUserMessage(text);
    });
  });

  // Handle Form Submit
  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (text) {
      handleUserMessage(text);
      chatInput.value = "";
    }
  });

  // ==========================================
  // VOICE ASSISTANT FEATURES (100% FREE)
  // ==========================================

  const voiceInputBtn = document.getElementById("voice-input-btn");
  const voiceToggleBtn = document.getElementById("voice-toggle-btn");
  const voiceIndicator = document.getElementById("voice-indicator");
  const micPulse = document.getElementById("mic-pulse");

  let voiceEnabled = false;
  let isListening = false;
  let recognition = null;

  // Initialize Speech Recognition (if supported)
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      isListening = true;
      voiceInputBtn.classList.add("!text-cyan", "!border-cyan");
      micPulse.classList.remove("opacity-0");
      chatInput.placeholder = "Listening...";
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
      chatInput.focus();
    };

    recognition.onend = () => {
      isListening = false;
      voiceInputBtn.classList.remove("!text-cyan", "!border-cyan");
      micPulse.classList.add("opacity-0");
      chatInput.placeholder = "Type or speak your question...";
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      isListening = false;
      voiceInputBtn.classList.remove("!text-cyan", "!border-cyan");
      micPulse.classList.add("opacity-0");
      chatInput.placeholder = "Type or speak your question...";

      if (event.error === "not-allowed") {
        alert(
          "Microphone access denied. Please enable microphone permissions in your browser settings."
        );
      }
    };
  } else {
    // Hide voice input button if not supported
    if (voiceInputBtn) voiceInputBtn.style.display = "none";
  }

  // Voice Input Button Click
  if (voiceInputBtn && recognition) {
    voiceInputBtn.addEventListener("click", () => {
      if (isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch (error) {
          console.error("Failed to start recognition:", error);
        }
      }
    });
  }

  // Voice Output Toggle
  if (voiceToggleBtn) {
    voiceToggleBtn.addEventListener("click", () => {
      voiceEnabled = !voiceEnabled;

      if (voiceEnabled) {
        voiceToggleBtn.classList.add("!text-cyan");
        voiceIndicator.classList.remove("opacity-0");
        voiceToggleBtn.querySelector("div").textContent = "Voice On";
        voiceToggleBtn.querySelector("i").className =
          "fas fa-volume-up text-sm";
      } else {
        voiceToggleBtn.classList.remove("!text-cyan");
        voiceIndicator.classList.add("opacity-0");
        voiceToggleBtn.querySelector("div").textContent = "Voice Off";
        voiceToggleBtn.querySelector("i").className =
          "fas fa-volume-mute text-sm";

        // Stop any ongoing speech
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
      }
    });
  }

  // Keyboard Shortcuts
  document.addEventListener("keydown", (e) => {
    // Ctrl+M for microphone
    if (e.ctrlKey && e.key === "m" && chatWindow.classList.contains("open")) {
      e.preventDefault();
      if (voiceInputBtn && recognition) voiceInputBtn.click();
    }

    // Ctrl+S for speaker toggle
    if (e.ctrlKey && e.key === "s" && chatWindow.classList.contains("open")) {
      e.preventDefault();
      if (voiceToggleBtn) voiceToggleBtn.click();
    }
  });

  // Text-to-Speech Function
  function speakText(text) {
    if (!voiceEnabled || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to use a pleasant voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (voice) =>
        voice.name.includes("Google") ||
        voice.name.includes("Microsoft") ||
        voice.lang.startsWith("en")
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      if (voiceToggleBtn) {
        voiceToggleBtn.querySelector("i").className =
          "fas fa-volume-up text-sm animate-pulse";
      }
    };

    utterance.onend = () => {
      if (voiceToggleBtn) {
        voiceToggleBtn.querySelector("i").className =
          "fas fa-volume-up text-sm";
      }
    };

    window.speechSynthesis.speak(utterance);
  }

  function handleUserMessage(text) {
    // Render User Message
    appendMessage("user", text);

    // Show Typing Indicator
    const typingId = appendTypingIndicator();

    // Simulate "Thinking" - Scaled by response length
    const response = getAIResponse(text);
    const delay = Math.min(Math.max(response.length * 5, 800), 2000);

    setTimeout(() => {
      removeTypingIndicator(typingId);
      appendMessage("ai", response);

      // Speak the response if voice is enabled
      speakText(response);
    }, delay);
  }

  function getAIResponse(query) {
    const q = query.toLowerCase();

    // Prioritize specific services over greetings
    let matches = [];

    for (const key in KNOWLEDGE_BASE) {
      if (key === "default") continue;
      const item = KNOWLEDGE_BASE[key];
      if (item.keywords.some((k) => q.includes(k.toLowerCase()))) {
        if (key === "greetings") {
          matches.push({ key, priority: 1, response: item.response });
        } else {
          matches.push({ key, priority: 10, response: item.response });
        }
      }
    }

    if (matches.length > 0) {
      // Sort by priority descending
      matches.sort((a, b) => b.priority - a.priority);
      return matches[0].response;
    }

    return KNOWLEDGE_BASE.default.response;
  }

  function appendMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `flex ${
      sender === "user" ? "justify-end" : "items-start"
    } gap-3 opacity-0 translate-y-2 transition-all duration-300`;

    if (sender === "ai") {
      msgDiv.innerHTML = `
                <div class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                    <img src="assets/images/ai-icons8.png" alt="AI" class="w-full h-full object-contain invert brightness-200 p-1">
                </div>
                <div class="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3 text-sm text-slate-200 max-w-[85%] message-ai">
                    ${text}
                </div>
            `;
    } else {
      msgDiv.innerHTML = `
                <div class="bg-cardinal/20 border border-cardinal/30 rounded-2xl rounded-tr-none p-3 text-sm text-white max-w-[85%] message-user">
                    ${text}
                </div>
            `;
    }

    messagesContainer.appendChild(msgDiv);

    // Wait for next frame to animate
    requestAnimationFrame(() => {
      msgDiv.classList.remove("opacity-0", "translate-y-2");
    });

    // Scroll to bottom
    setTimeout(() => {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }

  function appendTypingIndicator() {
    const id = "typing-" + Date.now();
    const msgDiv = document.createElement("div");
    msgDiv.id = id;
    msgDiv.className = `flex items-start gap-3`;
    msgDiv.innerHTML = `
            <div class="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 mt-1 overflow-hidden">
                <img src="assets/images/ai-icons8.png" alt="AI" class="w-full h-full object-contain invert brightness-200 p-1 animate-pulse">
            </div>
            <div class="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3 text-sm text-slate-400 max-w-[85%] flex gap-1">
                <span class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                <span class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                <span class="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
            </div>
        `;
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return id;
  }

  function removeTypingIndicator(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }
});
