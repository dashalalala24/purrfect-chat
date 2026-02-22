import serverErrorPageTemplate from './ServerErrorPage.hbs?raw';
import { Button } from '../../components/Button';
import { Routes } from '../../consts/routes';
import { ErrorScreen } from '../../layout/ErrorScreen';
import Block from '../../services/Block';

export default class ServerErrorPage extends Block {
  constructor(props: object = {}) {
    super(props);
  }

  init() {
    const ServerErrorScreen = new ErrorScreen({
      errorCode: '500',
      title: 'Taking a quick cat nap',
      subtitle:
        "Our servers are resting for a moment. Don't worry, our team of cats is already working on fixing this! Please try again in a bit.",

      imgSrc: '/icons/cat-sleeping.svg',
      animationImgSrc: '/icons/zzz.svg',
    });

    const RefreshPageButton = new Button({
      id: 'refresh-page',
      text: 'Try again',
      class: 'server-error__button',
      iconSrc: '/icons/refresh.svg',
      onClick: () => window.location.reload(),
    });

    const GoToHomeButton = new Button({
      id: 'go-to-home',
      text: 'Back to home',
      class: 'server-error__button',
      iconSrc: '/icons/home.svg',
      variant: 'outlined',
      onClick: () => window.router.go(Routes.Chats),
    });

    this.children = {
      ...this.children,
      ServerErrorScreen,
      RefreshPageButton,
      GoToHomeButton,
    };
  }

  render(): string {
    return serverErrorPageTemplate;
  }
}
