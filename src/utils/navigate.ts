import Handlebars from 'handlebars';

import { chatsMock } from '../mocks/chats';
import { profileMock } from '../mocks/profile';

type PageComponent = new (props: any) => {
  getContent: () => HTMLElement;
};

type PageLoader = () => Promise<PageComponent | string>;

const pages: { [key: string]: { loader: PageLoader; context: object } } = {
  signInPage: { loader: () => import('../pages/SignInPage').then((m) => m.SignInPage), context: {} },
  signUpPage: { loader: () => import('../pages/SignUpPage').then((m) => m.SignUpPage), context: {} },
  chatsPage: {
    loader: () => import('../pages/ChatsPage').then((m) => m.ChatsPage),
    context: { chats: chatsMock, selectedChat: null },
  },
  profilePage: {
    loader: () => import('../pages/ProfilePage').then((m) => m.ProfilePage),
    context: { profile: profileMock, isEditMode: false },
  },
  notFoundPage: { loader: () => import('../pages/NotFoundPage').then((m) => m.NotFoundPage), context: {} },
  serverErrorPage: {
    loader: () => import('../pages/ServerErrorPage').then((m) => m.ServerErrorPage),
    context: {},
  },
};

export default async function navigate(page: string) {
  const entry = pages[page];
  if (!entry) {
    return;
  }

  const { loader, context } = entry;
  const Source = await loader();

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
    void navigate(page);

    e.preventDefault();
    e.stopImmediatePropagation();
  }
});
