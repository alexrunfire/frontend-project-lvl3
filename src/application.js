import i18next from 'i18next';
import resources from './locales';
import parseRss from './rss-parser';
import validate from './validation';
import makeRequest from './make-request';
import {
  watchedProcessing, watchedFilling, watchedFailed, watchedProcessed,
} from './render';
import state from './state';
import {
  inputField, form,
} from './fields';

const timeout = 5000;

const validateUrl = (url) => {
  const errors = validate(url, state.rssUrls);
  if (errors.length === 0) {
    watchedFilling().valid = !watchedFilling().valid;
  } else {
    watchedFilling().error = errors;
  }
};

const proceedDoc = (doc, url) => {
  const {
    title, description, link, items,
  } = parseRss(doc);
  watchedProcessed().items = { ...watchedProcessed().items, [url]: items };
  if (!state.rssUrls.includes(url)) {
    watchedProcessed().head = { title, description, link };
    state.rssUrls = [...state.rssUrls, url];
  }
};

const checkDoc = (doc, url) => {
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    watchedFailed().error = ['renderProblem'];
  } else {
    proceedDoc(doc, url);
  }
};

const makeGetRequest = (url) => {
  makeRequest(url)
    .then((response) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, 'text/xml');
      checkDoc(doc, url);
    })
    .catch(() => {
      watchedFailed().error = ['networkProblem'];
    });
  setTimeout(() => {
    if (state.rssUrls.includes(url)) {
      makeGetRequest(url);
    }
  }, timeout);
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  });
  inputField().addEventListener('input', (e) => {
    e.preventDefault();
    validateUrl(e.target.value);
  });
  form().addEventListener('submit', (e) => {
    e.preventDefault();
    watchedProcessing().sending = !watchedProcessing().sending;
    makeGetRequest(inputField().value);
  });
};
