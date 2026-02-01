import profilePageTemplate from './ProfilePage.hbs?raw';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Input } from '../../components/Input';
import { profileMock } from '../../mocks/profile';
import Block from '../../services/Block';
import type { TProfile } from '../../types/profile';
import getInputValue from '../../utils/getInputValue';
import navigate from '../../utils/navigate';
import validateEmail from '../../utils/validation/validateEmail';
import validateFirstName from '../../utils/validation/validateFirstName';
import validateLogin from '../../utils/validation/validateLogin';
import validateNewPassword from '../../utils/validation/validateNewPassword';
import validatePassword from '../../utils/validation/validatePassword';
import validateSecondName from '../../utils/validation/validateSecondName';

type TProfilePageProps = {
  profile: TProfile;
  isEditMode: boolean;
};

export default class ProfilePage extends Block {
  constructor(props: TProfilePageProps) {
    super(props);
  }

  init() {
    const profile = (this.props.profile as TProfile) ?? profileMock;
    const isEditMode = (this.props.isEditMode as boolean) ?? false;

    const firstNameValidationBind = validateFirstName.bind(this);
    const secondNameValidationBind = validateSecondName.bind(this);
    const emailValidationBind = validateEmail.bind(this);
    const loginValidationBind = validateLogin.bind(this);
    const passwordValidationBind = validatePassword.bind(this);
    const newPasswordValidationBind = validateNewPassword.bind(this);

    const onExitProfileBind = this.onExitProfile.bind(this);
    const onSetEditModeBind = this.onSetEditMode.bind(this);
    const onResetFormBind = this.onResetForm.bind(this);
    const onSubmitFormBind = this.onSubmitForm.bind(this);

    const ProfileAvatar = new Avatar({
      src: profile.avatarSrc,
      alt: profile.displayName,
      username: profile.displayName,
      class: 'profile__avatar',
    });

    const ExitButton = new IconButton({
      id: 'exit-profile',
      ariaLabel: 'Exit profile',
      iconSrc: '/icons/arrow-left.svg',
      class: 'profile__header-exit-button',
      onClick: onExitProfileBind,
    });

    const ResetButton = new Button({
      id: 'reset-profile-form',
      text: 'Cancel',
      type: 'reset',
      iconSrc: '/icons/cancel.svg',
      variant: 'text',
      class: 'profile__form-button',
      onClick: onResetFormBind,
    });

    const SubmitButton = new Button({
      id: 'submit-profile-form',
      text: 'Save',
      type: 'submit',
      iconSrc: '/icons/save.svg',
      variant: 'text',
      class: 'profile__form-button',
      onClick: onSubmitFormBind,
    });

    const ProfileEditModeButton = new Button({
      id: 'edit-profile',
      text: 'Edit',
      type: 'button',
      iconSrc: '/icons/edit.svg',
      variant: 'text',
      class: 'profile__form-button',
      onClick: onSetEditModeBind,
    });

    const FirstNameInput = new Input({
      id: 'profile-first-name',
      label: 'First name',
      type: 'text',
      name: 'first_name',
      placeholder: 'Name',
      value: profile.firstName,
      readonly: !isEditMode,
      onBlur: firstNameValidationBind,
    });

    const SecondNameInput = new Input({
      id: 'profile-last-name',
      label: 'Last name',
      type: 'text',
      name: 'second_name',
      placeholder: 'Last name',
      value: profile.lastName,
      readonly: !isEditMode,
      onBlur: secondNameValidationBind,
    });

    const DisplayNameInput = new Input({
      id: 'profile-display-name',
      label: 'Display name',
      type: 'text',
      name: 'display_name',
      placeholder: 'your_display_name',
      value: profile.displayName,
      readonly: !isEditMode,
      onBlur: loginValidationBind,
    });

    const EmailInput = new Input({
      id: 'profile-email',
      label: 'Email',
      type: 'email',
      name: 'email',
      placeholder: 'your@email.com',
      value: profile.email,
      readonly: !isEditMode,
      onBlur: emailValidationBind,
    });

    const OldPasswordInput = new Input({
      id: 'profile-old-password',
      type: 'password',
      name: 'oldPassword',
      label: 'Old password',
      placeholder: 'password',
      readonly: !isEditMode,
      onBlur: passwordValidationBind,
    });

    const NewPasswordInput = new Input({
      id: 'profile-new-password',
      type: 'password',
      name: 'newPassword',
      label: 'New password',
      placeholder: 'password',
      readonly: !isEditMode,
      onBlur: newPasswordValidationBind,
    });

    const SignOutButton = new Button({
      id: 'sign-out',
      text: 'Sign out',
      type: 'button',
      iconSrc: '/icons/exit.svg',
      variant: 'text',
      class: 'profile__form-button profile__form-exit-button',
      fullwidth: true,
      onClick: () => navigate('signInPage'),
    });

    this.children = {
      ...this.children,

      ProfileAvatar,

      ExitButton,

      ResetButton,
      SubmitButton,
      ProfileEditModeButton,

      FirstNameInput,
      SecondNameInput,
      DisplayNameInput,
      EmailInput,
      OldPasswordInput,
      NewPasswordInput,

      SignOutButton,
    };

    // this.setProps({
    //   profile,
    //   isEditMode,
    // });
  }

