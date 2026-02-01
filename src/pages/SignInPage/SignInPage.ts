import SignInModule from '../../modules/SignInModule/SignInModule';
import Block from '../../services/Block';

export default class SignInPage extends Block {
  constructor(props: object) {
    super({
      ...props,
      SignInModule: new SignInModule({}),
    });
  }

  render(): string {
    return `
              <div>
              {{{SignInModule}}}
              </div>
          `;
  }
}
