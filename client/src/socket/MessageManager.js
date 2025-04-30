import io from 'socket.io-client';

export default class MessageManager {
  constructor(roomName, userId, callbacks) {
    this.roomName = roomName;
    this.userId = userId;
    this.callbacks = callbacks;
    this.socket = null;
    this.socketId = null;
  }

  async initialize() {
    const WEBSOCKET_URL = process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost/message';
    this.socket = io(WEBSOCKET_URL);

    this.socket.on('connection-success', ({ socketId }) => {
      this.socketId = socketId;
      this.callbacks.onSocketId(socketId);
    });


  }
  cleanup() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.callbacks.onCleanup?.();
  }
}