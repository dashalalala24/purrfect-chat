import createValidateInput from './createValidateInput';

export default createValidateInput({
  inputKey: 'PhoneInput',
  propKey: 'phone',
  pattern: /^\+?\d{10,15}$/,
  errorMessage: 'Invalid phone number',
});
