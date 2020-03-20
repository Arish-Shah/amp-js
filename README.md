# amp-js

A virtual DOM alternative to build declarative and reactive UI using template literal tags.

## Usage

Install using `npm i amp-js` and consume as such

```js
import { html, render } from 'amp-js';

const template = name => html`
  <div>${name}</div>
`;

render(template('Ben'), document.body);

render(template('Rey'), document.body);
```

## License

[MIT License](LICENSE)
