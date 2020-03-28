import { render } from '../../amp.js';

import AllPosts from './components/AllPosts.js';
import Post from './components/Post.js';

// The State
let data = {
  posts: [],
  loading: true
};
// The Container
const root = document.getElementById('root');

const hashChangeHandler = () => {
  const hash = window.location.hash;
  if (hash === '') {
    getAllPosts();
  } else {
    const postNumber = hash.slice(8);
    getPost(postNumber);
  }
};

const getAllPosts = async () => {
  let response = await fetch('https://jsonplaceholder.typicode.com/posts');
  response = await response.json();
  data.posts = response.slice(0, 10);
  data.loading = false;
  render(AllPosts(data), root);
};

const getPost = async postNumber => {
  let response = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${postNumber}`
  );
  response = await response.json();
  render(Post(response), root);
};

window.addEventListener('hashchange', hashChangeHandler);
window.addEventListener('load', hashChangeHandler);
