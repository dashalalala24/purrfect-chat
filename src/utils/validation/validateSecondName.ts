import createValidateInput from './createValidateInput';

export default createValidateInput({
  inputKey: 'SecondNameInput',
  propKey: 'secondName',
  pattern: /^[A-ZА-ЯЁ][a-zа-яё]*(?:-[A-ZА-ЯЁ][a-zа-яё]*)*$/,
  errorMessage: 'Invalid name',
});
