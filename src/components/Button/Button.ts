import buttonTemplate from './Button.hbs?raw';
import Block from '../../services/Block';

type TButtonProps = {
  id?: string;
  text?: string;
  type?: string;
  onClick?: (event: Event) => void;
  class?: string;
  fullwidth?: boolean;
  iconSrc?: string;
  variant?: string;
};

class Button extends Block {
  constructor(props: TButtonProps = {}) {
    super({
      ...props,
      events: {
        click: props.onClick,
      },
    });
  }

  render(): string {
    return buttonTemplate;
  }
}

export default Button;
