import { TemplateResult } from './lib/templates.js';
import { NodePart } from './lib/parts.js';

// A lookup map for NodeParts that represent the content of a render target
const nodeParts = new WeakMap();

/**
 * Tagging function to tag JavaScript template string literals as HTML
 *
 * @return {TemplateResult}
 *   The strings and values of the template string wrapped in a TemplateResult object
 */
export const html = (strings, ...values) => {
  return new TemplateResult(strings, values);
};

/**
 * Render content into a target node
 *
 * @param {any} content
 *   Any content you wish to render. Usually a template string literal tagged with the `html` function
 * @param {Node} target
 *   An HTML Node that you wish to render the content into.
 *   The content will become the sole content of the target node.
 */
export const render = (content, target) => {
  // Check if the target has a NodePart that represents its content
  let part = nodeParts.get(target);
  if (!part) {
    // If it does not, create a new NodePart
    part = new NodePart({ parent: target });
    nodeParts.set(target, part);
  }
  // Task the NodePart of this target to render the content
  part.render(content);
};
