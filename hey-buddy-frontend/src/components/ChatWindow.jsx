import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatWindow = ({ socket, user }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null); // To auto-scroll

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/chat', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
      } catch (err) {
        console.error("Error loading chat:", err);
      }
    };
    fetchMessages();

    socket.on('receive_message', (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => socket.off('receive_message');
  }, [socket]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/chat', { text }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setText('');
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-white p-4 border-b flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
            P
          </div>
          <div>
            <h3 className="font-bold text-gray-800">Your Partner</h3>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user._id;
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[70%] p-3 rounded-2xl shadow-sm text-sm ${
                  isMe 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <form onSubmit={sendMessage} className="bg-white p-4 border-t flex items-center gap-3">
        <input 
          className="flex-1 bg-gray-100 text-gray-800 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          placeholder="Type a message..." 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
        />
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-md transition transform hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;