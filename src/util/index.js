export const validate = (id, definition) => {
  if (!id) {
    throw new Error('Component name is not assigned');
  }
  if (id.indexOf('-') <= 0) {
    throw new Error('Component name must contain a dash, e.g., amp-root');
  }
  if (!definition) {
    throw new Error('Declare component definition');
  }
  if (!definition.template) {
    throw new Error('template is required for creating components');
  }
  if (typeof definition.template !== 'function') {
    throw new Error('template must be a function');
  }
};

export const getNodes = (name) => {
  const nodes = document.querySelectorAll(name) || [];
  return nodes;
};

export const createState = (data, methods) => {
  let state = {};
  if (data) {
    state = { ...JSON.parse(JSON.stringify(data)) };
  }
  if (methods) {
    state = { ...state, ...methods };
  }
  return state;
};

export const callLifeCycle = (method) => {
  if (method) {
    method();
  }
};

export const getProps = (props, node) => {
  if (props && props.length) {
    let obj = {};
    props.forEach((name) => {
      if (name in node) {
        obj[name] = node[name];
      }
    });
    return obj;
  }
  return undefined;
};
