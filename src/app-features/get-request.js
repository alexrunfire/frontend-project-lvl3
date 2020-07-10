import axios from 'axios';
import checkDoc from './check-doc';
import state from '../state';
import {
  watchedFailed,
} from '../render';

const makeGetRequest = (url) => {
  axios.get(url, {
    timeout: 5000,
  })
    .then((response) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, 'text/xml');
      checkDoc(doc, url);
    })
    .catch((err) => {
      watchedFailed().error = [err.message];
    });
  setTimeout(() => {
    if (state.rssUrls.includes(url)) {
      makeGetRequest(url);
    }
  }, 5000);
};
export default makeGetRequest;
