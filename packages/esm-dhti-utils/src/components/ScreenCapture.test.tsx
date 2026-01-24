import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScreenCapture, type ScreenCaptureResult } from './ScreenCapture';
import html2canvas from 'html2canvas';

// Mock html2canvas
jest.mock('html2canvas');

const mockHtml2canvas = html2canvas as jest.MockedFunction<typeof html2canvas>;

describe('ScreenCapture', () => {
  let onCaptureMock: jest.Mock;
  let onCancelMock: jest.Mock;

  beforeEach(() => {
    onCaptureMock = jest.fn();
    onCancelMock = jest.fn();
    jest.clearAllMocks();

    // Mock canvas context
    const mockContext = {
      drawImage: jest.fn(),
      fillStyle: '',
      fillRect: jest.fn(),
      fillText: jest.fn(),
      font: '',
    };

    HTMLCanvasElement.prototype.getContext = jest.fn(() => mockContext) as any;
    HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,mockImageData');

    // Mock html2canvas to return a mock canvas
    const mockCanvas = document.createElement('canvas');
    mockCanvas.width = 1024;
    mockCanvas.height = 768;
    mockHtml2canvas.mockResolvedValue(mockCanvas);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Component rendering', () => {
    it('should not render when isActive is false', () => {
      const { container } = render(
        <ScreenCapture isActive={false} onCapture={onCaptureMock} />
      );
      
      expect(container.querySelector('.screen-capture-overlay')).not.toBeInTheDocument();
    });

    it('should render overlay when isActive is true', () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      expect(overlay).toBeInTheDocument();
    });

    it('should render with custom className', () => {
      const { container } = render(
        <ScreenCapture 
          isActive={true} 
          onCapture={onCaptureMock} 
          className="custom-class"
        />
      );
      
      const overlay = container.querySelector('.screen-capture-overlay.custom-class');
      expect(overlay).toBeInTheDocument();
    });

    it('should render children when provided', () => {
      render(
        <ScreenCapture isActive={true} onCapture={onCaptureMock}>
          <div data-testid="custom-child">Custom Content</div>
        </ScreenCapture>
      );
      
      expect(screen.getByTestId('custom-child')).toBeInTheDocument();
    });
  });

  describe('Rectangle selection', () => {
    it('should start selection on mouse down', () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      fireEvent.mouseDown(overlay!, { button: 0, clientX: 100, clientY: 100 });
      
      // Selection should be visible
      const selection = overlay!.querySelector('.screen-capture-selection');
      expect(selection).toBeInTheDocument();
    });

    it('should update selection on mouse move', () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      // Mock getBoundingClientRect
      overlay!.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        right: 1024,
        bottom: 768,
        width: 1024,
        height: 768,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));
      
      fireEvent.mouseDown(overlay!, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(overlay!, { clientX: 200, clientY: 200 });
      
      const selection = overlay!.querySelector('.screen-capture-selection') as HTMLElement;
      expect(selection).toBeInTheDocument();
      expect(selection.style.left).toBe('100px');
      expect(selection.style.top).toBe('100px');
      expect(selection.style.width).toBe('100px');
      expect(selection.style.height).toBe('100px');
    });

    it('should not start selection on right mouse button', () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      fireEvent.mouseDown(overlay!, { button: 2, clientX: 100, clientY: 100 });
      
      const selection = overlay!.querySelector('.screen-capture-selection');
      expect(selection).not.toBeInTheDocument();
    });
  });

  describe('Screen capture', () => {
    it('should capture selected area on mouse up', async () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      // Mock getBoundingClientRect
      overlay!.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        right: 1024,
        bottom: 768,
        width: 1024,
        height: 768,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));
      
      fireEvent.mouseDown(overlay!, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(overlay!, { clientX: 200, clientY: 200 });
      fireEvent.mouseUp(overlay!, { clientX: 200, clientY: 200 });
      
      await waitFor(() => {
        expect(onCaptureMock).toHaveBeenCalled();
      });
      
      const result: ScreenCaptureResult = onCaptureMock.mock.calls[0][0];
      expect(result.type).toBe('image-data');
      expect(result.imageData).toBe('data:image/png;base64,mockImageData');
      expect(result.error).toBeUndefined();
    });

    it('should handle small selection area error', async () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      // Mock getBoundingClientRect
      overlay!.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        right: 1024,
        bottom: 768,
        width: 1024,
        height: 768,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));
      
      // Select a small area (less than 10x10 pixels)
      fireEvent.mouseDown(overlay!, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(overlay!, { clientX: 105, clientY: 105 });
      fireEvent.mouseUp(overlay!, { clientX: 105, clientY: 105 });
      
      await waitFor(() => {
        expect(onCaptureMock).toHaveBeenCalled();
      });
      
      const result: ScreenCaptureResult = onCaptureMock.mock.calls[0][0];
      expect(result.type).toBe('image-data');
      expect(result.error).toContain('too small');
    });

    it('should handle html2canvas error', async () => {
      mockHtml2canvas.mockRejectedValueOnce(new Error('Canvas error'));
      
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      // Mock getBoundingClientRect
      overlay!.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        right: 1024,
        bottom: 768,
        width: 1024,
        height: 768,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));
      
      fireEvent.mouseDown(overlay!, { button: 0, clientX: 100, clientY: 100 });
      fireEvent.mouseMove(overlay!, { clientX: 200, clientY: 200 });
      fireEvent.mouseUp(overlay!, { clientX: 200, clientY: 200 });
      
      await waitFor(() => {
        expect(onCaptureMock).toHaveBeenCalled();
      });
      
      const result: ScreenCaptureResult = onCaptureMock.mock.calls[0][0];
      expect(result.type).toBe('image-data');
      expect(result.error).toBeTruthy();
    });
  });

  describe('Image URL extraction', () => {
    it('should extract URL from img element on right-click', () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      // Create a mock img element
      const img = document.createElement('img');
      img.src = 'https://example.com/image.png';
      overlay!.appendChild(img);
      
      fireEvent.contextMenu(img);
      
      expect(onCaptureMock).toHaveBeenCalled();
      const result: ScreenCaptureResult = onCaptureMock.mock.calls[0][0];
      expect(result.type).toBe('image-url');
      expect(result.imageUrl).toBe('https://example.com/image.png');
      expect(result.error).toBeUndefined();
    });

    it('should extract URL from element with background-image', () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      // Create a mock div with background image
      const div = document.createElement('div');
      div.style.backgroundImage = 'url("https://example.com/background.png")';
      overlay!.appendChild(div);
      
      // Mock window.getComputedStyle
      window.getComputedStyle = jest.fn(() => ({
        backgroundImage: 'url("https://example.com/background.png")',
      })) as any;
      
      fireEvent.contextMenu(div);
      
      expect(onCaptureMock).toHaveBeenCalled();
      const result: ScreenCaptureResult = onCaptureMock.mock.calls[0][0];
      expect(result.type).toBe('image-url');
      expect(result.imageUrl).toBe('https://example.com/background.png');
      expect(result.error).toBeUndefined();
    });

    it('should handle no image found error on right-click', () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      // Mock window.getComputedStyle to return no background image
      window.getComputedStyle = jest.fn(() => ({
        backgroundImage: 'none',
      })) as any;
      
      fireEvent.contextMenu(overlay!);
      
      expect(onCaptureMock).toHaveBeenCalled();
      const result: ScreenCaptureResult = onCaptureMock.mock.calls[0][0];
      expect(result.type).toBe('image-url');
      expect(result.error).toContain('No image found');
    });

    it('should handle img element with no src', () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      // Create a mock img element without src
      const img = document.createElement('img');
      overlay!.appendChild(img);
      
      fireEvent.contextMenu(img);
      
      expect(onCaptureMock).toHaveBeenCalled();
      const result: ScreenCaptureResult = onCaptureMock.mock.calls[0][0];
      expect(result.type).toBe('image-url');
      expect(result.error).toContain('No valid image URL found');
    });
  });

  describe('Keyboard interactions', () => {
    it('should cancel on Escape key', () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} onCancel={onCancelMock} />);
      
      fireEvent.keyDown(window, { key: 'Escape' });
      
      expect(onCancelMock).toHaveBeenCalled();
    });

    it('should not trigger cancel when isActive is false', () => {
      const { rerender } = render(
        <ScreenCapture isActive={true} onCapture={onCaptureMock} onCancel={onCancelMock} />
      );
      
      rerender(<ScreenCapture isActive={false} onCapture={onCaptureMock} onCancel={onCancelMock} />);
      
      fireEvent.keyDown(window, { key: 'Escape' });
      
      expect(onCancelMock).not.toHaveBeenCalled();
    });

    it('should handle missing onCancel callback', () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      // Should not throw error
      expect(() => {
        fireEvent.keyDown(window, { key: 'Escape' });
      }).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle selection with negative dimensions', async () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      // Mock getBoundingClientRect
      overlay!.getBoundingClientRect = jest.fn(() => ({
        left: 0,
        top: 0,
        right: 1024,
        bottom: 768,
        width: 1024,
        height: 768,
        x: 0,
        y: 0,
        toJSON: () => {},
      }));
      
      // Select from bottom-right to top-left (negative direction)
      fireEvent.mouseDown(overlay!, { button: 0, clientX: 200, clientY: 200 });
      fireEvent.mouseMove(overlay!, { clientX: 100, clientY: 100 });
      fireEvent.mouseUp(overlay!, { clientX: 100, clientY: 100 });
      
      await waitFor(() => {
        expect(onCaptureMock).toHaveBeenCalled();
      });
      
      const result: ScreenCaptureResult = onCaptureMock.mock.calls[0][0];
      expect(result.type).toBe('image-data');
      expect(result.imageData).toBeTruthy();
    });

    it('should not capture if mouse up without mouse down', () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      fireEvent.mouseUp(overlay!, { clientX: 200, clientY: 200 });
      
      expect(onCaptureMock).not.toHaveBeenCalled();
    });

    it('should not update selection if not selecting', () => {
      render(<ScreenCapture isActive={true} onCapture={onCaptureMock} />);
      
      const overlay = screen.getByText(/Left-click and drag to select area/i).parentElement;
      
      fireEvent.mouseMove(overlay!, { clientX: 200, clientY: 200 });
      
      const selection = overlay!.querySelector('.screen-capture-selection');
      expect(selection).not.toBeInTheDocument();
    });
  });
});
