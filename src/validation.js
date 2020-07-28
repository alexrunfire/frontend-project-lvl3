import * as yup from 'yup';

export default (url, items) => {
  const usedUrls = Object.keys(items);
  const schema = yup.string().required('empty')
    .url('invalid')
    .notOneOf(usedUrls, 'exists');
  try {
    schema.validateSync(url);
    return [];
  } catch (e) {
    return e.errors;
  }
};
