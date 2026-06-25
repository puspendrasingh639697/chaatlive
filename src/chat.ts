let PeerConnectionClass: any = null;

if (typeof window !== 'undefined' && (window as any).RTCPeerConnection) {
  PeerConnectionClass = (window as any).RTCPeerConnection;
} else {
  try {
    const req = typeof require !== 'undefined' ? require : () => { throw new Error(); };
    const { RTCPeerConnection } = req('react-native-webrtc');
    PeerConnectionClass = RTCPeerConnection;
  } catch (e) {
    if (typeof console !== 'undefined') {
      console.warn("EasyP2PChat: WebRTC library fallback mode active.");
    }
  }
}

export class EasyP2PChat {
  public peerConnection: RTCPeerConnection | null = null;
  public dataChannel: RTCDataChannel | null = null;
  private onMessageCallback: ((msg: string) => void) | null = null;
  private configuration: { iceServers: RTCIceServer[] };

  constructor(customIceServers?: RTCIceServer[]) {
    this.configuration = {
      iceServers: customIceServers || [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
  }

  
  private initConnection() {
    if (PeerConnectionClass) {
      this.peerConnection = new PeerConnectionClass(this.configuration);
    } else if (typeof window !== 'undefined' && (window as any).RTCPeerConnection) {
      this.peerConnection = new (window as any).RTCPeerConnection(this.configuration);
    } else {
      throw new Error("WebRTC is not supported in this environment.");
    }
  }


  private waitForIceGathering(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.peerConnection) return resolve();
      if (this.peerConnection.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkState = () => {
          if (this.peerConnection?.iceGatheringState === 'complete') {
            this.peerConnection.removeEventListener('icecandidate', checkState);
            resolve();
          }
        };
        this.peerConnection.addEventListener('icecandidate', checkState);
      }
    });
  }

  public async createChatRoom(): Promise<string> {
    this.initConnection(); // Fresh slate initialization
    if (!this.peerConnection) throw new Error("WebRTC not initialized");

    this.dataChannel = this.peerConnection.createDataChannel("chatChannel");
    this.setupDataChannelEvents();
    
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    
    await this.waitForIceGathering();
    
    return btoa(JSON.stringify(this.peerConnection.localDescription));
  }

  public async joinChatRoom(senderToken: string): Promise<string> {
    this.initConnection(); // Fresh slate initialization
    if (!this.peerConnection) throw new Error("WebRTC not initialized");

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannelEvents();
    };
    
    const remoteDesc = JSON.parse(atob(senderToken));
    await this.peerConnection.setRemoteDescription(remoteDesc);
    
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    
    await this.waitForIceGathering();
    
    return btoa(JSON.stringify(this.peerConnection.localDescription));
  }

  public async lockConnection(receiverToken: string): Promise<void> {
    if (!this.peerConnection) throw new Error("WebRTC not initialized");
    const remoteDesc = JSON.parse(atob(receiverToken));
    await this.peerConnection.setRemoteDescription(remoteDesc);
  }

  public sendMessage(messageText: string): void {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(messageText);
    } else {
      console.error("Channel open nahi mila. State:", this.dataChannel?.readyState);
    }
  }

  public onMessageReceived(callback: (msg: string) => void): void {
    this.onMessageCallback = callback;
    if (this.dataChannel) {
      this.setupDataChannelEvents();
    }
  }

  private setupDataChannelEvents(): void {
    if (!this.dataChannel) return;
    
    this.dataChannel.onmessage = (event) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(event.data);
      }
    };
  }
}

export { EasyP2PChat as EasyChat };
export default EasyP2PChat;