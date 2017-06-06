const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const users = [];
const connections = [];

server.listen(process.env.PORT || 3000, () => console.log('SERVER ONLINE'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

// all the events go through this function
io.sockets.on('connection', (socket) => {
  connections.push(socket);
  console.log('connected: % sockets connected', connections.length);
  
  // disconnect handler
  socket.on('disconnect', (data) => {

    // remove user from chat when disconnected
    users.splice(users.indexOf(socket.username), 1);
    updateUsernames();

    // number of users handler
    connections.splice(connections.indexOf(socket), 1);
    console.log('Disconnected: % sockets connected', connections.length);
  });

  // send message handler
  socket.on('send message', (data) => {
    console.log(data);
    io.sockets.emit('new message', {msg: data, user: socket.username});
  });

  // new user handler
  socket.on('new user', (data, callback) => {
    callback(true);
    socket.username = data;
    users.push(socket.username);
    updateUsernames();
  });

  function updateUsernames() {
    io.sockets.emit('get users', users);
  }
}); 