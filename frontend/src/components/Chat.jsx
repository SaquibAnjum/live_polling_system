import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setChatMessages } from '../store/slices/socketSlice';

function Chat({ pollId, role, studentName }) {
  const { socket, chatMessages } = useSelector((state) => state.socket);
  const pollParticipants = useSelector((state) => state.poll.participants || []);
  const dispatch = useDispatch();
  const [inputMessage, setInputMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef(null);
  const storageKey = pollId ? `chat_${pollId}` : null;

  // Load chat history from localStorage for this poll
  useEffect(() => {
    if (!storageKey) return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        dispatch(setChatMessages(JSON.parse(stored)));
      } catch {
        // ignore parse errors
      }
    }
  }, [storageKey, dispatch]);

  // Persist chat messages
  useEffect(() => {
    if (!storageKey) return;
    if (chatMessages.length === 0) {
      localStorage.removeItem(storageKey);
    } else {
      localStorage.setItem(storageKey, JSON.stringify(chatMessages));
    }
  }, [chatMessages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      pollId,
      message: inputMessage,
      sender: role === 'teacher' ? 'Teacher' : studentName,
      role,
      timestamp: new Date().toISOString(),
    };

    socket.emit('chat_message', messageData);
    setInputMessage('');
  };

  const handleKickStudent = (socketId) => {
    if (role === 'teacher' && socket) {
      socket.emit('kick_student', { pollId, socketId });
    }
  };

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:bottom-24 sm:right-6 w-full max-w-sm sm:w-96 bg-white/95 backdrop-blur-sm rounded-2xl shadow-large border border-white/20 flex flex-col h-[60vh] sm:h-[500px] z-50">
      {/* Tabs */}
      <div className="flex border-b border-gray-light">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 px-4 text-center font-medium ${
            activeTab === 'chat'
              ? 'text-primary-light border-b-2 border-primary-light'
              : 'text-gray-DEFAULT hover:text-primary-light'
          }`}
        >
          Chat
        </button>
        {role === 'teacher' && (
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 py-3 px-4 text-center font-medium ${
              activeTab === 'participants'
                ? 'text-primary-light border-b-2 border-primary-light'
                : 'text-gray-DEFAULT hover:text-primary-light'
            }`}
          >
            Participants
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'chat' ? (
          <div className="space-y-3">
            {chatMessages.length === 0 ? (
              <p className="text-gray-DEFAULT text-center py-8">No messages yet. Start the conversation!</p>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === role ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === role
                      ? 'bg-primary-light text-white'
                      : 'bg-gray-900 text-white'
                  }`}
                >
                  <div className="text-xs font-semibold mb-1 text-gray-200">
                    {msg.sender}
                  </div>
                  <div>{msg.message}</div>
                </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Participants</h3>
              <span className="text-xs text-gray-500">Total: {pollParticipants.length}</span>
            </div>
            {pollParticipants.length === 0 ? (
              <p className="text-gray-500 text-sm">No participants yet.</p>
            ) : (
              <div className="space-y-2">
                {pollParticipants.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between border border-gray-light rounded-lg px-3 py-2 bg-white"
                  >
                    <div className="font-medium text-gray-800">{p.name}</div>
                    {role === 'teacher' && (
                      <button
                        onClick={() => handleKickStudent(p.socketId)}
                        className="text-red-600 hover:text-red-800 text-sm font-semibold"
                      >
                        Kick
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-light p-4">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light"
          />
          <button
            type="submit"
            className="min-w-[80px] bg-white text-primary-dark font-semibold px-4 py-2 rounded-xl border border-primary-light hover:bg-primary-light hover:text-white hover:shadow-glow transform hover:scale-105 transition-all duration-200 text-sm"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;
