import React, { useState } from 'react';

interface MessageInputProps {
  onSubmit: (message: string) => void;
  disabled?: boolean;
}

/**
 * Component for message input with submit button
 */
export const MessageInput: React.FC<MessageInputProps> = ({
  onSubmit,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSubmit(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          style={{
            flex: 1,
            padding: '10px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '3px',
          }}
        />
        <button
          type="submit"
          disabled={disabled || !message.trim()}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: disabled || !message.trim() ? '#ccc' : '#1976d2',
            color: '#fff',
            border: 'none',
            borderRadius: '3px',
            cursor: disabled || !message.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </form>
  );
};
