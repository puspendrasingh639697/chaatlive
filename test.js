
const wrtc = require('wrtc');
global.window = { RTCPeerConnection: wrtc.RTCPeerConnection };
global.RTCSessionDescription = wrtc.RTCSessionDescription;

const { EasyChat } = require('./lib/chat.js');

async function testMyPackage() {
    console.log("=== 🧪 PEER-TO-PEER CHAT TESTING SHURU ===");

    try {
      
        console.log("\n[User A]: Room bana raha hoon...");
        const tokenA = await EasyChat.createChatRoom();
        console.log("[User A]: Mera Token generate ho gaya! \n👉 Token:", tokenA.substring(0, 50) + "...");

        console.log("\n[User B]: User A ka token lekar join kar raha hoon...");
        const tokenB = await EasyChat.joinChatRoom(tokenA);
        console.log("[User B]: Mera Reply Token generate ho gaya! \n👉 Reply Token:", tokenB.substring(0, 50) + "...");

        console.log("\n[User A]: User B ka reply token lekar connection lock kar raha hoon...");
        await EasyChat.lockConnection(tokenB);
        
        console.log("\n✅ SUCCESS: Saare functions bina kisi error ke chal gaye!");
        console.log("Dono sides ka token exchange aur connection setup logic 100% WORKING hai!");

    } catch (error) {
        console.error("❌ OOPS! Testing me error aaya:", error.message);
    }
}

testMyPackage();