  validateAll() {
    const validations = [
      { key: 'FirstNameInput', fn: validateFirstName },
      { key: 'SecondNameInput', fn: validateSecondName },
      { key: 'DisplayNameInput', fn: validateLogin },
      { key: 'EmailInput', fn: validateEmail },
      { key: 'OldPasswordInput', fn: validatePassword },
      { key: 'NewPasswordInput', fn: validateNewPassword },
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

  onSubmitForm(e: Event) {
    e.preventDefault();

    this.validateAll();

    const firstNameError = !!this.children.FirstNameInput.props.errorMessage;
    const secondNameError = !!this.children.SecondNameInput.props.errorMessage;
    const displayNameError = !!this.children.DisplayNameInput.props.errorMessage;
    const emailError = !!this.children.EmailInput.props.errorMessage;
    const oldPasswordError = !!this.children.OldPasswordInput.props.errorMessage;
    const newPasswordInputError = !!this.children.NewPasswordInput.props.errorMessage;

    if (
      !firstNameError &&
      !secondNameError &&
      !displayNameError &&
      !emailError &&
      !oldPasswordError &&
      !newPasswordInputError
    ) {
      const firstName = getInputValue(this.children.FirstNameInput);
      const secondName = getInputValue(this.children.SecondNameInput);
      const displayName = getInputValue(this.children.DisplayNameInput);
      const email = getInputValue(this.children.EmailInput);
      const oldPassword = getInputValue(this.children.OldPasswordInput);
      const newPassword = getInputValue(this.children.NewPasswordInput);

      console.log({
        firstName,
        secondName,
        displayName,
        email,
        oldPassword,
        newPassword,
      });

      this.setEditMode(false);
    }
  }

  onSetEditMode(event: Event) {
    event.preventDefault();

    this.setEditMode(true);
  }

  onResetForm(event: Event) {
    event.preventDefault();

    const profile = (this.props.profile as TProfile) ?? profileMock;

    this.setEditMode(false);

    const resetValues: Record<string, string> = {
      FirstNameInput: profile.firstName,
      SecondNameInput: profile.lastName,
      DisplayNameInput: profile.displayName,
      EmailInput: profile.email,
      OldPasswordInput: '',
      NewPasswordInput: '',
    };

    Object.entries(resetValues).forEach(([key, value]) => {
      const child = this.children[key];
      if (!(child instanceof Input)) {
        return;
      }

      child.setProps({
        value,
        readonly: true,
        errorMessage: '',
      });
    });
  }

  setEditMode(isEditMode: boolean) {
    this.setProps({ isEditMode });

    Object.values(this.children).forEach((child) => {
      if (!(child instanceof Input)) {
        return;
      }

      child.setProps({ readonly: !isEditMode });
    });
  }

  onExitProfile(event: Event) {
    this.onResetForm(event);

    navigate('chatsPage');
  }

  render(): string {
    return profilePageTemplate;
  }
}
