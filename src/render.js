import i18next from 'i18next';
import { reduce, differenceBy, isEmpty } from 'lodash';
import onChange from 'on-change';
import state from './state';
import {
  submitButton, inputField, feedbackField, rssHeads, rssItems,
} from './fields';

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

const addNewItems = (newItems) => {
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

const addHead = (value) => {
  const { title, description, link } = value;
  const div = document.createElement('div');
  const a = document.createElement('a');
  a.setAttribute('href', link);
  a.textContent = `${title} (${description})`;
  div.append(a);
  rssHeads().prepend(div);
};

const findNewItems = (currentValue, previousValue) => reduce(currentValue,
  (acc, currentItems, key) => {
    const { [key]: previousItems = [] } = previousValue;
    const newItems = differenceBy(currentItems, previousItems, 'guid');
    return isEmpty(newItems) ? acc : newItems;
  }, []);

const enableForm = () => {
  submitButton().disabled = false;
  inputField().disabled = false;
};

const formStates = {
  fillingValid: () => {
    submitButton().disabled = false;
    feedbackField().textContent = '';
    inputField().classList.remove('is-invalid');
    feedbackField().classList.remove('text-success');
    feedbackField().classList.remove('text-danger');
  },
  fillingInvalid: () => {
    submitButton().disabled = true;
    inputField().classList.add('is-invalid');
    feedbackField().classList.remove('text-success');
    feedbackField().classList.add('text-danger');
  },
  processing: () => {
    submitButton().disabled = true;
    inputField().disabled = true;
    feedbackField().textContent = '';
  },
  processed: () => {
    enableForm();
    feedbackField().classList.remove('text-danger');
    feedbackField().classList.add('text-success');
    feedbackField().textContent = i18next.t('loaded');
    inputField().value = '';
  },
  failed: () => {
    enableForm();
    feedbackField().classList.add('text-danger');
  },
};
const watchedState = () => onChange(state, (path, currentValue, previousValue) => {
  switch (path) {
    case 'registrationProcess.state':
      formStates[currentValue]();
      break;
    case 'registrationProcess.error': {
      const [error] = currentValue;
      feedbackField().textContent = i18next.t(error);
      break;
    }
    case 'head': {
      addHead(currentValue);
      break;
    }
    case 'items': {
      const newItems = findNewItems(currentValue, previousValue);
      addNewItems(newItems);
      break;
    }
    default:
      throw new Error(`Unknown path in state: ${path}!`);
  }
});

export default watchedState;
