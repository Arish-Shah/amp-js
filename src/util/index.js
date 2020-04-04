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

  if (data && Object.keys(data).length > 0) {
    if (Object.keys(data).some((name) => typeof data[name] === 'function')) {
      throw new Error('"data" property should not contain methods');
    }

    state = { ...JSON.parse(JSON.stringify(data)) };
  }
  if (methods && Object.keys(methods).length > 0) {
    if (
      Object.keys(methods).some((name) => typeof methods[name] !== 'function')
    ) {
      throw new Error('"methods" property should not contain data');
    }

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
