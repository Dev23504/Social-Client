import { useState, useEffect, useRef } from "react";
import { FaImage } from "react-icons/fa";
import { io } from "socket.io-client";

const Chat = ({ user, selectedUser }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);

  const socketRef = useRef(null);
  const fileInputRef = useRef(null);

  const API = "https://social-server-hhnd.onrender.com";

  useEffect(() => {
    if (!user) return;

    if (!socketRef.current) {
      socketRef.current = io(API, {
        transports: ["websocket"],
      });

      socketRef.current.on("connect", () => {
        console.log("socket connected");
      });
    }

    socketRef.current.emit("join", user.username);

    return () => {
      socketRef.current.disconnect();
    };
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
  };

  return (
    <div className="flex h-screen bg-gray-100">

      <div className="w-1/3 bg-white border-r">
        {users.map((u, i) => (
          <div
            key={i}
            onClick={() => setCurrentChat(u.username)}
            className="p-3 cursor-pointer hover:bg-gray-100"
          >
            {u.username}
          </div>
        ))}
      </div>

      <div className="w-2/3 flex flex-col">

        {currentChat ? (
          <>
            <div className="p-3 border-b bg-white font-bold">
              {currentChat}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.sender === user.username
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="px-3 py-2 rounded bg-blue-500 text-white max-w-[70%]">

                    {msg.text && <p>{msg.text}</p>}

                    {msg.type === "image" && (
                      <img src={msg.file} className="max-h-40 rounded" />
                    )}

                    {msg.type === "video" && (
                      <video controls className="max-h-40">
                        <source src={msg.file} />
                      </video>
                    )}

                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 flex gap-2 border-t bg-white">

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFile}
              />

              <button onClick={() => fileInputRef.current.click()}>
                <FaImage />
              </button>

              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 bg-gray-200 px-3 py-2 rounded"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-4 rounded"
              >
                Send
              </button>

            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            Select user
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;