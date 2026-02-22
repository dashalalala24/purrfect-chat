import signInPageTemplate from './SignInPage.hbs?raw';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Link } from '../../components/Link';
import { Routes } from '../../consts/routes';
import AuthController from '../../controllers/AuthController';
import ChatController from '../../controllers/ChatController';
import { AuthCover } from '../../layout/AuthCover';
import Block from '../../services/Block';
import getInputValue from '../../utils/getInputValue';
import validateLogin from '../../utils/validation/validateLogin';
import validatePassword from '../../utils/validation/validatePassword';

export default class SignInPage extends Block {
  constructor(props: object = {}) {
    super({
      ...props,
      AuthCover: new AuthCover({}),
    });
  }

  init() {
    const loginValidationBind = validateLogin.bind(this);
    const validatePasswordBind = validatePassword.bind(this);
    const onSignInBind = this.onSignIn.bind(this);

    const LoginInput = new Input({
      id: 'sign-up-login',
      label: 'Login',
      type: 'text',
      name: 'login',
      placeholder: 'your_login',
      onBlur: loginValidationBind,
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
      href: Routes.SignUp,
    });

    this.children = {
      ...this.children,
      LoginInput,
      PasswordInput,
      SubmitButton,
      SignUpLink,
    };
  }

  async onSignIn(e: Event) {
    e.preventDefault();

    this.validateAll();

    const loginError = !!this.children.LoginInput.props.errorMessage;
    const passwordError = !!this.children.PasswordInput.props.errorMessage;

    if (!loginError && !passwordError) {
      const login = getInputValue(this.children.LoginInput);
      const password = getInputValue(this.children.PasswordInput);

      const userData: Record<string, unknown> = {
        login,
        password,
      };

      const isSignedIn = await AuthController.signIn(userData);

      if (isSignedIn) {
        await ChatController.getChats();
      }
    }
  }

  validateAll() {
    const validations = [
      { key: 'LoginInput', fn: validateLogin },
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

  render(): string {
    return signInPageTemplate;
  }
}
