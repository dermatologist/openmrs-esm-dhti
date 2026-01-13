import useSWR from 'swr';
import { fhirBaseUrl, openmrsFetch } from '@openmrs/esm-framework';

/**
 * Custom hook to search for a patient using the provided search term from the
 * OpenMRS FHIR API. It leverages the useSWR hook from the SWR library
 * https://swr.vercel.app/docs/data-fetching to fetch data.
 * 
 * SWR provides several benefits over the standard React useEffect hook:
 * - Fast, lightweight and reusable data fetching
 * - Built-in cache and request deduplication
 * - Real-time updates
 * - Simplified error and loading state handling
 *
 * This is the preferred approach for data fetching in OpenMRS frontend modules.
 *
 * See the docs for the underlying fhir.js Client object: https://github.com/FHIR/fhir.js#api
 * See the OpenMRS FHIR Module docs: https://wiki.openmrs.org/display/projects/OpenMRS+FHIR+Module
 * See the OpenMRS REST API docs: https://rest.openmrs.org/#openmrs-rest-api
 *
 * @param query A patient name or ID. If the query contains a number, it's treated as an identifier search.
 * @returns An object containing the patient data, error state, and loading state
 * 
 * @example
 * ```tsx
 * const { patient, error, isLoading } = usePatient('John Doe');
 * if (isLoading) return <div>Loading...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * if (patient) return <div>Patient: {patient.name?.[0]?.text}</div>;
 * ```
 */
export function usePatient(query: string) {
  // If query has a number anywhere in it, treat it as an identifier search
  const isId = /\d/.test(query);
  let url = null;
  if (query && query.trim()) {
    if (isId) {
      url = `${fhirBaseUrl}/Patient?identifier=${encodeURIComponent(query.trim())}&_summary=data`;
    } else {
      url = `${fhirBaseUrl}/Patient?name=${encodeURIComponent(query.trim())}&_summary=data`;
    }
  }
  
  const { data, error, isLoading } = useSWR<
    {
      data: { entry: Array<{ resource: fhir.Patient }> };
    },
    Error
  >(query ? url : null, openmrsFetch);

  return {
    patient: data && Array.isArray(data.data?.entry) && data.data.entry.length > 0 ? data.data.entry[0].resource : null,
    error: error,
    isLoading,
  };
}
