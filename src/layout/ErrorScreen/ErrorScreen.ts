import errorScreenTemplate from './ErrorScreen.hbs?raw';
import Block from '../../services/Block';

type TErrorScreenProps = {
  errorCode: string;
  title: string;
  subtitle?: string;
  imgSrc?: string;
  animationImgSrc?: string;
};

class ErrorScreen extends Block {
  constructor(props: TErrorScreenProps) {
    super(props);
  }

  render(): string {
    return errorScreenTemplate;
  }
}

export default ErrorScreen;
