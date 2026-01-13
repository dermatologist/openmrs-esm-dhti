import { renderHook, act, waitFor } from '@testing-library/react';
import { useDhti } from './useDhti';
import { useConfig } from '@openmrs/esm-framework';
import axios from 'axios';

// Mock dependencies
jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
}));

jest.mock('axios');

const mockUseConfig = useConfig as jest.MockedFunction<typeof useConfig>;
const mockAxios = axios as jest.Mocked<typeof axios>;

describe('useDhti', () => {
  const mockConfig = {
    dhtiRoute: 'https://example.com/dhti-service',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConfig.mockReturnValue(mockConfig);
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDhti());
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.submitMessage).toBe('function');
  });

  it('should handle successful submission with cards array', async () => {
    const mockCard = {
      summary: 'Test summary',
      detail: 'Test detail',
      indicator: 'info' as const,
    };

    mockAxios.post.mockResolvedValueOnce({
      data: {
        cards: [mockCard],
      },
    });

    const { result } = renderHook(() => useDhti());

    let response;
    await act(async () => {
      response = await result.current.submitMessage('Test message', 'test_service', 'patient-123');
    });

    expect(response).toBeDefined();
    expect(response?.summary).toBe('Test summary');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockAxios.post).toHaveBeenCalledWith(
      'https://example.com/dhti-service',
      expect.objectContaining({
        input: expect.any(Object),
        config: {},
        kwargs: {},
      })
    );
  });

  it('should handle successful submission with direct card', async () => {
    const mockCard = {
      summary: 'Direct card summary',
      detail: 'Direct card detail',
    };

    mockAxios.post.mockResolvedValueOnce({
      data: mockCard,
    });

    const { result } = renderHook(() => useDhti());

    let response;
    await act(async () => {
      response = await result.current.submitMessage('Test message');
    });

    expect(response).toBeDefined();
    expect(response?.summary).toBe('Direct card summary');
    expect(result.current.loading).toBe(false);
  });

  it('should return null when response has no cards or summary', async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: {},
    });

    const { result } = renderHook(() => useDhti());

    let response;
    await act(async () => {
      response = await result.current.submitMessage('Test message');
    });

    expect(response).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle errors from axios', async () => {
    const mockError = {
      response: {
        data: {
          message: 'Server error',
        },
      },
    };

    mockAxios.post.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useDhti());

    let response;
    await act(async () => {
      response = await result.current.submitMessage('Test message');
    });

    expect(response).toBeNull();
    expect(result.current.error).toBe('Server error');
    expect(result.current.loading).toBe(false);
  });

  it('should handle generic errors', async () => {
    const mockError = new Error('Network error');

    mockAxios.post.mockRejectedValueOnce(mockError);

    const { result } = renderHook(() => useDhti());

    let response;
    await act(async () => {
      response = await result.current.submitMessage('Test message');
    });

    expect(response).toBeNull();
    expect(result.current.error).toBe('Network error');
  });

  it('should set loading state during submission', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockAxios.post.mockReturnValueOnce(promise as any);

    const { result } = renderHook(() => useDhti());

    act(() => {
      result.current.submitMessage('Test message');
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!({
        data: { summary: 'Done' },
      });
      await promise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('should use default service name when not provided', async () => {
    mockAxios.post.mockResolvedValueOnce({
      data: { summary: 'Test' },
    });

    const { result } = renderHook(() => useDhti());

    await act(async () => {
      await result.current.submitMessage('Test message');
    });

    const callArgs = mockAxios.post.mock.calls[0][1];
    expect(callArgs.input.input.context.input).toBe('Test message');
  });
});
