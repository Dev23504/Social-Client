import { useState, useEffect, useRef } from "react";
import { FaImage, FaPlus, FaVideo } from "react-icons/fa";
import { io } from "socket.io-client";

const Chat = ({ user, selectedUser }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [showMenu, setShowMenu] = useState(false);

  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);

  const API = import.meta.env.VITE_BACKEND_URL || "https://social-server-hhnd.onrender.com";

  const emojis = ["😀","😂","😍","😎","😭","🔥","❤️","👍","🎉","😡"];

  useEffect(() => {
    if (!user) return;

    socketRef.current = io(API);
    socketRef.current.emit("join", user.username);

    return () => socketRef.current.disconnect();
  }, [user]);

  useEffect(() => {
    const allUsers = JSON.parse(localStorage.getItem("users")) || [];
    setUsers(allUsers.filter((u) => u.username !== user.username));
  }, [user]);

  useEffect(() => {
    if (!selectedUser) return;

    setCurrentChat(selectedUser);
    setMessages([]);

    fetch(`${API}/messages/${user.username}/${selectedUser}`)
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, [selectedUser]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !currentChat) return;

    const handler = (msg) => {
      if (
        (msg.sender === user.username && msg.receiver === currentChat) ||
        (msg.sender === currentChat && msg.receiver === user.username)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on("receiveMessage", handler);
    return () => socket.off("receiveMessage", handler);
  }, [currentChat, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
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

  const handleFile = (type) => {
    fileInputRef.current.accept = type === "image" ? "image/*" : "video/*";
    fileInputRef.current.click();
    setShowMenu(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file || !currentChat) return;

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
  };

  const getAvatar = (u) => {
    return u.profilePic || `https://ui-avatars.com/api/?name=${u.username}&background=random`;
  };

  return (
    <div className="flex h-screen">

      <div className="w-1/4 border-r bg-white">
        <div className="p-4 font-bold text-lg border-b flex items-center gap-3">
          <img
            src={getAvatar(user)}
            className="w-10 h-10 rounded-full object-cover"
          />
          {user.username}
        </div>

        {users.map((u, i) => (
          <div
            key={i}
            onClick={() => setCurrentChat(u.username)}
            className={`p-4 cursor-pointer flex items-center gap-3 ${
              currentChat === u.username ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <img
              src={getAvatar(u)}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span>{u.username}</span>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col bg-gray-50">

        {currentChat ? (
          <>
            <div className="p-4 border-b bg-white font-semibold flex items-center gap-3">
              <img
                src={getAvatar(users.find(u => u.username === currentChat) || {})}
                className="w-10 h-10 rounded-full object-cover"
              />
              {currentChat}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                    className={`px-4 py-2 rounded-2xl max-w-[60%] ${
                      msg.sender === user.username
                        ? "bg-blue-500 text-white"
                        : "bg-white border"
                    }`}
                  >
                    {msg.text && <p>{msg.text}</p>}

                    {msg.type === "image" && (
                      <img src={msg.file} className="rounded mt-2 max-h-52" />
                    )}

                    {msg.type === "video" && (
                      <video controls className="rounded mt-2 max-h-52">
                        <source src={msg.file} />
                      </video>
                    )}
                  </div>
                </div>
              ))}
              <div ref={scrollRef}></div>
            </div>

            <div className="p-3 border-t bg-white flex items-center gap-2 relative">

              <button
                onClick={() => setShowMenu(!showMenu)}
                className="text-xl p-2 rounded-full hover:bg-gray-200"
              >
                <FaPlus />
              </button>

              {showMenu && (
                <div className="absolute bottom-14 left-2 bg-white shadow-lg rounded-xl p-3 flex flex-col gap-3">

                  <div className="grid grid-cols-5 gap-2 text-xl">
                    {emojis.map((e, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setMessage((prev) => prev + e);
                          setShowMenu(false);
                        }}
                        className="hover:scale-125 transition"
                      >
                        {e}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4 justify-center pt-2 border-t">
                    <button onClick={() => handleFile("image")}><FaImage /></button>
                    <button onClick={() => handleFile("video")}><FaVideo /></button>
                  </div>

                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
              />

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message..."
                className="flex-1 px-4 py-2 border rounded-full bg-gray-100"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <button
                onClick={sendMessage}
                className="text-blue-500 font-semibold"
              >
                Send
              </button>

            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;