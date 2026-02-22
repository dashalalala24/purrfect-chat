import toast from './Toast';
import { Routes } from '../consts/routes';

type ErrorMessages = {
  badRequest?: string;
  unauthorized?: string;
  unexpected?: string;
};

const defaultMessages: Required<ErrorMessages> = {
  badRequest: 'Bad request: Please check your data and try again.',
  unauthorized: 'Unauthorized: Please sign in again.',
  unexpected: 'An unexpected error occurred. Please try again later.',
};

const getErrorReason = (error: XMLHttpRequest): string | null => {
  if (!error.responseText) {
    return null;
  }

  try {
    const parsedResponse = JSON.parse(error.responseText) as { reason?: unknown };

    return typeof parsedResponse.reason === 'string' && parsedResponse.reason.trim()
      ? parsedResponse.reason
      : null;
  } catch {
    return null;
  }
};

const handleControllerError = (error: unknown, defaultMessage: string, messages: ErrorMessages = {}) => {
  const mergedMessages = { ...defaultMessages, ...messages };

  if (!(error instanceof XMLHttpRequest)) {
    console.error(defaultMessage, error);
    toast.error(mergedMessages.unexpected);
    return;
  }

  const errorReason = getErrorReason(error);

  console.error(defaultMessage, error.statusText);

  switch (error.status) {
    case 400:
      toast.error(errorReason ?? mergedMessages.badRequest);
      break;
    case 401:
      toast.error(errorReason ?? mergedMessages.unauthorized);
      window.router.go(Routes.SignIn);
      break;
    case 500:
      window.router.go(Routes.ServerError);
      break;
    default:
      toast.error(errorReason ?? mergedMessages.unexpected);
      break;
  }
};

export default handleControllerError;
