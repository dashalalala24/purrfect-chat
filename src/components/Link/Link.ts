import linkTemplate from './Link.hbs?raw';
import Block from '../../services/Block';

type TLinkProps = {
  id?: string;
  text?: string;
  href?: string;
};

class Link extends Block {
  constructor(props: TLinkProps = {}) {
    super(props);
  }

  render(): string {
    return linkTemplate;
  }
}

export default Link;
