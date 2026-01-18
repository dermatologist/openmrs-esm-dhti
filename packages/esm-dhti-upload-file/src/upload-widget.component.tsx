import React, { useState } from 'react';
import { useConfig, openmrsFetch } from '@openmrs/esm-framework';
import type { Config } from './config-schema';
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
 * It sends files directly to the DHTI backend for processing.
 *
 * Features:
 * - File selection button
 * - Upload progress indicator
 * - Success/failure feedback
 * - Direct file transmission to backend
 */
const UploadFileWidget: React.FC<UploadFileWidgetProps> = ({ patientUuid }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const config = useConfig<Config>();

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

        setIsLoading(true);
        try {
            // Read file as ArrayBuffer
            const arrayBuffer = await selectedFile.arrayBuffer();

            // Convert ArrayBuffer to base64 string
            const uint8Array = new Uint8Array(arrayBuffer);
            let binaryString = '';
            for (let i = 0; i < uint8Array.length; i++) {
                binaryString += String.fromCharCode(uint8Array[i]);
            }
            const base64Content = btoa(binaryString);

            // Build query parameters for metadata
            const queryParams = new URLSearchParams();
            queryParams.append('fileName', selectedFile.name);
            queryParams.append('fileType', selectedFile.type);
            if (patientUuid) {
                queryParams.append('patientUuid', patientUuid);
            }

            // const uploadUrl = `${config.dhtiRoute}?${queryParams.toString()}`;
            const uploadUrl = config.dhtiRoute;

            // Send base64-encoded content as JSON { file: ... }
            const response = await openmrsFetch(uploadUrl, {
                method: 'POST',
                body: JSON.stringify({ input: { file: base64Content }, config: {} }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok && response.data) {
                const responseData = response.data as { message?: string; summary?: string };
                setUploadStatus('success');
                setStatusMessage(responseData.message || responseData.summary || 'File uploaded successfully!');
            } else {
                setUploadStatus('error');
                setStatusMessage('Upload failed. Please try again.');
            }
        } catch (err) {
            setUploadStatus('error');
            setStatusMessage('An error occurred during upload.');
            console.error('Upload error:', err);
        } finally {
            setIsLoading(false);
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
                        disabled={isLoading}
                        className={styles.hiddenInput}
                    />
                    <label htmlFor="file-upload" className={styles.fileLabel}>
                        <Button
                            kind="tertiary"
                            size="md"
                            renderIcon={Upload}
                            disabled={isLoading}
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
                    disabled={!selectedFile || isLoading}
                    className={styles.uploadButton}
                >
                    {isLoading ? 'Uploading...' : 'Upload File'}
                </Button>
            </div>

            {isLoading && (
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
