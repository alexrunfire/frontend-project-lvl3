import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/en';

const onChange = require('on-change');

const [form] = document.forms;
const inputField = form.querySelector('input');
const submitButton = form.querySelector('button');
const feedbackField = document.querySelector('.feedback');
const rssHeads = document.querySelector('.rss-heads');
const rssItems = document.querySelector('.rss-items');

const state = {
  registrationProcesses: {
    filling: {
      valid: null,
      error: null,
      rssExists: null,
    },
    processing: {
      sending: null,
    },
    processed: {
      head: null,
      items: {},
    },
    failed: {
      error: null,
    },
  },
  rssUrls: [],
};

i18next.init({
  lng: 'en',
  debug: true,
  resources,
});

const findNewItems = (currentValue, previousValue) => _.reduce(currentValue,
  (acc, currentItems, key) => {
    const { [key]: previousItems = [] } = previousValue;
    const newItems = _.differenceBy(currentItems, previousItems, 'guid');
    return _.isEmpty(newItems) ? acc : newItems;
  }, []);

const makeElement = (item) => {
  const { link, title } = item;
  const div = document.createElement('div');
  const a = document.createElement('a');
  a.setAttribute('href', link);
  a.classList.add('text-info');
  a.textContent = title;
  div.append(a);
  return div;
};

const makeItems = (currentValue, previousValue) => {
  const newItems = findNewItems(currentValue, previousValue);
  if (rssItems.children.length === 0) {
    newItems.forEach((item) => {
      const element = makeElement(item);
      rssItems.append(element);
    });
  } else {
    const { firstChild } = rssItems;
    newItems.forEach((item) => {
      const element = makeElement(item);
      firstChild.before(element);
    });
  }
};

const makeHead = ({ title, description, link }) => {
  const div = document.createElement('div');
  const a = document.createElement('a');
  a.setAttribute('href', link);
  a.textContent = `${title} (${description})`;
  div.append(a);
  rssHeads.prepend(div);
};

const enableItems = () => {
  submitButton.disabled = false;
  inputField.disabled = false;
};
const watchedProcessed = onChange(state.registrationProcesses.processed,
  (path, currentValue, previousValue) => {
    if (path === 'head') {
      enableItems();
      feedbackField.classList.remove('text-danger');
      feedbackField.classList.add('text-success');
      feedbackField.textContent = i18next.t('rssLoaded');
      inputField.value = '';
      makeHead(currentValue);
    } else if (path === 'items') {
      makeItems(currentValue, previousValue);
    }
  });

const watchedFailed = onChange(state.registrationProcesses.failed, (_path, [error]) => {
  enableItems();
  feedbackField.classList.add('text-danger');
  feedbackField.textContent = error;
});
const watchedProcessing = onChange(state.registrationProcesses.processing, () => {
  submitButton.disabled = true;
  inputField.disabled = true;
  feedbackField.textContent = '';
});

const makeInvalid = () => {
  submitButton.disabled = true;
  inputField.classList.add('is-invalid');
  feedbackField.classList.add('text-danger');
};

const watchedFilling = onChange(state.registrationProcesses.filling, (path, value) => {
  feedbackField.classList.remove('text-success');
  if (path === 'error') {
    makeInvalid();
    const [error] = value;
    feedbackField.textContent = error;
  } else if (path === 'rssExists') {
    makeInvalid();
    feedbackField.textContent = i18next.t('rssExists');
  } else if (path === 'valid') {
    submitButton.disabled = false;
    feedbackField.textContent = '';
    inputField.classList.remove('is-invalid');
    feedbackField.classList.remove('text-danger');
  }
});

function Render(filling, processing, failed, processed, rssUrls, input, formElement) {
  this.watchedFilling = filling;
  this.watchedProcessing = processing;
  this.watchedFailed = failed;
  this.watchedProcessed = processed;
  this.rssUrls = rssUrls;
  this.inputField = input;
  this.form = formElement;
}
export default new Render(
  watchedFilling,
  watchedProcessing,
  watchedFailed,
  watchedProcessed,
  state.rssUrls,
  inputField,
  form,
);
