import { render } from './lib/render.js';
import { html } from './lib/html.js';

export default {
  /**
   * Lets you create your own custom tags
   *
   *
   * @param {string} name
   *   Name of the component to be used in HTML.
   * @param {Object} configuration
   * @param {Object=} configuration.data
   * @param {Object=} configuration.methods
   * @param {Array<string>=} configuration.props
   * @param {TemplateResult} configuration.template
   *   Configuration of the component
   */
  component(name, { data, methods, props, template }) {
    if (name.indexOf('<') > -1 || name.indexOf('>') > -1) {
      throw new Error('Do not use < or > while declaring component');
    }

    const nodes = document.querySelectorAll(name);
    if (!nodes.length) {
      throw new Error(`<${name}> was not found.`);
    }
    nodes.forEach(node => {
      let state = {};

      if (data) {
        state = { ...JSON.parse(JSON.stringify(data)) };
      }

      if (methods) {
        state = { ...state, ...methods };
      }
      // Create a copy of data for each element
      // Component LifeCycle Methods
      const lifeCycle = {
        onMount: null,
        onUpdate: null
      };

      if (JSON.stringify(state) !== '{}') {
        // Proxying the 'data' members
        Object.keys(state).forEach(key => {
          if (typeof state[key] === 'function') {
            state[key] = state[key].bind(state);

            if (key === 'onmount') {
              lifeCycle.onMount = state[key];
            }
            if (key === 'onupdate') {
              lifeCycle.onUpdate = state[key];
            }
          } else {
            let internalValue = state[key];
            Object.defineProperty(state, key, {
              get() {
                return internalValue;
              },
              set(newValue) {
                internalValue = newValue;
                render(template(state), node);
                // Calling update for every subsequent render
                if (lifeCycle.onUpdate) {
                  lifeCycle.onUpdate();
                }
              }
            });
          }
        });
      }
      // Handling the props passed by the component and then removing them
      if (props && props.length) {
        state.props = {};
        const attributes = Array.from(node.attributes);
        attributes.forEach(attr => {
          if (props.indexOf(attr.name) > -1) {
            state.props[attr.name] = attr.value;
            node.removeAttribute(attr.name);
          }
        });
        if (JSON.stringify(state.props) === '{}') {
          delete state.props;
        }
      }
      render(template(state), node);
      // Calling onmount
      if (lifeCycle.onMount) {
        lifeCycle.onMount();
      }
    });
  }
};

export { render, html };
