// frontend/src/pages/Chat.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWebSocket } from "../context/WebSocketContext";
import api from "../api/axios";

export default function Chat() {
  const { state } = useAuth();
  const {
    connected,
    onlineUsers,
    messages,
    sendPrivateMessage,
    joinRoom,
    leaveRoom,
    sendRoomMessage,
    fetchHistory,
  } = useWebSocket();

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState("general");
  const [text, setText] = useState("");
  const [allUsers, setAllUsers] = useState([]);

  const myId = state?.user?.id;

  // Fetch all users (exclude current)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get("/users");
        const users = Array.isArray(res.data) ? res.data : res.data.users || [];
        setAllUsers(users.filter((u) => String(u.id || u._id) !== String(myId)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchUsers();
  }, [myId]);

  // When selecting a user or room fetch history
  useEffect(() => {
    if (selectedUser) fetchHistory({ mode: "private", withUserId: selectedUser.id || selectedUser._id, limit: 50 });
    else fetchHistory({ mode: "room", roomId: selectedRoom, limit: 50 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, selectedRoom]);

  // Build a merged user list (online first, then others)
  const mergedUsers = useMemo(() => {
    const map = new Map();
    onlineUsers.forEach((u) => map.set(String(u.id), { id: u.id, username: u.username, online: true }));
    allUsers.forEach((u) => {
      const id = String(u.id || u._id);
      if (!map.has(id)) map.set(id, { id, username: u.username || u.name || u._id, online: false });
    });
    // ensure current user excluded
    map.delete(String(myId));
    return Array.from(map.values());
  }, [onlineUsers, allUsers, myId]);

  // Filter messages to show in current view
  const myMessages = useMemo(() => {
    return messages.filter((m) => {
      // system / room notifications
      if (m.system && !selectedUser) return m.roomId === selectedRoom;
      // room messages when no user selected
      if (!selectedUser && m.roomId) return m.roomId === selectedRoom;

      // private chat: check both possible field names (toUserId or toUser)
      if (selectedUser) {
        const toId = m.toUserId ?? m.toUser ?? m.to ?? null;
        const fromId = m.from ?? m.fromId ?? m.sender ?? null;
        return (
          (String(fromId) === String(myId) && String(toId) === String(selectedUser.id)) ||
          (String(fromId) === String(selectedUser.id) && String(toId) === String(myId))
        );
      }
      return false;
    });
  }, [messages, selectedUser, selectedRoom, myId]);

  const handleSend = () => {
    if (!text) return;
    if (selectedUser) {
      sendPrivateMessage({ toUserId: selectedUser.id, content: text });
    } else {
      sendRoomMessage({ roomId: selectedRoom, content: text });
    }
    setText("");
  };

  const getUsername = (msg) => {
    if (msg.system) return "System";
    // find username from online or all users
    const id = msg.from ?? msg.fromId;
    const userFromOnline = onlineUsers.find((u) => String(u.id) === String(id));
    if (userFromOnline) return userFromOnline.username;
    const userFromAll = allUsers.find((u) => String(u.id || u._id) === String(id));
    if (userFromAll) return userFromAll.username || userFromAll.name;
    return msg.fromUsername || "Unknown";
  };

  return (
    <div className="p-4 flex h-screen">
      <div className="w-64 border-r p-2">
        <div className="mb-4">Status: {connected ? "Connected" : "Disconnected"}</div>

        <div className="mb-2 font-semibold">Users</div>
        <ul>
          {mergedUsers.length ? (
            mergedUsers.map((u) => (
              <li key={u.id}>
                <button
                  className={`w-full text-left p-1 ${selectedUser?.id === u.id ? "bg-gray-200" : ""}`}
                  onClick={() => setSelectedUser(u)}
                >
                  {u.username} {u.online ? "(online)" : ""}
                </button>
              </li>
            ))
          ) : (
            <li>No users</li>
          )}
        </ul>

        <div className="mt-4">
          <div className="font-semibold">Rooms</div>
          <ul>
            <li>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setSelectedRoom("general");
                }}
                className={`p-1 ${!selectedUser && selectedRoom === "general" ? "bg-gray-200" : ""}`}
              >
                general
              </button>
            </li>
          </ul>
          <button onClick={() => joinRoom({ roomId: selectedRoom })} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded">
            Join Room
          </button>
          <button
            onClick={() => leaveRoom({ roomId: selectedRoom })}
            className="mt-2 ml-2 bg-red-500 text-white px-3 py-1 rounded"
          >
            Leave Room
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="font-bold">{selectedUser ? `Chat with ${selectedUser.username}` : `Room: ${selectedRoom}`}</div>
          <div>My ID: {myId}</div>
        </div>

        <div className="flex-1 border rounded p-2 overflow-auto">
          {myMessages.map((m, idx) => (
            <div key={m.messageId ?? idx} className={`mb-2 ${String(m.from) === String(myId) ? "text-right" : "text-left"}`}>
              <div
                className="inline-block p-2 rounded"
                style={{
                  background: String(m.from) === String(myId) ? "#dcf8c6" : m.system ? "#f0f0f0" : "#fff",
                }}
              >
                <div className="text-sm font-semibold">{getUsername(m)}</div>
                <div>{m.content}</div>
                {!m.system && <div className="text-xs text-gray-400">{new Date(m.createdAt).toLocaleString()}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 border p-2 rounded"
            placeholder="Type a message..."
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2 rounded">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
