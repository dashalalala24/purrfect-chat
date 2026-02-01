import createValidateInput from './createValidateInput';

export default createValidateInput({
  inputKey: 'PasswordInput',
  propKey: 'password',
  pattern: /^(?=.*[A-Z])(?=.*\d).{8,40}$/,
  errorMessage: 'Invalid password',
});
