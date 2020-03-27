import { html, render } from '../../amp.js';

const root = document.getElementById('root');
let data = {
  message: 'World',
  count: 0
};

const handleClick = () => {
  data.count++;
  render(Template(data), root);
};

const handleInput = event => {
  data.message = event.target.value;
  render(Template(data), root);
};

const Template = data => html`
  <input type="text" value=${data.message} @input=${handleInput} />
  <button @click=${handleClick}>Clicks: ${data.count}</button>
  <h1>Hello ${data.message || 'Stranger'}!</h1>
`;

render(Template(data), root);
