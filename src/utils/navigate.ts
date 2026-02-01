import Handlebars from 'handlebars';

import { chatsMock } from '../mocks/chats';
import { profileMock } from '../mocks/profile';
import * as Pages from '../pages';

type PageComponent = new (props: any) => {
  getContent: () => HTMLElement;
};

const pages: { [key: string]: [PageComponent, object] } = {
  routes: [Pages.RoutesPage, {}],
  signInPage: [Pages.SignInPage, {}],
  signUpPage: [Pages.SignUpPage, {}],
  chatsPage: [Pages.ChatsPage, { chats: chatsMock, selectedChat: null }],
  profilePage: [Pages.ProfilePage, { profile: profileMock, isEditMode: false }],
  notFoundPage: [Pages.NotFoundPage, {}],
  serverErrorPage: [Pages.ServerErrorPage, {}],
};

export default function navigate(page: string) {
  const [Source, context] = pages[page];

  const container = document.getElementById('app')!;

  if (typeof Source === 'function') {
    const pageInstance = new Source(context);

    container.innerHTML = '';
    container.append(pageInstance.getContent());

    return;
  }

  container.innerHTML = Handlebars.compile(Source)(context);
}

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;

  const page = target.getAttribute('id');

  if (page) {
    navigate(page);

    e.preventDefault();
    e.stopImmediatePropagation();
  }
});
