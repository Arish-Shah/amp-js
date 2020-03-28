import { html } from '../../../amp.js';

const Post = ({ title, body }) => html`
  <h1>${title}</h1>
  <p>${body}</p>
`;

export default Post;
