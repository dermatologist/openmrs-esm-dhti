import { renderHook, waitFor } from '@testing-library/react';
import { usePatient } from './usePatient';
import { openmrsFetch } from '@openmrs/esm-framework';

// Mock the dependencies
jest.mock('@openmrs/esm-framework', () => ({
  openmrsFetch: jest.fn(),
  fhirBaseUrl: 'https://example.com/fhir',
}));

jest.mock('swr', () => {
  const originalModule = jest.requireActual('swr');
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn((key, fetcher) => {
      if (!key) {
        return { data: undefined, error: undefined, isLoading: false };
      }
      // Mock implementation that calls the fetcher
      return { data: undefined, error: undefined, isLoading: true };
    }),
  };
});

describe('usePatient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null patient when query is empty', () => {
    const { result } = renderHook(() => usePatient(''));
    
    expect(result.current.patient).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('should construct name search URL when query contains no numbers', () => {
    const useSWR = require('swr').default;
    useSWR.mockImplementation((key: string | null) => {
      if (key) {
        expect(key).toContain('name=John%20Doe');
        expect(key).not.toContain('identifier=');
      }
      return { data: undefined, error: undefined, isLoading: false };
    });

    renderHook(() => usePatient('John Doe'));
  });

  it('should construct identifier search URL when query contains numbers', () => {
    const useSWR = require('swr').default;
    useSWR.mockImplementation((key: string | null) => {
      if (key) {
        expect(key).toContain('identifier=123456');
        expect(key).not.toContain('name=');
      }
      return { data: undefined, error: undefined, isLoading: false };
    });

    renderHook(() => usePatient('123456'));
  });

  it('should return patient data when available', () => {
    const mockPatient = {
      resourceType: 'Patient',
      id: '123',
      name: [{ given: ['John'], family: 'Doe' }],
    };

    const useSWR = require('swr').default;
    useSWR.mockReturnValue({
      data: {
        data: {
          entry: [{ resource: mockPatient }],
        },
      },
      error: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => usePatient('John'));
    
    expect(result.current.patient).toEqual(mockPatient);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle empty entry array', () => {
    const useSWR = require('swr').default;
    useSWR.mockReturnValue({
      data: {
        data: {
          entry: [],
        },
      },
      error: undefined,
      isLoading: false,
    });

    const { result } = renderHook(() => usePatient('Nonexistent'));
    
    expect(result.current.patient).toBeNull();
  });

  it('should handle errors', () => {
    const mockError = new Error('Network error');
    const useSWR = require('swr').default;
    useSWR.mockReturnValue({
      data: undefined,
      error: mockError,
      isLoading: false,
    });

    const { result } = renderHook(() => usePatient('John'));
    
    expect(result.current.patient).toBeNull();
    expect(result.current.error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
  });
});
