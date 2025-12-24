import Handlebars from 'handlebars';
import { AuthCover } from './partials/AuthCover';
import { Avatar } from './partials/Avatar';
import { Button } from './partials/Button';
import { IconButton } from './partials/IconButton';
import { Input } from './partials/Input';
import * as Pages from './pages';
import { ChatCard } from './partials/ChatCard';
import './helpers/handlebarsHelpers.ts';
import type { TChat, TChatsPageContext } from './types/chats';
import { chatsMock } from './mocks/chats';
import { MAX_CHAT_MESSAGES_COUNT } from './consts';
import type { TProfile, TProfilePageContext } from './types/profile';
import { profileMock } from './mocks/profile';
import { ErrorScreen } from './partials/ErrorScreen';

Handlebars.registerPartial('AuthCover', AuthCover);
Handlebars.registerPartial('Avatar', Avatar);
Handlebars.registerPartial('Button', Button);
Handlebars.registerPartial('ChatCard', ChatCard);
Handlebars.registerPartial('IconButton', IconButton);
Handlebars.registerPartial('ErrorScreen', ErrorScreen);
Handlebars.registerPartial('Input', Input);

Handlebars.registerPartial('ChatsPage', Pages.ChatsPage);
Handlebars.registerPartial('NotFoundPage', Pages.NotFoundPage);
Handlebars.registerPartial('ChatsPage', Pages.ProfilePage);
Handlebars.registerPartial('SignUpPage', Pages.SignUpPage);
Handlebars.registerPartial('SignUpPage', Pages.SignUpPage);

Handlebars.registerPartial('RoutesPage', Pages.RoutesPage);

type TPageName = 'routes' | 'signIn' | 'signUp' | 'chats' | 'profile' | 'notFound' | 'serverError';

type TAppState = {
  currentPage: TPageName;
  questions: string[];
  answers: string[];
  chats: TChat[];
  selectedChat: TChat | null;
  isProfileEditMode: boolean;
  profile: TProfile | null;
};

export default class App {
  private state: TAppState;
  private appElement: HTMLElement;

  constructor() {
    this.state = {
      currentPage: 'routes',
      questions: [],
      answers: [],
      chats: chatsMock,
      selectedChat: null,
      isProfileEditMode: false,
      profile: profileMock,
    };

    const app = document.getElementById('app');

    if (!app) throw new Error('App root element not found');

    this.appElement = app;
  }

  render(): void {
    switch (this.state.currentPage) {
      case 'routes': {
        this.createPage(Pages.RoutesPage);
        break;
      }

      case 'signIn': {
        this.createPage(Pages.SignInPage);
        break;
      }

      case 'signUp': {
        this.createPage(Pages.SignUpPage);
        break;
      }

      case 'chats': {
        const chatsWithMeta = this.state.chats.map((chatMock) => {
          const lastMessage = chatMock.messages[chatMock.messages.length - 1];

          const messagePreview = lastMessage.type === 'outgoing' ? `You: ${lastMessage.text}` : lastMessage.text;
          console.log('messagePreview', messagePreview);
          const unreadMessagesCountLabel =
            chatMock.unreadMessagesCount && chatMock.unreadMessagesCount > MAX_CHAT_MESSAGES_COUNT
              ? `${MAX_CHAT_MESSAGES_COUNT}+`
              : chatMock.unreadMessagesCount;

          return {
            ...chatMock,
            messagePreview,
            lastMessageDateTime: lastMessage.dateTime,
            unreadMessagesCountLabel,
          };
        });

        const pageContext: TChatsPageContext = {
          chats: chatsWithMeta,
          selectedChat: this.state.selectedChat,
        };

        this.createPage(Pages.ChatsPage, pageContext);
        break;
      }

      case 'profile': {
        if (!this.state.profile) {
          this.changePage('signIn');
        } else {
          const pageContext: TProfilePageContext = {
            profile: this.state.profile,
            isEditMode: this.state.isProfileEditMode,
          };

          this.createPage(Pages.ProfilePage, pageContext);
        }
        break;
      }

      case 'notFound': {
        this.createPage(Pages.NotFoundPage);
        break;
      }

      case 'serverError': {
        this.createPage(Pages.ServerErrorPage);

        break;
      }

      default:
        break;
    }
  }

