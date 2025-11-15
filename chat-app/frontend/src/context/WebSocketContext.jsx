  // frontend/src/context/WebSocketContext.jsx
  import React, { createContext, useContext, useEffect, useRef, useState } from "react";

  const WS_URL = "ws://localhost:4500/ws";

  const WebSocketContext = createContext();

  export function useWebSocket() {
    return useContext(WebSocketContext);
  }

  export function WebSocketProvider({ children }) {
    const wsRef = useRef(null);
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [typingUsers, setTypingUsers] = useState({}); // { userId: true/false }

    const messageQueue = useRef([]);

    const pushMessage = (msg) => setMessages((m) => [...m, msg]);
    const updateMessage = (messageId, updates) => {
      setMessages((m) => m.map((msg) => (msg.messageId === messageId ? { ...msg, ...updates } : msg)));
    };
    const deleteMessage = (messageId) => {
      setMessages((m) => m.filter((msg) => msg.messageId !== messageId));
    };

    const connect = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        messageQueue.current.forEach((msg) => {
          if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
        });
        messageQueue.current = [];
      };

      ws.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          const { type, payload = {} } = data;

          switch (type) {
            case "connected":
              console.log("WS connected:", payload);
              break;

            case "online_users":
              if (payload && Array.isArray(payload.users)) {
                setOnlineUsers(
                  payload.users.map((u) => ({ id: u.id, username: u.username }))
                );
              }
              break;

            case "private_message":
            case "room_message":
              pushMessage(payload);
              break;

            case "history_private":
            case "history_room":
              if (payload && Array.isArray(payload.messages)) {
                setMessages(payload.messages.map((m) => ({ ...m })));
              }
              break;

            case "message_edited":
              updateMessage(payload.messageId, {
                content: payload.newContent,
                edited: payload.edited,
              });
              break;

            case "message_deleted":
              deleteMessage(payload.messageId);
              break;

            case "message_status":
              // payload: { messageId, status }
              updateMessage(payload.messageId, { status: payload.status });
              break;

            case "typing":
              setTypingUsers((prev) => ({
                ...prev,
                [payload.from]: payload.isTyping,
              }));
              setTimeout(
                () =>
                  setTypingUsers((prev) => ({ ...prev, [payload.from]: false })),
                3000
              );
              break;

            default:
              console.log("WS message:", data);
          }
        } catch (err) {
          console.error("WS parse error", err);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        setTimeout(connect, 2000);
      };

      ws.onerror = (err) => {
        console.error("WS error:", err);
        try { ws.close(); } catch {}
      };
    };

    useEffect(() => {
      connect();
      return () => wsRef.current?.close();
    }, []);

    const send = (obj) => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
      else messageQueue.current.push(obj);
    };

    // Messaging functions
const sendPrivateMessage = ({ toUserId, content, image = null }) =>
  send({ type: "private_message", payload: { toUserId, content, image } });
    const joinRoom = ({ roomId }) => send({ type: "join_room", payload: { roomId } });
    const leaveRoom = ({ roomId }) => send({ type: "leave_room", payload: { roomId } });
    const sendRoomMessage = ({ roomId, content }) => send({ type: "room_message", payload: { roomId, content } });
    const fetchHistory = ({ mode, withUserId, roomId, limit }) => send({ type: "fetch_history", payload: { mode, withUserId, roomId, limit } });
    const setMessageRead = ({ messageId }) => send({ type: "read_message", payload: { messageId } });

    // New functions: edit/delete/typing
    const editMessage = ({ messageId, newContent }) => send({ type: "edit_message", payload: { messageId, newContent } });
    const deleteMsg = ({ messageId }) => send({ type: "delete_message", payload: { messageId } });
    const sendTyping = ({ toUserId, roomId, isTyping }) => send({ type: "typing", payload: { toUserId, roomId, isTyping } });

    return (
      <WebSocketContext.Provider
        value={{
          connected,
          onlineUsers,
          messages,
          typingUsers,
          sendPrivateMessage,
          joinRoom,
          leaveRoom,
          sendRoomMessage,
          fetchHistory,
          editMessage,
          deleteMsg,
          sendTyping,
          setMessageRead
        }}
      >
        {children}
      </WebSocketContext.Provider>
    );
  }
