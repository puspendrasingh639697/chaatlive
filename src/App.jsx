import React, { useState, useEffect } from 'react';
import { EasyChat } from '@puspendra/easy-p2p-chat';

function App() {
  const [roomId, setRoomId] = useState('');
  const [status, setStatus] = useState('Ready to Connect');
  const [statusColor, setStatusColor] = useState('#007bff');
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [p2p, setP2p] = useState(null);

  
  useEffect(() => {
    try {
      const p2pInstance = new EasyChat();
      setP2p(p2pInstance);
    } catch (err) {
      setStatus('Error loading EasyChat');
      setStatusColor('red');
      console.error(err);
    }
  }, []);

  const handleConnect = () => {
    if (!roomId.trim()) return alert("Pehle Room ID daalo bhai!");
    if (!p2p) return;

    setStatus('Connecting...');
    setStatusColor('orange');

    try {
      p2p.connect(roomId);
      p2p.on('open', () => {
        setStatus('Connected! 🎉');
        setStatusColor('green');
      });

      p2p.on('data', (data) => {
        setChatLog((prev) => [...prev, { text: `Peer: ${data}`, align: 'flex-start', bg: '#f1f1f1' }]);
      });
    } catch (e) {
      console.error("Connection Error:", e);
      setStatus("Connection Failed");
      setStatusColor("red");
    }
  };

  const handleSend = () => {
    if (!message.trim() || !p2p) return;

    try {
      p2p.send(message);
      setChatLog((prev) => [...prev, { text: `Me: ${message}`, align: 'flex-end', bg: '#dcf8c6' }]);
      setMessage('');
    } catch (e) {
      console.error("Send Error:", e);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h3 style={{ textAlign: 'center', margin: 0, color: '#333' }}>🚀 React P2P Chat Test</h3>
        <div style={{ ...styles.status, color: statusColor }}>Status: {status}</div>
        <div style={styles.inputGroup}>
          <input 
            type="text" 
            placeholder="Enter Room ID..." 
            value={roomId} 
            onChange={(e) => setRoomId(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleConnect} style={styles.connectBtn}>Connect</button>
        </div>

        <div style={styles.chatBox}>
          {chatLog.map((msg, index) => (
            <div key={index} style={{ ...styles.msgBubble, alignSelf: msg.align, background: msg.bg }}>
              {msg.text}
            </div>
          ))}
        </div>

        <div style={styles.inputGroup}>
          <input 
            type="text" 
            placeholder="Type a message..." 
            value={message} 
            onChange={(e) => setMessage(e.target.value)}
            style={styles.input}
          />
          <button onClick={handleSend} style={styles.sendBtn}>Send</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  body: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' },
  container: { width: '400px', background: 'white', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  status: { fontSize: '13px', textAlign: 'center', fontWeight: 'bold' },
  inputGroup: { display: 'flex', gap: '10px' },
  input: { flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px', outline: 'none' },
  connectBtn: { padding: '10px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  sendBtn: { padding: '10px 15px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  chatBox: { height: '250px', border: '1px solid #ccc', overflowY: 'auto', padding: '10px', borderRadius: '4px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '8px' },
  msgBubble: { padding: '8px 12px', borderRadius: '5px', maxWidth: '80%', fontSize: '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }
};

export default App;