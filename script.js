// Wait for DOM so elements exist
window.addEventListener("DOMContentLoaded", () => {
  const socket = io("https://overflowing-mindfulness-production.up.railway.app", {
    transports: ["websocket"]
  });

  let roomCode = "";
  let username = "";

  // DOM ELEMENTS
  const roomScreen = document.getElementById("room-screen");
  const appContainer = document.getElementById("app-container");
  const input = document.getElementById("input");
  const messagesDiv = document.getElementById("messages");
  const usersList = document.getElementById("users");
  const enterBtn = document.getElementById("enter-btn");

  // Ensure messages container is visible
  messagesDiv.style.display = "block";
  messagesDiv.style.visibility = "visible";

  // DEBUG LOGS
  socket.on("connect", () => console.log("socket connected", socket.id));
  socket.on("connect_error", (err) => console.error("connect_error", err));
  socket.on("error", (err) => console.error("socket error", err));
  socket.on("disconnect", (reason) => console.log("socket disconnected", reason));

  // ENTER ROOM
  enterBtn.addEventListener("click", () => {

    username = document.getElementById("username").value.trim();
    roomCode = document.getElementById("room-code").value.trim();

    if (!username) {
      alert("Please enter your name");
      return;
    }

    if (!roomCode) {
      alert("Room code cannot be empty");
      return;
    }

    let mode = document.querySelector("input[name='mode']:checked").value;

    if (mode === "create") {
      socket.emit("create_room", { room: roomCode, user: username });
    } else {
      socket.emit("join_room", { room: roomCode, user: username });
    }

    // Hide room box, show chat UI
    roomScreen.classList.add("hidden");
    appContainer.classList.remove("hidden");

    addSystemMessage(`[CONNECTED AS ${username} TO ROOM: ${roomCode}]`);
  });

  // RECEIVE CHAT MESSAGE
  socket.on("chat_message", (data) => {
    appendMessage(`${data.user}: ${data.message}`);
  });

  // SEND CHAT ON ENTER
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {

      let msg = input.value.trim();
      if (msg.length > 0) {
        socket.emit("chat_message", {
          room: roomCode,
          message: msg,
          user: username
        });
      }
      input.value = "";
    }
  });

  // UPDATE USERS LIST
  socket.on("users", (users) => {
    usersList.innerHTML = "";
    users.forEach(u => {
      let li = document.createElement("li");
      li.textContent = u;
      usersList.appendChild(li);
    });
  });

  // helpers
  function appendMessage(text) {
    const div = document.createElement("div");
    div.textContent = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function addSystemMessage(text) {
    const div = document.createElement("div");
    div.style.color = "#00ffaa";
    div.textContent = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
});
