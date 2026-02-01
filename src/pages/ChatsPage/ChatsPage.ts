import chatsPageTemplate from './ChatsPage.hbs?raw';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { ChatCard } from '../../components/ChatCard';
import { IconButton } from '../../components/IconButton';
import { Input } from '../../components/Input';
import { MAX_CHAT_MESSAGES_COUNT } from '../../consts';
import { chatsMock } from '../../mocks/chats';
import Block from '../../services/Block';
import type { TChat } from '../../types/chats';
import getInputValue from '../../utils/getInputValue';
import navigate from '../../utils/navigate';
import validateMessage from '../../utils/validation/validateMessage';

type TChatsPageProps = {
  chats?: TChat[];
  selectedChat?: TChat | null;
};

export default class ChatsPage extends Block {
  constructor(props: TChatsPageProps = {}) {
    super(props);
  }

  init() {
    const chats = (this.props.chats as TChat[] | undefined) ?? chatsMock;
    const selectedChat = (this.props.selectedChat as TChat | null | undefined) ?? null;

    const chatsWithMeta = chats.map((chat) => {
      const lastMessage = chat.messages[chat.messages.length - 1];
      const messagePreview = lastMessage.type === 'outgoing' ? `You: ${lastMessage.text}` : lastMessage.text;

      const unreadMessagesCountLabel =
        chat.unreadMessagesCount && chat.unreadMessagesCount > MAX_CHAT_MESSAGES_COUNT
          ? `${MAX_CHAT_MESSAGES_COUNT}+`
          : chat.unreadMessagesCount;

      return {
        ...chat,
        messagePreview,
        lastMessageDateTime: lastMessage.dateTime,
        unreadMessagesCountLabel,
      };
    });

    const chatCardChildren: Record<string, ChatCard> = {};
    const chatCardStubs: string[] = [];

    chatsWithMeta.forEach((chat) => {
      const chatCard = new ChatCard({
        id: chat.id,
        avatarSrc: chat.user.avatarSrc,
        username: chat.user.username,
        lastMessageDateTime: chat.lastMessageDateTime,
        messagePreview: chat.messagePreview,
        unreadMessagesCountLabel: chat.unreadMessagesCountLabel,
        selected: selectedChat?.id === chat.id,
        onClick: () => this.onSelectChat(chat.id),
      });

      chatCardChildren[`ChatCard_${chat.id}`] = chatCard;
      chatCardStubs.push(`<div data-id="${chatCard._id}"></div>`);
    });

    const validateMessageBind = validateMessage.bind(this);
    const onSendMessageBind = this.onSendMessage.bind(this);

    const SearchInput = new Input({
      id: 'chats-search',
      type: 'text',
      name: 'message',
      placeholder: 'Search chat',
      class: 'chats__sidebar-chats-search',
      hideErrorMessage: true,
      autocomplete: 'off',
    });

    const MessageInput = new Input({
      id: 'chat-message-input',
      type: 'text',
      name: 'message',
      placeholder: 'Write a message...',
      inputClass: 'chats__chat-message-input',
      hideErrorMessage: true,
      autocomplete: 'off',
      onBlur: validateMessageBind,
    });

    const SubmitMessageButton = new IconButton({
      id: 'send-message',
      type: 'submit',
      ariaLabel: 'Send message',
      iconSrc: '/icons/send.svg',
      class: 'icon-button_contained chats__chat-message-input-button',
      onClick: onSendMessageBind,
    });

    const NewChatButton = new Button({
      id: 'new-chat',
      text: 'New chat',
      type: 'button',
      class: 'chats__sidebar-chats-button',
      fullwidth: true,
    });

    const ProfileButton = new IconButton({
      id: 'profile',
      ariaLabel: 'Profile',
      class: 'chats__sidebar-header-button',
      iconSrc: '/icons/user.svg',
      onClick: () => navigate('profilePage'),
    });

    const SettingsButton = new IconButton({
      id: 'settings',
      ariaLabel: 'Settings',
      class: 'chats__sidebar-header-button',
      iconSrc: '/icons/gear.svg',
    });

    const ChatSettingsButton = new IconButton({
      id: 'chat-settings',
      ariaLabel: 'Chat settings',
      class: 'chats__sidebar-header-button',
      iconSrc: '/icons/ellipsis-vertical.svg',
    });

    const SelectedChatAvatar = selectedChat
      ? new Avatar({
          src: selectedChat.user.avatarSrc,
          alt: selectedChat.user.username,
          username: selectedChat.user.username,
          class: 'chats__chat-avatar',
        })
      : null;

    this.children = {
      ...this.children,
      ...(SelectedChatAvatar ? { SelectedChatAvatar } : {}),
      ...chatCardChildren,
      SearchInput,
      MessageInput,
      SubmitMessageButton,
      NewChatButton,
      ProfileButton,
      SettingsButton,
      ChatSettingsButton,
    };

    this.setProps({
      chats: chatsWithMeta,
      selectedChat,
      chatCards: chatCardStubs,
    });
  }

  onSendMessage(e: Event) {
    e.preventDefault();

    const inputElement = this.children.MessageInput?.element?.querySelector('input');
    if (inputElement) {
      const event = new Event('blur');
      Object.defineProperty(event, 'target', { value: inputElement });
      validateMessage.call(this, event);
    }

    const messageError = !!this.children.MessageInput.props.errorMessage;

    if (!messageError) {
      const message = getInputValue(this.children.MessageInput);

      console.log({
        message,
      });
    }
  }

  private onSelectChat(chatId: string) {
    const chats = this.props.chats as TChat[] | undefined;

    if (!chats) return;

    const selectedChat = chats.find((chat) => chat.id === chatId) ?? null;

    Object.values(this.children).forEach((child) => {
      if (!(child instanceof ChatCard)) {
        return;
      }

      child.setProps({ selected: child.props.id === chatId });
    });

    if (selectedChat) {
      const commonProps = {
        src: selectedChat.user.avatarSrc,
        alt: selectedChat.user.username,
        username: selectedChat.user.username,
      };

      if (!this.children.SelectedChatAvatar) {
        this.children.SelectedChatAvatar = new Avatar({
          ...commonProps,
          class: 'chats__chat-avatar',
        });
      } else {
        this.children.SelectedChatAvatar.setProps(commonProps);
      }
    }

    this.setProps({ selectedChat });
  }

  render(): string {
    return chatsPageTemplate;
  }
}
