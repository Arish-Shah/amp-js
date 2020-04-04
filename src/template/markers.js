export const marker = Math.random().toString(36).slice(2).padStart(10, '0');
export const attributeMarker = `font-family:${marker}`;
export const IEStyleMarker = `font-family: ${marker};`;
export const commentMarker = `comment-${marker}`;
export const failMarker = `node-${marker}`;
export const nodeMarker = `${failMarker}" ${failMarker} `;
