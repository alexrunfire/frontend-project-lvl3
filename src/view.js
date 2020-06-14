import i18next from 'i18next';
import { differenceBy } from 'lodash';
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
    item: null,
    articles: {
      currentItemUrl: null,
      articlesList: {},
    },
  },
};

const getPrevArticles = (previousValue, currentItemUrl) => {
  const { articlesList } = previousValue;
  const prevArticles = articlesList[currentItemUrl];
  if (!prevArticles) {
    return [];
  }
  return prevArticles;
};

const makeItems = (currentValue, previousValue) => {
  const { currentItemUrl, articlesList } = currentValue;
  const currentArticles = articlesList[currentItemUrl];
  console.log(currentArticles);
  if (rssLinks.childNodes.length === 0) {
    currentArticles.forEach((article) => {
      const { articleLink, articleTitle } = article;
      const div = document.createElement('div');
      const a = document.createElement('a');
      a.setAttribute('href', articleLink);
      a.classList.add('text-info');
      a.textContent = articleTitle;
      div.append(a);
      rssLinks.append(div);
    });
  } else {
    const { firstChild } = rssLinks;
    const previousAricles = getPrevArticles(previousValue, currentItemUrl);
    const newArticles = differenceBy(currentArticles, previousAricles, 'id');
    newArticles.forEach((article) => {
      const { articleLink, articleTitle } = article;
      const div = document.createElement('div');
      const a = document.createElement('a');
      a.setAttribute('href', articleLink);
      a.classList.add('text-info');
      a.textContent = articleTitle;
      div.append(a);
      firstChild.before(div);
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
const watchedRows = onChange(state.rssRows, (path, currentValue, previousValue) => {
  if (path === 'item') {
    const { itemLink, itemTitle, description } = currentValue;
    const div = document.createElement('div');
    const a = document.createElement('a');
    a.setAttribute('href', itemLink);
    a.textContent = `${itemTitle} (${description})`;
    div.append(a);
    rssItems.prepend(div);
  } else if (path === 'articles') {
    makeItems(currentValue, previousValue);
  }
});
export {
  watchedForm, watchedFeedback, watchedRows, inputField, form,
};
