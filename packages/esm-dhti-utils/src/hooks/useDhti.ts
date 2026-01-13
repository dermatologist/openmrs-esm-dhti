import { useState } from 'react';
import axios from 'axios';
import { CDSHookRequest } from '../models/request';
import { CDSHookCard } from '../models/card';
import { useConfig } from '@openmrs/esm-framework';

interface UseDhtiReturn {
  submitMessage: (newMessage: string, service?: string, patientId?: string) => Promise<CDSHookCard | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to handle DHTI (Digital Health Technology for India) service submissions.
 * This hook manages the state for submitting messages to a DHTI CDS Hooks service
 * and handles the response processing.
 * 
 * The hook expects a configuration with a `dhtiRoute` property that specifies
 * the endpoint URL for the DHTI service.
 * 
 * @returns An object containing:
 *  - submitMessage: Function to submit a message to the DHTI service
 *  - loading: Boolean indicating if a request is in progress
 *  - error: Error message string or null
 * 
 * @example
 * ```tsx
 * const { submitMessage, loading, error } = useDhti();
 * 
 * const handleSubmit = async () => {
 *   const result = await submitMessage('Patient symptoms', 'dhti_service', 'patient-123');
 *   if (result) {
 *     console.log('Response:', result.summary);
 *   }
 * };
 * ```
 */
export const useDhti = (): UseDhtiReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const config = useConfig();

  const submitMessage = async (
    newMessage: string,
    service: string = 'dhti_service',
    patientId?: string,
  ): Promise<CDSHookCard | null> => {
    setLoading(true);
    setError(null);

    try {
      const request = new CDSHookRequest({
        context: { input: newMessage, patientId: patientId || undefined },
      });

      // TODO: Investigate why nested input is required by the DHTI service
      const _request = {
        input: request,
      };

      const response = await axios.post(`${config.dhtiRoute}`, {
        input: _request,
        config: {},
        kwargs: {},
      });

      // Handle response containing cards array
      if (response.data && response.data.cards && response.data.cards.length > 0) {
        return CDSHookCard.from(response.data.cards[0]);
      } else if (response.data && response.data.summary) {
        // Handle case where response is directly a card (must have summary property)
        return CDSHookCard.from(response.data);
      }

      return null;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to submit message';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { submitMessage, loading, error };
};
