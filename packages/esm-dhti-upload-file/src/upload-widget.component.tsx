import React, { useState } from 'react';
import { usePatient } from '@openmrs/esm-framework';
import { useDhti } from '@openmrs/esm-dhti-utils';
import { Button, InlineLoading, ToastNotification } from '@carbon/react';
import { Upload } from '@carbon/react/icons';
import styles from './upload-widget.scss';

interface UploadFileWidgetProps {
    patientUuid?: string;
}

/**
 * Upload File Widget Component
 *
 * This component provides a file upload interface for the patient chart summary tab.
 * It uses the DHTI upload_file elixir service to process and upload files.
 *
 * Features:
 * - File selection button
 * - Upload progress indicator
 * - Success/failure feedback
 * - Patient context awareness
 */
const UploadFileWidget: React.FC<UploadFileWidgetProps> = ({ patientUuid }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');
    const { submitMessage, loading, error } = useDhti();
    const patient = usePatient(patientUuid);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadStatus('idle');
            setStatusMessage('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadStatus('error');
            setStatusMessage('Please select a file to upload.');
            return;
        }

        try {
            // Read file content as base64
            const reader = new FileReader();
            reader.onload = async (e) => {
                const fileContent = e.target?.result;

                // Create a message with file information
                const fileData = {
                    fileName: selectedFile.name,
                    fileType: selectedFile.type,
                    fileSize: selectedFile.size,
                    fileContent: fileContent,
                };

                const message = JSON.stringify(fileData);

                // Submit to DHTI service
                const result = await submitMessage(
                    message,
                    'upload_file',
                    patientUuid
                );

                if (result) {
                    setUploadStatus('success');
                    setStatusMessage(result.summary || 'File uploaded successfully!');
                } else if (error) {
                    setUploadStatus('error');
                    setStatusMessage(error);
                } else {
                    setUploadStatus('error');
                    setStatusMessage('Upload failed. No response from server.');
                }
            };

            reader.onerror = () => {
                setUploadStatus('error');
                setStatusMessage('Failed to read file.');
            };

            reader.readAsDataURL(selectedFile);
        } catch (err) {
            setUploadStatus('error');
            setStatusMessage('An error occurred during upload.');
            console.error('Upload error:', err);
        }
    };

    return (
        <div className={styles.uploadWidget}>
            <h4 className={styles.title}>File Upload</h4>

            <div className={styles.uploadContainer}>
                <div className={styles.fileInput}>
                    <input
                        type="file"
                        id="file-upload"
                        onChange={handleFileChange}
                        disabled={loading}
                        className={styles.hiddenInput}
                    />
                    <label htmlFor="file-upload" className={styles.fileLabel}>
                        <Button
                            kind="tertiary"
                            size="md"
                            renderIcon={Upload}
                            disabled={loading}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById('file-upload')?.click();
                            }}
                        >
                            {selectedFile ? selectedFile.name : 'Choose File'}
                        </Button>
                    </label>
                </div>

                <Button
                    kind="primary"
                    size="md"
                    onClick={handleUpload}
                    disabled={!selectedFile || loading}
                    className={styles.uploadButton}
                >
                    {loading ? 'Uploading...' : 'Upload File'}
                </Button>
            </div>

            {loading && (
                <div className={styles.loadingContainer}>
                    <InlineLoading description="Uploading file..." />
                </div>
            )}

            {uploadStatus === 'success' && (
                <ToastNotification
                    kind="success"
                    title="Upload Successful"
                    subtitle={statusMessage}
                    timeout={5000}
                    onClose={() => setUploadStatus('idle')}
                />
            )}

            {uploadStatus === 'error' && (
                <ToastNotification
                    kind="error"
                    title="Upload Failed"
                    subtitle={statusMessage}
                    timeout={5000}
                    onClose={() => setUploadStatus('idle')}
                />
            )}
        </div>
    );
};

export default UploadFileWidget;
