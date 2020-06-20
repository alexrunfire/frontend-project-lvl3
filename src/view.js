import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/en';

const onChange = require('on-change');

const [form] = document.forms;
const inputField = form.querySelector('input');
const submitButton = form.querySelector('button');
const feedbackField = document.querySelector('.feedback');
const rssLinks = document.querySelector('.rss-links');
const rssItems = document.querySelector('.rss-items');

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
  },
  rssRows: {
    item: null,
    articles: {},
  },
  rssUrls: [],
};

i18next.init({
  lng: 'en',
  debug: true,
  resources,
});

const getPreviousArticles = (object, key) => {
  if (_.has(object, key)) {
    return object[key];
  }
  return [];
};

const findNewArticles = (currentValue, previousValue) => _.reduce(currentValue,
  (acc, currentArticles, key) => {
    const previousArticles = getPreviousArticles(previousValue, key);
    const newArticles = _.differenceBy(currentArticles, previousArticles, 'guid');
    if (!_.isEmpty(newArticles)) {
      return newArticles;
    }
    return acc;
  }, []);

const makeElement = (article) => {
  const { link, title } = article;
  const div = document.createElement('div');
  const a = document.createElement('a');
  a.setAttribute('href', link);
  a.classList.add('text-info');
  a.textContent = title;
  div.append(a);
  return div;
};

const makeItems = (currentValue, previousValue) => {
  const newArticles = findNewArticles(currentValue, previousValue);
  if (rssLinks.children.length === 0) {
    newArticles.forEach((article) => {
      const element = makeElement(article);
      rssLinks.append(element);
    });
  } else {
    const { firstChild } = rssLinks;
    newArticles.forEach((article) => {
      const element = makeElement(article);
      firstChild.before(element);
    });
  }
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
  } else if (path === 'textDanger') {
    feedbackField.classList.remove('text-success');
    feedbackField.classList.add('text-danger');
  } else if (path === 'textSuccess') {
    feedbackField.classList.remove('text-danger');
    feedbackField.classList.add('text-success');
    feedbackField.textContent = i18next.t('rssLoaded');
  } else if (path === 'rssExists') {
    feedbackField.textContent = i18next.t('rssExists');
  }
});
const watchedRows = onChange(state.rssRows, (path, currentValue, previousValue) => {
  if (path === 'item') {
    const { title, description, link } = currentValue;
    const div = document.createElement('div');
    const a = document.createElement('a');
    a.setAttribute('href', link);
    a.textContent = `${title} (${description})`;
    div.append(a);
    rssItems.prepend(div);
  } else if (path === 'articles') {
    makeItems(currentValue, previousValue);
  }
});
export {
  state, watchedForm, watchedFeedback, watchedRows, inputField, form,
};
