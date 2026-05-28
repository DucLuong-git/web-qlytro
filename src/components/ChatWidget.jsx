import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Edit2, Check } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import io from 'socket.io-client';

const ChatWidget = () => {
  const { user } = useAuthStore();
  const token = localStorage.getItem('token');
  const [isOpen, setIsOpen] = useState(false);
  
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState('');
  const [participants, setParticipants] = useState([]);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Khởi tạo & Lấy dữ liệu khi mở chat lần đầu
  useEffect(() => {
    if (!isOpen || !user || !token) return;
    
    let activeSocket = socket;

    const initChat = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Lấy thông tin phòng chat
        const roomRes = await fetch(`${window.location.origin}/api/chat/my-room`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const roomData = await roomRes.json();
        
        if (!roomData.success) {
          setError('Bạn chưa có phòng chat hỗ trợ.');
          setIsLoading(false);
          return;
        }
        
        setRoom(roomData.room);
        setParticipants(roomData.participants || []);

        // 2. Lấy lịch sử tin nhắn
        const msgRes = await fetch(`${window.location.origin}/api/chat/messages/${roomData.room._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const msgData = await msgRes.json();
        
        if (msgData.success) {
          setMessages(msgData.data);
        }

        // 3. Khởi tạo Socket.IO kết nối đến Namespace /chat
        if (!activeSocket) {
          activeSocket = io(`${window.location.origin}/chat`, {
            auth: { token }
          });

          activeSocket.on('connect', () => {
            console.log('Chat socket connected!');
            activeSocket.emit('join_room', roomData.room._id);
          });

          activeSocket.on('receive_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
          });

          activeSocket.on('room_renamed', (updatedRoom) => {
            setRoom(updatedRoom);
          });

          activeSocket.on('error', (err) => {
            console.error('Socket error:', err);
            setError(err.message || 'Lỗi kết nối chat');
          });

          setSocket(activeSocket);
        }
      } catch (err) {
        console.error('Lỗi khởi tạo chat:', err);
        setError('Không thể kết nối đến máy chủ chat.');
      } finally {
        setIsLoading(false);
      }
    };

    if (!room) {
      initChat();
    }

    return () => {
      // Dọn dẹp khi unmount (Hoặc đóng hẳn trang)
      // Không ngắt socket ngay khi đóng popup để vẫn nhận tin báo
    };
  }, [isOpen, user, token]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !room) return;

    socket.emit('send_message', {
      roomId: room._id,
      content: newMessage
    }, (response) => {
      if (!response.success) {
        console.error('Lỗi gửi tin nhắn:', response.error);
        alert('Gửi tin nhắn thất bại');
      }
    });

    setNewMessage('');
  };

  const handleRenameRoom = () => {
    if (!editNameValue.trim() || !socket || !room) return;
    
    socket.emit('rename_room', { roomId: room._id, name: editNameValue.trim() }, (res) => {
      if (res.success) {
        setRoom(res.room);
        setIsEditingName(false);
      } else {
        alert(res.error || 'Đổi tên thất bại');
      }
    });
  };

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Khung Chat */}
      {isOpen && (
        <div className="w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col mb-4 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300 origin-bottom-right">
          {/* Header */}
          <div className="bg-indigo-600 dark:bg-indigo-700 text-white p-4 flex justify-between items-center shadow-md z-10">
            <div className="flex-1 mr-4">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="flex-1 bg-white/20 border-none rounded px-2 py-1 text-sm text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white"
                    autoFocus
                  />
                  <button onClick={handleRenameRoom} className="p-1 hover:bg-white/20 rounded text-emerald-300"><Check className="w-4 h-4" /></button>
                  <button onClick={() => setIsEditingName(false)} className="p-1 hover:bg-white/20 rounded text-rose-300"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg leading-tight truncate" title={room ? room.name || 'Trung tâm Hỗ trợ' : 'Trung tâm Hỗ trợ'}>
                    {room ? room.name || 'Trung tâm Hỗ trợ' : 'Trung tâm Hỗ trợ'}
                  </h3>
                  {room && (
                    <button 
                      onClick={() => { setIsEditingName(true); setEditNameValue(room.name || ''); }}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors opacity-70 hover:opacity-100 shrink-0"
                      title="Đổi tên nhóm chat"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
              {!isEditingName && <p className="text-xs text-indigo-200 mt-0.5">{room ? 'Quản lý viên đang trực' : 'Đang kết nối...'}</p>}
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowInfo(!showInfo)}
                className={`p-1.5 rounded-full transition-colors ${showInfo ? 'bg-white/30' : 'hover:bg-white/20'}`}
                title="Thông tin nhóm"
              >
                <User className="w-5 h-5" />
              </button>
              <button  
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body - Danh sách tin nhắn hoặc Thông tin nhóm */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900/50 space-y-4 relative">
            {showInfo ? (
              <div className="absolute inset-0 bg-white dark:bg-slate-800 p-4 z-20 overflow-y-auto animate-in slide-in-from-right-4 duration-200">
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 mb-4 border-b border-slate-100 dark:border-slate-700 pb-2">Thành viên trong nhóm ({participants.length})</h4>
                <div className="space-y-3">
                  {participants.map(p => (
                    <div key={p._id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                        {p.userId?.avatar ? (
                           <img src={p.userId.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                           <User className="w-5 h-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-slate-800 dark:text-slate-100 leading-tight">{p.userId?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500 capitalize">{p.role === 'TENANT' ? 'Khách thuê' : p.role === 'OWNER' ? 'Chủ trọ' : 'Quản lý'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {isLoading && <div className="text-center text-slate-400 text-sm py-4">Đang tải tin nhắn...</div>}
            {error && <div className="text-center text-rose-500 text-sm py-4 bg-rose-50 rounded-lg">{error}</div>}
            
            {!isLoading && !error && messages.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-8">
                Chưa có tin nhắn nào.<br/>Hãy gửi tin nhắn đầu tiên để liên hệ Quản lý!
              </div>
            )}

            {messages.map((msg, idx) => {
              const isMine = msg.senderId?._id === user.id || msg.senderId === user.id;
              
              return (
                <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  {!isMine && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-2 shrink-0 overflow-hidden">
                      {msg.senderId?.avatar ? (
                         <img src={msg.senderId.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                         <User className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                  )}
                  <div 
                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${
                      isMine 
                        ? 'bg-indigo-600 text-white rounded-br-sm' 
                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-600 shadow-sm rounded-bl-sm'
                    }`}
                  >
                    {!isMine && <p className="text-[10px] font-bold text-slate-400 dark:text-slate-300 mb-1">{msg.senderId?.name || 'Admin'}</p>}
                    <p className="text-sm break-words leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer - Ô nhập tin */}
          <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
            <form onSubmit={handleSendMessage} className="flex gap-2 relative">
              <input 
                type="text" 
                placeholder="Nhập tin nhắn..." 
                className="flex-1 bg-slate-100 dark:bg-slate-900 border-none rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white placeholder-slate-400"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={isLoading || !!error}
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim() || isLoading || !!error}
                className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${
          isOpen ? 'bg-slate-800 text-white' : 'bg-indigo-600 text-white'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>
    </div>
  );
};

export default ChatWidget;
