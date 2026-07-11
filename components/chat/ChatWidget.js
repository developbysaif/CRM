'use client';
import { useState } from 'react';
import ChatInterface from './ChatInterface';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-widget-window">
          <ChatInterface />
        </div>
      )}
      <button
        className="chat-widget-btn"
        onClick={() => setOpen(o => !o)}
        title={open ? 'Close AI Assistant' : 'Talk to AI Business Consultant'}
      >
        <span style={{ fontSize: 26, transition: 'transform 0.3s', transform: open ? 'rotate(45deg)' : 'none', display: 'block' }}>
          {open ? '✕' : '🤖'}
        </span>
      </button>
    </div>
  );
}
