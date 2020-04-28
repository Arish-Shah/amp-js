import {
  attributeMarkerTag,
  commentMarkerTag,
  nodeMarkerTag,
  attributeContext,
  commentContext,
  nodeContext,
  unchangedContext,
  parseContext,
  parseTemplate,
  buildTemplate
} from '../../src/parser/template-parser.js';
import {
  attributeMarker,
  commentMarker,
  nodeMarker,
  failMarker
} from '../../src/template/markers.js';

const html = (strings) => strings;

describe('templateParser', () => {
  describe('parseContext', () => {
    it('detects comment contexts', () => {
      expect(parseContext('<!--').context).toEqual(commentContext);
      expect(parseContext('<div><!--').context).toEqual(commentContext);
      expect(parseContext('<!-- ').context).toEqual(commentContext);
      expect(parseContext('<!-- <div>').context).toEqual(commentContext);
      expect(parseContext('<!-- a=').context).toEqual(commentContext);
    });

    it('detects closed comments', () => {
      expect(parseContext('<!-- -->').commentClosed).toBe(true);
      expect(parseContext('<!-->').commentClosed).toBe(true);
      expect(parseContext('-->').commentClosed).toBe(true);
      expect(parseContext(' -->').commentClosed).toBe(true);
      expect(parseContext('<div> -->').commentClosed).toBe(true);
    });

    it('detects unchanged contexts', () => {
      expect(parseContext('').context).toEqual(unchangedContext);
      expect(parseContext(' ').context).toEqual(unchangedContext);
      expect(parseContext('some text').context).toEqual(unchangedContext);
      expect(parseContext('👍').context).toEqual(unchangedContext);
    });

    it('detects node contexts', () => {
      expect(parseContext('<div>').context).toEqual(nodeContext);
      expect(parseContext('<div> ').context).toEqual(nodeContext);
      expect(parseContext('<div>text').context).toEqual(nodeContext);
      expect(parseContext('<div> a=').context).toEqual(nodeContext);
      expect(parseContext('<div>text<div></div>').context).toEqual(nodeContext);
      expect(parseContext('<!-->').context).toEqual(nodeContext);
      expect(parseContext('<!-- -->').context).toEqual(nodeContext);
    });

    it('detects attribute contexts', () => {
      expect(parseContext('<div a=').context).toEqual(attributeContext);
      expect(parseContext('<div a =').context).toEqual(attributeContext);
    });

    it('detects a node context when an attribute contains the ">" character', () => {
      expect(parseContext('<div a=">" b=').context).toEqual(nodeContext);
    });
  });

  describe('parseTemplate', () => {
    it('inserts nodeMarkerTags', () => {
      expect(parseTemplate(html`<div>${0}</div>`)).toEqual(
        `<div>${nodeMarkerTag}</div>`
      );
      expect(parseTemplate(html`${0}`)).toEqual(`${nodeMarkerTag}`);
      expect(parseTemplate(html`a${0}`)).toEqual(`a${nodeMarkerTag}`);
      expect(parseTemplate(html`${0}a`)).toEqual(`${nodeMarkerTag}a`);
      expect(parseTemplate(html`${0}${0}`)).toEqual(
        `${nodeMarkerTag}${nodeMarkerTag}`
      );
      expect(parseTemplate(html`a${0}${0}`)).toEqual(
        `a${nodeMarkerTag}${nodeMarkerTag}`
      );
      expect(parseTemplate(html`${0}b${0}`)).toEqual(
        `${nodeMarkerTag}b${nodeMarkerTag}`
      );
      expect(parseTemplate(html`${0}${0}c`)).toEqual(
        `${nodeMarkerTag}${nodeMarkerTag}c`
      );
      expect(parseTemplate(html`a${0}b${0}c`)).toEqual(
        `a${nodeMarkerTag}b${nodeMarkerTag}c`
      );
      expect(parseTemplate(html`<!-- -->${0}`)).toEqual(
        `<!-- -->${nodeMarkerTag}`
      );
    });

    it('inserts attributeMarkerTags', () => {
      expect(parseTemplate(html`<div a=${0}></div>`)).toEqual(
        `<div a=${attributeMarkerTag}></div>`
      );
      expect(parseTemplate(html`<div a=${0}></div>`)).toEqual(
        `<div a=${attributeMarkerTag}></div>`
      );
      expect(parseTemplate(html`<div a=${0}></div>`)).toEqual(
        `<div a=${attributeMarkerTag}></div>`
      );
      expect(parseTemplate(html`<div a=${0} b=${0}></div>`)).toEqual(
        `<div a=${attributeMarkerTag} b=${attributeMarkerTag}></div>`
      );
      expect(parseTemplate(html`<div a="0" b=${0}></div>`)).toEqual(
        `<div a="0" b=${attributeMarkerTag}></div>`
      );
      expect(parseTemplate(html`<div a=${0} b="0"></div>`)).toEqual(
        `<div a=${attributeMarkerTag} b="0"></div>`
      );
      expect(parseTemplate(html`<div a=${0} b="0" c=${0}></div>`)).toEqual(
        `<div a=${attributeMarkerTag} b="0" c=${attributeMarkerTag}></div>`
      );
      expect(parseTemplate(html`<div a=${0} b></div>`)).toEqual(
        `<div a=${attributeMarkerTag} b></div>`
      );
      expect(parseTemplate(html`<div a b=${0}></div>`)).toEqual(
        `<div a b=${attributeMarkerTag}></div>`
      );
      expect(parseTemplate(html`<div a=">" b=${0}></div>`)).toEqual(
        `<div a=">" b=${nodeMarkerTag}></div>`
      );
    });

    it('inserts a nodeMarkerTag when an attribute contains the ">" character', () => {
      expect(parseTemplate(html`<div a=">" b=${0}></div>`)).toEqual(
        `<div a=">" b=${nodeMarkerTag}></div>`
      );
    });

    it('throws an Error on incorrect attribute tag usage', () => {
      expect(() => parseTemplate(html`<div a="${0}"></div>`)).toThrow();
      expect(() => parseTemplate(html`<div a="a${0}"></div>`)).toThrow();
      expect(() => parseTemplate(html`<div a="${0}a"></div>`)).toThrow();
      expect(() => parseTemplate(html`<div ${0}></div>`)).toThrow();
    });

    it('inserts commentMarkerTags', () => {
      expect(parseTemplate(html`<!--${0}-->`)).toEqual(
        `<!--${commentMarkerTag}-->`
      );
      expect(parseTemplate(html`<div><!--${0}--></div>`)).toEqual(
        `<div><!--${commentMarkerTag}--></div>`
      );
      expect(parseTemplate(html`<div><!--${0}--></div>`)).toEqual(
        `<div><!--${commentMarkerTag}--></div>`
      );
      expect(parseTemplate(html`a<!--${0}-->`)).toEqual(
        `a<!--${commentMarkerTag}-->`
      );
      expect(parseTemplate(html`<!--a${0}-->`)).toEqual(
        `<!--a${commentMarkerTag}-->`
      );
      expect(parseTemplate(html`<!--${0}a-->`)).toEqual(
        `<!--${commentMarkerTag}a-->`
      );
      expect(parseTemplate(html`<!--a${0}b-->`)).toEqual(
        `<!--a${commentMarkerTag}b-->`
      );
    });

    it('inserts correct tags in different part type sequences', () => {
      expect(
        parseTemplate(html`<div a=${0} b=${0}>${0}${0}<!--${0}${0}--></div>`)
      ).toEqual(
        `<div a=${attributeMarkerTag} b=${attributeMarkerTag}>${nodeMarkerTag}${nodeMarkerTag}<!--${commentMarkerTag}${commentMarkerTag}--></div>`
      );
      expect(
        parseTemplate(
          html`<div a=${0} b=${0}>${0}${0}</div><!--${0}${0}-->`
        )
      ).toEqual(
        `<div a=${attributeMarkerTag} b=${attributeMarkerTag}>${nodeMarkerTag}${nodeMarkerTag}</div><!--${commentMarkerTag}${commentMarkerTag}-->`
      );
      expect(
        parseTemplate(
          html`<div a=${0} b=${0}>${0}</div>${0}<!--${0}${0}-->`
        )
      ).toEqual(
        `<div a=${attributeMarkerTag} b=${attributeMarkerTag}>${nodeMarkerTag}</div>${nodeMarkerTag}<!--${commentMarkerTag}${commentMarkerTag}-->`
      );
      expect(
        parseTemplate(
          html`<div a=${0} b=${0}>${0}</div><!--${0}${0}-->${0}`
        )
      ).toEqual(
        `<div a=${attributeMarkerTag} b=${attributeMarkerTag}>${nodeMarkerTag}</div><!--${commentMarkerTag}${commentMarkerTag}-->${nodeMarkerTag}`
      );
      expect(
        parseTemplate(
          html`<div a=${0} b=${0}></div><!--${0}${0}-->${0}${0}`
        )
      ).toEqual(
        `<div a=${attributeMarkerTag} b=${attributeMarkerTag}></div><!--${commentMarkerTag}${commentMarkerTag}-->${nodeMarkerTag}${nodeMarkerTag}`
      );
      expect(
        parseTemplate(
          html`<!--${0}${0}--><div a=${0} b=${0}>${0}${0}</div>`
        )
      ).toEqual(
        `<!--${commentMarkerTag}${commentMarkerTag}--><div a=${attributeMarkerTag} b=${attributeMarkerTag}>${nodeMarkerTag}${nodeMarkerTag}</div>`
      );
      expect(
        parseTemplate(
          html`<!--${0}${0}--><div a=${0} b=${0}>${0}</div>${0}`
        )
      ).toEqual(
        `<!--${commentMarkerTag}${commentMarkerTag}--><div a=${attributeMarkerTag} b=${attributeMarkerTag}>${nodeMarkerTag}</div>${nodeMarkerTag}`
      );
      expect(
        parseTemplate(
          html`<!--${0}${0}-->${0}<div a=${0} b=${0}>${0}</div>`
        )
      ).toEqual(
        `<!--${commentMarkerTag}${commentMarkerTag}-->${nodeMarkerTag}<div a=${attributeMarkerTag} b=${attributeMarkerTag}>${nodeMarkerTag}</div>`
      );
      expect(
        parseTemplate(
          html`<!--${0}${0}--><div a=${0} b=${0}></div>${0}${0}`
        )
      ).toEqual(
        `<!--${commentMarkerTag}${commentMarkerTag}--><div a=${attributeMarkerTag} b=${attributeMarkerTag}></div>${nodeMarkerTag}${nodeMarkerTag}`
      );
      expect(
        parseTemplate(
          html`<!--${0}${0}-->${0}${0}<div a=${0} b=${0}></div>`
        )
      ).toEqual(
        `<!--${commentMarkerTag}${commentMarkerTag}-->${nodeMarkerTag}${nodeMarkerTag}<div a=${attributeMarkerTag} b=${attributeMarkerTag}></div>`
      );
      expect(
        parseTemplate(
          html`${0}${0}<div a=${0} b=${0}><!--${0}${0}--></div>`
        )
      ).toEqual(
        `${nodeMarkerTag}${nodeMarkerTag}<div a=${attributeMarkerTag} b=${attributeMarkerTag}><!--${commentMarkerTag}${commentMarkerTag}--></div>`
      );
      expect(
        parseTemplate(
          html`${0}${0}<div a=${0} b=${0}></div><!--${0}${0}-->`
        )
      ).toEqual(
        `${nodeMarkerTag}${nodeMarkerTag}<div a=${attributeMarkerTag} b=${attributeMarkerTag}></div><!--${commentMarkerTag}${commentMarkerTag}-->`
      );
      expect(
        parseTemplate(
          html`${0}<div a=${0} b=${0}>${0}<!--${0}${0}--></div>`
        )
      ).toEqual(
        `${nodeMarkerTag}<div a=${attributeMarkerTag} b=${attributeMarkerTag}>${nodeMarkerTag}<!--${commentMarkerTag}${commentMarkerTag}--></div>`
      );
      expect(
        parseTemplate(
          html`${0}<div a=${0} b=${0}><!--${0}${0}-->${0}</div>`
        )
      ).toEqual(
        `${nodeMarkerTag}<div a=${attributeMarkerTag} b=${attributeMarkerTag}><!--${commentMarkerTag}${commentMarkerTag}-->${nodeMarkerTag}</div>`
      );
      expect(
        parseTemplate(
          html`${0}<div a=${0} b=${0}><!--${0}${0}--></div>${0}`
        )
      ).toEqual(
        `${nodeMarkerTag}<div a=${attributeMarkerTag} b=${attributeMarkerTag}><!--${commentMarkerTag}${commentMarkerTag}--></div>${nodeMarkerTag}`
      );
    });
  });

  describe('buildTemplate', () => {
    it('injects a commentNode for node parts', () => {
      expect(buildTemplate(html`${0}`).content.firstChild.nodeType).toEqual(8);
      expect(
        buildTemplate(html`<div>${0}</div>`).content.firstChild.firstChild
          .nodeType
      ).toEqual(8);
    });

    it('the injected commentNode for node parts contains the nodeMarker', () => {
      expect(buildTemplate(html`${0}`).content.firstChild.textContent).toEqual(
        nodeMarker
      );
      expect(
        buildTemplate(html`<div>${0}</div>`).content.firstChild.firstChild
          .textContent
      ).toEqual(nodeMarker);
    });

    it('injects a commentNode in between comment strings', () => {
      expect(
        buildTemplate(html`<!--${0}-->`).content.childNodes.length
      ).toEqual(3);
      expect(
        buildTemplate(html`<!-- ${0} -->`).content.childNodes.length
      ).toEqual(3);
    });

    it('the injected commentNode for comment parts contains the commentMarker', () => {
      expect(
        buildTemplate(html`<!--${0}-->`).content.childNodes[1].textContent
      ).toEqual(commentMarker);
    });

    it('does not create extra empty text nodes', () => {
      expect(
        buildTemplate(html`<div>${0}</div>`).content.childNodes[0].childNodes
          .length
      ).toEqual(1);
      expect(buildTemplate(html`${0}`).content.childNodes.length).toEqual(1);
      expect(buildTemplate(html`a${0}`).content.childNodes.length).toEqual(2);
      expect(buildTemplate(html`${0}a`).content.childNodes.length).toEqual(2);
      expect(buildTemplate(html`${0}${0}`).content.childNodes.length).toEqual(
        2
      );
      expect(buildTemplate(html`a${0}${0}`).content.childNodes.length).toEqual(
        3
      );
      expect(buildTemplate(html`${0}b${0}`).content.childNodes.length).toEqual(
        3
      );
      expect(buildTemplate(html`${0}${0}c`).content.childNodes.length).toEqual(
        3
      );
      expect(
        buildTemplate(html`a${0}b${0}c`).content.childNodes.length
      ).toEqual(5);
    });

    it('does not break on comment-like comment content', () => {
      expect(
        buildTemplate(html`<!--${0}>-->`).content.childNodes.length
      ).toEqual(3);
      expect(
        buildTemplate(html`<!--${0}->-->`).content.childNodes.length
      ).toEqual(3);
      expect(
        buildTemplate(html`<!--<${0}-->`).content.childNodes.length
      ).toEqual(3);
      expect(
        buildTemplate(html`<!--<!${0}-->`).content.childNodes.length
      ).toEqual(3);
      expect(
        buildTemplate(html`<!--<!-${0}-->`).content.childNodes.length
      ).toEqual(3);
      expect(
        buildTemplate(html`<!--<!--${0}-->`).content.childNodes.length
      ).toEqual(3);
    });

    it('adds the failMarker attribute to nodes when an attribute contains the ">" character', () => {
      expect(
        buildTemplate(
          html`<div a=">" b=${0}></div>`
        ).content.childNodes[0].hasAttribute(failMarker)
      ).toBe(true);
      expect(
        buildTemplate(
          html`<div a=">" b="${0}"></div>`
        ).content.childNodes[0].hasAttribute(failMarker)
      ).toBe(true);
    });

    it('adds the attributeMarker attribute to nodes with a dynamic attribute', () => {
      expect(
        buildTemplate(
          html`<div a=${0}></div>`
        ).content.childNodes[0].hasAttribute(attributeMarker)
      ).toBe(true);
      expect(
        buildTemplate(
          html`<div a="1"></div>`
        ).content.childNodes[0].hasAttribute(attributeMarker)
      ).toBe(false);
      expect(
        buildTemplate(
          html`<div a=${0} b=${0}></div>`
        ).content.childNodes[0].hasAttribute(attributeMarker)
      ).toBe(true);
      expect(
        buildTemplate(
          html`<div a="1" b=${0}></div>`
        ).content.childNodes[0].hasAttribute(attributeMarker)
      ).toBe(true);
    });

    it('assigns the attributeMarker value to dynamic attributes', () => {
      expect(
        buildTemplate(
          html`<div a=${0}></div>`
        ).content.childNodes[0].getAttribute('a')
      ).toEqual(attributeMarker);
      expect(
        buildTemplate(
          html`<div a=${0} b="1"></div>`
        ).content.childNodes[0].getAttribute('a')
      ).toEqual(attributeMarker);
      expect(
        buildTemplate(
          html`<div a="1" b=${0}></div>`
        ).content.childNodes[0].getAttribute('b')
      ).toEqual(attributeMarker);
      expect(
        buildTemplate(
          html`<div a=${0} b="1" c="1"></div>`
        ).content.childNodes[0].getAttribute('a')
      ).toEqual(attributeMarker);
      expect(
        buildTemplate(
          html`<div a=${0} b=${0} c="1"></div>`
        ).content.childNodes[0].getAttribute('a')
      ).toEqual(attributeMarker);
      expect(
        buildTemplate(
          html`<div a=${0} b=${0} c="1"></div>`
        ).content.childNodes[0].getAttribute('b')
      ).toEqual(attributeMarker);
      expect(
        buildTemplate(
          html`<div a=${0} b="1" c=${0}></div>`
        ).content.childNodes[0].getAttribute('a')
      ).toEqual(attributeMarker);
      expect(
        buildTemplate(
          html`<div a=${0} b="1" c=${0}></div>`
        ).content.childNodes[0].getAttribute('c')
      ).toEqual(attributeMarker);
      expect(
        buildTemplate(
          html`<div a="1" b=${0} c=${0}></div>`
        ).content.childNodes[0].getAttribute('b')
      ).toEqual(attributeMarker);
      expect(
        buildTemplate(
          html`<div a="1" b=${0} c=${0}></div>`
        ).content.childNodes[0].getAttribute('c')
      ).toEqual(attributeMarker);
      expect(
        buildTemplate(
          html`<div a=${0} b=${0} c=${0}></div>`
        ).content.childNodes[0].getAttribute('a')
      ).toEqual(attributeMarker);
      expect(
        buildTemplate(
          html`<div a=${0} b=${0} c=${0}></div>`
        ).content.childNodes[0].getAttribute('b')
      ).toEqual(attributeMarker);
      expect(
        buildTemplate(
          html`<div a=${0} b=${0} c=${0}></div>`
        ).content.childNodes[0].getAttribute('c')
      ).toEqual(attributeMarker);
    });
  });
});
