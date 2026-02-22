import profilePageTemplate from './ProfilePage.hbs?raw';
import { baseUrl } from '../../api/baseUrl';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { IconButton } from '../../components/IconButton';
import { Input } from '../../components/Input';
import { Routes } from '../../consts/routes';
import AuthController from '../../controllers/AuthController';
import UserController from '../../controllers/UserController';
import Block from '../../services/Block';
import store, { type TUser } from '../../services/Store';
import type { TProfile } from '../../types/profile';
import getInputValue from '../../utils/getInputValue';
import validateEmail from '../../utils/validation/validateEmail';
import validateFirstName from '../../utils/validation/validateFirstName';
import validateLogin from '../../utils/validation/validateLogin';
import validateSecondName from '../../utils/validation/validateSecondName';

type TProfilePageProps = {
  profile?: TUser;
  isEditMode?: boolean;
};

const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d).{8,40}$/;

export default class ProfilePage extends Block<TProfilePageProps> {
  constructor(props: TProfilePageProps = {}) {
    super(props);
  }

  init() {
    const profile = store.getState().user;
    const isEditMode = (this.props.isEditMode as boolean) ?? false;
    const avatarSrc = this.getAvatarSrc(profile?.avatar);

    const firstNameValidationBind = validateFirstName.bind(this);
    const secondNameValidationBind = validateSecondName.bind(this);
    const emailValidationBind = validateEmail.bind(this);
    const loginValidationBind = validateLogin.bind(this);

    const onExitProfileBind = this.onExitProfile.bind(this);
    const onSetEditModeBind = this.onSetEditMode.bind(this);
    const onResetFormBind = this.onResetForm.bind(this);
    const onSubmitFormBind = this.onSubmitForm.bind(this);
    const onAvatarChangeBind = this.onAvatarChange.bind(this);

    const onSignOutBind = this.onSignOut.bind(this);

    this.setProps({
      profile,
      events: {
        change: onAvatarChangeBind,
      },
    });

    const ProfileAvatar = new Avatar({
      src: avatarSrc,
      alt: profile?.first_name,
      username: profile?.first_name,
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
      value: profile?.first_name,
      readonly: !isEditMode,
      onBlur: firstNameValidationBind,
    });

    const SecondNameInput = new Input({
      id: 'profile-last-name',
      label: 'Last name',
      type: 'text',
      name: 'second_name',
      placeholder: 'Last name',
      value: profile?.second_name,
      readonly: !isEditMode,
      onBlur: secondNameValidationBind,
    });

    const DisplayNameInput = new Input({
      id: 'profile-display-name',
      label: 'Display name',
      type: 'text',
      name: 'display_name',
      placeholder: 'your_display_name',
      value: profile?.display_name,
      readonly: !isEditMode,
      onBlur: loginValidationBind,
    });

    const EmailInput = new Input({
      id: 'profile-email',
      label: 'Email',
      type: 'email',
      name: 'email',
      placeholder: 'your@email.com',
      value: profile?.email,
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
    });

    const NewPasswordInput = new Input({
      id: 'profile-new-password',
      type: 'password',
      name: 'newPassword',
      label: 'New password',
      placeholder: 'password',
      readonly: !isEditMode,
    });

    const SignOutButton = new Button({
      id: 'sign-out',
      text: 'Sign out',
      type: 'button',
      iconSrc: '/icons/exit.svg',
      variant: 'text',
      class: 'profile__form-button profile__form-exit-button',
      fullwidth: true,
      onClick: onSignOutBind,
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
  }

  validateAll() {
    const validations = [
      { key: 'FirstNameInput', fn: validateFirstName },
      { key: 'SecondNameInput', fn: validateSecondName },
      { key: 'DisplayNameInput', fn: validateLogin },
      { key: 'EmailInput', fn: validateEmail },
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

  private validatePasswordFields(oldPassword: string, newPassword: string): boolean {
    const oldPasswordInput = this.children.OldPasswordInput;
    const newPasswordInput = this.children.NewPasswordInput;

    const hasAnyPassword = oldPassword.length > 0 || newPassword.length > 0;
    if (!hasAnyPassword) {
      oldPasswordInput.setProps({ errorMessage: '' });
      newPasswordInput.setProps({ errorMessage: '' });
      return true;
    }

    let isValid = true;

    if (!PASSWORD_PATTERN.test(oldPassword)) {
      oldPasswordInput.setProps({ errorMessage: 'Invalid password' });
      isValid = false;
    } else {
      oldPasswordInput.setProps({ errorMessage: '' });
    }

    if (!PASSWORD_PATTERN.test(newPassword)) {
      newPasswordInput.setProps({ errorMessage: 'Invalid password' });
      isValid = false;
    } else if (newPassword === oldPassword) {
      newPasswordInput.setProps({ errorMessage: 'New password cannot be the same' });
      isValid = false;
    } else {
      newPasswordInput.setProps({ errorMessage: '' });
    }

    return isValid;
  }

  async onSubmitForm(e: Event) {
    e.preventDefault();

    this.validateAll();

    const firstNameError = !!this.children.FirstNameInput.props.errorMessage;
    const secondNameError = !!this.children.SecondNameInput.props.errorMessage;
    const displayNameError = !!this.children.DisplayNameInput.props.errorMessage;
    const emailError = !!this.children.EmailInput.props.errorMessage;
    const oldPassword = getInputValue(this.children.OldPasswordInput);
    const newPassword = getInputValue(this.children.NewPasswordInput);
    const isPasswordValid = this.validatePasswordFields(oldPassword, newPassword);

    if (firstNameError || secondNameError || displayNameError || emailError || !isPasswordValid) {
      return;
    }

    const profile = (this.props.profile as TProfile | undefined) ?? (store.getState().user as TProfile | undefined);
    if (!profile) {
      return;
    }

    const firstName = getInputValue(this.children.FirstNameInput);
    const secondName = getInputValue(this.children.SecondNameInput);
    const displayName = getInputValue(this.children.DisplayNameInput);
    const email = getInputValue(this.children.EmailInput);

    const profilePayload = {
      first_name: firstName,
      second_name: secondName,
      display_name: displayName || null,
      email,
      login: profile?.login,
      phone: profile?.phone,
    };

    const updatedUser = await UserController.updateProfile(profilePayload);
    if (!updatedUser) {
      return;
    }

    const shouldUpdatePassword = oldPassword.length > 0 || newPassword.length > 0;
    if (shouldUpdatePassword) {
      const passwordUpdated = await UserController.updatePassword({
        oldPassword,
        newPassword,
      });

      if (!passwordUpdated) {
        return;
      }
    }

    const nextProfile: TUser = {
      ...profile,
      ...updatedUser,
      id: typeof updatedUser.id === 'number' ? updatedUser.id : profile?.id,
      display_name: typeof updatedUser.display_name === 'string' ? updatedUser.display_name : profile?.display_name,
      avatar: typeof updatedUser.avatar === 'string' ? updatedUser.avatar : profile?.avatar,
    };

    this.setProps({ profile: nextProfile });
    this.setEditMode(false);
    this.children.OldPasswordInput.setProps({ value: '', errorMessage: '' });
    this.children.NewPasswordInput.setProps({ value: '', errorMessage: '' });
  }

  onSetEditMode(event: Event) {
    event.preventDefault();

    this.setEditMode(true);
  }

  onResetForm(event: Event) {
    event.preventDefault();

    const profile = this.props.profile;

    this.setEditMode(false);

    const resetValues: Record<string, string | null> = {
      FirstNameInput: profile?.first_name || null,
      SecondNameInput: profile?.second_name || null,
      DisplayNameInput: profile?.display_name || null,
      EmailInput: profile?.email || null,
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

    void window.router.go(Routes.Chats);
  }

  onSignOut() {
    AuthController.signOut();
  }

  private getAvatarSrc(avatar?: string | null) {
    if (!avatar) {
      return undefined;
    }

    const normalizedPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
    return `${baseUrl}/resources${normalizedPath}`;
  }

  async onAvatarChange(event: Event) {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    if (target.id !== 'upload-profile-avatar') {
      return;
    }

    const file = target.files?.[0];

    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('avatar', file);

    const updatedUser = await UserController.updateProfileAvatar(formData);

    if (updatedUser && this.children.ProfileAvatar instanceof Avatar) {
      this.children.ProfileAvatar.setProps({
        src: this.getAvatarSrc(updatedUser.avatar),
        alt: updatedUser.first_name,
        username: updatedUser.first_name,
      });

      const profile = this.props.profile;

      this.setProps({
        profile: {
          ...profile,
          ...updatedUser,
          id: typeof updatedUser.id === 'number' ? updatedUser.id : profile?.id,
          display_name: typeof updatedUser.display_name === 'string' ? updatedUser.display_name : profile?.display_name,
          avatar: typeof updatedUser.avatar === 'string' ? updatedUser.avatar : profile?.avatar,
        },
      });
    }
    target.value = '';
  }

  render(): string {
    return profilePageTemplate;
  }
}
