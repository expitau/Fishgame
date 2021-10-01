// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAqXrynY5nXOd_cdJ2b5-R43QsoEmMxSAk",
//   authDomain: "expitau-websockettest.firebaseapp.com",
//   projectId: "expitau-websockettest",
//   storageBucket: "expitau-websockettest.appspot.com",
//   messagingSenderId: "728917982416",
//   appId: "1:728917982416:web:10e874fd32c787be49f2d5",
//   measurementId: "G-2JFD33XS8Y"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

const io = require("socket.io")(3000, {
    cors: {
        origin: "*",
    }
})

gameState = {
    players: {}
}

io.on("connection", (socket) => {
    console.log(socket.id + " connected")
    gameState.players[socket.id] = { x: 0, y: 0 }
    socket.on('post', (state) => {
        gameState.players[socket.id] = state;
    })
    socket.on('get', () => {
        socket.emit('return', gameState)
    })
    socket.on('disconnect', () => {
        delete gameState.players[socket.id]
        console.log(socket.id + " disconnected")
    })
})