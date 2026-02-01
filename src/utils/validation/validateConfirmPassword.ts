import type Input from '../../components/Input/Input';
import getInputValue from '../getInputValue';

type TConfirmPasswordValidationContext = {
  children: Record<string, Input>;
};

export default function validateConfirmPassword(this: TConfirmPasswordValidationContext, e: Event) {
  const target = e.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const input = this.children.ConfirmPasswordInput;

  if (!input) {
    return;
  }

  const inputValue = target.value.trim();

  // if (!inputValue.length) {
  //   return;
  // }

  const passwordValue = getInputValue(this.children.PasswordInput);
  const isValid = inputValue.length > 0 && inputValue === passwordValue;

  if (isValid) {
    input.setProps({ errorMessage: null, value: inputValue });
  } else {
    input.setProps({ errorMessage: 'Passwords do not match', value: inputValue });
  }

}
