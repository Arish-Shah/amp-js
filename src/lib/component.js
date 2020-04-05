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
 * @param {Array<Component>=} definition.components
 * @param {Array<string>=} definition.props
 * @param {TemplateResult} definition.template
 * @returns {{id, Function}}
 *   id of the components alongwith a function to generate it
 */
export const component = (id, definition) => {
  return {
    id,
    generate: () => {
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

        const proxyHandler = {
          get: function (target, key) {
            if (typeof target[key] === 'object' && target[key] !== null) {
              return new Proxy(target[key], proxyHandler);
            } else {
              return target[key];
            }
          },
          set: function (target, key, value) {
            target[key] = value;
            render(template.call(state), node);
            updateChildren(components);
            callLifeCycle(lifeCycle.onupdate);
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
        };

        /* Checks through state and proxifies them */
        if (state) {
          Object.keys(state).forEach((key) => {
            if (typeof state[key] === 'function') {
              state[key] = state[key].bind(state);
              if (key in lifeCycle) {
                lifeCycle[key] = state[key];
              }
            } else {
              state = new Proxy(state, proxyHandler);
            }
          });
        }

        /* Set the props to state.props variable */
        state.props = getProps(props, node);

        callLifeCycle(lifeCycle.oncreate);
        render(template.call(state), node);
        updateChildren(components);
        callLifeCycle(lifeCycle.onmount);
      });
    }
  };
};
