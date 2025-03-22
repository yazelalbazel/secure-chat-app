export interface User {
  id: string;
  name: string;
  publicKey: string;
  privateKey?: string;
  avatar?: string;
}

export interface Contact extends User {
  status: 'online' | 'offline';
  lastSeen: Date;
}

// Encrypted content type
export interface EncryptedContent {
  encrypted: string;
  ephemeralPublicKey: string;
  nonce: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string | EncryptedContent; // Can be encrypted or plaintext
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file';
}

export interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
}