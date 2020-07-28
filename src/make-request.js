import axios from 'axios';

const proxy = 'cors-container.herokuapp.com';
const makeFullUrl = (url) => `https://${proxy}/${url}`;

const timeout = 5000;

export default (url) => axios.get(makeFullUrl(url), { timeout });
