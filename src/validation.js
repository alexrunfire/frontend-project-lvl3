import * as yup from 'yup';

export default (url, arrayOfValues) => {
  const schema = yup.string().required('empty')
    .url('invalid')
    .notOneOf(arrayOfValues, 'exists');
  try {
    schema.validateSync(url);
    return [];
  } catch (e) {
    return e.errors;
  }
};
