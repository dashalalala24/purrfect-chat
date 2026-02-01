import iconButtonTemplate from './IconButton.hbs?raw';
import Block from '../../services/Block';

type TIconButtonProps = {
  id?: string;
  ariaLabel?: string;
  class?: string;
  type?: string;
  iconSrc?: string;
  onClick?: (event: Event) => void;
};

class IconButton extends Block {
  constructor(props: TIconButtonProps = {}) {
    super({
      ...props,
      events: {
        click: props.onClick,
      },
    });
  }

  render(): string {
    return iconButtonTemplate;
  }
}

export default IconButton;
