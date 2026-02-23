import './helpers/handlebarsHelpers';

import { Routes } from './consts/routes';
import AuthController from './controllers/AuthController';
import * as Pages from './pages';
import Router from './services/Router';
import toast from './services/Toast';

const router = new Router('#app');
window.router = router;
toast.init();

const bootstrapApp = async () => {
  await AuthController.preloadUserForAppStart();

  router
    .use(Routes.SignIn, Pages.SignInPage)
    .use(Routes.SignUp, Pages.SignUpPage)
    .use(Routes.Chats, Pages.ChatsPage)
    .use(Routes.Profile, Pages.ProfilePage)
    .use(Routes.ServerError, Pages.ServerErrorPage)
    .use('*', Pages.NotFoundPage);

  router.start();
};

void bootstrapApp();
