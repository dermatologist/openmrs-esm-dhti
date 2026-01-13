/**
 * CDS Hook Request Model (TypeScript)
 * 
 * Represents a request to a CDS Hooks service. CDS Hooks is a specification for
 * integrating clinical decision support into the EHR workflow at specific points
 * called "hooks" (e.g., patient-view, order-select).
 * 
 * @see https://cds-hooks.org/specification/current/#http-request_1
 *
 * @example
 * ```json
 * {
 *   "hookInstance": "d1577c69-dfbe-44ad-ba6d-3e05e953b2ea",
 *   "fhirServer": "https://example.com/fhir",
 *   "fhirAuthorization": { "access_token": "..." },
 *   "hook": "patient-view",
 *   "context": { "patientId": "123", "input": "Patient symptoms" },
 *   "prefetch": { "patient": { "resourceType": "Patient", ... } }
 * }
 * ```
 */

export class CDSHookRequest {
	/** A unique identifier for this hook invocation */
	hookInstance?: string;

	/** Base URL of the FHIR server associated with the hook */
	fhirServer?: string;

	/** Authorization details for accessing the FHIR server */
	fhirAuthorization?: Record<string, any> | null;

	/** 
	 * Name of the hook (e.g., "patient-view", "order-select", "order-sign")
	 * @see https://cds-hooks.org/hooks/
	 */
	hook?: string;

	/** 
	 * Context object passed by the EHR containing hook-specific data.
	 * The structure varies by hook type.
	 */
	context?: Record<string, any> | null;

	/** 
	 * Prefetched FHIR resources keyed by name.
	 * These are resources that the CDS service indicated it needs via the discovery endpoint.
	 */
	prefetch?: Record<string, any> | null;

	constructor(init?: Partial<CDSHookRequest>) {
		Object.assign(this, init);
	}

	/** 
	 * Factory to build a CDSHookRequest from a plain object.
	 * 
	 * @param obj Plain object representing a CDS Hook Request
	 * @returns CDSHookRequest instance
	 */
	static from(obj: Partial<CDSHookRequest>): CDSHookRequest {
		return new CDSHookRequest(obj);
	}
}
