import notFoundPageTemplate from './NotFoundPage.hbs?raw';
import { Button } from '../../components/Button';
import { ErrorScreen } from '../../layout/ErrorScreen';
import Block from '../../services/Block';
import navigate from '../../utils/navigate';

export default class NotFoundPage extends Block {
  constructor(props: object = {}) {
    super(props);
  }

  init() {
    const NotFoundErrorScreen = new ErrorScreen({
      errorCode: '404',
      title: 'Oops! Page not found',
      subtitle:
        "Looks like this page wandered off somewhere! Don't worry, even curious cats get lost sometimes. Let's get you back home.",

      imgSrc: '/icons/cat-weary.svg',
      animationImgSrc: '/icons/question-mark.svg',
    });

    const GoToHomeButton = new Button({
      id: 'go-to-home',
      text: 'Back to home',
      class: 'not-found__button',
      iconSrc: '/icons/home.svg',
      onClick: () => navigate('chatsPage'),
    });

    this.children = {
      ...this.children,
      NotFoundErrorScreen,
      GoToHomeButton,
    };
  }

  render(): string {
    return notFoundPageTemplate;
  }
}
