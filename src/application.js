import * as yup from 'yup';
import i18next from 'i18next';
import parse from './parse';
import proceedDoc from './proceedDoc';
import resources from './en';


const onChange = require('on-change');

const axios = require('axios');

const proxy = {
  url: () => 'cors-anywhere.herokuapp.com',
};

const schema = yup.object().shape({
  url: yup.string().required().url(),
});

const feedbackField = document.querySelector('.feedback');
const [form] = document.forms;
const inputField = form.querySelector('input');
const submitButton = form.querySelector('button');
const rssItems = document.querySelector('.rss-items');
const rssLinks = document.querySelector('.rss-links');

const validate = (url) => {
  try {
    schema.validateSync({ url });
    return [];
  } catch (e) {
    return e.errors;
  }
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: true,
    resources,
  });

  const state = {
    form: {
      submitButton: null,
      emptyInput: null,
      validStatus: null,
    },
    feedback: {
      value: null,
      textDanger: null,
      textSuccess: null,
      rssExists: null,
    },
    rssUrls: [],
    rssRows: {
      heads: null,
      items: [],
    },
  };

  const watchedForm = onChange(state.form, (path, value) => {
    if (path === 'submitButton') {
      submitButton.disabled = value;
    } else if (path === 'validStatus' && !value) {
      inputField.classList.add('is-invalid');
    } else if (path === 'validStatus' && value) {
      inputField.classList.remove('is-invalid');
    } else if (path === 'emptyInput' && value) {
      inputField.value = '';
    }
  });

  const watchedFeedback = onChange(state.feedback, (path, value) => {
    if (path === 'value') {
      feedbackField.textContent = value;
    } else if (path === 'textDanger' && value) {
      feedbackField.classList.remove('text-success');
      feedbackField.classList.add('text-danger');
    } else if (path === 'textDanger' && !value) {
      feedbackField.classList.remove('text-success');
      feedbackField.classList.remove('text-danger');
    } else if (path === 'textSuccess' && value) {
      feedbackField.classList.add('text-success');
      feedbackField.textContent = i18next.t('rssLoaded');
    } else if (path === 'rssExists' && value) {
      feedbackField.textContent = i18next.t('rssExists');
    }
  });
  const watchedRows = onChange(state.rssRows, (path, currentValue, previousValue) => {
    if (path === 'heads') {
      const div = document.createElement('div');
      const a = document.createElement('a');
      a.setAttribute('href', currentValue.headLink);
      a.textContent = `${currentValue.title} (${currentValue.description})`;
      div.append(a);
      rssItems.prepend(div);
    } else if (path === 'items') {
      rssLinks.innerHTML = '';
      [...currentValue, ...previousValue].forEach((item) => {
        const div = document.createElement('div');
        const a = document.createElement('a');
        a.setAttribute('href', item.link);
        a.textContent = item.itemTitle;
        div.append(a);
        rssLinks.append(div);
      });
    }
  });

  const validateUrl = (url) => {
    const errors = validate(url);
    if (errors.length === 0) {
      watchedForm.submitButton = false;
      watchedForm.validStatus = true;
      watchedFeedback.value = '';
      watchedFeedback.textDanger = false;
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
      const rssData = proceedDoc(doc);
      watchedRows.heads = rssData.head;
      watchedRows.items = rssData.items;
      watchedFeedback.textSuccess = true;
      watchedForm.emptyInput = true;
      state.rssUrls.push(url);
    }
  };
  const makeGetRequest = (url) => {
    axios.get(url)
      .then((response) => {
        watchedForm.submitButton = false;
        const doc = parse(response);
        checkDoc(doc, url);
      })
      .catch((err) => {
        watchedForm.submitButton = false;
        watchedFeedback.value = err.message;
        watchedFeedback.textDanger = true;
      });
  };
  inputField.addEventListener('input', (e) => {
    e.preventDefault();
    watchedFeedback.textSuccess = false;
    watchedForm.emptyInput = false;
    watchedFeedback.rssExists = false;
    validateUrl(e.target.value);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedForm.submitButton = true;
    const url = `https://${proxy.url()}/${inputField.value}`;
    if (state.rssUrls.includes(url)) {
      watchedForm.submitButton = false;
      watchedForm.validStatus = false;
      watchedFeedback.textDanger = true;
      watchedFeedback.rssExists = true;
    } else {
      makeGetRequest(url);
    }
  });
};
