import {
  attributeMarker,
  commentMarker,
  nodeMarker
} from '../template/markers.js';

/**
 * The second marker is to add a boolean attribute to the element
 * This is to easily test if a node has dynamic attributes by checking against that attribute
 */
export const attributeMarkerTag = `${attributeMarker} ${attributeMarker}`;

/* The space at the end is necessary, to avoid accidentally closing comments with `<!-->` */
export const commentMarkerTag = `--><!--${commentMarker}--><!-- `;

/**
 * The extra content at the end is to add a flag to an element when
 * a nodeMarkerTag is inserted as an attribute due to an attribute containing `>`
 */
export const nodeMarkerTag = `<!--${nodeMarker}-->`;

export const attributeContext = {};
export const commentContext = {};
export const nodeContext = {};
export const unchangedContext = {};

const markers = new Map();
markers.set(attributeContext, attributeMarkerTag);
markers.set(commentContext, commentMarkerTag);
markers.set(nodeContext, nodeMarkerTag);

export const parseContext = (string) => {
  const openComment = string.lastIndexOf('<!--');
  const closeComment = string.indexOf('-->', openComment + 1);
  const commentClosed = closeComment > -1;
  let context;
  if (openComment > -1 && !commentClosed) {
    context = commentContext;
  } else {
    const closeTag = string.lastIndexOf('>');
    const openTag = string.indexOf('<', closeTag + 1);
    if (openTag > -1) {
      context = attributeContext;
    } else {
      if (closeTag > -1) {
        context = nodeContext;
      } else {
        context = unchangedContext;
      }
    }
  }
  return { commentClosed, context };
};

export const parseTemplate = (strings) => {
  const html = [];
  const lastStringIndex = strings.length - 1;
  let currentContext = nodeContext;
  for (let i = 0; i < lastStringIndex; i++) {
    const string = strings[i];
    const { commentClosed, context } = parseContext(string);
    if (
      (currentContext !== commentContext || commentClosed) &&
      context !== unchangedContext
    ) {
      currentContext = context;
    }
    if (currentContext === attributeContext && string.slice(-1) !== '=') {
      throw new Error('Only bare attribute parts are allowed: `<div a=${0}>`');
    }
    html.push(string + markers.get(currentContext));
  }

  html.push(strings[lastStringIndex]);
  return html.join('');
};

export const buildTemplate = (strings) => {
  const template = document.createElement('template');
  template.innerHTML = parseTemplate(strings);
  return template;
};
