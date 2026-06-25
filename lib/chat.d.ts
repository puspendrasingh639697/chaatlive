export declare class EasyP2PChat {
    peerConnection: RTCPeerConnection | null;
    dataChannel: RTCDataChannel | null;
    private onMessageCallback;
    private configuration;
    constructor(customIceServers?: RTCIceServer[]);
    private initConnection;
    private waitForIceGathering;
    createChatRoom(): Promise<string>;
    joinChatRoom(senderToken: string): Promise<string>;
    lockConnection(receiverToken: string): Promise<void>;
    sendMessage(messageText: string): void;
    onMessageReceived(callback: (msg: string) => void): void;
    private setupDataChannelEvents;
}
export { EasyP2PChat as EasyChat };
export default EasyP2PChat;
