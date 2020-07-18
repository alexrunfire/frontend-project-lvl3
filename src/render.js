import i18next from 'i18next';
import state from './state';
import {
  submitButton, inputField, feedbackField,
} from './fields';
import {
  onFillingError,
  onFillingValid,
  makeItems,
  makeHead,
  enableForm,
} from './render-cases';

const onChange = require('on-change');

const processedCases = { head: makeHead, items: makeItems };
const watchedProcessed = () => onChange(state.registrationProcesses.processed,
  (path, currentValue, previousValue) => { processedCases[path](currentValue, previousValue); });

const watchedFailed = () => onChange(state.registrationProcesses.failed, (_path, [error]) => {
  enableForm();
  feedbackField().classList.add('text-danger');
  feedbackField().textContent = i18next.t(error);
});

const watchedProcessing = () => onChange(state.registrationProcesses.processing, () => {
  submitButton().disabled = true;
  inputField().disabled = true;
  feedbackField().textContent = '';
});

const fillingCases = { error: onFillingError, valid: onFillingValid };

const watchedFilling = () => onChange(state.registrationProcesses.filling, (path, value) => {
  feedbackField().classList.remove('text-success');
  fillingCases[path](value);
});

export {
  watchedFilling, watchedProcessing, watchedProcessed, watchedFailed,
};
