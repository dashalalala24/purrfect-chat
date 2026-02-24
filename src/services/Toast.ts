import { Toast, type TToastVariant } from '../components/Toast';

type ToastOptions = {
  duration?: number;
};

class ToastService {
  private container: HTMLDivElement | null = null;
  private readonly defaultDuration = 4000;
  private readonly hideAnimationDuration = 220;

  public init() {
    if (this.container) {
      return;
    }

    const container = document.createElement('div');
    container.className = 'toast__container';
    document.body.append(container);
    this.container = container;
  }

  public error(message: string, options?: ToastOptions) {
    this.show(message, 'error', options);
  }

  public success(message: string, options?: ToastOptions) {
    this.show(message, 'success', options);
  }

  public info(message: string, options?: ToastOptions) {
    this.show(message, 'info', options);
  }

  private show(message: string, variant: TToastVariant, options?: ToastOptions) {
    this.init();

    if (!this.container) {
      return;
    }

    const toastComponent = new Toast({ message, variant });
    const toast = toastComponent.getContent();

    this.container.append(toast);

    requestAnimationFrame(() => {
      toast.classList.add('toast_state_visible');
    });

    const duration = options?.duration ?? this.defaultDuration;

    setTimeout(() => {
      toast.classList.remove('toast_state_visible');
      toast.classList.add('toast_state_closing');

      setTimeout(() => {
        toast.remove();
      }, this.hideAnimationDuration);
    }, duration);
  }
}

const toast = new ToastService();

export default toast;
