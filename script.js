// CONNECT TO SERVER
const socket = io("wss://overflowing-mindfulness-production.up.railway.app", {
    transports: ["websocket"]
});

let roomCode = "";
let username = "User" + Math.floor(Math.random() * 1000);

// DOM ELEMENTS
const roomScreen = document.getElementById("room-screen");
const appContainer = document.getElementById("app-container");
const input = document.getElementById("input");
const messagesDiv = document.getElementById("messages");
const usersList = document.getElementById("users");
const enterBtn = document.getElementById("enter-btn");

// ENTER ROOM
enterBtn.onclick = () => {
    roomCode = document.getElementById("room-code").value.trim();
    let mode = document.querySelector("input[name='mode']:checked").value;

    if (!roomCode) {
        alert("Room code cannot be empty");
        return;
    }

    if (mode === "create") {
        socket.emit("create_room", roomCode);
    } else {
        socket.emit("join_room", roomCode);
    }

    roomScreen.classList.add("hidden");
    appContainer.classList.remove("hidden");
};

// RECEIVE CHAT MESSAGE
socket.on("chat_message", (data) => {
    let div = document.createElement("div");
    div.textContent = `${data.user}: ${data.message}`;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// SEND MESSAGE
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
