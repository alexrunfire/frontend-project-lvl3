import * as yup from 'yup';
import axios from 'axios';
import parse from './parse';
import proceedDoc from './proceedDoc';
import {
  watchedForm, watchedFeedback, watchedRows, inputField, form,
} from './view';

const rssUrls = [];
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
    watchedFeedback.empty = !watchedFeedback.empty;
    // watchedFeedback.textDanger = false;
  } else {
    watchedForm.submitButton = true;
    watchedForm.validStatus = false;
    const [error] = errors;
    watchedFeedback.value = error;
    watchedFeedback.textDanger = true;
  }
};
const checkDoc = (doc, url) => {
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    watchedFeedback.value = parserError.textContent;
    watchedFeedback.textDanger = true;
  } else {
    const { item, articles } = proceedDoc(doc);
    watchedRows.articles = { ...watchedRows.articles, [url]: articles };
    if (!rssUrls.includes(url)) {
      watchedRows.item = item;
      watchedFeedback.textSuccess = !watchedFeedback.textSuccess;
      watchedForm.emptyInput = !watchedForm.emptyInput;
      rssUrls.push(url);
    }
  }
};
const makeGetRequest = (url) => {
  axios.get(url, {
    timeout: 5000,
  })
    .then((response) => {
      const doc = parse(response);
      checkDoc(doc, url);
    })
    .catch((err) => {
      watchedFeedback.value = err.message;
      watchedFeedback.textDanger = true;
    })
    .then(() => {
      watchedForm.submitButton = false;
      if (rssUrls.includes(url)) {
        setTimeout(() => makeGetRequest(url), 5000);
      }
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
    if (rssUrls.includes(url)) {
      watchedForm.submitButton = false;
      watchedForm.validStatus = false;
      watchedFeedback.textDanger = true;
      watchedFeedback.rssExists = !watchedFeedback.rssExists;
    } else {
      makeGetRequest(url);
    }
  });
};
