import { UserApi } from '../api/userApi';
import { HttpStatus } from '../consts/httpStatus';
import handleControllerError from '../services/handleControllerError';
import store from '../services/Store';
import type { TUser } from '../services/Store';
import toast from '../services/Toast';

class UserController {
  public static async updatePassword(data: Record<string, unknown>): Promise<boolean> {
    try {
      const xhr = await UserApi.updatePassword(data);

      if (xhr.status === HttpStatus.Ok) {
        toast.success('Password updated successfully');
        return true;
      } else {
        throw xhr;
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Error during updating password');
      return false;
    }
  }

  public static async updateProfile(data: Record<string, unknown>): Promise<TUser | null> {
    try {
      const xhr = await UserApi.updateProfile(data);

      if (xhr.status === HttpStatus.Ok) {
        const userData = JSON.parse(xhr.responseText) as TUser;

        store.setUser(userData);

        toast.success('Profile data updated successfully');
        return userData;
      } else {
        throw xhr;
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Error updating profile data');
      return null;
    }
  }

  public static async updateProfileAvatar(data: FormData): Promise<TUser | null> {
    try {
      const xhr = await UserApi.updateProfileAvatar(data);

      if (xhr.status === HttpStatus.Ok) {
        const userData = JSON.parse(xhr.responseText) as TUser;

        store.setUser(userData);

        toast.success('Avatar updated successfully');
        return userData;
      } else {
        throw xhr;
      }
    } catch (xhr) {
      handleControllerError(xhr, 'Error updating avatar');
    }

    return null;
  }
}

export default UserController;
