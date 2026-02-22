export const Routes = {
  SignIn: '/',
  SignUp: '/sign-up',
  Chats: '/messenger',
  Profile: '/settings',
  NotFound: '/not-found',
  ServerError: '/error',
};

export const AuthRoutes = [Routes.SignIn, Routes.SignUp] as const;

export const PrivateRoutes = [Routes.Chats, Routes.Profile] as const;
