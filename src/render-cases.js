import i18next from 'i18next';
import { reduce, differenceBy, isEmpty } from 'lodash';
import {
  submitButton, inputField, feedbackField, rssHeads, rssItems,
} from './fields';

const enableForm = () => {
  submitButton().disabled = false;
  inputField().disabled = false;
};

const makeHead = (value) => {
  enableForm();
  feedbackField().classList.remove('text-danger');
  feedbackField().classList.add('text-success');
  feedbackField().textContent = i18next.t('loaded');
  inputField().value = '';
  const { title, description, link } = value;
  const div = document.createElement('div');
  const a = document.createElement('a');
  a.setAttribute('href', link);
  a.textContent = `${title} (${description})`;
  div.append(a);
  rssHeads().prepend(div);
};

const createItem = (item) => {
  const { link, title } = item;
  const div = document.createElement('div');
  const a = document.createElement('a');
  a.setAttribute('href', link);
  a.classList.add('text-info');
  a.textContent = title;
  div.append(a);
  return div;
};

const findNewItems = (currentValue, previousValue) => reduce(currentValue,
  (acc, currentItems, key) => {
    const { [key]: previousItems = [] } = previousValue;
    const newItems = differenceBy(currentItems, previousItems, 'guid');
    return isEmpty(newItems) ? acc : newItems;
  }, []);

const makeItems = (currentValue, previousValue) => {
  const newItems = findNewItems(currentValue, previousValue);
  if (rssItems().children.length === 0) {
    newItems.forEach((item) => {
      const newItem = createItem(item);
      rssItems().append(newItem);
    });
  } else {
    const { firstChild } = rssItems();
    newItems.forEach((item) => {
      const newItem = createItem(item);
      firstChild.before(newItem);
    });
  }
};

const onFillingError = ([error]) => {
  submitButton().disabled = true;
  inputField().classList.add('is-invalid');
  feedbackField().classList.add('text-danger');
  feedbackField().textContent = i18next.t(error);
};

const onFillingValid = () => {
  submitButton().disabled = false;
  feedbackField().textContent = '';
  inputField().classList.remove('is-invalid');
  feedbackField().classList.remove('text-danger');
};
export {
  onFillingError,
  onFillingValid,
  makeItems,
  makeHead,
  enableForm,
};
