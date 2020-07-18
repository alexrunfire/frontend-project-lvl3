import axios from 'axios';

const proxy = {
  url: () => 'cors-container.herokuapp.com',
};
const makeFullUrl = (url) => `https://${proxy.url()}/${url}`;

const timeout = 5000;

export default (url) => axios.get(makeFullUrl(url), { timeout });
