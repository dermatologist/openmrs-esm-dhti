import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { usePatient } from '@openmrs/esm-framework';
import { useDhti } from '@openmrs/esm-dhti-utils';
import UploadFileWidget from './upload-widget.component';

// Mock dependencies
jest.mock('@openmrs/esm-framework', () => ({
    usePatient: jest.fn(),
}));

jest.mock('@openmrs/esm-dhti-utils', () => ({
    useDhti: jest.fn(),
}));

describe('UploadFileWidget', () => {
    const mockSubmitMessage = jest.fn();
    const mockPatient = { uuid: 'patient-123' };

    beforeEach(() => {
        jest.clearAllMocks();
        (usePatient as jest.Mock).mockReturnValue(mockPatient);
        (useDhti as jest.Mock).mockReturnValue({
            submitMessage: mockSubmitMessage,
            loading: false,
            error: null,
        });
    });

    it('should render the upload widget', () => {
        render(<UploadFileWidget />);
        expect(screen.getByText('File Upload')).toBeInTheDocument();
        expect(screen.getByText('Choose File')).toBeInTheDocument();
        expect(screen.getByText('Upload File')).toBeInTheDocument();
    });

    it('should disable upload button when no file is selected', () => {
        render(<UploadFileWidget />);
        const uploadButton = screen.getByText('Upload File');
        expect(uploadButton).toBeDisabled();
    });

    it('should display selected file name', () => {
        render(<UploadFileWidget />);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;

        const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(screen.getByText('test.pdf')).toBeInTheDocument();
    });

    it('should show loading state during upload', () => {
        (useDhti as jest.Mock).mockReturnValue({
            submitMessage: mockSubmitMessage,
            loading: true,
            error: null,
        });

        render(<UploadFileWidget />);
        expect(screen.getByText('Uploading...')).toBeInTheDocument();
    });

    it('should show success message after successful upload', async () => {
        mockSubmitMessage.mockResolvedValue({
            summary: 'File uploaded successfully!',
        });

        render(<UploadFileWidget />);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

        fireEvent.change(fileInput, { target: { files: [file] } });

        const uploadButton = screen.getByText('Upload File');
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText('Upload Successful')).toBeInTheDocument();
        });
    });

    it('should show error message when upload fails', async () => {
        mockSubmitMessage.mockResolvedValue(null);
        (useDhti as jest.Mock).mockReturnValue({
            submitMessage: mockSubmitMessage,
            loading: false,
            error: 'Upload failed',
        });

        render(<UploadFileWidget />);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

        fireEvent.change(fileInput, { target: { files: [file] } });

        const uploadButton = screen.getByText('Upload File');
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText('Upload Failed')).toBeInTheDocument();
        });
    });
});
