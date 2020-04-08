import { render } from '../lib/render.js';
import {
  validate,
  createData,
  callLifeCycle,
  getProps
} from '../util/index.js';

/**
 * Create custom reusable components for usage in HTML
 * @param {string} id
 *   Name of the component.
 *   It mush contain a dash (-), e.g., amp-root
 * @param {Object} definition
 *   Definition of the component.
 *   This includes template, data, methods and props (if any)
 * @param {Function} definition.oncreate
 * @param {Function} definition.onmount
 * @param {Function} definition.onupdate
 * @param {Object} definition.data
 * @param {Object} definition.methods
 * @param {Array<Component>} definition.components
 * @param {Array<string>} definition.props
 * @param {TemplateResult} definition.template
 * @returns {{id, Function}}
 *   id of the components alongwith a function to generate it
 */
export const component = (id, definition) => {
  const generate = (nodes) => {
    validate(id, definition);
    const {
      oncreate,
      onmount,
      onupdate,
      data,
      methods,
      props,
      components,
      template
    } = definition;

    nodes.forEach((node) => {
      const proxyHandler = {
        get: function (target, key) {
          if (typeof target[key] === 'object' && target[key] !== null) {
            return new Proxy(target[key], proxyHandler);
          } else {
            return target[key];
          }
        },
        set: function (target, key, value) {
          let flag = key in target;
          target[key] = value;
          if (flag) {
            render(template.call(state), node);
            updateChildren(components);
            callLifeCycle(lifeCycle.onupdate);
          }
          return true;
        }
      };

      /*  On re-render update children */
      const updateChildren = (components) => {
        if (components && components.length > 0) {
          components.forEach((comp) => {
            const isInDOM = document.querySelectorAll(comp.id).length > 0;
            if (isInDOM) {
              comp.generate();
            }
          });
        }

        const childNodes = node.querySelectorAll(id);
        if (childNodes.length > 0) {
          generate(childNodes);
        }
      };

      // Create a copy of data for each element
      let state = createData(data);
      state.attr = (name) => node.getAttribute(name);
      state = new Proxy(state, proxyHandler);

      /* Go through methods and bind them, add them to state */
      const mCopy = { ...methods };
      if (mCopy) {
        const methodNames = Object.keys(mCopy);
        if (methodNames.some((name) => typeof mCopy[name] !== 'function')) {
          throw new Error('"methods" property should not contain data');
        }

        if (methodNames.length > 0) {
          methodNames.forEach((name) => {
            state[name] = mCopy[name].bind(state);
          });
        }
      }

      /* Set the props to state.props variable */
      state.props = getProps(props, node);

      let lifeCycle = {};
      if (oncreate) lifeCycle.oncreate = oncreate.bind(state);
      if (onmount) lifeCycle.onmount = onmount.bind(state);
      if (onupdate) lifeCycle.onupdate = onupdate.bind(state);

      callLifeCycle(lifeCycle.oncreate);
      render(template.call(state), node);
      updateChildren(components);
      callLifeCycle(lifeCycle.onmount);
    });
  };

  return {
    id,
    generate: () => generate(document.querySelectorAll(id))
  };
};
