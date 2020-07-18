import { head } from 'lodash';

const feedbackField = () => document.querySelector('.feedback');

const form = () => head(document.forms);

const inputField = () => form().querySelector('.form-control');

const rssHeads = () => document.querySelector('.rss-heads');

const rssItems = () => document.querySelector('.rss-items');

const submitButton = () => form().querySelector('button[type="submit"]');

export {
  feedbackField, form, inputField, rssHeads, rssItems, submitButton,
};
