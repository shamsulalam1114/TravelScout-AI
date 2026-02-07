import React, { useState, useRef, useEffect, useCallback } from "react";
import { sendChatMessage } from "../utils/api";
import { useThemeMode } from "../context/ThemeContext";
import {
  FaRobot,
  FaTimes,
  FaPaperPlane,
  FaTrash,
  FaCompass,
  FaUtensils,
  FaMoneyBillWave,
  FaInfoCircle,
} from "react-icons/fa";

const QUICK_PROMPTS = [
  { icon: <FaCompass />, text: "Top places to visit in Paris" },
  { icon: <FaUtensils />, text: "Best local food in Tokyo" },
  { icon: <FaMoneyBillWave />, text: "Budget travel tips for Europe" },
  { icon: <FaInfoCircle />, text: "Travel safety tips for solo travelers" },
];

const ChatBot = () => {
  const { mode } = useThemeMode();
  const darkMode = mode === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setError(null);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: m.content,
      }));
      const data = await sendChatMessage(trimmed, history);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || data.response },
      ]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const handleQuickPrompt = async (text) => {
    if (isTyping) return;
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    setError(null);

    try {
      const data = await sendChatMessage(text, []);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || data.response },
      ]);
    } catch (err) {
      setError(err.message);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Simple markdown-like rendering
  const renderContent = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, i) => {
      // Bold
      let processed = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      // Bullet points
      if (processed.match(/^[\s]*[-•*]\s/)) {
        processed = processed.replace(/^[\s]*[-•*]\s/, "");
        return (
          <div key={i} className="chat-bullet">
            <span className="bullet-dot">•</span>
            <span dangerouslySetInnerHTML={{ __html: processed }} />
          </div>
        );
      }
      // Numbered list
      if (processed.match(/^[\s]*\d+\.\s/)) {
        return (
          <div key={i} className="chat-bullet">
            <span dangerouslySetInnerHTML={{ __html: processed }} />
          </div>
        );
      }
      // Empty line
      if (!processed.trim()) return <br key={i} />;
      return (
        <p
          key={i}
          className="chat-para"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    });
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        className={`chatbot-toggle ${isOpen ? "open" : ""} ${
          darkMode ? "dark" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open AI travel assistant"}
      >
        {isOpen ? <FaTimes /> : <FaRobot />}
        {!isOpen && <span className="chatbot-badge">AI</span>}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`chatbot-window ${darkMode ? "dark" : ""}`}>
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <FaRobot className="chatbot-header-icon" />
              <div>
                <h3>TravelScout AI</h3>
                <span className="chatbot-status">
                  <span className="status-dot" />
                  Powered by Gemini Pro
                </span>
              </div>
            </div>
            <div className="chatbot-header-actions">
              <button onClick={clearChat} title="Clear chat" aria-label="Clear chat">
                <FaTrash />
              </button>
              <button onClick={() => setIsOpen(false)} title="Close" aria-label="Close chat">
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.length === 0 && (
              <div className="chatbot-welcome">
                <div className="welcome-icon">
                  <FaRobot />
                </div>
                <h4>Hi! I'm your AI Travel Assistant</h4>
                <p>
                  Ask me anything about travel destinations, tips, local
                  cuisines, budgets, or safety advice!
                </p>
                <div className="quick-prompts">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      className="quick-prompt-btn"
                      onClick={() => handleQuickPrompt(prompt.text)}
                    >
                      {prompt.icon}
                      <span>{prompt.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="msg-avatar">
                    <FaRobot />
                  </div>
                )}
                <div className="msg-bubble">{renderContent(msg.content)}</div>
              </div>
            ))}

            {isTyping && (
              <div className="chat-message assistant">
                <div className="msg-avatar">
                  <FaRobot />
                </div>
                <div className="msg-bubble typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            {error && (
              <div className="chat-error">
                <FaInfoCircle /> {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about travel..."
              rows={1}
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="send-btn"
              aria-label="Send message"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
