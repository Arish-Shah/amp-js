# amp-js

A virtual DOM alternative to build declarative and reactive UI using template literal tags.

[![GitHub license](https://img.shields.io/github/license/Arish-Shah/amp-js?color=blue)](https://github.com/Arish-Shah/amp-js/blob/master/LICENSE)
[![NPM Version](https://img.shields.io/npm/v/@arish-shah/amp.svg)](https://www.npmjs.com/package/@arish-shah/amp)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Arish-Shah/amp-js/pulls)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

- **Highly Flexible:** Use expressive JavaScript templates that can render anything to HTML. Set properties and event listeners directly from the template.
- **Extremely Performant:** Using the latest generation of rendering techniques, it easily outperforms contemporary VirtualDOM-based rendering as used in modern frontend frameworks.
- **Lightweight:** ~2.6kb total size.
- **Extensible:** Create components, pass props, handle lifecycle events and efficiently update the DOM by using HTML templating.

## Overview

`amp-js` lets you write HTML templates in JavaScript with template literals.

```javascript
import { html, render } from '@arish-shah/amp';

// This is an amp template function. It returns an amp template.
const helloTemplate = (name) => html` <div>Hello ${name}!</div> `;

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
const template = () => html` <p>Hello World</p> `;
```

The contents of the template will be parsed as HTML. The flexibility comes from interpreted values that can be inserted into these templates.

```javascript
const template = (name) => html` <p>Hello ${name}!</p> `;
```

These interpreted values can in turn be any kind of object that amp-js can render, including nested templates and arrays.

## Extended Usage

### Function `component`

The `component` function can be used to create custom reusable components. It is provided with the default export.

- Each component has a first argument `id`, which helps amp-js locate its usage.
- The second parameter is a description object that contains an optional dynamic data object, methods to mutate them, props passed to the component, templates used inside it and the template itself. amp-js automatically binds `this` to the data, so they can be effectively changed causing a rerender.
- Each component should have a template function which gets called upon component creation.
- Execution of this function returns another function that can be called repeatedly to efficiently update the content.
- Changing the data members inside a component causes it to update automatically.

```javascript
const Hello = Amp.component('amp-hello', {
  template() {
    return html`<h1>Hello World</h1>`;
  }
});

Hello.generate();
```

The component can be consumed in HTML as such:

```html
<amp-hello></amp-hello>
```

---

For a more complex component,

```javascript
import Amp, { html } from 'https://unpkg.com/@arish-shah/amp';

const Counter = Amp.component('amp-counter', {
  data: {
    count: 0,
    step: 1
  },
  methods: {
    onmount() {
      this.count = +this.attr('start');
      this.step = +this.attr('step');
    },
    decrement() {
      this.count -= this.step;
    },
    increment() {
      this.count += this.step;
    }
  },
  template() {
    return html`
      <div class="counter">
        <button @click=${this.decrement}>Decrement</button>
        <span>${this.count}</span>
        <button @click=${this.increment}>Increment</button>
      </div>
    `;
  }
});

Counter.generate();
```

We can now create multiple `app-counter` component in our HTML, passing `start` and `step` as props:

```html
<!-- Starts counter with 5 and increments/decrements by 5 -->
<app-counter start="5" step="5"></app-counter>

<!-- Starts counter with 8 and increments/decrements by 3 -->
<app-counter start="8" step="3"></app-counter>
```

## Attributes

#### 1. Dynamic attributes

The `html` tag can also be used to set attributes on nodes. To set an attribute, assign the value of the attribute with an interpreted value. amp-js requires that you omit the surrounding `"` when setting attributes.

```javascript
const template = (source) => html` <img src=${source} /> `;

// Composite attribute
const template = (classString) => html`
  <div class=${`red ${classString}`}></div>
`;
```

#### 2. Boolean attributes

You can set boolean attributes by prefixing the attribute name with `?`

```javascript
const template = (secret) => html` <p ?hidden=${secret}></p> `;
```

#### 3. Properties

You can set properties on elements by prefixing an attribute name with `.`

```javascript
const template = (user) => html` <user-panel .user=${user}></user-panel> `;
```

#### 4. Event handlers

You can attach event handlers by prefixing an attribute name with `@`

```javascript
const handleClick = () => {
  alert('clicked the button');
};

const template = () => html` <button @click=${handleClick}></button> `;
```

## Installation

### npm

amp-js is distributed on npm, in the [`@arish-shah/amp` package](https://www.npmjs.com/package/@arish-shah/amp).

```
$ npm install @arish-shah/amp
```

### <span>unpkg</span>.com

You can also load amp-js directly from the unpkg.com CDN:

```javascript
import Amp, { html, render } from 'https://unpkg.com/@arish-shah/amp';
```

Or, you can create an `index.html` file and include amp-js with:

```html
<!-- development version -->
<script type="module">
  import Amp, {
    html,
    render
  } from 'https://unpkg.com/@arish-shah/amp@latest/amp.js';
</script>

<!-- production version -->
<script type="module">
  import Amp, {
    html,
    render
  } from 'https://unpkg.com/@arish-shah/amp@latest/amp.min.js';
</script>
```

## License

[MIT License](LICENSE)
