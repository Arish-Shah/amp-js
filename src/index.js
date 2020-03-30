import { render } from './lib/render.js';
import { html } from './lib/html.js';

export default {
  /**
   * Create custom reusable components for usage in HTML
   * @param {string} name
   *   Name of the component. Best practice is to use follow web components standard and use kebab-case
   * @param {Object} config
   *   Configuration of the component. This includes template, data, methods and props (if any)
   * @param {Object=} config.data
   * @param {Object=} config.methods
   * @param {Array<string>=} config.props
   * @param {TemplateResult} config.template
   */
  component(name, config) {
    const { data, methods, props, template } = config;

    if (name.indexOf('<') > -1 || name.indexOf('>') > -1) {
      throw new Error('Do not use < or > while declaring component');
    }

    if (!template) {
      throw new Error('"template" is required for creating components');
    }

    if (typeof template !== 'function') {
      throw new Error('"template" should be a function');
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
