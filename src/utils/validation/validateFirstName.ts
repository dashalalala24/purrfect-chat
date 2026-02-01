import createValidateInput from './createValidateInput';

export default createValidateInput({
  inputKey: 'FirstNameInput',
  propKey: 'firstName',
  pattern: /^[A-ZА-ЯЁ][a-zа-яё]*(?:-[A-ZА-ЯЁ][a-zа-яё]*)*$/,
  errorMessage: 'Invalid name',
});
