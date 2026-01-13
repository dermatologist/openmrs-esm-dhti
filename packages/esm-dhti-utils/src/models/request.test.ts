import { CDSHookRequest } from './request';

describe('CDSHookRequest', () => {
  it('should create request with all properties', () => {
    const request = new CDSHookRequest({
      hookInstance: '123e4567-e89b-12d3-a456-426614174000',
      fhirServer: 'https://fhir.example.com',
      fhirAuthorization: {
        access_token: 'token123',
        token_type: 'Bearer',
      },
      hook: 'patient-view',
      context: {
        patientId: 'patient-123',
        userId: 'user-456',
      },
      prefetch: {
        patient: {
          resourceType: 'Patient',
          id: 'patient-123',
        },
      },
    });

    expect(request.hookInstance).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(request.fhirServer).toBe('https://fhir.example.com');
    expect(request.fhirAuthorization?.access_token).toBe('token123');
    expect(request.hook).toBe('patient-view');
    expect(request.context?.patientId).toBe('patient-123');
    expect(request.prefetch?.patient?.id).toBe('patient-123');
  });

  it('should create request with minimal properties', () => {
    const request = new CDSHookRequest({
      hook: 'order-select',
    });

    expect(request.hook).toBe('order-select');
    expect(request.hookInstance).toBeUndefined();
    expect(request.fhirServer).toBeUndefined();
    expect(request.fhirAuthorization).toBeUndefined();
    expect(request.context).toBeUndefined();
    expect(request.prefetch).toBeUndefined();
  });

  it('should create request using from factory method', () => {
    const request = CDSHookRequest.from({
      hook: 'order-sign',
      context: {
        draftOrders: [],
      },
    });

    expect(request).toBeInstanceOf(CDSHookRequest);
    expect(request.hook).toBe('order-sign');
    expect(request.context?.draftOrders).toEqual([]);
  });

  it('should handle null values for optional fields', () => {
    const request = new CDSHookRequest({
      hook: 'patient-view',
      fhirAuthorization: null,
      context: null,
      prefetch: null,
    });

    expect(request.hook).toBe('patient-view');
    expect(request.fhirAuthorization).toBeNull();
    expect(request.context).toBeNull();
    expect(request.prefetch).toBeNull();
  });

  it('should create request with custom context data', () => {
    const request = new CDSHookRequest({
      hook: 'patient-view',
      context: {
        input: 'Patient symptoms',
        patientId: 'patient-789',
        customField: 'custom value',
      },
    });

    expect(request.context?.input).toBe('Patient symptoms');
    expect(request.context?.patientId).toBe('patient-789');
    expect(request.context?.customField).toBe('custom value');
  });

  it('should handle empty initialization', () => {
    const request = new CDSHookRequest();
    
    expect(request).toBeInstanceOf(CDSHookRequest);
    expect(request.hook).toBeUndefined();
  });

  it('should preserve all hook types', () => {
    const hookTypes = [
      'patient-view',
      'order-select',
      'order-sign',
      'appointment-book',
      'encounter-start',
      'encounter-discharge',
    ];

    hookTypes.forEach((hook) => {
      const request = new CDSHookRequest({ hook });
      expect(request.hook).toBe(hook);
    });
  });

  it('should handle complex prefetch data', () => {
    const request = new CDSHookRequest({
      hook: 'order-select',
      prefetch: {
        patient: {
          resourceType: 'Patient',
          id: 'patient-123',
          name: [{ given: ['John'], family: 'Doe' }],
        },
        medications: {
          resourceType: 'Bundle',
          entry: [
            {
              resource: {
                resourceType: 'MedicationRequest',
                id: 'med-1',
              },
            },
          ],
        },
      },
    });

    expect(request.prefetch?.patient?.resourceType).toBe('Patient');
    expect(request.prefetch?.medications?.resourceType).toBe('Bundle');
    expect(request.prefetch?.medications?.entry).toHaveLength(1);
  });
});
