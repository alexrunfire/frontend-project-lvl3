import * as yup from 'yup';

const onChange = require('on-change');

const component = () => {
  const schema = yup.object().shape({
    url: yup.string().required().url(),
  });

  const state = {
    form: {
      url: '',
    },
  };
  const feedback = document.querySelector('.feedback');
  const [form] = document.forms;
  const inputField = form.querySelector('.form-control');
  const submitButton = form.querySelector('input[type="submit"]');
  const watchedState = onChange(state.form, (_path, url) => {
    schema.validate({ url })
      .then(() => {
        console.log('flex');
        submitButton.disabled = false;
        inputField.classList.remove('is-invalid');
      })
      .catch((err) => {
        const [error] = err.errors;
        inputField.classList.add('is-invalid');
        feedback.classList.add('text-danger');
        feedback.textContent = error;
      });
  });
  inputField.addEventListener('input', (e) => {
    e.preventDefault();
    watchedState.url = e.target.value;
  });
};
document.body.appendChild(component());
