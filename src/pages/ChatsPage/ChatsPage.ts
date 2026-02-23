import chatsPageTemplate from './ChatsPage.hbs?raw';
import { baseUrl } from '../../api/baseURL';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { ChatActionPopup } from '../../components/ChatActionPopup';
import type { TChatActionPopupUser } from '../../components/ChatActionPopup/ChatActionPopup';
import { ChatCard } from '../../components/ChatCard';
import { ChatSettingsMenu } from '../../components/ChatSettingsMenu';
import { IconButton } from '../../components/IconButton';
import { Input } from '../../components/Input';
import { Routes } from '../../consts/routes';
import ChatController from '../../controllers/ChatController';
import Block from '../../services/Block';
import store, { StoreEvents, type TSocketMessage } from '../../services/Store';
import wsService from '../../services/WebSocket';
import type { TChat } from '../../types/chats';
import getInputValue from '../../utils/getInputValue';
import validateMessage from '../../utils/validation/validateMessage';

enum ChatAction {
  UploadAvatar = 'uploadAvatar',
  AddUser = 'addUser',
  DeleteUser = 'deleteUser',
  DeleteChat = 'deleteChat',
}

type TChatsPageProps = {
  chats?: TChat[];
  selectedChat?: TChat | null;
  selectedChatDisplayName?: string;
  chatMessages?: Array<{ text: string; dateTime: string; type: 'incoming' | 'outgoing' }>;
  hasChatMessages?: boolean;
  isChatMessagesLoading?: boolean;
  isChatSettingsMenuOpen?: boolean;
  isChatActionPopupOpen?: boolean;
  chatActionType?: ChatAction | null;
};

export default class ChatsPage extends Block {
  private readonly historyPageSize = 20;
  private readonly onStoreUpdatedHandler = this.onStoreUpdated.bind(this);
  private isHistoryLoading = false;
  private hasMoreHistory = true;
  private preserveScrollOnNextUpdate = false;
  private previousMessagesContainer: HTMLElement | null = null;
  private isStoreSubscribed = false;
  private selectChatRequestId = 0;

  private onStoreUpdated() {
    const chats = store.getState().chats ?? [];
    const messages = store.getState().messages ?? [];
    const currentSelectedChatId = store.getState().activeChat?.id;
    const selectedChatFromStore =
      chats.find((chat) => chat.id === currentSelectedChatId) ?? chats.find((chat) => chat.isActive) ?? null;
    const selectedChatFromProps = this.props.selectedChat as TChat | null | undefined;
    void (selectedChatFromStore ?? selectedChatFromProps ?? null);

    this.syncChatsData(chats, messages);
  }

  constructor(props: TChatsPageProps = {}) {
    super(props);
  }

