import i18next from 'i18next';
import resources from './en';

const onChange = require('on-change');

const feedbackField = document.querySelector('.feedback');
const [form] = document.forms;
const inputField = form.querySelector('input');
const submitButton = form.querySelector('button');
const rssItems = document.querySelector('.rss-items');
const rssLinks = document.querySelector('.rss-links');

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
    empty: null,
  },
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
  } else if (path === 'empty' && value) {
    feedbackField.textContent = '';
  }
});
const watchedRows = onChange(state.rssRows, (path, value) => {
  if (path === 'heads') {
    const div = document.createElement('div');
    const a = document.createElement('a');
    a.setAttribute('href', value.headLink);
    a.textContent = `${value.title} (${value.description})`;
    div.append(a);
    rssItems.prepend(div);
  } else if (path === 'items') {
    rssLinks.innerHTML = '';
    value.forEach((item) => {
      const div = document.createElement('div');
      const a = document.createElement('a');
      a.setAttribute('href', item.link);
      a.classList.add('text-info');
      a.textContent = item.itemTitle;
      div.append(a);
      rssLinks.append(div);
    });
  }
});
export {
  watchedForm, watchedFeedback, watchedRows, inputField, form,
};
