import * as yup from 'yup';
import parse from './parse';
import proceedDoc from './proceedDoc';


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
    },
    rssUrls: [],
    rssRows: {
      heads: null,
      items: null,
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
    }
  });
  const watchedRows = onChange(state.rssRows, (path, value) => {
    if (path === 'heads') {
      const externalDiv = document.createElement('div');
      const a = document.createElement('a');
      a.setAttribute('href', value.headLink);
      a.textContent = value.title;
      const internalDiv = document.createElement('div');
      internalDiv.textContent = value.description;
      externalDiv.append(a, internalDiv);
      rssItems.append(externalDiv);
    } else {
      console.log();
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
    if (!parserError) {
      watchedFeedback.value = parserError.textContent;
      watchedFeedback.textDanger = true;
    } else {
      const rssData = proceedDoc(doc);
      console.log(rssData);
      watchedRows.heads = rssData.head;
      watchedRows.items = rssData.items;
      watchedFeedback.textSuccess = true;
      watchedFeedback.value = 'RSS has been successfully added';
      watchedForm.emptyInput = true;
      state.rssUrls.push(url);
    }
  };
  const makeGetRequest = (url) => {
    axios.get(url)
      .then((response) => {
        watchedForm.submitButton = false;
        const doc = parse(response);
        console.log(doc);
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
      watchedFeedback.value = 'Rss already exists';
    } else {
      makeGetRequest(url);
    }
  });
};
