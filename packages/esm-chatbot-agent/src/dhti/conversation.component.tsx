import React, { useState } from 'react';
import { useConfig } from '@openmrs/esm-framework';
import { useDhti } from '@openmrs/esm-dhti-utils';
import { ConversationDisplay, Message } from './ConversationDisplay';
import { MessageInput } from './MessageInput';

interface ConversationComponentProps {
    patientUuid: string;
}

/**
 * Conversation component for the conversational UI
 */
const ConversationComponent: React.FC<ConversationComponentProps> = ({ patientUuid }) => {
    const config = useConfig();
    const serviceName = config?.dhtiServiceName || 'dhti_elixir_template';
    const [messages, setMessages] = useState<Message[]>([]);
    const { submitMessage, loading, error } = useDhti();

    const handleSubmit = async (messageContent: string) => {
        // Add user message
        const userMessage: Message = {
            type: 'user',
            content: messageContent,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Submit to service
        const card = await submitMessage(messageContent, serviceName, patientUuid);

        // Add system response
        const systemMessage: Message = {
            type: 'system',
            content: card?.summary || 'No response received',
            card: card || undefined,
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, systemMessage]);
    };

    const handleClear = () => {
        setMessages([]);
    };

    return (
        <div
            style={{
                maxWidth: '800px',
                margin: '20px auto',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
        >
            <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
                {config?.dhtiTitle || 'Healthcare Conversational Interface'}
            </h2>

            <ConversationDisplay messages={messages} />

            {error && (
                <div
                    style={{
                        padding: '10px',
                        marginBottom: '10px',
                        backgroundColor: '#ffebee',
                        color: '#c62828',
                        borderRadius: '3px',
                        fontSize: '14px',
                    }}
                >
                    Error: {error}
                </div>
            )}

            <MessageInput onSubmit={handleSubmit} disabled={loading} />

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <button
                    onClick={handleClear}
                    disabled={loading || messages.length === 0}
                    style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        backgroundColor:
                            loading || messages.length === 0 ? '#ccc' : '#f44336',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '3px',
                        cursor:
                            loading || messages.length === 0 ? 'not-allowed' : 'pointer',
                    }}
                >
                    Clear Conversation
                </button>
                {loading && (
                    <span style={{ fontSize: '14px', color: '#666' }}>
                        Sending message...
                    </span>
                )}
            </div>
        </div>
    );
};

export default ConversationComponent;