  init() {
    const chats = store.getState().chats ?? [];
    const messages = store.getState().messages ?? [];
    const activeChatId = store.getState().activeChat?.id;
    const selectedChat = chats.find((chat) => chat.id === activeChatId) ?? chats.find((chat) => chat.isActive) ?? null;

    const validateMessageBind = validateMessage.bind(this);
    const onSendMessageBind = this.onSendMessage.bind(this);
    const onCreateNewChatBind = this.onCreateNewChat.bind(this);
    const onToggleChatSettingsMenuBind = this.onToggleChatSettingsMenu.bind(this);
    const onUploadChatAvatarBind = this.onOpenUploadChatAvatarPopup.bind(this);
    const onAddUserToChatBind = this.onOpenAddUserPopup.bind(this);
    const onDeleteUserFromChatBind = this.onOpenDeleteUserPopup.bind(this);
    const onDeleteChatBind = this.onOpenDeleteChatPopup.bind(this);

    const onSubmitChatActionPopupBind = this.onSubmitChatActionPopup.bind(this);
    const onSearchUsersForPopupBind = this.onSearchUsersForPopup.bind(this);
    const onCloseChatActionPopupBind = this.onCloseChatActionPopup.bind(this);
    const onMessageInputKeyDownBind = this.onMessageInputKeyDown.bind(this);
    this.setProps({
      events: {
        submit: onSendMessageBind,
      },
    });

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
      onKeyDown: onMessageInputKeyDownBind,
    });

    const SubmitMessageButton = new IconButton({
      id: 'send-message',
      type: 'submit',
      ariaLabel: 'Send message',
      iconSrc: '/icons/send.svg',
      class: 'icon-button_contained chats__chat-message-input-button',
    });

    const NewChatButton = new Button({
      id: 'new-chat',
      text: 'New chat',
      type: 'button',
      class: 'chats__sidebar-chats-button',
      fullwidth: true,
      onClick: onCreateNewChatBind,
    });

    const ProfileButton = new IconButton({
      id: 'profile',
      ariaLabel: 'Profile',
      class: 'chats__sidebar-header-button',
      iconSrc: '/icons/user.svg',
      onClick: () => window.router.go(Routes.Profile),
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
      onClick: onToggleChatSettingsMenuBind,
    });

    const ChatSettingsMenuComponent = new ChatSettingsMenu({
      isOpen: false,
      onUploadAvatarClick: onUploadChatAvatarBind,
      onAddUserClick: onAddUserToChatBind,
      onDeleteUserClick: onDeleteUserFromChatBind,
      onDeleteChatClick: onDeleteChatBind,
    });

    const ChatActionPopupComponent = new ChatActionPopup({
      isOpen: false,
      title: 'Add user to chat',
      submitText: 'Add',
      requiresUserSelection: true,
      onSubmit: onSubmitChatActionPopupBind,
      onSearch: onSearchUsersForPopupBind,
      onClose: onCloseChatActionPopupBind,
    });

    const SelectedChatAvatar = selectedChat
      ? new Avatar({
          src: this.getAvatarSrc(selectedChat.avatar),
          alt: selectedChat.title,
          username: selectedChat.title,
          class: 'chats__chat-avatar',
        })
      : null;

    this.children = {
      ...this.children,
      ...(SelectedChatAvatar ? { SelectedChatAvatar } : {}),
      SearchInput,
      MessageInput,
      SubmitMessageButton,
      NewChatButton,
      ProfileButton,
      SettingsButton,
      ChatSettingsButton,
      ChatSettingsMenu: ChatSettingsMenuComponent,
      ChatActionPopup: ChatActionPopupComponent,
    };

    this.syncChatsData(chats, messages);
    this.setProps({
      isChatMessagesLoading: false,
      isChatSettingsMenuOpen: false,
      isChatActionPopupOpen: false,
      chatActionType: null,
    });
    this.subscribeToStore();
  }

  private subscribeToStore() {
    if (this.isStoreSubscribed) {
      return;
    }

    store.on(StoreEvents.Updated, this.onStoreUpdatedHandler);
    this.isStoreSubscribed = true;
  }

  private unsubscribeFromStore() {
    if (!this.isStoreSubscribed) {
      return;
    }

    store.off(StoreEvents.Updated, this.onStoreUpdatedHandler);
    this.isStoreSubscribed = false;
  }

  show() {
    super.show();
    this.subscribeToStore();
    this.onStoreUpdated();
  }

  hide() {
    this.unsubscribeFromStore();
    if (this.previousMessagesContainer) {
      this.previousMessagesContainer.removeEventListener('scroll', this.onMessagesScroll);
      this.previousMessagesContainer = null;
    }
    super.hide();
  }

  onSendMessage(e: Event) {
    e.preventDefault();
    const message = getInputValue(this.children.MessageInput).trim();

    if (!message) {
      this.children.MessageInput.setProps({
        errorMessage: 'Message cannot be empty',
        value: '',
      });
      return;
    }

    this.children.MessageInput.setProps({ errorMessage: null, value: '' });
    wsService.sendMessage(message, 'message');
  }

  private onMessageInputKeyDown(e: Event) {
    if (!(e instanceof KeyboardEvent)) {
      return;
    }

    if (e.key !== 'Enter' || e.shiftKey) {
      return;
    }

    const target = e.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    e.preventDefault();

    const normalizedMessage = target.value.trim();
    if (!normalizedMessage) {
      this.children.MessageInput.setProps({
        errorMessage: 'Message cannot be empty',
        value: target.value,
      });
      return;
    }

    this.children.MessageInput.setProps({ errorMessage: null, value: normalizedMessage });

    const formElement = this.element?.querySelector('#chat-message-form');
    if (formElement instanceof HTMLFormElement) {
      formElement.requestSubmit();
    } else {
      this.onSendMessage(e);
    }
  }

  private async onSelectChat(chatId: number) {
    const requestId = ++this.selectChatRequestId;

    this.subscribeToStore();
    store.setActiveChat(chatId);
    store.clearMessages();
    const chats = (store.getState().chats ?? []) as TChat[];
    const selectedChat = chats.find((chat) => chat.id === chatId);

    this.setProps({
      selectedChat,
      selectedChatDisplayName: selectedChat?.title ?? '',
      isChatMessagesLoading: true,
      isChatSettingsMenuOpen: false,
    });
    this.syncChatsData(chats, []);

    this.children.ChatSettingsMenu.setProps({ isOpen: false });
    this.onCloseChatActionPopup();
    this.hasMoreHistory = true;
    this.isHistoryLoading = false;
    this.preserveScrollOnNextUpdate = false;

    try {
      const token = await ChatController.getToken(chatId);
      if (requestId !== this.selectChatRequestId || !token) {
        return;
      }

      await wsService.openConnection(chatId, token);
      if (requestId !== this.selectChatRequestId) {
        return;
      }

      this.syncChatsData(store.getState().chats ?? [], store.getState().messages ?? []);
    } finally {
      if (requestId === this.selectChatRequestId) {
        this.setProps({ isChatMessagesLoading: false });
      }
    }
  }

  private async onCreateNewChat() {
    await ChatController.createNewChat({ title: 'New chat' });
    this.onStoreUpdated();
  }

  private onToggleChatSettingsMenu() {
    const currentValue = !!this.props.isChatSettingsMenuOpen;
    const nextValue = !currentValue;

    this.setProps({ isChatSettingsMenuOpen: nextValue });
    this.children.ChatSettingsMenu.setProps({ isOpen: nextValue });
  }

  private onOpenAddUserPopup(e: Event) {
    e.preventDefault();
    this.openChatActionPopup(ChatAction.AddUser);
  }

  private onOpenUploadChatAvatarPopup(e: Event) {
    e.preventDefault();
    this.openChatActionPopup(ChatAction.UploadAvatar);
  }

  private async onOpenDeleteUserPopup(e: Event) {
    e.preventDefault();

    this.openChatActionPopup(ChatAction.DeleteUser);

    const chatUsers = await ChatController.getChatUsers();
    this.children.ChatActionPopup.setProps({
      searchResults: chatUsers,
      selectedUserId: null,
      hasSearched: true,
    });
  }

  private onOpenDeleteChatPopup(e: Event) {
    e.preventDefault();
    this.openChatActionPopup(ChatAction.DeleteChat);
  }

  private getChatActionPopupConfig(chatActionType: ChatAction) {
    if (chatActionType === ChatAction.UploadAvatar) {
      return {
        title: 'Upload chat avatar',
        submitText: 'Upload',
        requiresUserSelection: false,
        requiresAvatarUpload: true,
        showSearch: false,
      };
    }

    if (chatActionType === ChatAction.AddUser) {
      return {
        title: 'Add user to chat',
        submitText: 'Add',
        requiresUserSelection: true,
        requiresAvatarUpload: false,
        showSearch: true,
      };
    }

    if (chatActionType === ChatAction.DeleteUser) {
      return {
        title: 'Delete user from chat',
        submitText: 'Delete',
        requiresUserSelection: true,
        requiresAvatarUpload: false,
        showSearch: false,
      };
    }

    return {
      title: 'Delete chat',
      submitText: 'Delete',
      requiresUserSelection: false,
      requiresAvatarUpload: false,
      showSearch: false,
      description: 'Are you sure? This action cannot be undone',
    };
  }

  private openChatActionPopup(chatActionType: ChatAction) {
    const popupConfig = this.getChatActionPopupConfig(chatActionType);

    this.setProps({ isChatActionPopupOpen: true, chatActionType, isChatSettingsMenuOpen: false });
    this.children.ChatSettingsMenu.setProps({ isOpen: false });
    this.children.ChatActionPopup.setProps({
      isOpen: true,
      ...popupConfig,
    });
  }

  private onCloseChatActionPopup() {
    this.setProps({ isChatActionPopupOpen: false, chatActionType: null });
    this.children.ChatActionPopup.setProps({
      isOpen: false,
      searchResults: [],
      selectedUserId: null,
      hasSearched: false,
      uploadError: '',
    });
  }

  private async onSearchUsersForPopup(login: string): Promise<TChatActionPopupUser[]> {
    return ChatController.searchUsers(login);
  }

  private async onSubmitChatActionPopup(userId?: number, avatarFile?: File) {
    const chatActionType = this.props.chatActionType as ChatAction | null;

    if (chatActionType === ChatAction.UploadAvatar && avatarFile) {
      await ChatController.updateChatAvatar(avatarFile);
    }

    if (chatActionType === ChatAction.AddUser && !!userId) {
      await ChatController.addUser({ userId });
    }

    if (chatActionType === ChatAction.DeleteUser && !!userId) {
      await ChatController.deleteUser({ userId });
    }

    if (chatActionType === ChatAction.DeleteChat) {
      await ChatController.deleteChat();
    }

    this.onCloseChatActionPopup();
  }

  private onMessagesScroll = () => {
    const selectedChatId = store.getState().activeChat?.id;

    if (!selectedChatId || this.isHistoryLoading || !this.hasMoreHistory) {
      return;
    }

    const messagesContainer = this.element?.querySelector('.chats__chat-messages');
    if (!(messagesContainer instanceof HTMLElement)) {
      return;
    }

    if (messagesContainer.scrollTop <= 16) {
      void this.loadOlderMessages(messagesContainer);
    }
  };

  private attachMessagesScrollListener() {
    const messagesContainer = this.element?.querySelector('.chats__chat-messages');
    if (!(messagesContainer instanceof HTMLElement)) {
      if (this.previousMessagesContainer) {
        this.previousMessagesContainer.removeEventListener('scroll', this.onMessagesScroll);
        this.previousMessagesContainer = null;
      }
      return;
    }

    if (this.previousMessagesContainer && this.previousMessagesContainer !== messagesContainer) {
      this.previousMessagesContainer.removeEventListener('scroll', this.onMessagesScroll);
    }

    messagesContainer.removeEventListener('scroll', this.onMessagesScroll);
    messagesContainer.addEventListener('scroll', this.onMessagesScroll);
    this.previousMessagesContainer = messagesContainer;
  }

  private async loadOlderMessages(messagesContainer: HTMLElement) {
    this.isHistoryLoading = true;
    this.preserveScrollOnNextUpdate = true;

    const prevScrollTop = messagesContainer.scrollTop;
    const prevScrollHeight = messagesContainer.scrollHeight;
    const currentOffset = store.getState().messages?.length ?? 0;

    const loadedCount = await wsService.getOldMessages(currentOffset);
    if (loadedCount < this.historyPageSize) {
      this.hasMoreHistory = false;
    }

    requestAnimationFrame(() => {
      const updatedContainer = this.element?.querySelector('.chats__chat-messages');
      if (updatedContainer instanceof HTMLElement) {
        const heightDelta = updatedContainer.scrollHeight - prevScrollHeight;
        updatedContainer.scrollTop = prevScrollTop + heightDelta;
      }
      this.isHistoryLoading = false;
      this.preserveScrollOnNextUpdate = false;
    });
  }

  private mapChatMessages(messages: TSocketMessage[]) {
    const currentUserId = store.getState().user?.id;

    return messages
      .slice()
      .reverse()
      .map((message) => ({
        text: message.content,
        dateTime: message.time
          ? new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '',
        type: message.user_id === currentUserId ? ('outgoing' as const) : ('incoming' as const),
      }));
  }

  private getAvatarSrc(avatar?: string | null) {
    if (!avatar) {
      return undefined;
    }

    const normalizedPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
    return `${baseUrl}/resources${normalizedPath}`;
  }

  private scrollMessagesToBottom() {
    requestAnimationFrame(() => {
      const messagesContainer = this.element?.querySelector('.chats__chat-messages');
      if (messagesContainer instanceof HTMLElement) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    });
  }

  private syncChatsData(chats: TChat[], messages: TSocketMessage[] = []) {
    const storedChatId = store.getState().activeChat?.id;
    const selectedChatFromProps = this.props.selectedChat as TChat | null | undefined;
    const selectedChatDisplayNameFromProps =
      typeof this.props.selectedChatDisplayName === 'string' ? this.props.selectedChatDisplayName : '';

    const activeChatFromStore = storedChatId ? (chats.find((chat) => chat.id === storedChatId) ?? null) : null;

    const activeChat =
      activeChatFromStore ??
      selectedChatFromProps ??
      chats.find((chat) => chat.isActive) ??
      (storedChatId
        ? ({
            id: storedChatId,
            title: selectedChatDisplayNameFromProps || 'Chat',
          } as TChat)
        : null) ??
      null;

    const chatsWithMeta = chats.map((chat) => {
      const messagePreview = chat.last_message?.content || '';
      const lastMessageDateTime = chat.last_message?.time ? new Date(chat.last_message.time).toLocaleDateString() : '';
      const unreadMessagesCountLabel = chat.unread_count;
      const cardUsername = chat.title;
      const cardAvatarSrc = this.getAvatarSrc(chat.avatar);

      return {
        ...chat,
        cardUsername,
        cardAvatarSrc,
        messagePreview,
        lastMessageDateTime,
        unreadMessagesCountLabel,
      };
    });

    const chatCardChildren: Record<string, ChatCard> = {};
    const chatCardStubs: string[] = [];

    chatsWithMeta.forEach((chat) => {
      const chatCard = new ChatCard({
        id: chat.id,
        username: chat.cardUsername,
        avatarSrc: chat.cardAvatarSrc,
        lastMessageDateTime: chat.lastMessageDateTime,
        messagePreview: chat.messagePreview,
        unreadMessagesCountLabel: chat.unreadMessagesCountLabel,
        selected: activeChat?.id === chat.id,
        onClick: () => {
          const clickedChatId = chat.id;

          if (clickedChatId) {
            void this.onSelectChat(clickedChatId);
          }
        },
      });

      chatCardChildren[`ChatCard_${chat.id}`] = chatCard;
      chatCardStubs.push(`<div data-id="${chatCard._id}"></div>`);
    });

    this.children = {
      ...this.children,
      ...chatCardChildren,
    };
    const mappedMessages = this.mapChatMessages(messages);

    this.setProps({
      chats: chatsWithMeta,
      selectedChat: activeChat,
      selectedChatDisplayName: activeChat ? activeChat.title : '',
      chatMessages: mappedMessages,
      hasChatMessages: mappedMessages.length > 0,
      chatCards: chatCardStubs,
    });

    if (activeChat) {
      const avatarProps = {
        src: this.getAvatarSrc(activeChat.avatar),
        alt: activeChat.title,
        username: activeChat.title,
      };

      if (!this.children.SelectedChatAvatar) {
        this.children.SelectedChatAvatar = new Avatar({
          ...avatarProps,
          class: 'chats__chat-avatar',
        });
      } else {
        this.children.SelectedChatAvatar.setProps(avatarProps);
      }
    }

    this.attachMessagesScrollListener();

    if (activeChat) {
      if (!this.preserveScrollOnNextUpdate) {
        this.scrollMessagesToBottom();
      }
    } else if (this.previousMessagesContainer) {
      this.previousMessagesContainer.removeEventListener('scroll', this.onMessagesScroll);
      this.previousMessagesContainer = null;
    }
  }

  render(): string {
    return chatsPageTemplate;
  }
}
