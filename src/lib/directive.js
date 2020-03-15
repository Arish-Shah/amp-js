const directives = new WeakMap();

export const isDirective = value => directives.has(value);

export const directive = directive => {
  directives.set(directive, null);
  return directive;
};
