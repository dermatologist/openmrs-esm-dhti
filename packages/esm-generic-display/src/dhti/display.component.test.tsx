import React from 'react';
import { render, screen } from '@testing-library/react';
import { useConfig } from '@openmrs/esm-framework';
import { useDhti } from '@openmrs/esm-dhti-utils';
import DisplayWidget from './display.component';

// Mock dependencies
jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
}));

jest.mock('@openmrs/esm-dhti-utils', () => ({
  useDhti: jest.fn(),
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: undefined,
    error: undefined,
    isLoading: false,
  })),
}));

const mockUseConfig = useConfig as jest.MockedFunction<typeof useConfig>;
const mockUseDhti = useDhti as jest.MockedFunction<typeof useDhti>;

describe('DisplayWidget', () => {
  const defaultConfig = {
    dhtiTitle: 'Test Display Widget',
    dhtiServiceName: 'test_display_service',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConfig.mockReturnValue(defaultConfig);
    mockUseDhti.mockReturnValue({
      submitMessage: jest.fn().mockResolvedValue({ summary: 'AI analysis result' }),
      loading: false,
      error: null,
    });
  });

  it('should render display widget', () => {
    render(<DisplayWidget patientUuid="patient-123" />);

    expect(screen.getByText('Test Display Widget')).toBeInTheDocument();
  });

  it('should use default title when not configured', () => {
    mockUseConfig.mockReturnValue({});
    render(<DisplayWidget patientUuid="patient-123" />);

    expect(screen.getByText('GenAI Interpretation')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    mockUseDhti.mockReturnValue({
      submitMessage: jest.fn(),
      loading: true,
      error: null,
    });

    render(<DisplayWidget patientUuid="patient-123" />);

    expect(screen.getByText('Generating insights...')).toBeInTheDocument();
  });

  it('should show error state', () => {
    mockUseDhti.mockReturnValue({
      submitMessage: jest.fn(),
      loading: false,
      error: 'Failed to load',
    });

    render(<DisplayWidget patientUuid="patient-123" />);

    expect(screen.getByText(/error: failed to load/i)).toBeInTheDocument();
  });
});