  private attachEventListeners(): void {
    switch (this.state.currentPage) {
      case 'routes':
        const routeSignInButton = document.querySelector<HTMLButtonElement>('#route-sign-in');
        const routeSignUpButton = document.querySelector<HTMLButtonElement>('#route-sign-up');
        const routeChatsButton = document.querySelector<HTMLButtonElement>('#route-chats');
        const routeProfileButton = document.querySelector<HTMLButtonElement>('#route-profile');
        const routeNotFoundButton = document.querySelector<HTMLButtonElement>('#route-not-found');
        const routeServerErrorButton = document.querySelector<HTMLButtonElement>('#route-server-error');

        routeSignInButton?.addEventListener('click', () => this.changePage('signIn'));
        routeSignUpButton?.addEventListener('click', () => this.changePage('signUp'));
        routeChatsButton?.addEventListener('click', () => this.changePage('chats'));
        routeProfileButton?.addEventListener('click', () => this.changePage('profile'));
        routeNotFoundButton?.addEventListener('click', () => this.changePage('notFound'));
        routeServerErrorButton?.addEventListener('click', () => this.changePage('serverError'));

        break;

      case 'signIn':
        const navigateToSignUpLink = document.querySelector<HTMLAnchorElement>('#link-to-sign-up');

        const signInForm = document.querySelector<HTMLFormElement>('#sign-in-form');

        if (signInForm) {
          this.attachRequiredInputListeners(signInForm);
          this.syncSubmitButtonsState(signInForm);
        }

        navigateToSignUpLink?.addEventListener('click', (e: PointerEvent) => {
          e.preventDefault();
          this.changePage('signUp');
        });

        signInForm?.addEventListener('submit', (e: SubmitEvent) => {
          e.preventDefault();
          if (!this.validateRequiredInputs(signInForm)) return;
          this.changePage('chats');
        });

        break;

      case 'signUp':
        const navigateToSignInLink = document.querySelector<HTMLAnchorElement>('#link-to-sign-in');

        const signUpForm = document.querySelector<HTMLFormElement>('#sign-up-form');

        if (signUpForm) {
          this.attachRequiredInputListeners(signUpForm);
          this.syncSubmitButtonsState(signUpForm);
        }

        navigateToSignInLink?.addEventListener('click', (e: PointerEvent) => {
          e.preventDefault();
          this.changePage('signIn');
        });

        signUpForm?.addEventListener('submit', (e: SubmitEvent) => {
          e.preventDefault();
          if (!this.validateRequiredInputs(signUpForm)) return;
          this.changePage('chats');
        });

        break;

      case 'chats':
        const chatCards = document.querySelectorAll<HTMLDivElement>('.chat-card');

        const messageForm = document.querySelector<HTMLFormElement>('#chat-message-form');
        const messageInput = document.querySelector<HTMLInputElement>('#chat-message-input');
        const sendMessageButton = document.querySelector<HTMLButtonElement>('#send-message');

        const profileButton = document.querySelector<HTMLButtonElement>('#profile');

        if (sendMessageButton) sendMessageButton.disabled = true;

        const syncSendButtonState = () => {
          if (!messageInput || !sendMessageButton) return;
          sendMessageButton.disabled = messageInput.value.trim().length === 0;
        };

        messageInput?.addEventListener('input', syncSendButtonState);

        messageForm?.addEventListener('submit', (e: SubmitEvent) => {
          e.preventDefault();
          if (!messageInput) return;
          const value = messageInput.value.trim();
          if (!value) return;
          this.sendMessage(value);
          messageInput.value = '';
          syncSendButtonState();
        });

        chatCards.forEach((chatCard) => chatCard.addEventListener('click', () => this.selectChat(chatCard.id)));

        profileButton?.addEventListener('click', (e: PointerEvent) => {
          e.preventDefault();
          this.changePage('profile');
        });

        break;

      case 'profile':
        const profileForm = document.querySelector<HTMLFormElement>('#profile-form');
        const profileInputs = profileForm?.querySelectorAll<HTMLInputElement>('input');
        const editProfileButton = document.querySelector<HTMLButtonElement>('#edit-profile');
        const exitProfileButton = document.querySelector<HTMLButtonElement>('#exit-profile');
        const signOutButton = document.querySelector<HTMLButtonElement>('#sign-out');

        const setProfileInputsDisabled = (disabled: boolean) => {
          profileInputs?.forEach((input) => {
            input.disabled = disabled;
          });
        };

        setProfileInputsDisabled(!this.state.isProfileEditMode);

        if (profileForm) {
          this.attachRequiredInputListeners(profileForm);
          this.syncSubmitButtonsState(profileForm);
        }

        const resetProfileForm = () => {
          this.state.isProfileEditMode = false;
          if (profileForm) this.clearRequiredInputErrors(profileForm);
          this.render();
        };

        editProfileButton?.addEventListener('click', (e: PointerEvent) => {
          e.preventDefault();
          this.state.isProfileEditMode = true;
          this.render();
        });

        profileForm?.addEventListener('submit', (e: SubmitEvent) => {
          e.preventDefault();
          if (!profileForm || !this.validateRequiredInputs(profileForm)) return;
          this.state.isProfileEditMode = false;
          this.render();
        });

        profileForm?.addEventListener('reset', resetProfileForm);

        exitProfileButton?.addEventListener('click', (e: PointerEvent) => {
          e.preventDefault();
          this.changePage('chats');
        });

        signOutButton?.addEventListener('click', (e: PointerEvent) => {
          e.preventDefault();
          resetProfileForm();
          this.changePage('signIn');
        });

        break;

      case 'notFound':
      case 'serverError':
        const navigateToHomeButton = document.querySelector<HTMLButtonElement>('#go-to-home');
        const refreshPageButton = document.querySelector<HTMLButtonElement>('#refresh-page');

        navigateToHomeButton?.addEventListener('click', (e: PointerEvent) => {
          e.preventDefault();
          this.changePage('chats');
        });

        refreshPageButton?.addEventListener('click', (e: PointerEvent) => {
          e.preventDefault();
          window.location.reload();
        });

        break;

      default:
        break;
    }
  }

