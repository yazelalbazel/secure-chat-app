import Peer, { DataConnection } from 'peerjs';
import { Platform } from 'react-native';
import { generateKeyPair } from './encryption';

// Define event types for better type safety
export type PeerMessageEvent = {
  type: 'message' | 'status' | 'error';
  data: any;
  senderId: string;
};

// Define callback type
export type PeerEventCallback = (event: PeerMessageEvent) => void;

class PeerConnection {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private eventListeners: PeerEventCallback[] = [];
  private initializing: boolean = false;
  private initializationFailed: boolean = false;

  async initialize() {
    // Prevent multiple simultaneous initialization attempts
    if (this.initializing) {
      console.log('Peer initialization already in progress');
      return null;
    }
    
    // If initialization previously failed, don't retry unless specifically reset
    if (this.initializationFailed) {
      console.log('Peer initialization previously failed. Using mock mode');
      return 'mock-peer-id';
    }
    
    // If already initialized, return the existing ID
    if (this.peer && this.peer.id) {
      console.log('Peer already initialized with ID:', this.peer.id);
      return this.peer.id;
    }
    
    this.initializing = true;
    
    try {
      const { publicKey } = await generateKeyPair();
      
      // Configure the peer with default STUN servers for better connectivity
      this.peer = new Peer(publicKey, {
        // Use a free public PeerJS server for development
        // In production, you should use your own server
        host: 'peerjs-server.herokuapp.com',
        port: 443,
        secure: true,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      // Set up event listeners
      this.peer.on('connection', (conn) => {
        this.handleConnection(conn);
      });

      this.peer.on('error', (err: Error) => {
        console.error('PeerJS error:', err);
        this.notifyListeners({
          type: 'error',
          data: err.message,
          senderId: 'system'
        });
        
        // If this was during initialization, mark as failed
        if (this.initializing) {
          this.initializationFailed = true;
          this.initializing = false;
        }
      });
      
      // Wait for the peer to be fully open before returning
      return new Promise<string>((resolve, reject) => {
        if (!this.peer) {
          this.initializing = false;
          this.initializationFailed = true;
          reject(new Error('Failed to create peer'));
          return;
        }
        
        // Set a timeout to prevent hanging indefinitely
        const timeout = setTimeout(() => {
          this.initializing = false;
          this.initializationFailed = true;
          reject(new Error('Peer initialization timed out'));
        }, 10000); // 10 seconds timeout
        
        this.peer.on('open', (id) => {
          clearTimeout(timeout);
          this.initializing = false;
          console.log('Peer successfully initialized with ID:', id);
          resolve(id);
        });
      });
    } catch (error) {
      console.error('Failed to initialize peer:', error);
      this.initializing = false;
      this.initializationFailed = true;
      return 'mock-peer-id';
    }
  }

  connect(peerId: string) {
    if (!this.peer) {
      console.error('Cannot connect: Peer not initialized');
      
      // Notify listeners about the error
      this.notifyListeners({
        type: 'error',
        data: 'Cannot connect: Peer not initialized',
        senderId: 'system'
      });
      
      return null;
    }
    
    try {
      const conn = this.peer.connect(peerId, {
        reliable: true
      });
      
      this.handleConnection(conn);
      return conn;
    } catch (error) {
      console.error('Connection error:', error);
      return null;
    }
  }

  private handleConnection(conn: DataConnection) {
    // Store the connection
    this.connections.set(conn.peer, conn);

    // Set up connection event handlers
    conn.on('open', () => {
      this.notifyListeners({
        type: 'status',
        data: 'connected',
        senderId: conn.peer
      });
    });

    conn.on('data', (data: any) => {
      this.notifyListeners({
        type: 'message',
        data,
        senderId: conn.peer
      });
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.notifyListeners({
        type: 'status',
        data: 'disconnected',
        senderId: conn.peer
      });
    });

    conn.on('error', (err: Error) => {
      console.error('Connection error:', err);
      this.notifyListeners({
        type: 'error',
        data: err.message,
        senderId: conn.peer
      });
    });
  }

  addEventListener(callback: PeerEventCallback) {
    this.eventListeners.push(callback);
    return () => {
      // Return function to remove the listener
      this.eventListeners = this.eventListeners.filter(cb => cb !== callback);
    };
  }

  private notifyListeners(event: PeerMessageEvent) {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in event listener:', err);
      }
    });
  }

  sendMessage(peerId: string, message: any) {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      try {
        conn.send(message);
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        return false;
      }
    } else {
      console.warn(`Cannot send message: No open connection to ${peerId}`);
      return false;
    }
  }

  getConnectedPeers() {
    return Array.from(this.connections.keys()).filter(
      peerId => this.connections.get(peerId)?.open
    );
  }

  disconnect() {
    this.connections.forEach((conn) => {
      try {
        conn.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    });
    
    this.connections.clear();
    this.eventListeners = [];
    
    if (this.peer) {
      this.peer.disconnect();
      this.peer.destroy();
      this.peer = null;
    }
  }
}

// Export a singleton instance
export const peerConnection = new PeerConnection();