import signInModuleTemplate from './SignInModule.hbs?raw';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import Link from '../../components/Link/Link';
import { AuthCover } from '../../layout/AuthCover';
import Block from '../../services/Block';
import getInputValue from '../../utils/getInputValue';
import navigate from '../../utils/navigate';
import validateEmail from '../../utils/validation/validateEmail';
import validatePassword from '../../utils/validation/validatePassword';

export default class SignInModule extends Block {
  constructor(props: object = {}) {
    super({
      ...props,
      AuthCover: new AuthCover({}),
    });
  }

  init() {
    const validateEmailBind = validateEmail.bind(this);
    const validatePasswordBind = validatePassword.bind(this);
    const onSignInBind = this.onSignIn.bind(this);

    const EmailInput = new Input({
      id: 'sign-in-email',
      label: 'Email',
      type: 'email',
      name: 'email',
      placeholder: 'your@email.com',
      onBlur: validateEmailBind,
    });

    const PasswordInput = new Input({
      id: 'sign-in-password',
      type: 'password',
      name: 'password',
      label: 'Password',
      placeholder: 'password',
      onBlur: validatePasswordBind,
    });

    const SubmitButton = new Button({
      text: 'Sign in',
      type: 'submit',
      fullwidth: true,
      onClick: onSignInBind,
    });

    const SignUpLink = new Link({
      text: 'Sign up',
      id: 'signUpPage',
    });

    this.children = {
      ...this.children,
      EmailInput,
      PasswordInput,
      SubmitButton,
      SignUpLink,
    };
  }

  onSignIn(e: Event) {
    e.preventDefault();

    this.validateAll();

    const emailError = !!this.children.EmailInput.props.errorMessage;
    const passwordError = !!this.children.PasswordInput.props.errorMessage;

    if (!emailError && !passwordError) {
      const email = getInputValue(this.children.EmailInput);
      const password = getInputValue(this.children.PasswordInput);

      console.log({
        email,
        password,
      });

      navigate('chatsPage');
    }
  }

  render(): string {
    return signInModuleTemplate;
  }

  private validateAll() {
    const validations = [
      { key: 'EmailInput', fn: validateEmail },
      { key: 'PasswordInput', fn: validatePassword },
    ];

    validations.forEach(({ key, fn }) => {
      const inputBlock = this.children[key];
      const inputElement = inputBlock?.element?.querySelector('input');

      if (!inputElement) {
        return;
      }

      const event = new Event('blur');

      Object.defineProperty(event, 'target', { value: inputElement });

      fn.call(this, event);
    });
  }
}
