import { useEffect } from "react";
import { useState } from "react";

function App() {
  const [currMessage, setCurrMessage] = useState("");
  const [chatRoom, setChatRoom] = useState("general");
  const [changeChatRoom, setChangeChatRoom] = useState("");
  const [wsConn, setWsConn] = useState(null);
  const [messages, setMessage] = useState([]);

  // runs on every mount
  useEffect(() => {
    if (window["WebSocket"]) {
      console.log("supports websockets");

      try {
        const conn = new WebSocket("ws://localhost:4000/ws");
        conn.onmessage = (ws) => {
          console.log("message recieved: ", ws.data);
          setMessage((prev) => {
            return [...prev, ws.data];
          });
        };
        setWsConn(conn);
      } catch (e) {
        console.log(e);
      }
    } else {
      alert("Not supporting websockets");
    }
  }, []);

  function handleChangeChatRoom() {
    alert(`changing chat room to ${changeChatRoom}`);
    setChatRoom(changeChatRoom);
    setChangeChatRoom("");
  }

  function handleSendChat() {
    if (!wsConn) {
      alert("error websocket not connected");
      return;
    }

    wsConn.send(currMessage);

    setCurrMessage("");
  }

  return (
    <>
      <div
        style={{
          paddingTop: "2rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "2rem",
        }}
      >
        <h1> Chat app </h1>
        <h3>Currently in chat: {chatRoom}</h3>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <p>Change Chat room:</p>
          <input
            type="text"
            style={{ padding: "0.4rem 1rem" }}
            value={changeChatRoom}
            onChange={(e) => {
              setChangeChatRoom(e.target.value);
            }}
          />
          <button
            style={{ padding: "0.4rem 1rem" }}
            onClick={handleChangeChatRoom}
          >
            Change
          </button>
        </div>
      </div>

      <div style={{ padding: "0 2rem" }}>
        <div>
          {messages.map((msg) => {
            return <div key={msg}>{msg}</div>;
          })}
        </div>
      </div>

      <div
        style={{
          width: "100%",
          position: "absolute",
          bottom: "3rem",
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          style={{
            width: "600px",
            height: "2rem",
            background: "silver",
            border: "1px solid",
            outline: "0px",
            padding: "1rem",
            fontSize: "1rem",
          }}
          value={currMessage}
          onChange={(e) => {
            setCurrMessage(e.target.value);
          }}
        />
        <button
          style={{
            width: "4rem",
            height: "2rem",
          }}
          onClick={handleSendChat}
        >
          Send
        </button>
      </div>
    </>
  );
}

export default App;
