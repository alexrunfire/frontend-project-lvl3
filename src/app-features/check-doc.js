import { watchedFailed } from '../render';
import proceedDoc from './proceed-doc';

export default (doc, url) => {
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    watchedFailed().error = [parserError.textContent];
  } else {
    proceedDoc(doc, url);
  }
};
