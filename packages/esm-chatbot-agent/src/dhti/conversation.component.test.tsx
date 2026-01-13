import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig } from '@openmrs/esm-framework';
import ConversationComponent from './conversation.component';

// Mock dependencies
jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
}));

jest.mock('@openmrs/esm-dhti-utils', () => ({
  useDhti: jest.fn(() => ({
    submitMessage: jest.fn(),
    loading: false,
    error: null,
  })),
}));

const mockUseConfig = useConfig as jest.MockedFunction<typeof useConfig>;

describe('ConversationComponent', () => {
  const defaultConfig = {
    dhtiTitle: 'Test Chat Interface',
    dhtiServiceName: 'test_service',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConfig.mockReturnValue(defaultConfig);
  });

  it('should render conversation component with title', () => {
    render(<ConversationComponent patientUuid="patient-123" />);

    expect(screen.getByText('Test Chat Interface')).toBeInTheDocument();
  });

  it('should render message input', () => {
    render(<ConversationComponent patientUuid="patient-123" />);

    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
  });

  it('should render clear conversation button', () => {
    render(<ConversationComponent patientUuid="patient-123" />);

    expect(screen.getByRole('button', { name: /clear conversation/i })).toBeInTheDocument();
  });

  it('should disable clear button when there are no messages', () => {
    render(<ConversationComponent patientUuid="patient-123" />);

    const clearButton = screen.getByRole('button', { name: /clear conversation/i });
    expect(clearButton).toBeDisabled();
  });

  it('should use default title when not configured', () => {
    mockUseConfig.mockReturnValue({});
    render(<ConversationComponent patientUuid="patient-123" />);

    expect(screen.getByText('Healthcare Conversational Interface')).toBeInTheDocument();
  });
});
