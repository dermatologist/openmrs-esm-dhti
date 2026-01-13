/**
 * TypeScript models for CDS Hook Card
 * 
 * CDS (Clinical Decision Support) Hooks is a specification for integrating clinical
 * decision support into the EHR workflow. Cards are the primary mechanism for returning
 * information to the user.
 *
 * @see https://cds-hooks.org/specification/current/#card-attributes
 * 
 * @example
 * ```json
 * {
 *   "summary": "Patient is at high risk for opioid overdose.",
 *   "detail": "According to CDC guidelines, the patient's opioid dosage should be tapered to less than 50 MME. [Link to CDC Guideline](https://www.cdc.gov/drugoverdose/prescribing/guidelines.html)",
 *   "indicator": "warning",
 *   "source": {
 *     "label": "CDC Opioid Prescribing Guidelines",
 *     "url": "https://www.cdc.gov/drugoverdose/prescribing/guidelines.html",
 *     "icon": "https://example.org/img/cdc-icon.png"
 *   },
 *   "links": [
 *     {
 *       "label": "View MME Conversion Table",
 *       "url": "https://www.cdc.gov/drugoverdose/prescribing/mme.html"
 *     }
 *   ]
 * }
 * ```
 */

/**
 * The allowed indicators for a CDS Hook Card.
 * - info: Informational message
 * - warning: Warning message that requires attention
 * - hard-stop: Critical issue that must be addressed before proceeding
 */
export type CDSHookCardIndicator = 'info' | 'warning' | 'hard-stop';

/**
 * Source of the CDS Hook Card
 */
export class CDSHookCardSource {
	/** Display label for the source */
	label!: string;
	/** Optional URL to the source */
	url?: string;
	/** Optional icon URL for the source */
	icon?: string;

	constructor(init?: Partial<CDSHookCardSource>) {
		Object.assign(this, init);
	}
}

/**
 * Link associated with the CDS Hook Card
 */
export class CDSHookCardLink {
	/** Display label for the link */
	label!: string;
	/** URL for the link */
	url!: string;

	constructor(init?: Partial<CDSHookCardLink>) {
		Object.assign(this, init);
	}
}

/**
 * CDS Hook Card Model
 * Represents a card returned by a CDS Hooks service
 */
export class CDSHookCard {
	/** Short, succinct summary of the card content */
	summary!: string;
	/** Optional detailed description of the card content */
	detail?: string;
	/** Visual indicator for the card's importance */
	indicator?: CDSHookCardIndicator;
	/** Source of the card */
	source?: CDSHookCardSource;
	/** Related links for additional information */
	links?: CDSHookCardLink[];

	constructor(init?: Partial<CDSHookCard>) {
		if (init) {
			// Shallow assign for primitives; nested objects handled below if present
			const { source, links, ...rest } = init as CDSHookCard;
			Object.assign(this, rest);
			if (source) this.source = new CDSHookCardSource(source);
			if (links) this.links = links.map((l) => new CDSHookCardLink(l));
		}
	}

	/**
	 * Factory to build a CDSHookCard from a plain object, ensuring nested types are instantiated.
	 * 
	 * @param obj Plain object representing a CDS Hook Card
	 * @returns CDSHookCard instance
	 */
	static from(obj: Partial<CDSHookCard>): CDSHookCard {
		return new CDSHookCard(obj);
	}
}
