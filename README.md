# Secure Chat Application

A modern, secure, and feature-rich chat application built with React Native and Expo that works across web and mobile platforms.

## Features

- End-to-end encryption using libsodium
- Peer-to-peer communication using WebRTC
- Cross-platform support (iOS, Android, Web)
- Modern and intuitive UI
- Dark mode support
- Contact management
- Real-time messaging
- Message status tracking (sent, delivered, read)
- File sharing capabilities
- Group chat support

## Security Features

- End-to-end encryption for all messages
- Perfect forward secrecy using ephemeral keys
- No central server for message storage
- Local data encryption
- Secure key management

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── app/                    # Application routes
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── _layout.tsx    # Tab navigation configuration
│   │   ├── index.tsx      # Chats screen
│   │   ├── contacts.tsx   # Contacts screen
│   │   └── settings.tsx   # Settings screen
├── components/            # Reusable components
├── store/                # State management
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Architecture

The application uses a decentralized architecture with the following key components:

1. **State Management**
   - Zustand for local state management
   - Persistent storage for messages and contacts

2. **Encryption Layer**
   - libsodium for cryptographic operations
   - Asymmetric encryption for message security
   - Key exchange protocols

3. **Networking**
   - WebRTC for peer-to-peer communication
   - PeerJS for simplified WebRTC implementation

4. **UI Components**
   - React Native components
   - Lucide icons
   - Custom animations

## Security Considerations

1. **Message Security**
   - All messages are encrypted end-to-end
   - Keys are never transmitted in plain text
   - Perfect forward secrecy ensures past messages remain secure

2. **Data Storage**
   - Messages are stored locally
   - Sensitive data is encrypted at rest
   - No central server stores message content

3. **Key Management**
   - Public/private key pairs for each user
   - Ephemeral keys for each message
   - Secure key storage using platform-specific solutions

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT