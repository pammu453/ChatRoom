import React, { useState, useEffect } from "react";
import socket from "./socket";
import axios from "axios";

const App = () => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [message, setMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [roomLink, setRoomLink] = useState("");

  const createRoom = async () => {
    if (username) {
      const response = await axios.get("http://localhost:5000/create-room");
      const roomId = response.data.roomId;
      setRoom(roomId);
      const generatedLink = `http://localhost:3000/join/${roomId}`;
      setRoomLink(generatedLink);
      joinRoom(roomId); // Automatically join the room after creating it
    }
  };

  const joinRoom = (roomId) => {
    if (username) {
      socket.emit("join_room", { room: roomId, username });
      setIsJoined(true);
    }
  };

  const sendMessage = async () => {
    if (message && isJoined) {
      const messageData = {
        room,
        author: username,
        message,
        time: new Date(Date.now()).toLocaleTimeString(),
      };
      await socket.emit("send_message", messageData);
      setMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });

    return () => socket.off("receive_message");
  }, []);

  return (
    <div className="App">
      {!isJoined ? (
        <div className="joinChatContainer">
          <h3>Create or Join a Chat</h3>
          <input
            type="text"
            placeholder="Name..."
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={createRoom}>Create Room</button>
          {roomLink && (
            <p>
              Share this link to join the room: <a href={roomLink}>{roomLink}</a>
            </p>
          )}
          <input
            type="text"
            placeholder="Enter Room ID to Join..."
            onChange={(e) => setRoom(e.target.value)}
          />
          <button onClick={() => joinRoom(room)}>Join Room</button>
        </div>
      ) : (
        <div className="chatContainer">
          <h3>Welcome to the Room: {room}</h3>
          {roomLink && (
            <div className="shareLink">
              <p>
                Share this link to invite others:{" "}
                <a href={roomLink} target="_blank" rel="noopener noreferrer">
                  {roomLink}
                </a>
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomLink);
                  alert("Room link copied to clipboard!");
                }}
              >
                Share Room Link
              </button>
            </div>
          )}
          <div className="messages">
            {messageList.map((msg, index) => (
              <div key={index} className="message">
                <p>
                  <strong>{msg.author}</strong>: {msg.message}
                </p>
                <span>{msg.time}</span>
              </div>
            ))}
          </div>
          <div className="messageInput">
            <input
              type="text"
              value={message}
              placeholder="Message..."
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
