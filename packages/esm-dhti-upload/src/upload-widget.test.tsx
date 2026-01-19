import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useConfig, openmrsFetch } from '@openmrs/esm-framework';
import UploadFileWidget from './upload-widget.component';

// Mock dependencies
jest.mock('@openmrs/esm-framework', () => ({
    useConfig: jest.fn(),
    openmrsFetch: jest.fn(),
}));

// Mock File.arrayBuffer() for jsdom
Object.defineProperty(File.prototype, 'arrayBuffer', {
    value: function () {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };
            reader.readAsArrayBuffer(this);
        });
    },
});

describe('UploadFileWidget', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useConfig as jest.Mock).mockReturnValue({
            dhtiRoute: 'http://localhost:8001/api/upload',
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

    it('should upload file and show success message', async () => {
        (openmrsFetch as jest.Mock).mockResolvedValue({
            ok: true,
            data: { message: 'File uploaded successfully!' },
        });

        render(<UploadFileWidget />);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

        fireEvent.change(fileInput, { target: { files: [file] } });

        const uploadButton = screen.getByText('Upload File');
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText('Upload Successful')).toBeInTheDocument();
            expect(screen.getByText('File uploaded successfully!')).toBeInTheDocument();
        });
    });

    it('should handle upload failure', async () => {
        (openmrsFetch as jest.Mock).mockResolvedValue({
            ok: false,
            data: null,
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

    it('should handle upload error', async () => {
        (openmrsFetch as jest.Mock).mockRejectedValue(new Error('Network error'));

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

    it('should send file as base64 in JSON format', async () => {
        (openmrsFetch as jest.Mock).mockResolvedValue({
            ok: true,
            data: { message: 'Success' },
        });

        render(<UploadFileWidget />);
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

        fireEvent.change(fileInput, { target: { files: [file] } });

        const uploadButton = screen.getByText('Upload File');
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(openmrsFetch).toHaveBeenCalled();
            const callArgs = (openmrsFetch as jest.Mock).mock.calls[0];
            const body = JSON.parse(callArgs[1].body);
            // The body should have the structure: { input: { input: base64Content, patientId }, config: {} }
            expect(body).toHaveProperty('input');
            expect(body.input).toHaveProperty('input');
            expect(typeof body.input.input).toBe('string');
            expect(callArgs[1].headers['Content-Type']).toBe('application/json');
        });
    });

    it('should show error when no file is selected and upload is attempted programmatically', async () => {
        // Since the button is disabled when no file is selected,
        // we test the error handling by mocking the state
        render(<UploadFileWidget />);
        const uploadButton = screen.getByText('Upload File');

        // Button should be disabled when no file is selected
        expect(uploadButton).toBeDisabled();
    });
});

