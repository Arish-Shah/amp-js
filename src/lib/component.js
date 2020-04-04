import { render } from '../lib/render.js';
import {
  validate,
  getNodes,
  createState,
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
 * @param {Object=} definition.data
 * @param {Object=} definition.methods
 * @param {Object=} definition.components
 * @param {Array<string>=} definition.props
 * @param {TemplateResult} definition.template
 */
export const component = (id, definition) => {
  return () => {
    validate(id, definition);
    const { data, methods, props, components, template } = definition;
    const nodes = getNodes(id);

    nodes.forEach((node) => {
      const lifeCycle = {
        oncreate: undefined,
        onmount: undefined,
        onupdate: undefined
      };
      // Create a copy of data for each element
      let state = createState(data, methods);
      state.attr = (name) => node.getAttribute(name);

      const defineReactive = (internalValue, object, name) => {
        Object.defineProperty(object, name, {
          get() {
            return internalValue;
          },
          set(newValue) {
            internalValue = newValue;
            render(template.call(state), node);
            updateChildren(components);
            callLifeCycle(lifeCycle.onupdate);
          }
        });
      };

      /**
       * On re-render update children
       */
      const updateChildren = (components) => {
        if (components && Object.keys(components).length > 0) {
          Object.keys(components).forEach((key) => {
            const isInDOM = document.querySelectorAll(key).length > 0;
            if (isInDOM) {
              components[key]();
            }
          });
        }
      };

      /**
       * Checks through state and proxifies them
       */
      if (state) {
        Object.keys(state).forEach((key) => {
          if (typeof state[key] === 'function') {
            state[key] = state[key].bind(state);
            if (key in lifeCycle) {
              lifeCycle[key] = state[key];
            }
          } else {
            defineReactive(state[key], state, key);
          }
        });
      }

      /**
       * Set the props to state.props variable
       */
      state.props = getProps(props, node);

      callLifeCycle(lifeCycle.oncreate);
      render(template.call(state), node);
      updateChildren(components);
      callLifeCycle(lifeCycle.onmount);
    });
  };
};
