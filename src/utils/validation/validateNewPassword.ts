import type Input from '../../components/Input/Input';

type TOldPasswordValidationContext = {
  children: Record<string, Input>;
  props: Record<string, unknown>;
  setProps: (nextProps: Record<string, unknown>) => void;
};

export default function validateNewPassword(this: TOldPasswordValidationContext, e: Event) {
  const target = e.target;

  if (!(target instanceof HTMLInputElement)) {
    return;
  }

  const input = this.children.ConfirmPasswordInput;

  if (!input) {
    return;
  }

  const inputValue = target.value.trim();

  const oldPasswordValue = typeof this.props.oldPassword === 'string' ? this.props.oldPassword : '';
  const isValid = inputValue.length > 0 && oldPasswordValue.length && inputValue !== oldPasswordValue;

  if (isValid) {
    input.setProps({ errorMessage: null, value: inputValue });
  } else {
    input.setProps({ errorMessage: 'New password cannot be the same', value: inputValue });
  }

  this.setProps({ confirmPassword: inputValue });
}
