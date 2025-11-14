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

  const messageQueue = useRef([]);

  const pushMessage = (msg) => setMessages((m) => [...m, msg]);

  const connect = () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const ws = new WebSocket(`${WS_URL}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      // flush queue
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
            // payload.user { id, username }
            console.log("WS connected:", payload);
            break;

          case "online_users":
            // server sends payload: { users: [ {id, username}, ... ] }
            if (payload && Array.isArray(payload.users)) {
              // normalize users to { id, username }
              const normalized = payload.users.map((u) => ({ id: u.id, username: u.username }));
              setOnlineUsers(normalized);
            }
            break;

          case "private_message": {
            // payload should already be normalized by server
            const p = payload;
            // ensure it has from, toUserId, content, createdAt
            const normalized = {
              messageId: p.messageId,
              from: p.from,
              fromUsername: p.fromUsername,
              toUserId: p.toUserId,
              toUsername: p.toUsername,
              content: p.content,
              createdAt: p.createdAt,
            };
            pushMessage(normalized);
            break;
          }

          case "room_message": {
            const p = payload;
            const normalized = {
              messageId: p.messageId,
              from: p.from,
              fromUsername: p.fromUsername,
              roomId: p.roomId,
              content: p.content,
              createdAt: p.createdAt,
            };
            pushMessage(normalized);
            break;
          }

          case "history_private":
            if (payload && Array.isArray(payload.messages)) {
              // replace messages with history between two users
              setMessages(payload.messages.map((m) => ({
                messageId: m.messageId,
                from: m.from,
                fromUsername: m.fromUsername,
                toUserId: m.toUserId,
                content: m.content,
                createdAt: m.createdAt,
              })));
            }
            break;

          case "history_room":
            if (payload && Array.isArray(payload.messages)) {
              setMessages(payload.messages.map((m) => ({
                messageId: m.messageId,
                from: m.from,
                fromUsername: m.fromUsername,
                roomId: m.roomId,
                content: m.content,
                createdAt: m.createdAt,
              })));
            }
            break;

          case "room_notification": {
            const p = payload;
            pushMessage({
              messageId: p.messageId || `notif_${Date.now()}`,
              system: true,
              content: p.message || p.message,
              roomId: p.roomId,
              createdAt: p.createdAt || new Date(),
            });
            break;
          }

          default:
            console.log("WS message:", data);
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // try to reconnect after small delay
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = (obj) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
    else messageQueue.current.push(obj);
  };

  const sendPrivateMessage = ({ toUserId, content }) => {
    send({ type: "private_message", payload: { toUserId, content } });
  };

  const joinRoom = ({ roomId }) => send({ type: "join_room", payload: { roomId } });
  const leaveRoom = ({ roomId }) => send({ type: "leave_room", payload: { roomId } });
  const sendRoomMessage = ({ roomId, content }) => send({ type: "room_message", payload: { roomId, content } });
  const fetchHistory = ({ mode, withUserId, roomId, limit }) =>
    send({ type: "fetch_history", payload: { mode, withUserId, roomId, limit } });

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        onlineUsers,
        messages,
        sendPrivateMessage,
        joinRoom,
        leaveRoom,
        sendRoomMessage,
        fetchHistory,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
