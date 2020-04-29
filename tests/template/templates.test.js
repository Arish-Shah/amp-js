import {
  Template,
  TemplateResult,
  TemplateInstance
} from '../../src/template/templates.js';
import { findParts } from '../../src/parser/node-walker.js';
import { buildTemplate } from '../../src/parser/template-parser.js';
import {
  AttributePart,
  CommentPart,
  NodePart
} from '../../src/template/parts.js';

const html = (strings, ...values) => new TemplateResult(strings, values);
const htmlStrings = (strings) => strings;

describe('templates', () => {
  describe('TemplateResult', () => {
    test('stores the strings and values', () => {
      const strings = ['<div>', '</div>'];
      const values = [0];
      const templateResultFromArrays = new TemplateResult(strings, values);
      expect(templateResultFromArrays.strings).toEqual(strings);
      expect(templateResultFromArrays.values).toEqual(values);
      const templateResult = html`<div>${0}</div>`;
      expect(templateResult.strings).toEqual(strings);
      expect(templateResult.values).toEqual(values);
    });

    test('holds a template', () => {
      const templateResult = html``;
      expect(templateResult.template instanceof Template).toBe(true);
    });

    test('lazily loads the template', () => {
      const templateResult = html``;
      expect(templateResult._template).toBeUndefined();
      expect(templateResult.template instanceof Template).toBe(true);
      expect(templateResult._template instanceof Template).toBe(true);
    });

    test('returns the same template from different TemplateResults create with the same literal', () => {
      const template = () => html``;
      const templateResultOne = template();
      const templateResultTwo = template();
      expect(templateResultOne).toEqual(templateResultTwo);
      expect(templateResultOne.template).toEqual(templateResultTwo.template);
    });
  });

  describe('Template', () => {
    test('stores the strings that constructed the template', () => {
      const strings = htmlStrings`<div>${0}</div>`;
      const template = new Template(strings);
      expect(template.strings).toEqual(strings);
    });

    test('constructs a template element that holds a DOM template', () => {
      const strings = htmlStrings`<div>${0}</div>`;
      const template = new Template(strings);
      expect(template.element instanceof HTMLTemplateElement).toBe(true);
    });

    test('computes the parts for the template', () => {
      const strings = htmlStrings`<div>${0}</div>`;
      const templateElement = buildTemplate(strings);
      const template = new Template(strings);
      expect(template.parts).toEqual(findParts(strings, templateElement));
    });
  });

  const fragmentString = (documentFragment) =>
    [].map.call(documentFragment.childNodes, (node) => node.outerHTML).join('');

  describe('TemplateInstance', () => {
    test('clones the template document fragment from the source Template', () => {
      const template = html`<div>${0}</div>`.template;
      const instance = new TemplateInstance(template);
      expect(fragmentString(template.element.content)).toEqual(
        fragmentString(instance.fragment)
      );

      instance.fragment.appendChild(document.createElement('div'));
      expect(fragmentString(template.element.content)).not.toEqual(
        fragmentString(instance.fragment)
      );
    });

    test('constructs Part instances according to the definitions from the Template', () => {
      const template = html`
        <div id="parent0">
          ${0}
          <div id="parent1">
            ${1} ${2}
          </div>
          <div id="parent3">
            ${3}
          </div>
        </div>
        ${4}
        <div id="node5" a=${5}>
          <div id="node6" .a=${6} ?b=${7}>
            <!-- ${8} -->
            <div></div>
          </div>
        </div>
      `.template;
      const parent = document.createElement('div');
      parent.id = 'root';
      const instance = new TemplateInstance(template, parent);

      expect(instance.parts.length).toEqual(9);

      expect(instance.parts[0] instanceof NodePart).toBe(true);
      expect(instance.parts[0].parentNode.id).toEqual('parent0');
      expect(instance.parts[1] instanceof NodePart).toBe(true);
      expect(instance.parts[1].parentNode.id).toEqual('parent1');
      expect(instance.parts[2] instanceof NodePart).toBe(true);
      expect(instance.parts[2].parentNode.id).toEqual('parent1');
      expect(instance.parts[3] instanceof NodePart).toBe(true);
      expect(instance.parts[3].parentNode.id).toEqual('parent3');
      expect(instance.parts[4] instanceof NodePart).toBe(true);
      expect(instance.parts[4].parentNode.id).toEqual('root');
      expect(instance.parts[5] instanceof AttributePart).toBe(true);
      expect(instance.parts[5].node.id).toEqual('node5');
      expect(instance.parts[6] instanceof AttributePart).toBe(true);
      expect(instance.parts[6].node.id).toEqual('node6');
      expect(instance.parts[6].node.parentNode.id).toEqual('node5');
      expect(instance.parts[7] instanceof AttributePart).toBe(true);
      expect(instance.parts[7].node.id).toEqual('node6');
      expect(instance.parts[8] instanceof CommentPart).toBe(true);
      expect(instance.parts[8].node.parentNode.id).toEqual('node6');
    });

    test('calls "render" on the parts with the correct values', () => {
      const template = html`${3}${3}${3}`.template;
      const instance = new TemplateInstance(template);
      instance.parts.forEach(
        (part) => (part.render = (value) => (part.__renderCalledWith = value))
      );
      instance.render([0, 1, 2]);
      expect(
        instance.parts.every((part, index) => part.__renderCalledWith === index)
      ).toBe(true);
    });
  });
});
