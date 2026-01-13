import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInput } from './MessageInput';

describe('MessageInput', () => {
  it('should render input field and submit button', () => {
    const mockOnSubmit = jest.fn();
    render(<MessageInput onSubmit={mockOnSubmit} disabled={false} />);

    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should call onSubmit when button is clicked with non-empty input', async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSubmit={mockOnSubmit} disabled={false} />);

    const input = screen.getByPlaceholderText(/type your message/i);
    const button = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Test message');
    await user.click(button);

    expect(mockOnSubmit).toHaveBeenCalledWith('Test message');
  });

  it('should clear input after submission', async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSubmit={mockOnSubmit} disabled={false} />);

    const input = screen.getByPlaceholderText(/type your message/i) as HTMLInputElement;
    const button = screen.getByRole('button', { name: /send/i });

    await user.type(input, 'Test message');
    await user.click(button);

    expect(input.value).toBe('');
  });

  it('should not submit when input is empty', async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSubmit={mockOnSubmit} disabled={false} />);

    const button = screen.getByRole('button', { name: /send/i });
    await user.click(button);

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should disable button when disabled prop is true', () => {
    const mockOnSubmit = jest.fn();
    render(<MessageInput onSubmit={mockOnSubmit} disabled={true} />);

    const button = screen.getByRole('button', { name: /send/i });
    expect(button).toBeDisabled();
  });

  it('should submit on Enter key press', async () => {
    const mockOnSubmit = jest.fn();
    const user = userEvent.setup();
    
    render(<MessageInput onSubmit={mockOnSubmit} disabled={false} />);

    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Test message{Enter}');

    expect(mockOnSubmit).toHaveBeenCalledWith('Test message');
  });
});
