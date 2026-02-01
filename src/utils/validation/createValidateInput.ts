import type Input from '../../components/Input/Input';

type TValidationContext = {
  children: Record<string, Input>;
};

type TValidationOptions = {
  inputKey: string;
  propKey: string;
  pattern: RegExp;
  errorMessage: string;
};

export default function createValidateInput(options: TValidationOptions) {
  return function validateInput(this: TValidationContext, e: Event) {
    const target = e.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    const input = this.children[options.inputKey];

    if (!input) {
      return;
    }

    const inputValue = target.value.trim();

    const isValid = options.pattern.test(inputValue);

    if (isValid) {
      input.setProps({ errorMessage: null, value: inputValue });
    } else {
      input.setProps({ errorMessage: options.errorMessage, value: inputValue });
    }

  };
}
