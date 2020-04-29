import { buildTemplate } from '../../src/parser/template-parser.js';
import { findParts } from '../../src/parser/node-walker.js';
import { AttributePart, CommentPart, NodePart } from '../../src/template/parts';

const html = (strings) => strings;

describe('nodeWalker', () => {
  describe('findParts', () => {
    test('Correctly detects part types', () => {
      const strings = html`<!--${0}-->
        <div a=${1}>${2}</div>`;
      const template = buildTemplate(strings);
      const parts = findParts(strings, template);

      expect(parts[0].type).toBe(CommentPart);
      expect(parts[1].type).toBe(AttributePart);
      expect(parts[2].type).toBe(NodePart);
    });

    test('Returns the correct path for node parts', () => {
      const strings = html`<div>
        ${0}
        <div>${0}</div>
      </div>`;
      const template = buildTemplate(strings);
      const parts = findParts(strings, template);
      expect(parts[0].path).toEqual([0, 1]);
      expect(parts[1].path).toEqual([0, 3, 0]);
    });

    test('Considers text nodes in paths', () => {
      const strings = html`<div>
        ${0}
        <div>${0}</div>
      </div>`;
      const template = buildTemplate(strings);
      const parts = findParts(strings, template);
      expect(parts[0].path).toEqual([0, 1]);
      expect(parts[1].path).toEqual([0, 3, 0]);
    });

    test('Considers comment nodes in paths', () => {
      const strings = html`<div>
        <!-- -->${0}<!-- -->
        <div><!-- -->${0}</div>
      </div>`;
      const template = buildTemplate(strings);
      const parts = findParts(strings, template);
      expect(parts[0].path).toEqual([0, 2]);
      expect(parts[1].path).toEqual([0, 5, 1]);
    });

    test('Returns the correct path for attribute parts', () => {
      const strings = html`<div a=${0}>
        <div></div>
        <div a=${0}></div>
      </div>`;
      const template = buildTemplate(strings);
      const parts = findParts(strings, template);
      expect(parts[0].path).toEqual([0]);
      expect(parts[1].path).toEqual([0, 3]);
    });

    test('Returns the correct path for attribute parts', () => {
      const strings = html`<div a=${0}>
        <div></div>
        <div a=${0}></div>
      </div>`;
      const template = buildTemplate(strings);
      const parts = findParts(strings, template);
      expect(parts[0].path).toEqual([0]);
      expect(parts[1].path).toEqual([0, 3]);
    });

    test('Preserves original attribute names', () => {
      const strings = html` <div
        a=${0}
        a-b=${1}
        👍=${2}
        (a)=${3}
        [a]=${4}
        a$=${5}
        $a=${6}
      ></div>`;
      const template = buildTemplate(strings);
      const parts = findParts(strings, template);
      expect(parts[0].attribute).toBe('a');
      expect(parts[1].attribute).toBe('a-b');
      expect(parts[2].attribute).toBe('👍');
      expect(parts[3].attribute).toBe('(a)');
      expect(parts[4].attribute).toBe('[a]');
      expect(parts[5].attribute).toBe('a$');
      expect(parts[6].attribute).toBe('$a');
    });

    test('Preserves prefixes in the attribute name', () => {
      const strings = html` <div .a=${0} ?a=${1} @a=${2}></div>`;
      const template = buildTemplate(strings);
      const parts = findParts(strings, template);
      expect(parts[0].attribute).toBe('.a');
      expect(parts[1].attribute).toBe('?a');
      expect(parts[2].attribute).toBe('@a');
    });

    test('throws an Error when an attribute contains the ">" character', () => {
      let strings = html` <div a=">" b=${0}></div>`;
      let template = buildTemplate(strings);
      expect(() => findParts(strings, template)).toThrow();

      strings = html` <div a=">" b="${0}"></div>`;
      template = buildTemplate(strings);
      expect(() => findParts(strings, template)).toThrow();
    });

    test('throws an Error when attributes are assigned to more than once', () => {
      let strings = html` <div a=${0} a=${1}></div>`;
      let template = buildTemplate(strings);
      expect(() => findParts(strings, template)).toThrow();

      strings = html` <div a="0" a=${1}></div>`;
      template = buildTemplate(strings);
      expect(() => findParts(strings, template)).toThrow();

      // We cannot detect this case, but it does not break rendering
      // The only side-effect is that the static assignment to the variable is ignored
      strings = html` <div a=${0} a="1"></div>`;
      template = buildTemplate(strings);
      expect(() => findParts(strings, template)).not.toThrow();
    });

    test('does not break on the "style" attribute', () => {
      {
        const strings = html`<div style=${''}></div>`;
        const template = buildTemplate(strings);
        const parts = findParts(strings, template);
        expect(parts[0].attribute).toBe('style');
      }
      {
        const strings = html`<div a=${0} style=${''} b=${1}></div>`;
        const template = buildTemplate(strings);
        const parts = findParts(strings, template);
        expect(parts[0].attribute).toBe('a');
        expect(parts[1].attribute).toBe('style');
        expect(parts[2].attribute).toBe('b');
      }
      {
        const strings = html`<div a=${0} style="" b=${1}></div>`;
        const template = buildTemplate(strings);
        const parts = findParts(strings, template);
        expect(parts[0].attribute).toBe('a');
        expect(parts[1].attribute).toBe('b');
      }
      {
        const strings = html`<div a="" a=${0} style=""></div>`;
        const template = buildTemplate(strings);
        expect(() => findParts(strings, template)).toThrow();
      }
      {
        const strings = html`<div a="" a=${0} style="">style=${0}</div>`;
        const template = buildTemplate(strings);
        expect(() => findParts(strings, template)).toThrow();
      }
      {
        const strings = html`<div a="" a=${0} style=${''}></div>`;
        const template = buildTemplate(strings);
        expect(() => findParts(strings, template)).toThrow();
      }
      {
        const strings = html`<div a="" a=${0} style=${''}>style=${0}</div>`;
        const template = buildTemplate(strings);
        expect(() => findParts(strings, template)).toThrow();
      }
    });
  });
});
