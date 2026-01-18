import { Type } from '@openmrs/esm-framework';

/**
 * This is the config schema for the upload widget.
 * It expects a configuration object which looks like this:
 *
 * ```json
 * { "dhtiRoute": "http://localhost:8001/langserve/dhti_elixir_upload_file/cds-services/dhti-service" }
 * ```
 *
 * In OpenMRS Microfrontends, all config parameters are optional. Thus,
 * all elements must have a reasonable default. A good default is one
 * that works well with the reference application.
 *
 * To understand the schema below, please read the configuration system
 * documentation:
 *   https://openmrs.github.io/openmrs-esm-core/#/main/config
 * Note especially the section "How do I make my module configurable?"
 *   https://openmrs.github.io/openmrs-esm-core/#/main/config?id=im-developing-an-esm-module-how-do-i-make-it-configurable
 * and the Schema Reference
 *   https://openmrs.github.io/openmrs-esm-core/#/main/config?id=schema-reference
 */
export const configSchema = {
  dhtiRoute: {
    _type: Type.String,
    _default: 'http://localhost:8001/langserve/dhti_elixir_upload/invoke', //Call invoke directly as the input_type in BaseChain is different
    _description: 'The URL of the DHTI upload_file elixir service endpoint.',
  },
};

export type Config = {
  dhtiRoute: string;
};
