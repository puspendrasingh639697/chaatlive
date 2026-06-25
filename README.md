arkdown
# @puspendra/easy-p2p-chat

A powerful, **zero-server Peer-to-Peer (P2P) messaging library** for Web and Mobile. Built for privacy and real-time communication.

## 🚀 Installation

### Web (React/Next.js):
```bash
npm install @puspendra/easy-p2p-chat
Mobile (React Native):
Bash
npm install @puspendra/easy-p2p-chat react-native-webrtc
# (For iOS: cd ios && pod install)
💻 Implementation Demo
The signaling process (token exchange) is managed by YOU using your own database (Firebase, Supabase, or REST API).

JavaScript
import { EasyChat } from '@puspendra/easy-p2p-chat';

// 1. Initialize
const chat = new EasyChat(); 

// 2. Peer A: Create Room
const offerToken = await chat.createChatRoom();

// 3. Peer B: Join Room
const answerToken = await chat.joinChatRoom(offerToken);

// 4. Peer A: Lock Connection
await chat.lockConnection(answerToken);

// 5. Messaging
chat.sendMessage("Hello Friend!");
chat.onMessageReceived((msg) => console.log("New Message:", msg));
⚙️ Production Configuration (TURN Servers)
To ensure 100% connectivity in real-world networks/firewalls, provide your TURN server:

JavaScript
const iceConfig = [
  { urls: 'stun:stun.l.google.com:19302' }, 
  {
    urls: 'turn:YOUR_TURN_SERVER_URL:3478',
    username: 'YOUR_USERNAME',
    credential: 'YOUR_PASSWORD'
  }
];

const chat = new EasyChat(iceConfig);
💡 FAQ
Where do I host signaling? Use your existing backend/database to exchange tokens.

Is it secure? Yes, it is End-to-End Encrypted via WebRTC.

📜 License
MIT © [Puspendra Singh]