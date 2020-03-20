# amp-js

A virtual DOM alternative to build declarative and reactive UI using template literal tags.

[![GitHub license](https://img.shields.io/github/license/Arish-Shah/amp-js?color=blue)](https://github.com/Arish-Shah/amp-js/blob/master/LICENSE)
![npm v1.0.0](https://img.shields.io/badge/npm-v1.0.0-brightgreen.svg)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

- **Highly Flexible:** Use expressive JavaScript templates that can render anything to HTML. Set properties and event listeners directly from the template.
- **Extremely Performant:** Using the latest generation of rendering techniques, it easily outperforms contemporary VirtualDOM-based rendering as used in modern frontend frameworks.
- **Lightweight:** ~2.6kb total size.
- **Extensible:** Create components, pass props, handle lifecycle events and efficiently update the DOM by using HTML templating.

## Overview

`amp-js` lets you write HTML templates in JavaScript with template literals.

```javascript
import { html, render } from 'amp-js';

// This is an amp template function. It returns an amp template.
const helloTemplate = name => html`
  <div>Hello ${name}!</div>
`;

// This renders <div>Hello Ben!</div> to the document body
render(helloTemplate('Ben'), document.body);

// This updates to <div>Hello Rey!</div>, but only updates the ${name} part
render(helloTemplate('Rey'), document.body);
```

## Core API

### Function `render(<any>, Node)`

The `render` function will render any type of object into the content of an HTML `Node`, usually the document body, a container element, or a shadowRoot.

The first argument is the object that will be rendered. It can be one of the following:

- A `TemplateResult` (returned by the `html` tag)
- A string, number, or boolean
- An HTML DOM Node
- An Array-like object

Any other object is coerced to a String before being rendered.

The second argument is the `Node` that the object will be rendered into. The previous content of the `Node` will be removed.

### Function `html`

The `html` is a [JavaScript template tag](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#Tagged_templates) that allows creation of flexible templates which will be interpreted as HTML. To use the tag, prepend it to any [JavaScript template literal](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals).

```javascript
const template = () => html`
  <p>Hello World</p>
`;
```

The contents of the template will be parsed as HTML. The flexibility comes from interpreted values that can be inserted into these templates.

```javascript
const template = name => html`
  <p>Hello ${name}!</p>
`;
```

These interpreted values can in turn be any kind of object that amp-js can render, including nested templates and arrays.

## Extended Usage

### Function `component`

The `component` can be used to create custom reusable components. It is provided with the default export.

- Each component has a first argument `name`, which helps amp-js locate its usage.
- The second parameter is a configuration object that contains an optional dynamic data object, methods to mutate them, props passed to the component, and the template itself. amp-js automatically binds `this` to the data, so they can be effectively changed causing a rerender.

```javascript
Amp.component('app-hello', {
  template: html`
    <h1>Hello World</h1>
  `
});
```

The component can be consumed in HTML as such:

```html
<app-hello></app-hello>
```

---

For a more complex component,

```javascript
Amp.component('app-counter', {
  data: {
    count: 0,
    step: 1
  },
  methods: {
    onmount() {
      this.count = this.props.start || 0;
      this.step = this.props.step || 1;
    },
    increment() {
      this.count += this.step;
    },
    decrement() {
      this.count -= this.step;
    }
  },
  props: ['start', 'step'],
  template: data => html`
    <button @click=${data.decrement}>Decrement</button>
    <h1>${data.count}</h1>
    <button @click=${data.increment}>Increment</button>
  `
});
```

We can now create multiple `app-counter` component in our HTML, passing `start` and `step` as props:

```html
<!-- Starts counter with 5 and increments/decrements by 5 -->
<app-counter start="5" step="5"></app-counter>

<!-- Starts counter with 8 and increments/decrements by 3 -->
<app-counter start="8" step="3"></app-counter>
```

#### Dynamic attributes

The `html` tag can also be used to set attributes on nodes. To set an attribute, assign the value of the attribute with an interpreted value. amp-js requires that you omit the surrounding `"` when setting attributes.

```javascript
const template = source => html`
  <img src=${source} />
`;

// Composite attribute
const template = classString => html`
  <div class=${`red ${classString}`}></div>
`;
```

#### Boolean attributes

You can set boolean attributes by prefixing the attribute name with `?`

```javascript
const template = secret => html`
  <p ?hidden=${secret}></p>
`;
```

#### Properties

You can set properties on elements by prefixing an attribute name with `.`

```javascript
const template = user => html`
  <user-panel .user=${user}></user-panel>
`;
```

#### Event handlers

You can attach event handlers by prefixing an attribute name with `@`

```javascript
const handleClick = () => {
  alert('clicked the button');
};

const template = () => html`
  <button @click=${handleClick}></button>
`;
```

## Installation

```
$ npm install --save amp-js
```

## License

[MIT License](LICENSE)
