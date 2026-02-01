import { SignUpModule } from '../../modules/SignUpModule';
import Block from '../../services/Block';

export default class SignUpPage extends Block {
  constructor(props: object) {
    super({
      ...props,
      SignUpModule: new SignUpModule({}),
    });
  }

  render(): string {
    return `
      <div>
        {{{SignUpModule}}}
      </div>
    `;
  }
}
