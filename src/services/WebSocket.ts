import store from './Store';
import toast from './Toast';
import { baseWsUrl } from '../api/baseURL';

class WebSocketService {
  private static instance: WebSocketService | null = null;
  private socket: WebSocket | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private connectionPromise: Promise<void> | null = null;
  private connectionResolver: (() => void) | null = null;
  private historyOffset = 0;
  private historyResolver: ((loadedCount: number) => void) | null = null;

  private constructor() {}

  public static getInstance(): WebSocketService {
    if (this.instance === null) {
      this.instance = new WebSocketService();
    }
    return this.instance;
  }

  public async openConnection(chatID: number, token: string): Promise<boolean> {
    await this.closeConnection();

    const userID = store.getState().user?.id;
    if (userID == null) {
      console.error('User ID is missing, cannot establish WebSocket connection.');
      return false;
    }

    this.socket = new WebSocket(`${baseWsUrl}/${userID}/${chatID}/${token}`);

    this.connectionPromise = new Promise((resolve) => {
      this.connectionResolver = resolve;
    });

    this.socket.addEventListener('open', this.handleOpen);
    this.socket.addEventListener('message', this.handleMessage);
    this.socket.addEventListener('close', this.handleClose);
    this.socket.addEventListener('error', this.handleError);

    if (this.connectionPromise) {
      await this.connectionPromise;
    }

    await this.getOldMessages(0);

    return true;
  }

  private handleOpen = () => {
    this.setupPing();

    if (this.connectionResolver) {
      this.connectionResolver();
      this.connectionResolver = null;
    }
  };

  private handleMessage = (event: MessageEvent) => {
    const data = JSON.parse(event.data);

    if (Array.isArray(data)) {
      const filteredData = data.filter((message) => message.type === 'message');
      const currentMessages = store.getState().messages ?? [];
      const nextMessages = this.historyOffset === 0 ? filteredData : [...currentMessages, ...filteredData];
      store.setMessages(nextMessages);
      this.historyResolver?.(filteredData.length);
      this.historyResolver = null;
    } else {
      if (data.type === 'message') {
        store.addMessage(data);
      }
      if (data.type === 'error') {
        console.error('error:', data);
        toast.error(data.content);
      }
    }
  };

  private handleClose = (event: CloseEvent) => {
    void event;
    this.cleanup();
  };

  private handleError = (event: Event) => {
    console.error('WebSocket error:', event);
  };

  private setupPing() {
    this.cleanupPing();

    this.pingInterval = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send('ping');
      }
    }, 60000);
  }

  public sendMessage(content: string, type: string) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ content, type }));
    } else {
      console.warn('WebSocket is not open. Message not sent.');
    }
  }

  public async getOldMessages(offset = 0): Promise<number> {
    if (this.connectionPromise) {
      await this.connectionPromise;
    }
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return 0;
    }

    return new Promise((resolve) => {
      this.historyOffset = offset;
      this.historyResolver = resolve;
      this.socket?.send(
        JSON.stringify({
          content: String(offset),
          type: 'get old',
        }),
      );
    });
  }

  public closeConnection(): Promise<void> {
    return new Promise((resolve) => {
      if (this.socket) {
        this.socket.addEventListener(
          'close',
          () => {
            this.cleanup();
            resolve();
          },
          { once: true },
        );

        this.socket.close();
        this.socket = null;
      } else {
        resolve();
      }

      this.connectionPromise = null;
      this.connectionResolver = null;
      this.historyOffset = 0;
      this.historyResolver?.(0);
      this.historyResolver = null;
    });
  }

  private cleanup() {
    this.cleanupPing();
    this.socket = null;
    this.connectionPromise = null;
    this.connectionResolver = null;
    this.historyOffset = 0;
    this.historyResolver?.(0);
    this.historyResolver = null;
  }

  private cleanupPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

const wsService = WebSocketService.getInstance();

export default wsService;
