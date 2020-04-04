import { TemplateResult } from '../template/templates.js';

/**
 * Tagging function to tag JavaScript template string literals as HTML
 *
 * @return {TemplateResult}
 *   The strings and values of the template string wrapped in a TemplateResult object
 */
export const html = (strings, ...values) => {
  return new TemplateResult(strings, values);
};
