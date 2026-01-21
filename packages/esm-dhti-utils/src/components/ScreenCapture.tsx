import React, { useCallback, useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';

/**
 * Result of a screen capture operation
 */
export interface ScreenCaptureResult {
  /**
   * Type of the capture result
   */
  type: 'image-data' | 'image-url';
  
  /**
   * The captured image as base64 data URL (for rectangular captures)
   * Format: "data:image/png;base64,{base64_image}"
   */
  imageData?: string;
  
  /**
   * The image URL (for right-click image captures)
   */
  imageUrl?: string;
  
  /**
   * Error message if the capture failed
   */
  error?: string;
}

/**
 * Props for the ScreenCapture component
 */
export interface ScreenCaptureProps {
  /**
   * Callback function called when a capture is completed
   */
  onCapture: (result: ScreenCaptureResult) => void;
  
  /**
   * Whether the capture mode is active
   */
  isActive: boolean;
  
  /**
   * Optional callback when capture mode is cancelled
   */
  onCancel?: () => void;
  
  /**
   * Optional custom class name for the overlay
   */
  className?: string;
  
  /**
   * Optional children to render inside the component
   */
  children?: React.ReactNode;
}

/**
 * Coordinates for the selection rectangle
 */
interface SelectionRect {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

/**
 * ScreenCapture Component
 * 
 * A reusable component to capture rectangular screen areas or extract image URLs.
 * 
 * Features:
 * - Left-click and drag to select a rectangular area for capture
 * - Right-click on an image to extract its URL
 * - Returns captured areas as base64-encoded image data
 * - Handles errors gracefully
 * 
 * @example
 * ```tsx
 * const [isCapturing, setIsCapturing] = useState(false);
 * 
 * const handleCapture = (result: ScreenCaptureResult) => {
 *   if (result.error) {
 *     console.error('Capture failed:', result.error);
 *   } else if (result.type === 'image-data') {
 *     console.log('Captured image:', result.imageData);
 *   } else if (result.type === 'image-url') {
 *     console.log('Image URL:', result.imageUrl);
 *   }
 *   setIsCapturing(false);
 * };
 * 
 * return (
 *   <div>
 *     <button onClick={() => setIsCapturing(true)}>Start Capture</button>
 *     <ScreenCapture 
 *       isActive={isCapturing} 
 *       onCapture={handleCapture}
 *       onCancel={() => setIsCapturing(false)}
 *     />
 *   </div>
 * );
 * ```
 */
export const ScreenCapture: React.FC<ScreenCaptureProps> = ({
  onCapture,
  isActive,
  onCancel,
  className = '',
  children,
}) => {
  const [isSelecting, setIsSelecting] = useState(false);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /**
   * Handle mouse down event to start selection
   */
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Only handle left mouse button
    if (e.button !== 0) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsSelecting(true);
    setSelection({
      startX: x,
      startY: y,
      endX: x,
      endY: y,
    });
  }, []);

  /**
   * Handle mouse move event to update selection
   */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !selection) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setSelection({
      ...selection,
      endX: x,
      endY: y,
    });
  }, [isSelecting, selection]);

  /**
   * Capture the selected area as an image
   */
  const captureSelectedArea = useCallback(async (rect: SelectionRect) => {
    try {
      // Calculate the actual coordinates
      const x = Math.min(rect.startX, rect.endX);
      const y = Math.min(rect.startY, rect.endY);
      const width = Math.abs(rect.endX - rect.startX);
      const height = Math.abs(rect.endY - rect.startY);

      // Validate selection size
      if (width < 10 || height < 10) {
        throw new Error('Selection area is too small (minimum 10x10 pixels)');
      }

      // Hide the overlay temporarily before capture
      if (overlayRef.current) {
        overlayRef.current.style.display = 'none';
      }

      // Capture the entire body using html2canvas
      const bodyCanvas = await html2canvas(document.body, {
        allowTaint: true,
        useCORS: true,
        logging: false,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });

      // Show the overlay again
      if (overlayRef.current) {
        overlayRef.current.style.display = 'block';
      }

      // Create a new canvas for the selected area
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw the selected portion from the body canvas
      ctx.drawImage(
        bodyCanvas,
        x, // source x
        y, // source y
        width, // source width
        height, // source height
        0, // destination x
        0, // destination y
        width, // destination width
        height // destination height
      );
      
      // Convert canvas to base64 data URL
      const imageData = canvas.toDataURL('image/png');
      
      onCapture({
        type: 'image-data',
        imageData,
      });
    } catch (error) {
      // Show the overlay again in case of error
      if (overlayRef.current) {
        overlayRef.current.style.display = 'block';
      }
      
      onCapture({
        type: 'image-data',
        error: error instanceof Error ? error.message : 'Failed to capture screen area',
      });
    }
  }, [onCapture]);

  /**
   * Handle mouse up event to complete selection
   */
  const handleMouseUp = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !selection) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    setIsSelecting(false);
    
    // Capture the selected area
    await captureSelectedArea(selection);
    
    // Reset selection
    setSelection(null);
  }, [isSelecting, selection, captureSelectedArea]);

  /**
   * Handle right-click (context menu) to extract image URL
   */
  const handleContextMenu = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const target = e.target as HTMLElement;
    
    // Check if the target is an image element
    if (target.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      const imageUrl = img.src;
      
      if (imageUrl) {
        onCapture({
          type: 'image-url',
          imageUrl,
        });
      } else {
        onCapture({
          type: 'image-url',
          error: 'No valid image URL found',
        });
      }
      return;
    }
    
    // Check if the target has a background image
    const computedStyle = window.getComputedStyle(target);
    const backgroundImage = computedStyle.backgroundImage;
    
    if (backgroundImage && backgroundImage !== 'none') {
      // Extract URL from background-image style
      const urlMatch = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        onCapture({
          type: 'image-url',
          imageUrl: urlMatch[1],
        });
        return;
      }
    }
    
    onCapture({
      type: 'image-url',
      error: 'No image found at this position',
    });
  }, [onCapture]);

  /**
   * Handle escape key to cancel capture
   */
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSelecting(false);
        setSelection(null);
        onCancel?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onCancel]);

  // Don't render if not active
  if (!isActive) return null;

  // Calculate selection rectangle for rendering
  const selectionStyle: React.CSSProperties = selection
    ? {
        left: Math.min(selection.startX, selection.endX),
        top: Math.min(selection.startY, selection.endY),
        width: Math.abs(selection.endX - selection.startX),
        height: Math.abs(selection.endY - selection.startY),
      }
    : {};

  return (
    <>
      <div
        ref={overlayRef}
        className={`screen-capture-overlay ${className}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleContextMenu}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          cursor: 'crosshair',
          zIndex: 9999,
        }}
      >
        {selection && (
          <div
            className="screen-capture-selection"
            style={{
              position: 'absolute',
              border: '2px dashed #0066cc',
              backgroundColor: 'rgba(0, 102, 204, 0.1)',
              pointerEvents: 'none',
              ...selectionStyle,
            }}
          />
        )}
        {children}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            fontSize: '14px',
            pointerEvents: 'none',
          }}
        >
          Left-click and drag to select area • Right-click on image to extract URL • Press ESC to cancel
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
};
