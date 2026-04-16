import { useState, useEffect, useRef } from "react";
import { FaPlus, FaImage, FaVideo, FaSmile } from "react-icons/fa";
import { io } from "socket.io-client";

const Chat = ({ user, selectedUser }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ["😀","😂","😍","😎","🔥","👍","❤️","😢","😡","🎉"];

  useEffect(() => {
    socketRef.current = io("https://social-server-hhnd.onrender.com", {
      transports: ["websocket"],
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const allUsers = JSON.parse(localStorage.getItem("users")) || [];
    const filtered = allUsers.filter((u) => u.username !== user.username);
    setUsers(filtered);
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      setCurrentChat(selectedUser);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (!user || !currentChat || !socketRef.current) return;

    socketRef.current.emit("join", user.username);

    fetch(`https://social-server-hhnd.onrender.com/messages/${user.username}/${currentChat}`)
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(() => setMessages([]));
  }, [user, currentChat]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handler = (msg) => {
      if (
        (msg.sender === user.username && msg.receiver === currentChat) ||
        (msg.sender === currentChat && msg.receiver === user.username)
      ) {
        setMessages(prev => [...prev, msg]);
      }
    };

    socketRef.current.on("receiveMessage", handler);

    return () => {
      socketRef.current.off("receiveMessage", handler);
    };
  }, [user, currentChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim() || !currentChat) return;

    socketRef.current.emit("sendMessage", {
      sender: user.username,
      receiver: currentChat,
      text: message,
    });

    setMessage("");
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      socketRef.current.emit("sendMessage", {
        sender: user.username,
        receiver: currentChat,
        file: reader.result,
        type: file.type.startsWith("image") ? "image" : "video",
      });
    };

    reader.readAsDataURL(file);
    setShowMenu(false);
  };

  const sendEmoji = (emoji) => {
    socketRef.current.emit("sendMessage", {
      sender: user.username,
      receiver: currentChat,
      text: emoji,
    });

    setShowEmoji(false);
  };

  return (
    <div className="flex h-screen bg-gray-100 text-black">

      <div className="w-1/3 bg-white border-r overflow-y-auto">
        <h2 className="p-3 font-bold border-b">Users</h2>

        {users.map((u, i) => (
          <div
            key={i}
            onClick={() => setCurrentChat(u.username)}
            className={`p-3 cursor-pointer ${
              currentChat === u.username ? "bg-blue-100" : "hover:bg-gray-100"
            }`}
          >
            {u.username}
          </div>
        ))}
      </div>

      <div className="w-2/3 flex flex-col">

        {currentChat ? (
          <>
            <div className="flex items-center gap-3 p-3 border-b bg-white">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                {currentChat?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm font-semibold">{currentChat}</h2>
                <p className="text-xs text-green-500">online</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === user.username
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-[70%] text-sm ${
                      msg.sender === user.username
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-white border rounded-bl-none"
                    }`}
                  >
                    {msg.text && <p>{msg.text}</p>}

                    {msg.type === "image" && (
                      <img src={msg.file} className="rounded-lg mt-1 max-h-40" />
                    )}

                    {msg.type === "video" && (
                      <video controls className="rounded-lg mt-1 max-h-40">
                        <source src={msg.file} />
                      </video>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 border-t bg-white flex items-center gap-2 relative">
              <button onClick={() => setShowMenu(!showMenu)} className="text-xl">
                <FaPlus />
              </button>

              {showMenu && (
                <div className="absolute bottom-14 left-2 bg-white border p-3 rounded-xl flex flex-col gap-2 shadow">
                  <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2">
                    <FaImage /> Photo
                  </button>
                  <button onClick={() => fileInputRef.current.click()} className="flex items-center gap-2">
                    <FaVideo /> Video
                  </button>
                  <button
                    onClick={() => {
                      setShowEmoji(!showEmoji);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2"
                  >
                    <FaSmile /> Emoji
                  </button>
                </div>
              )}

              {showEmoji && (
                <div className="absolute bottom-16 left-12 bg-white border p-3 rounded-xl grid grid-cols-5 gap-2 text-xl shadow">
                  {emojis.map((e, i) => (
                    <button key={i} onClick={() => sendEmoji(e)}>
                      {e}
                    </button>
                  ))}
                </div>
              )}

              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFile} />

              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-gray-200 px-4 py-2 rounded-full text-sm outline-none"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select user to start chat
          </div>
        )}

      </div>
    </div>
  );
};

export default Chat;