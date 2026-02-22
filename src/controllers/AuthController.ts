import { AuthApi } from '../api/authApi';
import { Routes } from '../consts/routes';
import handleControllerError from '../services/handleControllerError';
import store from '../services/Store';
import toast from '../services/Toast';

const authErrorMessages = {
  badRequest: 'Bad request: Please check the data you entered and try again.',
  unauthorized: 'Unauthorized: Please sign in again.',
};

class AuthController {
  public static async signUp(data: Record<string, unknown>) {
    try {
      const xhr = await AuthApi.signUp(data);

      if (xhr.status === 200) {
        toast.success('Signed up successfully');

        await this.setUserDataToStore();

        window.router.go(Routes.Chats);
      } else {
        throw xhr;
      }
    } catch (error) {
      handleControllerError(error, 'Error during signing up', authErrorMessages);
    }
  }

  public static async signIn(data: Record<string, unknown>): Promise<boolean> {
    try {
      const xhr = await AuthApi.signIn(data);

      if (xhr.status === 200) {
        toast.success('Signed in successfully');

        await this.setUserDataToStore();

        window.router.go(Routes.Chats);
        return true;
      } else if (xhr.status === 400) {
        const responseErrorText = JSON.parse(xhr.responseText);

        if (responseErrorText.reason === 'User already in system') {
          toast.info('Already signed in. Setting data');

          await this.setUserDataToStore();

          window.router.go(Routes.Chats);
          return true;
        }

        throw xhr;
      } else {
        throw xhr;
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Error during signing in', authErrorMessages);
      return false;
    }
  }

  public static async signOut() {
    try {
      const xhr = await AuthApi.signOut();

      if (xhr.status === 200) {
        sessionStorage.setItem('appState', '{}');

        toast.success('Signed out successfully');

        window.router.go(Routes.SignIn);
      } else {
        throw xhr;
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Error during signing out', authErrorMessages);
    }
  }

  private static async setUserDataToStore() {
    try {
      const xhr = await AuthApi.getUser();
      if (xhr.status === 200) {
        const userData = JSON.parse(xhr.responseText);
        store.setUser(userData);
      } else {
        throw xhr;
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Failed to fetch user data', authErrorMessages);
    }
  }
}

export default AuthController;
