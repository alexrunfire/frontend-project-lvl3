import * as yup from 'yup';

const onChange = require('on-change');

const schema = yup.object().shape({
  url: yup.string().required().url(),
});

const feedback = document.querySelector('.feedback');
const [form] = document.forms;
const inputField = form.querySelector('.form-control');
const submitButton = form.querySelector('button[type="submit"]');

const validate = (url) => {
  try {
    schema.validateSync({ url });
    return [];
  } catch (e) {
    return e.errors;
  }
};

const component = () => {
  const state = {
    form: {
      url: '',
    },
  };

  const watchedState = onChange(state.form, (_path, url) => {
    const errors = validate(url);
    console.log(errors);
    if (errors.length === 0) {
      submitButton.disabled = false;
      inputField.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.textContent = '';
    } else {
      const [error] = errors;
      inputField.classList.add('is-invalid');
      feedback.classList.add('text-danger');
      feedback.textContent = error;
    }
  });
  inputField.addEventListener('input', (e) => {
    e.preventDefault();
    watchedState.url = e.target.value;
  });
};
document.body.appendChild(component());
