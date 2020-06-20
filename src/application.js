#!/usr/bin/env node
import * as yup from 'yup';
import axios from 'axios';
import parseRss from './rssParser';
import {
  state, watchedForm, watchedFeedback, watchedRows, inputField, form,
} from './view';

const proxy = {
  url: () => 'cors-container.herokuapp.com',
};

const schema = yup.object().shape({
  url: yup.string().required().url(),
});

const validate = (url) => {
  try {
    schema.validateSync({ url });
    return [];
  } catch (e) {
    return e.errors;
  }
};

const validateUrl = (url) => {
  const errors = validate(url);
  if (errors.length === 0) {
    watchedForm.submitButton = false;
    watchedForm.validStatus = true;
    watchedFeedback.value = '';
  } else {
    watchedForm.submitButton = true;
    watchedForm.validStatus = false;
    const [error] = errors;
    watchedFeedback.value = error;
    watchedFeedback.textDanger = !watchedFeedback.textDanger;
  }
};
const checkDoc = (doc, url) => {
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    watchedFeedback.value = parserError.textContent;
    watchedFeedback.textDanger = !watchedFeedback.textDanger;
  } else {
    const {
      title, description, link, articles,
    } = parseRss(doc);
    watchedRows.articles = { ...watchedRows.articles, [url]: articles };
    if (!state.rssUrls.includes(url)) {
      watchedRows.item = { title, description, link };
      watchedFeedback.textSuccess = !watchedFeedback.textSuccess;
      watchedForm.emptyInput = !watchedForm.emptyInput;
      state.rssUrls.push(url);
    }
  }
};
const makeGetRequest = (url) => {
  axios.get(url, {
    timeout: 5000,
  })
    .then((response) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(response.data, 'text/xml');
      checkDoc(doc, url);
      watchedForm.submitButton = false;
      if (state.rssUrls.includes(url)) {
        setTimeout(() => makeGetRequest(url), 5000);
      }
    })
    .catch((err) => {
      watchedFeedback.value = err.message;
      watchedFeedback.textDanger = !watchedFeedback.textDanger;
    });
};
export default () => {
  inputField.addEventListener('input', (e) => {
    e.preventDefault();
    validateUrl(e.target.value);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedForm.submitButton = true;
    const url = `https://${proxy.url()}/${inputField.value}`;
    if (state.rssUrls.includes(url)) {
      watchedForm.submitButton = false;
      watchedForm.validStatus = false;
      watchedFeedback.textDanger = !watchedFeedback.textDanger;
      watchedFeedback.rssExists = !watchedFeedback.rssExists;
    } else {
      makeGetRequest(url);
    }
  });
};
