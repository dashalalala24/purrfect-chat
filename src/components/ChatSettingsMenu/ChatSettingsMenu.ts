import chatSettingsMenuTemplate from './ChatSettingsMenu.hbs?raw';
import Block from '../../services/Block';
import { Button } from '../Button';

type TChatSettingsMenuProps = {
  isOpen?: boolean;
  onUploadAvatarClick?: (event: Event) => void;
  onAddUserClick?: (event: Event) => void;
  onDeleteUserClick?: (event: Event) => void;
  onDeleteChatClick?: (event: Event) => void;
};

class ChatSettingsMenu extends Block {
  constructor(props: TChatSettingsMenuProps = {}) {
    super(props);
  }

  init() {
    const { onUploadAvatarClick, onAddUserClick, onDeleteUserClick, onDeleteChatClick } = this.props as TChatSettingsMenuProps;

    const UploadAvatarButton = new Button({
      id: 'chat-settings-upload-avatar',
      type: 'button',
      text: 'Upload chat avatar',
      variant: 'text',
      onClick: onUploadAvatarClick,
      class: 'chat-settings-menu__button',
      fullwidth: true,
    });

    const AddUserButton = new Button({
      id: 'chat-settings-add-user',
      type: 'button',
      text: 'Add user to chat',
      variant: 'text',
      onClick: onAddUserClick,
      class: 'chat-settings-menu__button',
      fullwidth: true,
    });

    const DeleteUserButton = new Button({
      id: 'chat-settings-delete-user',
      type: 'button',
      text: 'Delete user from chat',
      variant: 'text',
      onClick: onDeleteUserClick,
      class: 'chat-settings-menu__button',
      fullwidth: true,
    });

    const DeleteChatButton = new Button({
      id: 'chat-settings-delete-chat',
      type: 'button',
      text: 'Delete chat',
      variant: 'text',
      onClick: onDeleteChatClick,
      class: 'chat-settings-menu__button',
      fullwidth: true,
    });

    this.children = {
      ...this.children,
      UploadAvatarButton,
      AddUserButton,
      DeleteUserButton,
      DeleteChatButton,
    };
  }

  render(): string {
    return chatSettingsMenuTemplate;
  }
}

export default ChatSettingsMenu;
