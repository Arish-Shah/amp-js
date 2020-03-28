import { html } from '../../../amp.js';

const Item = ({ id, title }) =>
  html`
    <li>
      <a href=${`#!/post/${id}`}><h3>${title}</h3></a>
    </li>
  `;

const AllPosts = data => html`
  <ol>
    ${data.posts.map(post => Item(post))}
  </ol>
`;

export default AllPosts;
