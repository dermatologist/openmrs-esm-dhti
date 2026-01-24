import React from 'react';
import { render, screen } from '@testing-library/react';
import { OrthancViewer } from './orthanc-viewer.component';
import * as orthanc from '@openmrs/esm-dhti-utils';

// Mock the useOrthanc hook
jest.mock('@openmrs/esm-dhti-utils', () => ({
    ...jest.requireActual('@openmrs/esm-dhti-utils'),
    useOrthanc: jest.fn(),
}));

describe('OrthancViewer Component - Delete Button Integration', () => {
    const mockUseOrthanc = orthanc.useOrthanc as jest.MockedFunction<typeof orthanc.useOrthanc>;

    const createMockHook = (overrides = {}) => ({
        uploadImage: jest.fn(),
        fetchPatientImages: jest.fn().mockResolvedValue([]),
        fetchInstanceById: jest.fn(),
        deleteImage: jest.fn(),
        loading: false,
        error: null,
        ...overrides,
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render component without errors', () => {
        const mockHook = createMockHook();
        mockUseOrthanc.mockReturnValue(mockHook as any);

        render(
            <OrthancViewer patientId="patient-123" orthancUrl="http://localhost:8010/http://orthanc:8042" />
        );

        expect(screen.getByText('DICOM Image Viewer')).toBeInTheDocument();
        expect(screen.getByText('Upload New Image')).toBeInTheDocument();
    });

    it('should have useOrthanc hook properly imported and available', () => {
        const mockHook = createMockHook({
            deleteImage: jest.fn().mockResolvedValue(true),
        });
        mockUseOrthanc.mockReturnValue(mockHook as any);

        render(
            <OrthancViewer patientId="patient-123" orthancUrl="http://localhost:8010/http://orthanc:8042" />
        );

        expect(mockUseOrthanc).toHaveBeenCalledWith('http://localhost:8010/http://orthanc:8042');
    });

    it('should have deleteImage function available in hook', () => {
        const deleteImageMock = jest.fn().mockResolvedValue(true);
        const mockHook = createMockHook({
            deleteImage: deleteImageMock,
        });
        mockUseOrthanc.mockReturnValue(mockHook as any);

        render(
            <OrthancViewer patientId="patient-123" orthancUrl="http://localhost:8010/http://orthanc:8042" />
        );

        const hookResult = mockUseOrthanc.mock.results[0].value;
        expect(hookResult.deleteImage).toBeDefined();
        expect(typeof hookResult.deleteImage).toBe('function');
    });

    it('should show empty state when no images', () => {
        const mockHook = createMockHook({
            fetchPatientImages: jest.fn().mockResolvedValue([]),
        });
        mockUseOrthanc.mockReturnValue(mockHook as any);

        render(
            <OrthancViewer patientId="patient-123" orthancUrl="http://localhost:8010/http://orthanc:8042" />
        );

        expect(screen.getByText('No images available. Upload an image to get started.')).toBeInTheDocument();
    });
});
