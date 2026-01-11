import React from 'react';
import { CDSHookCard } from '../models/card';

export interface Message {
  type: 'user' | 'system';
  content: string;
  card?: CDSHookCard;
  timestamp: Date;
}

interface ConversationDisplayProps {
  messages: Message[];
}

/**
 * Component to display conversation messages
 */
export const ConversationDisplay: React.FC<ConversationDisplayProps> = ({
  messages,
}) => {
  return (
    <div
      style={{
        border: '1px solid #ccc',
        padding: '10px',
        height: '400px',
        overflowY: 'auto',
        marginBottom: '10px',
        backgroundColor: '#f9f9f9',
      }}
    >
      {messages.length === 0 ? (
        <p style={{ color: '#999', textAlign: 'center' }}>
          No messages yet. Start a conversation!
        </p>
      ) : (
        messages.map((message, index) => (
          <div
            key={index}
            style={{
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: message.type === 'user' ? '#e3f2fd' : '#f1f8e9',
              borderRadius: '5px',
            }}
          >
            <div
              style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}
            >
              <strong>{message.type === 'user' ? 'You' : 'System'}</strong>{' '}
              <span>{message.timestamp.toLocaleTimeString()}</span>
            </div>
            <div style={{ fontSize: '14px' }}>{message.content}</div>
            {message.card && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#fff',
                  border: '1px solid #ddd',
                  borderRadius: '3px',
                }}
              >
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {message.card.summary}
                </div>
                {message.card.detail && (
                  <div style={{ fontSize: '13px', marginBottom: '5px' }}>
                    {message.card.detail}
                  </div>
                )}
                {message.card.indicator && (
                  <div
                    style={{
                      fontSize: '12px',
                      color:
                        message.card.indicator === 'hard-stop'
                          ? '#d32f2f'
                          : message.card.indicator === 'warning'
                          ? '#f57c00'
                          : '#1976d2',
                      fontWeight: 'bold',
                    }}
                  >
                    {message.card.indicator.toUpperCase()}
                  </div>
                )}
                {message.card.source && (
                  <div
                    style={{
                      fontSize: '12px',
                      marginTop: '5px',
                      color: '#666',
                    }}
                  >
                    Source: {message.card.source.label}
                    {message.card.source.url && (
                      <a
                        href={message.card.source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ marginLeft: '5px' }}
                      >
                        (link)
                      </a>
                    )}
                  </div>
                )}
                {message.card.links && message.card.links.length > 0 && (
                  <div style={{ marginTop: '5px' }}>
                    {message.card.links.map((link, idx) => (
                      <div key={idx}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ fontSize: '12px', color: '#1976d2' }}
                        >
                          {link.label}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};
