import toastTemplate from './Toast.hbs?raw';
import Block from '../../services/Block';

type TToastVariant = 'error' | 'success' | 'info';

type TToastProps = {
  message: string;
  variant: TToastVariant;
  visible?: boolean;
  closing?: boolean;
};

class Toast extends Block {
  constructor(props: TToastProps) {
    super({
      ...props,
    });
  }

  render(): string {
    return toastTemplate;
  }
}

export default Toast;
