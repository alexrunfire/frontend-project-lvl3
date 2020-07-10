import i18next from 'i18next';
import resources from './locales/en';
import state from './state';
import inputField from './components/input-field';
import createRssHeaders from './render-features/create-rss-headers';
import createRssItems from './render-features/create-rss-items';
import submitButton from './components/submit-button';
import feedbackField from './components/feedback-field';

const onChange = require('on-change');

i18next.init({
  lng: 'en',
  debug: true,
  resources,
});

const enableForm = () => {
  submitButton().disabled = false;
  inputField().disabled = false;
};

const makeInvalidForm = () => {
  submitButton().disabled = true;
  inputField().classList.add('is-invalid');
  feedbackField().classList.add('text-danger');
};

const watchedProcessed = () => onChange(state.registrationProcesses.processed,
  (path, currentValue, previousValue) => {
    if (path === 'head') {
      enableForm();
      feedbackField().classList.remove('text-danger');
      feedbackField().classList.add('text-success');
      feedbackField().textContent = i18next.t('rssLoaded');
      inputField().value = '';
      createRssHeaders(currentValue);
    } else if (path === 'items') {
      createRssItems(currentValue, previousValue);
    }
  });

const watchedFailed = () => onChange(state.registrationProcesses.failed, (_path, [error]) => {
  enableForm();
  feedbackField().classList.add('text-danger');
  feedbackField().textContent = error;
});

const watchedProcessing = () => onChange(state.registrationProcesses.processing, () => {
  submitButton().disabled = true;
  inputField().disabled = true;
  feedbackField().textContent = '';
});

const watchedFilling = () => onChange(state.registrationProcesses.filling, (path, value) => {
  feedbackField().classList.remove('text-success');
  if (path === 'error') {
    makeInvalidForm();
    const [error] = value;
    feedbackField().textContent = error;
  } else if (path === 'rssExists') {
    makeInvalidForm();
    feedbackField().textContent = i18next.t('rssExists');
  } else if (path === 'valid') {
    submitButton().disabled = false;
    feedbackField().textContent = '';
    inputField().classList.remove('is-invalid');
    feedbackField().classList.remove('text-danger');
  }
});

export {
  watchedFilling, watchedProcessing, watchedProcessed, watchedFailed,
};
