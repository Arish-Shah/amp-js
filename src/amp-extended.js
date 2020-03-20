import { render } from './amp.js';

export default {
  component(name, { data, methods, props, template }) {
    const nodes = document.querySelectorAll(name);
    if (!nodes.length) {
      throw new Error(`<${name}> was not found.`);
    }

    nodes.forEach(node => {
      // Create a copy of data for each element
      const state = { ...JSON.parse(JSON.stringify(data)), ...methods };

      // Component LifeCycle Methods
      const lifeCycle = {
        onMount: null,
        onUpdate: null
      };

      // Proxying the `data` members
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

              // Calling update for every subsequent update
              if (lifeCycle.onUpdate) {
                lifeCycle.onUpdate();
              }
            }
          });
        }
      });

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
