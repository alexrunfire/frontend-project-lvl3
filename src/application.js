import * as yup from 'yup';
// import _ from 'lodash';
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
  };

  const watchedForm = onChange(state.form, (path, value) => {
    if (path === 'submitButton') {
      submitButton.disabled = value;
    } else if (path === 'validStatus' && !value) {
      inputField.classList.add('is-invalid');
    } else if (path === 'validStatus' && value) {
      inputField.classList.remove('is-invalid');
    } else if (path === 'emptyInput') {
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
    } else if (path === 'textSuccess') {
      feedbackField.classList.add('text-success');
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
  inputField.addEventListener('input', (e) => {
    e.preventDefault();
    validateUrl(e.target.value);
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedForm.submitButton = true;
    axios.get(`https://${proxy.url()}/${state.form.url}`)
      .then((response) => {
        watchedForm.submitButton = false;
        const doc = parse(response);
        const rssData = proceedDoc(doc);
        if (rssData instanceof Error) {
          watchedFeedback.value = rssData.message;
          watchedFeedback.textDanger = true;
        } else {
          watchedFeedback.textSuccess = true;
          watchedFeedback.value = 'RSS has been successfully added';
          watchedForm.emptyInput = true;
        }
      })
      .catch((err) => {
        watchedForm.submitButton = false;
        watchedFeedback.value = err.message;
        watchedFeedback.textDanger = true;
      });
  });
};
