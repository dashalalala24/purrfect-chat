import createValidateInput from './createValidateInput';

export default createValidateInput({
  inputKey: 'MessageInput',
  propKey: 'message',
  pattern: /^(?!\s*$).+$/,
  errorMessage: 'Message cannot be empty',
});
