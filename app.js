/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const http = require('http');
const bodyParser = require('body-parser');
// const io = require('./src/helper/socket');
const { Server } = require('socket.io');
const models = require('./src/models/messagemodel');
const userrouter = require('./src/routers/userrouter');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(userrouter);

app.use(express.static(`${__dirname}/src/img`));

// membuat http server
const httpServer = http.createServer(app);
// membuat socketio
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});
io.on('connection', (socket) => {
  console.log('a client connected');
  // menerima request send-message
  socket.on('get-message', ({ sender, receiver }) => {
    models.getmsg(sender, receiver).then((result) => {
      io.to(sender).emit('history-messages', result);
    }).catch((err) => {
      console.log(err);
    });
  });
  socket.on('login', (room) => {
    console.log(`a user joined to room ${room}`);
    socket.join(room);
  });
  socket.on('send-message', (payload) => {
    const { sender, receiver, msg } = payload;
    models.insert(sender, receiver, msg).then(() => {
      io.to(receiver).emit('list-message', payload);
    }).catch((err) => {
      console.log(err);
    });
  });
  socket.on('disconnect', () => {
    console.log('a client disconnected');
  });
});
const PORT = 5000;
httpServer.listen(PORT, () => {
  console.log(`service running on port ${PORT}`);
});

module.exports = io;
