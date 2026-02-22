import chatActionPopupTemplate from './ChatActionPopup.hbs?raw';
import Block from '../../services/Block';
import getInputValue from '../../utils/getInputValue';
import { Button } from '../Button';
import { Input } from '../Input';

export type TChatActionPopupUser = {
  id: number;
  login: string;
  first_name?: string;
  second_name?: string;
  display_name?: string | null;
  avatar?: string | null;
};

type TChatActionPopupProps = {
  isOpen?: boolean;
  title?: string;
  description?: string;
  submitText?: string;
  requiresUserSelection?: boolean;
  requiresAvatarUpload?: boolean;
  showSearch?: boolean;
  onSubmit?: (userId?: number, avatarFile?: File) => Promise<void> | void;
  onSearch?: (login: string) => Promise<TChatActionPopupUser[]>;
  onClose?: () => void;
  userResultButtons?: string[];
  searchResults?: TChatActionPopupUser[];
  selectedUserId?: number | null;
  hasSearched?: boolean;
  uploadError?: string;
};

class ChatActionPopup extends Block {
  constructor(props: TChatActionPopupProps = {}) {
    super(props);
  }

  init() {
    const onSearchBind = this.onSearch.bind(this);
    const onSubmitBind = this.onSubmit.bind(this);
    const onCloseBind = this.onClose.bind(this);

    const LoginInput = new Input({
      id: 'chat-action-user-login',
      name: 'login',
      type: 'text',
      placeholder: 'User login',
      autocomplete: 'off',
      hideErrorMessage: false,
    });

    const SearchButton = new Button({
      id: 'chat-action-user-search',
      text: 'Search',
      type: 'button',
      variant: 'outlined',
      onClick: onSearchBind,
    });

    const CancelButton = new Button({
      id: 'chat-action-cancel',
      text: 'Cancel',
      type: 'button',
      variant: 'outlined',
      onClick: onCloseBind,
    });

    const SubmitButton = new Button({
      id: 'chat-action-submit',
      text: (this.props.submitText as string | undefined) ?? 'Apply',
      type: 'button',
      onClick: onSubmitBind,
    });

    this.children = {
      ...this.children,
      LoginInput,
      SearchButton,
      CancelButton,
      SubmitButton,
    };

    this.setProps({
      requiresUserSelection: true,
      requiresAvatarUpload: false,
      showSearch: true,
      userResultButtons: [],
      searchResults: [],
      selectedUserId: null,
      hasSearched: false,
      uploadError: '',
    });
  }

  componentDidUpdate(oldProps: Record<string, unknown>, newProps: Record<string, unknown>) {
    if (oldProps.submitText !== newProps.submitText) {
      this.children.SubmitButton.setProps({ text: newProps.submitText });
    }

    if (oldProps.isOpen !== newProps.isOpen && newProps.isOpen) {
      this.children.LoginInput.setProps({ value: '', errorMessage: '' });
      this.setProps({
        searchResults: [],
        userResultButtons: [],
        selectedUserId: null,
        hasSearched: false,
        uploadError: '',
      });
    }

    if (oldProps.searchResults !== newProps.searchResults || oldProps.selectedUserId !== newProps.selectedUserId) {
      this.syncUserResultButtons(
        (newProps.searchResults as TChatActionPopupUser[] | undefined) ?? [],
        (newProps.selectedUserId as number | null | undefined) ?? null,
      );
    }

    return true;
  }

  private async onSearch(e: Event) {
    e.preventDefault();
    const requiresUserSelection = Boolean(this.props.requiresUserSelection);
    const showSearch = Boolean(this.props.showSearch);
    if (!requiresUserSelection || !showSearch) {
      return;
    }

    const login = getInputValue(this.children.LoginInput).trim();

    if (!login) {
      this.children.LoginInput.setProps({ errorMessage: 'Login is required' });
      return;
    }

    this.children.LoginInput.setProps({ errorMessage: '' });

    const searchHandler = this.props.onSearch as TChatActionPopupProps['onSearch'];
    const searchResults = searchHandler ? await searchHandler(login) : [];

    this.setProps({
      searchResults,
      selectedUserId: null,
      hasSearched: true,
    });
  }

  private async onSubmit(e: Event) {
    e.preventDefault();
    const requiresUserSelection = Boolean(this.props.requiresUserSelection);
    const requiresAvatarUpload = Boolean(this.props.requiresAvatarUpload);
    const submitHandler = this.props.onSubmit as TChatActionPopupProps['onSubmit'];

    if (requiresAvatarUpload) {
      const fileInput = this.element?.querySelector('#chat-action-avatar-file');
      if (!(fileInput instanceof HTMLInputElement)) {
        return;
      }

      const avatarFile = fileInput.files?.[0];
      if (!avatarFile) {
        this.setProps({ uploadError: 'Select an image file' });
        return;
      }

      this.setProps({ uploadError: '' });
      if (submitHandler) {
        await submitHandler(undefined, avatarFile);
      }
      return;
    }

    if (!requiresUserSelection) {
      if (submitHandler) {
        await submitHandler();
      }
      return;
    }

    const selectedUserId = this.props.selectedUserId as number | null | undefined;
    if (typeof selectedUserId !== 'number') {
      this.children.LoginInput.setProps({ errorMessage: 'Select a user from the list' });
      return;
    }

    this.children.LoginInput.setProps({ errorMessage: '' });

    if (submitHandler) {
      await submitHandler(selectedUserId);
    }
  }

  private onClose(e: Event) {
    e.preventDefault();

    const closeHandler = this.props.onClose as TChatActionPopupProps['onClose'];
    if (closeHandler) {
      closeHandler();
    }
  }

  private syncUserResultButtons(users: TChatActionPopupUser[], selectedUserId: number | null) {
    const nonResultChildren = Object.fromEntries(
      Object.entries(this.children).filter(([key]) => !key.startsWith('UserResultButton_')),
    );
    const userResultChildren: Record<string, Button> = {};
    const userResultButtonStubs: string[] = [];

    users.forEach((user) => {
      const displayName = user.display_name || `${user.first_name ?? ''} ${user.second_name ?? ''}`.trim();
      const label = displayName ? `${displayName} (@${user.login})` : `@${user.login}`;
      const isSelected = selectedUserId === user.id;

      const userResultButton = new Button({
        id: `chat-user-result-${user.id}`,
        type: 'button',
        text: label,
        variant: isSelected ? 'outlined' : 'text',
        class: 'chat-action-popup__result-button',
        fullwidth: true,
        onClick: () => {
          this.setProps({
            selectedUserId: user.id,
          });
        },
      });

      userResultChildren[`UserResultButton_${user.id}`] = userResultButton;
      userResultButtonStubs.push(`<div data-id="${userResultButton._id}"></div>`);
    });

    this.children = {
      ...nonResultChildren,
      ...userResultChildren,
    };

    this.setProps({
      userResultButtons: userResultButtonStubs,
    });
  }

  render(): string {
    return chatActionPopupTemplate;
  }
}

export default ChatActionPopup;
