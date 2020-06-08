import * as yup from 'yup';

const onChange = require('on-change');

const axios = require('axios');

const proxy = {
  url: () => 'cors-anywhere.herokuapp.com',
};

const schema = yup.object().shape({
  url: yup.string().required().url(),
});

const feedback = document.querySelector('.feedback');
const [form] = document.forms;
const inputField = form.querySelector('.form-control');
const submitButton = form.querySelector('button[type="submit"]');

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
      url: '',
    },
    submitButton: {
      status: null,
    },
  };

  const watchedButton = onChange(state.submitButton, (_path, value) => {
    submitButton.disabled = value;
  });
  const watchedUrl = onChange(state.form, (_path, url) => {
    const errors = validate(url);
    if (errors.length === 0) {
      watchedButton.status = false;
      inputField.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.textContent = '';
    } else {
      watchedButton.status = true;
      const [error] = errors;
      inputField.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.textContent = error;
    }
  });
  inputField.addEventListener('input', (e) => {
    e.preventDefault();
    watchedUrl.url = e.target.value;
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedButton.status = true;
    axios.get(`https://${proxy.url()}/${state.form.url}`)
      .then((response) => {
        const domparser = new DOMParser();
        const doc = domparser.parseFromString(response.data, 'text/html');
        console.log(doc);
      })
      .catch((err) => {
        console.log(err.message);
      });
  });
};
