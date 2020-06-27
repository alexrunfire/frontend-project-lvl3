import * as yup from 'yup';
import axios from 'axios';
import parseRss from './rssParser';
import render from './view';

const {
  watchedFilling,
  watchedProcessing,
  watchedFailed,
  watchedProcessed,
  rssUrls,
  inputField,
  form,
} = render;

const proxy = {
  url: () => 'cors-container.herokuapp.com',
};
const makeUrl = (url) => `https://${proxy.url()}/${url}`;

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
const validateUniqUrl = (url) => {
  const errors = validate(url);
  if (errors.length === 0) {
    watchedFilling.valid = !watchedFilling.valid;
  } else {
    watchedFilling.error = [errors];
  }
};
const validateUrl = (url) => {
  if (rssUrls.includes(makeUrl(url))) {
    watchedFilling.rssExists = !watchedFilling.rssExists;
  } else {
    validateUniqUrl(url);
  }
};

const makeElements = (rssDoc, url) => {
  const {
    title, description, link, items,
  } = parseRss(rssDoc);
  watchedProcessed.items = { ...watchedProcessed.items, [url]: items };
  if (!rssUrls.includes(url)) {
    watchedProcessed.head = { title, description, link };
    rssUrls.push(url);
  }
};

const checkDoc = (doc, url) => {
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    watchedFailed.error = [parserError.textContent];
  } else {
    makeElements(doc, url);
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
    })
    .catch((err) => {
      watchedFailed.error = [err.message];
    });
  setTimeout(() => {
    if (rssUrls.includes(url)) {
      makeGetRequest(url);
    }
  }, 5000);
};
export default () => {
  inputField.addEventListener('input', (e) => {
    e.preventDefault();
    validateUrl(e.target.value);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedProcessing.sending = !watchedProcessing.sending;
    makeGetRequest(makeUrl(inputField.value));
  });
};