  private createPage(page: string, pageContext?: any): void {
    const template = Handlebars.compile(page);

    this.appElement.innerHTML = template(pageContext || {});

    this.attachEventListeners();
  }

  private changePage(page: TPageName): void {
    this.state.currentPage = page;
    this.render();
  }

  private selectChat(chatId: string): void {
    this.state.selectedChat = this.state.chats.find((chat) => chat.id === chatId) ?? null;
    this.render();
  }

  private sendMessage(text: string): void {
    if (!this.state.selectedChat) return;

    const nextMessage = {
      text,
      dateTime: 'now',
      attachments: [],
      type: 'outgoing' as const,
    };

    const updatedChats = this.state.chats.map((chat) => {
      if (chat.id !== this.state.selectedChat?.id) return chat;
      return { ...chat, messages: [...chat.messages, nextMessage] };
    });

    this.state.chats = updatedChats;
    this.state.selectedChat = updatedChats.find((chat) => chat.id === this.state.selectedChat?.id) ?? null;

    this.render();
  }

  private validateRequiredInputs(form: HTMLFormElement): boolean {
    const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));

    const skipPasswordValidation = form.id === 'profile-form';

    let isValid = true;

    inputs.forEach((input) => {
      if (input.disabled || input.type === 'file') return;

      if (skipPasswordValidation && input.type === 'password') return;

      const value = input.value.trim();

      if (!value) {
        isValid = false;
        input.classList.add('input_error');
      } else {
        input.classList.remove('input_error');
      }
    });

    this.syncSubmitButtonsState(form);
    return isValid;
  }

  private attachRequiredInputListeners(form: HTMLFormElement): void {
    const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));

    const skipPasswordValidation = form.id === 'profile-form';

    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (input.disabled || input.type === 'file') return;

        if (skipPasswordValidation && input.type === 'password') return;

        if (input.value.trim()) {
          input.classList.remove('input_error');
        }

        this.syncSubmitButtonsState(form);
      });
    });
  }

  private clearRequiredInputErrors(form: HTMLFormElement): void {
    const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));

    inputs.forEach((input) => {
      input.classList.remove('input_error');
    });

    this.syncSubmitButtonsState(form);
  }

  private syncSubmitButtonsState(form: HTMLFormElement): void {
    const inputs = Array.from(form.querySelectorAll<HTMLInputElement>('input'));
    const submitButtons = Array.from(form.querySelectorAll<HTMLButtonElement>('button[type="submit"]'));

    const skipPasswordValidation = form.id === 'profile-form';

    const hasEmptyRequired = inputs.some((input) => {
      if (input.disabled || input.type === 'file') return false;

      if (skipPasswordValidation && input.type === 'password') return false;

      return input.value.trim().length === 0;
    });

    submitButtons.forEach((button) => {
      button.disabled = hasEmptyRequired;
    });
  }
}
