import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

// 🟢 DEMO FIX: Bulletproof URL Sanitizer
// This removes duplicate paths if they were accidentally added in the .env.local file
const rawUrl = process.env.NEXT_PUBLIC_AI_URL || "http://localhost:8000";
const cleanBaseUrl = rawUrl.replace(/\/api\/v1\/chat\/?$/, "").replace(/\/$/, "");
const API_PREFIX = "/api/v1/chat";
const TARGET_URL = `${cleanBaseUrl}${API_PREFIX}`;

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState("");

  // 1. INITIALIZE SESSION
  useEffect(() => {
    let id = localStorage.getItem('hry_sarah_session');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('hry_sarah_session', id);
    }
    setSessionId(id);
    fetchWelcome(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. FETCH PROACTIVE WELCOME
  const fetchWelcome = async (id) => {
    setIsTyping(true);
    try {
      const res = await fetch(`${TARGET_URL}/welcome`, {
        headers: { 'x-session-id': id }
      });
      
      // Catch 404/500 errors before they create empty bubbles
      if (!res.ok) throw new Error(`Backend returned status: ${res.status}`);

      const data = await res.json();
      
      setMessages([{
        id: 'welcome',
        // 🟢 CRITICAL FIX: Ensure text is never undefined
        text: data.response || "Hi! I'm Sarah, your digital mortgage assistant. How can I help you today?",
        isBot: true,
        intent: data.intent || "proactive_welcome",
        timestamp: new Date()
      }]);
      setSuggestions(data.recommendations || []);
    } catch (err) {
      console.error("Sarah connection error:", err);
      setMessages([{
        id: 'error_welcome',
        text: "Hi! I'm currently disconnected from my intelligence engine. Please ensure the backend server is running.",
        isBot: true,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 3. SEND MESSAGE & HANDLE PDF
  const sendMessage = useCallback(async (text) => {
    // Add User Message immediately
    const userMsg = { text, isBot: false, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setSuggestions([]);

    try {
      const res = await fetch(`${TARGET_URL}/message`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-session-id': sessionId 
        },
        body: JSON.stringify({ message: text })
      });

      // Catch 404/500 errors
      if (!res.ok) throw new Error(`Backend returned status: ${res.status}`);

      const data = await res.json();

      // Add Sarah's Response
      setMessages(prev => [...prev, {
        id: Date.now(),
        // 🟢 CRITICAL FIX: Ensure text is never undefined
        text: data.response || "I processed your request, but the text response was empty.",
        isBot: true,
        file_url: data.file_url,
        intent: data.intent || "general", // 🟢 Fallback intent
        timestamp: new Date()
      }]);
      
      setSuggestions(data.recommendations || []);
    } catch (err) {
      console.error("Message send error:", err);
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: "I'm sorry, I couldn't reach the server. Please check your connection or backend terminal.",
        isBot: true,
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [sessionId]);

  return { messages, suggestions, isTyping, sendMessage, sessionId };
};