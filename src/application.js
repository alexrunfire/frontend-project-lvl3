import i18next from 'i18next';
import { has } from 'lodash';
import resources from './locales';
import parse from './rss-parser';
import validate from './validation';
import makeRequest from './make-request';
import watchedState from './render';
import {
  inputField, form,
} from './fields';

const timeout = 5000;

const validateUrl = (url) => {
  const errors = validate(url, watchedState().items);
  if (errors.length) {
    watchedState().registrationProcess.state = 'fillingInvalid';
    watchedState().registrationProcess.error = errors;
  } else {
    watchedState().registrationProcess.state = 'fillingValid';
  }
};

const addItemsToState = (url, items) => {
  watchedState().items = { ...watchedState().items, [url]: items };
};

const proceedRssData = (rssData, url) => {
  const {
    title, description, link, items,
  } = rssData;
  if (!has(watchedState().items, url)) {
    watchedState().registrationProcess.state = 'processed';
    watchedState().head = { title, description, link };
    addItemsToState(url, items);
  } else {
    addItemsToState(url, items);
  }
};

const makeGetRequest = (url) => {
  makeRequest(url)
    .then(({ data }) => {
      try {
        const rssData = parse(data);
        proceedRssData(rssData, url);
      } catch (e) {
        watchedState().registrationProcess.state = 'failed';
        watchedState().registrationProcess.error = ['renderProblem'];
      }
    })
    .catch(() => {
      watchedState().registrationProcess.state = 'failed';
      watchedState().registrationProcess.error = ['networkProblem'];
    });
  setTimeout(() => {
    if (has(watchedState().items, url)) {
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
    watchedState().registrationProcess.state = 'processing';
    makeGetRequest(inputField().value);
  });
};
