import form from './components/form';
import inputField from './components/input-field';
import makeUrl from './app-features/url';
import validateUrl from './app-features/validation';
import makeGetRequest from './app-features/get-request';
import { watchedProcessing } from './render';

export default () => {
  inputField().addEventListener('input', (e) => {
    e.preventDefault();
    validateUrl(e.target.value);
  });
  form().addEventListener('submit', (e) => {
    e.preventDefault();
    watchedProcessing().sending = !watchedProcessing().sending;
    makeGetRequest(makeUrl(inputField().value));
  });
};
