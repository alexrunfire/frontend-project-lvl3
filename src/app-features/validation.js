import * as yup from 'yup';
import state from '../state';
import { watchedFilling } from '../render';
import makeUrl from './url';

const schema = yup.object().shape({
  url: yup.string().required().url(),
});

const validate = (url) => {
  try {
    schema.validateSync({ url });
    return [];
  } catch (e) {
    return e.errors;
  }
};
const validateUniqUrl = (url) => {
  const errors = validate(url);
  if (errors.length === 0) {
    watchedFilling().valid = !watchedFilling().valid;
  } else {
    watchedFilling().error = [errors];
  }
};
export default (url) => {
  if (state.rssUrls.includes(makeUrl(url))) {
    watchedFilling().rssExists = !watchedFilling().rssExists;
  } else {
    validateUniqUrl(url);
  }
};
