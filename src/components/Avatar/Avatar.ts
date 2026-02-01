import avatarTemplate from './Avatar.hbs?raw';
import Block from '../../services/Block';

type TAvatarProps = {
  id?: string;
  src?: string | null;
  alt?: string;
  username?: string;
  class?: string;
};

class Avatar extends Block {
  constructor(props: TAvatarProps) {
    super(props);
  }

  render(): string {
    return avatarTemplate;
  }
}

export default Avatar;
