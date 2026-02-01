import inputTemplate from './Input.hbs?raw';
import Block from '../../services/Block';

type TInputProps = {
  id?: string;
  name?: string;
  value?: string;
  type?: string;
  placeholder?: string;
  label?: string;
  autocomplete?: string;
  readonly?: boolean;

  class?: string;
  inputClass?: string;

  hideErrorMessage?: boolean;
  errorMessage?: string;

  onChange?: TInputEventHandler;
  onBlur?: TInputEventHandler;
};

type TInputEventHandler = (event: Event) => void;

class Input extends Block {
  constructor(props: TInputProps = {}) {
    super({
      ...props,
    });
  }

  _addEvents() {
    const { onChange, onBlur } = this.props as TInputProps;
    const inputElement = this.element?.querySelector('input');

    if (!inputElement) {
      return;
    }

    if (onChange) {
      inputElement.addEventListener('change', onChange);
    }

    if (onBlur) {
      inputElement.addEventListener('blur', onBlur);
    }
  }

  _removeEvents() {
    const { onChange, onBlur } = this.props as TInputProps;
    const inputElement = this.element?.querySelector('input');

    if (!inputElement) {
      return;
    }

    if (onChange) {
      inputElement.removeEventListener('change', onChange);
    }

    if (onBlur) {
      inputElement.removeEventListener('blur', onBlur);
    }
  }

  render(): string {
    return inputTemplate;
  }
}

export default Input;
