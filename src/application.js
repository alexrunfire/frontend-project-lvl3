import * as yup from 'yup';
import axios from 'axios';
import parseRss from './rssParser';
import render from './view';

const { inputField, form } = render;

const proxy = {
  url: () => 'cors-anywhere.herokuapp.com',
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
    render.filling.valid = !render.filling.valid;
  } else {
    render.filling.error = [errors];
  }
};
const validateUrl = (url) => {
  if (render.rssUrls.includes(makeUrl(url))) {
    render.filling.rssExists = !render.filling.rssExists;
  } else {
    validateUniqUrl(url);
  }
};
const checkDoc = (doc, url) => {
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    render.failed.error = [parserError.textContent];
  } else {
    const {
      title, description, link, items,
    } = parseRss(doc);
    render.processed.items = { ...render.processed.items, [url]: items };
    if (!render.rssUrls.includes(url)) {
      render.processed.head = { title, description, link };
      render.rssUrls.push(url);
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
    })
    .catch((err) => {
      render.failed.error = [err.message];
    });
  setTimeout(() => {
    if (render.rssUrls.includes(url)) {
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
    render.processing.sending = !render.processing.sending;
    makeGetRequest(makeUrl(inputField.value));
  });
};
