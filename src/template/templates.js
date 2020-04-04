import { findParts } from '../parser/node-walker.js';
import { buildTemplate } from '../parser/template-parser.js';
import { NodePart } from './parts.js';
/**
 * A map that contains all the template literals we have seen before
 * It maps from a String array to a Template object
 *
 * @typedef {Map.<[String], Template>}
 */
const templateMap = new Map();

/**
 * Template holds the DocumentFragment that is to be used as a prototype for instances of this template
 * When a template is to be rendered in a new location, a clone will be made from this
 *
 * @prop {[String]} strings
 *   The unique string array that this template represents
 * @prop {[DocumentFragment]} element
 *   The DocumentFragment that can be cloned to make instances of this template
 * @prop {[Object]} parts
 *   The descriptions of the parts in this Template. Each part has a path which defines a unique location in the
 *   template DOM tree, a type which defines the part type, and an optional attribute which defines the name of
 *   the attribute this part represents.
 */
export class Template {
  constructor(strings) {
    this.strings = strings;
    this.element = buildTemplate(strings);
    this.parts = findParts(strings, this.element);
  }
}

/**
 * TemplateResult holds the strings and values that result from a tagged template string literal.
 * TemplateResult can find and return a unique Template object that represents its tagged template string literal.
 */
export class TemplateResult {
  constructor(strings, values) {
    this.strings = strings;
    this.values = values;
    this._template = undefined;
  }

  /**
   * @returns {Template}
   *   A unique Template object..
   *   Each evaluation of html`..` yields a new TemplateResult object, but they will have the same
   *   Template object when they are the result of the same html`..` literal.
   *
   */
  get template() {
    if (this._template) {
      return this._template;
    }
    let template = templateMap.get(this.strings);
    if (!template) {
      template = new Template(this.strings);
      templateMap.set(this.strings, template);
    }
    this._template = template;
    return template;
  }
}

/**
 * An instance of a template that can be rendered somewhere
 *
 * @prop {Template} template
 *   The unique Template object that this is an instance of
 * @prop {[DocumentFragment]} fragment
 *   The DocumentFragment that is a clone of the Template's prototype DocumentFragment
 * @prop {[AttributePart|CommentPart|NodePart|]} parts
 *   The parts that render into this template instance
 */
export class TemplateInstance {
  constructor(template, parent, before, after) {
    this.template = template;
    this.fragment = template.element.content.cloneNode(true);

    // Create new Parts based on the part definitions set on the Template
    const parts = this.template.parts.map((part) => {
      let node = this.fragment;
      part.path.forEach((nodeIndex) => {
        node = node.childNodes[nodeIndex];
      });
      part.node = node;
      if (part.type === NodePart) {
        if (part.path.length === 1) {
          part.parent = parent;
          part.before = node.previousSibling || before;
          part.after = node.nextSibling || after;
        } else {
          part.parent = node.parentNode;
        }
      }
      return part;
    });
    this.parts = parts.map((part) => new part.type(part));
  }

  /**
   * Render values into the parts of this TemplateInstance
   *
   * @param {[any]} values
   *   An array of values to render into the parts. There should be one value per part
   */
  render(values) {
    this.parts.map((part, index) => part.render(values[index]));
  }
}
