import {
  isSerializable,
  isIterable,
  AttributePart,
  CommentPart,
  NodePart
} from '../../src/template/parts.js';
import { TemplateResult } from '../../src/template/templates.js';

const html = (strings, ...values) => new TemplateResult(strings, values);
const fragmentString = (documentFragment) =>
  [].map.call(documentFragment.childNodes, (node) => node.outerHTML).join('');

const replaceWhitespace = (str) => str.replace(/\s+/g, '').trim();

describe('parts', () => {
  describe('isSerializable', () => {
    test('should return a truthy value for strings, numbers, and booleans', () => {
      expect(!!isSerializable('')).toBe(true);
      expect(!!isSerializable(0)).toBe(true);
      expect(!!isSerializable(true)).toBe(true);
    });

    test('should return a falsy value for other things', () => {
      expect(!!isSerializable(null)).toBe(false);
      expect(!!isSerializable(undefined)).toBe(false);
      expect(!!isSerializable(Symbol())).toBe(false);
      expect(!!isSerializable({})).toBe(false);
      expect(!!isSerializable([])).toBe(false);
      expect(!!isSerializable(html``)).toBe(false);
      expect(!!isSerializable(function () {})).toBe(false);
      expect(!!isSerializable(() => {})).toBe(false);
    });
  });

  describe('isIterable', () => {
    test('should return a truthy value for array-like non-primitives', () => {
      expect(!!isIterable([])).toBe(true);
      expect(!!isIterable(new Map())).toBe(true);
      expect(!!isIterable(new Set())).toBe(true);
      expect(!!isIterable(new Int8Array(0))).toBe(true);
    });

    test('should return a falsy value for non-array-like non-primitives', () => {
      expect(!!isIterable({})).toBe(false);
      expect(!!isIterable(html``)).toBe(false);
      expect(!!isIterable(function () {})).toBe(false);
      expect(!!isIterable(() => {})).toBe(false);
      expect(!!isIterable(Symbol())).toBe(false);
    });
  });

  describe('AttributePart', () => {
    test('remembers the node it belongs to', () => {
      const node = document.createElement('div');
      let part = new AttributePart({ node, attribute: '' });
      expect(part.node === node).toBe(true);
    });

    test('remembers the attribute name', () => {
      const node = document.createElement('div');
      let part = new AttributePart({ node, attribute: 'a' });
      expect(part.name).toEqual('a');
    });

    test('detects ":" "?" and "@" prefixes and sets the name correctly', () => {
      const node = document.createElement('div');
      let part = new AttributePart({ node, attribute: ':a' });
      expect(part.name).toEqual('a');
      part = new AttributePart({ node, attribute: '?a' });
      expect(part.name).toEqual('a');
      part = new AttributePart({ node, attribute: '@a' });
      expect(part.name).toEqual('a');
    });

    test('uses the correct render function', () => {
      const node = document.createElement('div');
      let part = new AttributePart({ node, attribute: 'a' });
      expect(part._render === part._renderAttribute).toBe(true);
      part = new AttributePart({ node, attribute: ':a' });
      expect(part._render === part._renderProperty).toBe(true);
      part = new AttributePart({ node, attribute: '?a' });
      expect(part._render === part._renderBoolean).toBe(true);
      part = new AttributePart({ node, attribute: '@a' });
      expect(part._render === part._renderEvent).toBe(true);
    });

    test('renders attributes', () => {
      const node = document.createElement('div');
      let part = new AttributePart({ node, attribute: 'a' });
      part.render('one');
      expect(node.getAttribute('a')).toEqual('one');
      part.render('two');
      expect(node.getAttribute('a')).toEqual('two');
    });

    test('renders properties', () => {
      const node = document.createElement('div');
      let part = new AttributePart({ node, attribute: ':a' });
      part.render('one');
      expect(node.a).toEqual('one');
      part.render('two');
      expect(node.a).toEqual('two');
    });

    test('renders booleans', () => {
      const node = document.createElement('div');
      let part = new AttributePart({ node, attribute: '?a' });
      part.render(true);
      expect(node.hasAttribute('a')).toBe(true);
      part.render(false);
      expect(node.hasAttribute('a')).toBe(false);
    });

    test('renders event handlers', () => {
      const node = document.createElement('div');
      let part = new AttributePart({ node, attribute: '@click' });
      let counterOne = 0;
      const handlerOne = () => {
        counterOne += 1;
      };
      let counterTwo = 0;
      const handlerTwo = () => {
        counterTwo += 1;
      };
      part.render(handlerOne);
      expect(counterOne).toEqual(0);
      node.click();
      expect(counterOne).toEqual(1);

      part.render(handlerTwo);
      expect(counterTwo).toEqual(0);
      node.click();
      expect(counterTwo).toEqual(1);
    });

    test('clears old event handlers', () => {
      const node = document.createElement('div');
      let part = new AttributePart({ node, attribute: '@click' });
      let counter = 0;
      const handler = () => {
        counter += 1;
      };
      part.render(handler);
      node.click();
      expect(counter).toEqual(1);
      part.render(() => {});
      node.click();
      expect(counter).toEqual(1);
    });

    test('does not remove other event handlers', () => {
      const node = document.createElement('div');
      let part = new AttributePart({ node, attribute: '@click' });
      let counter = 0;
      const handler = () => {
        counter += 1;
      };
      let otherCounter = 0;
      const otherHandler = () => {
        otherCounter += 1;
      };
      node.addEventListener('click', otherHandler);
      part.render(handler);
      expect(counter).toEqual(0);
      expect(otherCounter).toEqual(0);
      node.click();
      expect(counter).toEqual(1);
      expect(otherCounter).toEqual(1);
      part.render(() => {});
      node.click();
      expect(counter).toEqual(1);
      expect(otherCounter).toEqual(2);
    });
  });

  describe('CommentPart', () => {
    test('remembers the node it belongs to', () => {
      const node = document.createComment('test');
      let part = new CommentPart({ node, attribute: '' });
      expect(part.node === node).toBe(true);
    });

    test('renders comments', () => {
      const node = document.createComment('test');
      let part = new CommentPart({ node, attribute: '' });
      expect(node.textContent).toEqual('test');
      part.render('one');
      expect(node.textContent).toEqual('one');
      part.render('two');
      expect(node.textContent).toEqual('two');
    });
  });

  describe('NodePart', () => {
    let setupNodes = () => {
      const parent = document.createElement('div');
      const node = document.createComment('marker');
      const before = document.createElement('span');
      const after = document.createElement('span');
      parent.appendChild(before);
      parent.appendChild(node);
      parent.appendChild(after);
      return { node, parent, before, after };
    };

    test('remembers what node it represents', () => {
      const { node } = setupNodes();
      const part = new NodePart({ node });
      expect(part.node === node).toBe(true);
    });

    test('knows what the parent node is', () => {
      const { node, parent } = setupNodes();
      let part = new NodePart({ parent });
      expect(part.parentNode === parent).toBe(true);
      part = new NodePart({ node });
      expect(part.parentNode === parent).toBe(true);
    });

    test('reassigns parents for nodes that are DocumentFragment contents', () => {
      const { parent } = setupNodes();
      const fragment = document.createDocumentFragment();
      fragment.appendChild(parent);
      expect(fragmentString(fragment)).toEqual(
        '<div><span></span><!--marker--><span></span></div>'
      );
      const newParent = document.createElement('div');
      const part = new NodePart({ node: fragment.content, parent: newParent });
      expect(part.parentNode === newParent).toBe(true);
    });

    describe('clear', () => {
      test('removes nodes that this NodePart represents from the DOM', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          part.clear();
          expect(parent.outerHTML).toEqual(
            '<div><span></span><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          part.clear();
          expect(parent.outerHTML).toEqual('<div></div>');
        }
      });

      test('moves nodes back into the DocumentFragment when clearing after rendering a TemplateResult', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const templateResult = html`<ul>
            <li></li>
          </ul>`;
          part._renderTemplateResult(templateResult);

          const templateInstance = part.templateInstances.get(
            templateResult.template
          );
          expect(fragmentString(templateInstance.fragment)).toEqual('');
          expect(replaceWhitespace(parent.outerHTML)).toBe(
            '<div><span></span><ul><li></li></ul><span></span></div>'
          );
          part.clear();
          expect(
            replaceWhitespace(fragmentString(templateInstance.fragment))
          ).toEqual('<ul><li></li></ul>');
          expect(parent.outerHTML).toEqual(
            '<div><span></span><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const templateResult = html`<ul>
            <li></li>
          </ul>`;
          part._renderTemplateResult(templateResult);

          const templateInstance = part.templateInstances.get(
            templateResult.template
          );
          expect(fragmentString(templateInstance.fragment)).toEqual('');
          expect(replaceWhitespace(parent.outerHTML)).toEqual(
            '<div><ul><li></li></ul></div>'
          );
          part.clear();
          expect(
            replaceWhitespace(fragmentString(templateInstance.fragment))
          ).toEqual('<ul><li></li></ul>');
          expect(parent.outerHTML).toEqual('<div></div>');
        }
      });
    });

    describe('_renderText', () => {
      test('renders strings', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          part._renderText('one');
          expect(parent.outerHTML).toEqual(
            '<div><span></span>one<span></span></div>'
          );
          part._renderText('two');
          expect(parent.outerHTML).toEqual(
            '<div><span></span>two<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          part._renderText('one');
          expect(parent.outerHTML).toEqual('<div>one</div>');
          part._renderText('two');
          expect(parent.outerHTML).toEqual('<div>two</div>');
        }
      });

      test('renders numbers as strings', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          part._renderText(1);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>1<span></span></div>'
          );
          part._renderText(2);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>2<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          part._renderText(1);
          expect(parent.outerHTML).toEqual('<div>1</div>');
          part._renderText(2);
          expect(parent.outerHTML).toEqual('<div>2</div>');
        }
      });

      test('renders booleans as strings in the node', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          part._renderText(true);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>true<span></span></div>'
          );
          part._renderText(false);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>false<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          part._renderText(true);
          expect(parent.outerHTML).toEqual('<div>true</div>');
          part._renderText(false);
          expect(parent.outerHTML).toEqual('<div>false</div>');
        }
      });

      test('renders different types in succession', () => {
        const { node, parent } = setupNodes();
        const part = new NodePart({ node });
        part._renderText('string');
        expect(parent.outerHTML).toEqual(
          '<div><span></span>string<span></span></div>'
        );
        part._renderText(1);
        expect(parent.outerHTML).toEqual(
          '<div><span></span>1<span></span></div>'
        );
        part._renderText(true);
        expect(parent.outerHTML).toEqual(
          '<div><span></span>true<span></span></div>'
        );
      });
    });

    describe('_renderNode', () => {
      test('renders a node', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const nodeOne = document.createElement('div');
          nodeOne.setAttribute('node', 1);
          part._renderNode(nodeOne);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><div node="1"></div><span></span></div>'
          );
          const nodeTwo = document.createElement('div');
          nodeTwo.setAttribute('node', 2);
          part._renderNode(nodeTwo);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><div node="2"></div><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const nodeOne = document.createElement('div');
          nodeOne.setAttribute('node', 1);
          part._renderNode(nodeOne);
          expect(parent.outerHTML).toEqual('<div><div node="1"></div></div>');
          const nodeTwo = document.createElement('div');
          nodeTwo.setAttribute('node', 2);
          part._renderNode(nodeTwo);
          expect(parent.outerHTML).toEqual('<div><div node="2"></div></div>');
        }
      });
    });

    describe('_renderIterable', () => {
      test('renders an array of primitives', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const array = ['hello', 1, true];
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>hello1true<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const array = ['hello', 1, true];
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual('<div>hello1true</div>');
        }
      });

      test('renders an array of different value types', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const array = [
            'hello',
            html`<div></div>`,
            document.createElement('i')
          ];
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>hello<div></div><i></i><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const array = [
            'hello',
            html`<div></div>`,
            document.createElement('i')
          ];
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual(
            '<div>hello<div></div><i></i></div>'
          );
        }
      });

      test('renders nested arrays', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const array = [1, [2, 3], 4, 5];
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>12345<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const array = [1, [2, 3], 4, 5];
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual('<div>12345</div>');
        }
      });

      test('correctly handles changes in templates between renders', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const array = [1, 2, 3];
          part._renderIterable(array.map((i) => html`<p>${i}</p>`));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><p>1</p><p>2</p><p>3</p><span></span></div>'
          );
          part._renderIterable(array.map((i) => html`<i>${i}</i>`));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><i>1</i><i>2</i><i>3</i><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const array = [1, 2, 3];
          part._renderIterable(array.map((i) => html`<p>${i}</p>`));
          expect(parent.outerHTML).toEqual(
            '<div><p>1</p><p>2</p><p>3</p></div>'
          );
          part._renderIterable(array.map((i) => html`<i>${i}</i>`));
          expect(parent.outerHTML).toEqual(
            '<div><i>1</i><i>2</i><i>3</i></div>'
          );
        }
      });

      test('correctly renders empty arrays', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          let array = [1, 2, 3];
          part._renderIterable(array.map((i) => html`<p>${i}</p>`));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><p>1</p><p>2</p><p>3</p><span></span></div>'
          );

          array = [];
          part._renderIterable(array.map((i) => html`<p>${i}</p>`));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><span></span></div>'
          );

          array = [4, 5, 6];
          part._renderIterable(array.map((i) => html`<p>${i}</p>`));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><p>4</p><p>5</p><p>6</p><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          let array = [1, 2, 3];
          part._renderIterable(array.map((i) => html`<p>${i}</p>`));
          expect(parent.outerHTML).toEqual(
            '<div><p>1</p><p>2</p><p>3</p></div>'
          );

          array = [];
          part._renderIterable(array.map((i) => html`<p>${i}</p>`));
          expect(parent.outerHTML).toEqual('<div></div>');

          array = [4, 5, 6];
          part._renderIterable(array.map((i) => html`<p>${i}</p>`));
          expect(parent.outerHTML).toEqual(
            '<div><p>4</p><p>5</p><p>6</p></div>'
          );
        }
      });

      test('renders additions to the array in subsequent renders', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const array = ['hello', 1];
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>hello1<span></span></div>'
          );
          array.unshift(true);
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>truehello1<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const array = ['hello', 1];
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual('<div>hello1</div>');
          array.unshift(true);
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual('<div>truehello1</div>');
        }
      });

      test('removes elements when the array shrinks', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const array = ['hello', 1, true];
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>hello1true<span></span></div>'
          );
          array.pop();
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>hello1<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const array = ['hello', 1, true];
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual('<div>hello1true</div>');
          array.pop();
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual('<div>hello1</div>');
        }
      });

      test('does not break when rendering another thing in between arrays', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const array = ['hello', 1, true];
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>hello1true<span></span></div>'
          );
          part._renderText('string');
          expect(parent.outerHTML).toEqual(
            '<div><span></span>string<span></span></div>'
          );
          part._renderIterable([1, 2, 3, 4, 5]);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>12345<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const array = ['hello', 1, true];
          part._renderIterable(array);
          expect(parent.outerHTML).toEqual('<div>hello1true</div>');
          part._renderText('string');
          expect(parent.outerHTML).toEqual('<div>string</div>');
          part._renderIterable([1, 2]);
          expect(parent.outerHTML).toEqual('<div>12</div>');
        }
      });
    });

    describe('_renderPromise', () => {
      test('does nothing until the promise resolves', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const promise = new Promise(() => {});
          part._renderPromise(promise);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><!--marker--><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const promise = new Promise(() => {});
          part._renderPromise(promise);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><!--marker--><span></span></div>'
          );
        }
      });

      test('renders a promise that is already resolved', async () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const promise = Promise.resolve('string');
          part._renderPromise(promise);
          await promise;
          expect(parent.outerHTML).toEqual(
            '<div><span></span>string<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const promise = Promise.resolve('string');
          part._renderPromise(promise);
          await promise;
          expect(parent.outerHTML).toEqual('<div>string</div>');
        }
      });

      test('renders the promise result once it resolves', async () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const promise = new Promise(function (resolve) {
            setTimeout(() => resolve('string'), 10);
          });
          part._renderPromise(promise);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><!--marker--><span></span></div>'
          );
          await promise;
          expect(parent.outerHTML).toEqual(
            '<div><span></span>string<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const promise = new Promise(function (resolve) {
            setTimeout(() => resolve('string'), 10);
          });
          part._renderPromise(promise);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><!--marker--><span></span></div>'
          );
          await promise;
          expect(parent.outerHTML).toEqual('<div>string</div>');
        }
      });

      test('only renders the last promise', async () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const firstPromise = new Promise(function (resolve) {
            setTimeout(() => resolve('bad'), 10);
          });
          const secondPromise = new Promise(function (resolve) {
            setTimeout(() => resolve('good'), 20);
          });
          part._renderPromise(firstPromise);
          part._renderPromise(secondPromise);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><!--marker--><span></span></div>'
          );
          await firstPromise;
          expect(parent.outerHTML).toEqual(
            '<div><span></span><!--marker--><span></span></div>'
          );
          await secondPromise;
          expect(parent.outerHTML).toEqual(
            '<div><span></span>good<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const firstPromise = new Promise(function (resolve) {
            setTimeout(() => resolve('bad'), 10);
          });
          const secondPromise = new Promise(function (resolve) {
            setTimeout(() => resolve('good'), 20);
          });
          part._renderPromise(firstPromise);
          part._renderPromise(secondPromise);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><!--marker--><span></span></div>'
          );
          await firstPromise;
          expect(parent.outerHTML).toEqual(
            '<div><span></span><!--marker--><span></span></div>'
          );
          await secondPromise;
          expect(parent.outerHTML).toEqual('<div>good</div>');
        }
      });

      test('does not override values rendered after the promise', async () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const firstPromise = new Promise(function (resolve) {
            setTimeout(() => resolve('bad'), 10);
          });
          part._renderPromise(firstPromise);
          part.render('good');
          expect(parent.outerHTML).toEqual(
            '<div><span></span>good<span></span></div>'
          );
          await firstPromise;
          expect(parent.outerHTML).toEqual(
            '<div><span></span>good<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const firstPromise = new Promise(function (resolve) {
            setTimeout(() => resolve('bad'), 10);
          });
          part._renderPromise(firstPromise);
          part.render('good');
          expect(parent.outerHTML).toEqual('<div>good</div>');
          await firstPromise;
          expect(parent.outerHTML).toEqual('<div>good</div>');
        }
      });

      test('works when rendering another thing in between promises', async () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const firstPromise = new Promise(function (resolve) {
            setTimeout(() => resolve('bad'), 10);
          });
          const secondPromise = new Promise(function (resolve) {
            setTimeout(() => resolve('good'), 20);
          });
          part._renderPromise(firstPromise);
          part.render('intermediate');
          part._renderPromise(secondPromise);
          expect(parent.outerHTML).toEqual(
            '<div><span></span>intermediate<span></span></div>'
          );
          await firstPromise;
          expect(parent.outerHTML).toEqual(
            '<div><span></span>intermediate<span></span></div>'
          );
          await secondPromise;
          expect(parent.outerHTML).toEqual(
            '<div><span></span>good<span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const firstPromise = new Promise(function (resolve) {
            setTimeout(() => resolve('bad'), 10);
          });
          const secondPromise = new Promise(function (resolve) {
            setTimeout(() => resolve('good'), 20);
          });
          part._renderPromise(firstPromise);
          part.render('intermediate');
          part._renderPromise(secondPromise);
          expect(parent.outerHTML).toEqual('<div>intermediate</div>');
          await firstPromise;
          expect(parent.outerHTML).toEqual('<div>intermediate</div>');
          await secondPromise;
          expect(parent.outerHTML).toEqual('<div>good</div>');
        }
      });

      test('does not cause additional renders when re-rendering the same promise', async () => {
        {
          const { node } = setupNodes();
          const part = new NodePart({ node });
          const promise = Promise.resolve('result');
          let renderCount = 0;
          let previousValue;
          let sameValue = false;
          part.render = (value) => {
            renderCount++;
            sameValue = value === previousValue;
            previousValue = value;
          };
          part._renderPromise(promise);
          part._renderPromise(promise);
          expect(renderCount).toEqual(0);
          expect(sameValue).toBe(false);
          await promise;
          expect(renderCount).toEqual(1);
          expect(sameValue).toBe(false);
          part._renderPromise(promise);
          part._renderPromise(promise);
          expect(renderCount).toEqual(1);
          await promise;
          expect(renderCount).toEqual(2);
          expect(sameValue).toBe(true);
          part._renderPromise(promise);
          part._renderPromise(promise);
          expect(renderCount).toEqual(2);
          await promise;
          expect(renderCount).toEqual(3);
          expect(sameValue).toBe(true);
        }
      });
    });

    describe('_renderTemplateResult', () => {
      test('renders a template', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const templateResult = html`<p></p>`;
          part._renderTemplateResult(templateResult);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><p></p><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const templateResult = html`<p></p>`;
          part._renderTemplateResult(templateResult);
          expect(parent.outerHTML).toEqual('<div><p></p></div>');
        }
      });

      test('renders the values inside templates', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const templateResult = (value) => html`<p>${value}</p>`;
          part._renderTemplateResult(templateResult(1));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><p>1</p><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const templateResult = (value) => html`<p>${value}</p>`;
          part._renderTemplateResult(templateResult(1));
          expect(parent.outerHTML).toEqual('<div><p>1</p></div>');
        }
      });

      test('renders nested templates', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const templateResult = (value) => html`<p>${value}</p>`;
          part._renderTemplateResult(templateResult(html`<i>${1}</i>`));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><p><i>1</i></p><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const templateResult = (value) => html`<p>${value}</p>`;
          part._renderTemplateResult(templateResult(html`<i>${1}</i>`));
          expect(parent.outerHTML).toEqual('<div><p><i>1</i></p></div>');
        }
      });

      test('renders nested templates in the root of the template', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const templateResult = (value) => html`${value}`;
          part._renderTemplateResult(templateResult(html`<i>${1}</i>`));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><i>1</i><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const templateResult = (value) => html`${value}`;
          part._renderTemplateResult(templateResult(html`<i>${1}</i>`));
          expect(parent.outerHTML).toEqual('<div><i>1</i></div>');
        }
      });

      test('can render the same template in different parts', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const templateResult = (value) => html`${value}`;
          const templatePartial = (value) => html`<i>${value}</i>`;
          part._renderTemplateResult(templateResult(templatePartial(1)));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><i>1</i><span></span></div>'
          );
          part._renderTemplateResult(templateResult(templatePartial(2)));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><i>2</i><span></span></div>'
          );
          const thing = setupNodes();
          const newPart = new NodePart({ node: thing.node });
          newPart._renderTemplateResult(templateResult(templatePartial(1)));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><i>2</i><span></span></div>'
          );
          expect(thing.parent.outerHTML).toEqual(
            '<div><span></span><i>1</i><span></span></div>'
          );
        }
      });

      test('can alternate between templates', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const one = html`<p></p>`;
          const two = html`<i></i>`;
          part._renderTemplateResult(one);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><p></p><span></span></div>'
          );
          part._renderTemplateResult(two);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><i></i><span></span></div>'
          );
          part._renderTemplateResult(one);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><p></p><span></span></div>'
          );
          part._renderTemplateResult(two);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><i></i><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const one = html`<p></p>`;
          const two = html`<i></i>`;
          part._renderTemplateResult(one);
          expect(parent.outerHTML).toEqual('<div><p></p></div>');
          part._renderTemplateResult(two);
          expect(parent.outerHTML).toEqual('<div><i></i></div>');
          part._renderTemplateResult(one);
          expect(parent.outerHTML).toEqual('<div><p></p></div>');
          part._renderTemplateResult(two);
          expect(parent.outerHTML).toEqual('<div><i></i></div>');
        }
      });

      test('caches the template instances', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const one = html`<p></p>`;
          const two = html`<i></i>`;
          part._renderTemplateResult(one);
          parent.querySelector('p').id = 'a';
          expect(parent.outerHTML).toEqual(
            '<div><span></span><p id="a"></p><span></span></div>'
          );
          part._renderTemplateResult(two);
          parent.querySelector('i').id = 'b';
          expect(parent.outerHTML).toEqual(
            '<div><span></span><i id="b"></i><span></span></div>'
          );
          part._renderTemplateResult(one);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><p id="a"></p><span></span></div>'
          );
          part._renderTemplateResult(two);
          expect(parent.outerHTML).toEqual(
            '<div><span></span><i id="b"></i><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const one = html`<p></p>`;
          const two = html`<i></i>`;
          part._renderTemplateResult(one);
          parent.querySelector('p').id = 'a';
          expect(parent.outerHTML).toEqual('<div><p id="a"></p></div>');
          part._renderTemplateResult(two);
          parent.querySelector('i').id = 'b';
          expect(parent.outerHTML).toEqual('<div><i id="b"></i></div>');
          part._renderTemplateResult(one);
          expect(parent.outerHTML).toEqual('<div><p id="a"></p></div>');
          part._renderTemplateResult(two);
          expect(parent.outerHTML).toEqual('<div><i id="b"></i></div>');
        }
      });

      test('re-uses the template instances but replaces the values', () => {
        {
          const { node, parent } = setupNodes();
          const part = new NodePart({ node });
          const one = (value) => html`<p>${value}</p>`;
          const two = (value) => html`<i>${value}</i>`;
          part._renderTemplateResult(one(1));
          parent.querySelector('p').id = 'a';
          expect(parent.outerHTML).toEqual(
            '<div><span></span><p id="a">1</p><span></span></div>'
          );
          part._renderTemplateResult(two(2));
          parent.querySelector('i').id = 'b';
          expect(parent.outerHTML).toEqual(
            '<div><span></span><i id="b">2</i><span></span></div>'
          );
          part._renderTemplateResult(one(3));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><p id="a">3</p><span></span></div>'
          );
          part._renderTemplateResult(two(4));
          expect(parent.outerHTML).toEqual(
            '<div><span></span><i id="b">4</i><span></span></div>'
          );
        }
        {
          const { parent } = setupNodes();
          const part = new NodePart({ parent });
          const one = (value) => html`<p>${value}</p>`;
          const two = (value) => html`<i>${value}</i>`;
          part._renderTemplateResult(one(1));
          parent.querySelector('p').id = 'a';
          expect(parent.outerHTML).toEqual('<div><p id="a">1</p></div>');
          part._renderTemplateResult(two(2));
          parent.querySelector('i').id = 'b';
          expect(parent.outerHTML).toEqual('<div><i id="b">2</i></div>');
          part._renderTemplateResult(one(3));
          expect(parent.outerHTML).toEqual('<div><p id="a">3</p></div>');
          part._renderTemplateResult(two(4));
          expect(parent.outerHTML).toEqual('<div><i id="b">4</i></div>');
        }
      });
    });
  });
});
