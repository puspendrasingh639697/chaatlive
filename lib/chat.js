"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EasyChat = exports.EasyP2PChat = void 0;
let PeerConnectionClass = null;
if (typeof window !== 'undefined' && window.RTCPeerConnection) {
    PeerConnectionClass = window.RTCPeerConnection;
}
else {
    try {
        const req = typeof require !== 'undefined' ? require : () => { throw new Error(); };
        const { RTCPeerConnection } = req('react-native-webrtc');
        PeerConnectionClass = RTCPeerConnection;
    }
    catch (e) {
        if (typeof console !== 'undefined') {
            console.warn("EasyP2PChat: WebRTC library fallback mode active.");
        }
    }
}
class EasyP2PChat {
    // Constructor me customIceServers lene ka option de diya (Production ke liye)
    constructor(customIceServers) {
        this.peerConnection = null;
        this.dataChannel = null;
        this.onMessageCallback = null;
        this.configuration = {
            iceServers: customIceServers || [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' }
            ]
        };
    }
    // 🔥 100% Core Fix: Har call par connection bilkul fresh initialize hoga
    initConnection() {
        if (PeerConnectionClass) {
            this.peerConnection = new PeerConnectionClass(this.configuration);
        }
        else if (typeof window !== 'undefined' && window.RTCPeerConnection) {
            this.peerConnection = new window.RTCPeerConnection(this.configuration);
        }
        else {
            throw new Error("WebRTC is not supported in this environment.");
        }
    }
    // Helper: Network paths (ICE Candidates) collect hone ka wait karega
    waitForIceGathering() {
        return new Promise((resolve) => {
            if (!this.peerConnection)
                return resolve();
            if (this.peerConnection.iceGatheringState === 'complete') {
                resolve();
            }
            else {
                const checkState = () => {
                    var _a;
                    if (((_a = this.peerConnection) === null || _a === void 0 ? void 0 : _a.iceGatheringState) === 'complete') {
                        this.peerConnection.removeEventListener('icecandidate', checkState);
                        resolve();
                    }
                };
                this.peerConnection.addEventListener('icecandidate', checkState);
            }
        });
    }
    createChatRoom() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initConnection(); // Fresh slate initialization
            if (!this.peerConnection)
                throw new Error("WebRTC not initialized");
            this.dataChannel = this.peerConnection.createDataChannel("chatChannel");
            this.setupDataChannelEvents();
            const offer = yield this.peerConnection.createOffer();
            yield this.peerConnection.setLocalDescription(offer);
            yield this.waitForIceGathering();
            return btoa(JSON.stringify(this.peerConnection.localDescription));
        });
    }
    joinChatRoom(senderToken) {
        return __awaiter(this, void 0, void 0, function* () {
            this.initConnection(); // Fresh slate initialization
            if (!this.peerConnection)
                throw new Error("WebRTC not initialized");
            this.peerConnection.ondatachannel = (event) => {
                this.dataChannel = event.channel;
                this.setupDataChannelEvents();
            };
            const remoteDesc = JSON.parse(atob(senderToken));
            yield this.peerConnection.setRemoteDescription(remoteDesc);
            const answer = yield this.peerConnection.createAnswer();
            yield this.peerConnection.setLocalDescription(answer);
            yield this.waitForIceGathering();
            return btoa(JSON.stringify(this.peerConnection.localDescription));
        });
    }
    lockConnection(receiverToken) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.peerConnection)
                throw new Error("WebRTC not initialized");
            const remoteDesc = JSON.parse(atob(receiverToken));
            yield this.peerConnection.setRemoteDescription(remoteDesc);
        });
    }
    sendMessage(messageText) {
        var _a;
        if (this.dataChannel && this.dataChannel.readyState === "open") {
            this.dataChannel.send(messageText);
        }
        else {
            console.error("Channel open nahi mila. State:", (_a = this.dataChannel) === null || _a === void 0 ? void 0 : _a.readyState);
        }
    }
    onMessageReceived(callback) {
        this.onMessageCallback = callback;
        if (this.dataChannel) {
            this.setupDataChannelEvents();
        }
    }
    setupDataChannelEvents() {
        if (!this.dataChannel)
            return;
        this.dataChannel.onmessage = (event) => {
            if (this.onMessageCallback) {
                this.onMessageCallback(event.data);
            }
        };
    }
}
exports.EasyP2PChat = EasyP2PChat;
exports.EasyChat = EasyP2PChat;
exports.default = EasyP2PChat;
