import authCoverTemplate from './AuthCover.hbs?raw';
import Block from '../../services/Block';

class AuthCover extends Block {
  constructor(props: object = {}) {
    super(props);
  }

  render(): string {
    return authCoverTemplate;
  }
}

export default AuthCover;
