import React from 'react';
import './CopilotScreen.css';
import { useApp } from '@hooks/useApp';

export function CopilotScreen() {
  const { chatHistory, addChatMessage } = useApp();
  const [inputValue, setInputValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      text: inputValue,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMsg);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'demo-user-nepal', message: inputValue }),
      });
      const data = await response.json();
      
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: data.data?.reply || data.reply || 'I could not generate a response.',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Chat error:', error);
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: 'An error occurred while processing your message. Please try again.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen copilot-screen">
      <div className="screen-header">
        <h1 className="screen-title">Talk to AI</h1>
        <p className="screen-subtitle">Your 24/7 mental health companion</p>
      </div>

      <div className="copilot-container">
        <div className="chat-history">
          {chatHistory.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>Start a Conversation</h3>
              <p>I'm here to listen and support you whenever you need.</p>
            </div>
          ) : (
            <div className="messages-list">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`message ${msg.role}`}>
                  <div className="message-avatar">{msg.role === 'user' ? '👤' : '🤖'}</div>
                  <div className="message-content">
                    <p className="message-text">{msg.text}</p>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="message assistant">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <div className="input-wrapper">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="How are you feeling today...?"
              disabled={loading}
              className="chat-input"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="send-btn"
            >
              {loading ? '...' : '📤'}
            </button>
          </div>
          <p className="input-hint">Your conversations are private and encrypted.</p>
        </form>
      </div>
    </div>
  );
}
