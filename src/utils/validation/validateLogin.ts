import createValidateInput from './createValidateInput';

export default createValidateInput({
  inputKey: 'LoginInput',
  propKey: 'login',
  pattern: /^(?=.{3,20}$)(?=.*[A-Za-z])[A-Za-z0-9_-]+$/,
  errorMessage: 'Invalid login',
});
