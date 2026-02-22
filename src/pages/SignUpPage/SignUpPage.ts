import signUpPageTemplate from './SignUpPage.hbs?raw';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Link } from '../../components/Link';
import { Routes } from '../../consts/routes';
import AuthController from '../../controllers/AuthController';
import { AuthCover } from '../../layout/AuthCover';
import Block from '../../services/Block';
import getInputValue from '../../utils/getInputValue';
import validateConfirmPassword from '../../utils/validation/validateConfirmPassword';
import validateEmail from '../../utils/validation/validateEmail';
import validateFirstName from '../../utils/validation/validateFirstName';
import validateLogin from '../../utils/validation/validateLogin';
import validatePassword from '../../utils/validation/validatePassword';
import validatePhone from '../../utils/validation/validatePhone';
import validateSecondName from '../../utils/validation/validateSecondName';

export default class SignUpPage extends Block {
  constructor(props: object = {}) {
    super({
      ...props,
      AuthCover: new AuthCover({}),
    });
  }

  init() {
    const firstNameValidationBind = validateFirstName.bind(this);
    const secondNameValidationBind = validateSecondName.bind(this);
    const emailValidationBind = validateEmail.bind(this);
    const phoneValidationBind = validatePhone.bind(this);
    const loginValidationBind = validateLogin.bind(this);
    const passwordValidationBind = validatePassword.bind(this);
    const confirmPasswordValidationBind = validateConfirmPassword.bind(this);
    const onSignUpBind = this.onSignUp.bind(this);

    const FirstNameInput = new Input({
      id: 'sign-up-first-name',
      label: 'First name',
      type: 'text',
      name: 'first_name',
      placeholder: 'Name',
      onBlur: firstNameValidationBind,
    });

    const SecondNameInput = new Input({
      id: 'sign-up-last-name',
      label: 'Last name',
      type: 'text',
      name: 'second_name',
      placeholder: 'Last name',
      onBlur: secondNameValidationBind,
    });

    const EmailInput = new Input({
      id: 'sign-up-email',
      label: 'Email',
      type: 'email',
      name: 'email',
      placeholder: 'your@email.com',
      onBlur: emailValidationBind,
    });

    const PhoneInput = new Input({
      id: 'sign-up-phone',
      label: 'Phone',
      type: 'tel',
      name: 'phone',
      placeholder: '+79999999999',
      onBlur: phoneValidationBind,
    });

    const LoginInput = new Input({
      id: 'sign-up-login',
      label: 'Login',
      type: 'text',
      name: 'login',
      placeholder: 'your_login',
      onBlur: loginValidationBind,
    });

    const PasswordInput = new Input({
      id: 'sign-up-password',
      type: 'password',
      name: 'password',
      label: 'Password',
      placeholder: 'password',
      onBlur: passwordValidationBind,
    });

    const ConfirmPasswordInput = new Input({
      id: 'sign-up-repeat-password',
      type: 'password',
      name: 'repeat_password',
      label: 'Confirm password',
      placeholder: 'password',
      onBlur: confirmPasswordValidationBind,
    });

    const SubmitButton = new Button({
      text: 'Create account',
      type: 'submit',
      fullwidth: true,
      onClick: onSignUpBind,
    });

    const SignInLink = new Link({
      text: 'Sign in',
      id: 'signInPage',
      href: Routes.SignIn,
    });

    this.children = {
      ...this.children,
      FirstNameInput,
      SecondNameInput,
      EmailInput,
      PhoneInput,
      LoginInput,
      PasswordInput,
      ConfirmPasswordInput,
      SubmitButton,
      SignInLink,
    };
  }

  onSignUp(e: Event) {
    e.preventDefault();

    this.validateAll();

    const firstNameError = !!this.children.FirstNameInput.props.errorMessage;
    const secondNameError = !!this.children.SecondNameInput.props.errorMessage;
    const emailError = !!this.children.EmailInput.props.errorMessage;
    const phoneError = !!this.children.PhoneInput.props.errorMessage;
    const loginError = !!this.children.LoginInput.props.errorMessage;
    const passwordError = !!this.children.PasswordInput.props.errorMessage;
    const confirmPasswordInputError = !!this.children.ConfirmPasswordInput.props.errorMessage;

    if (
      !firstNameError &&
      !secondNameError &&
      !emailError &&
      !phoneError &&
      !loginError &&
      !passwordError &&
      !confirmPasswordInputError
    ) {
      const firstName = getInputValue(this.children.FirstNameInput);
      const secondName = getInputValue(this.children.SecondNameInput);
      const email = getInputValue(this.children.EmailInput);
      const phone = getInputValue(this.children.PhoneInput);
      const login = getInputValue(this.children.LoginInput);
      const password = getInputValue(this.children.PasswordInput);

      const userData: Record<string, unknown> = {
        first_name: firstName,
        second_name: secondName,
        email,
        phone,
        login,
        password,
      };

      AuthController.signUp(userData);
    }
  }

  validateAll() {
    const validations = [
      { key: 'FirstNameInput', fn: validateFirstName },
      { key: 'SecondNameInput', fn: validateSecondName },
      { key: 'EmailInput', fn: validateEmail },
      { key: 'PhoneInput', fn: validatePhone },
      { key: 'LoginInput', fn: validateLogin },
      { key: 'PasswordInput', fn: validatePassword },
      { key: 'ConfirmPasswordInput', fn: validateConfirmPassword },
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
    return signUpPageTemplate;
  }
}
