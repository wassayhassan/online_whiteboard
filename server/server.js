const http = require('http');
const express = require('express');
const cors = require('cors');
const socketio = require('socket.io');
const {v4: createRoomID} = require('uuid');

const port = process.env.PORT || 4000;

const app = express();

app.use(cors());

app.get('/',(req,res) => {
    res.send('server is working');
});

const server = http.createServer(app);

const io = socketio(server);

const users = [{}];
let sessions = [];


//sockets
io.on('connection', (socket)=>{
  console.log('new connection');

  socket.on('create-room',({userId}) => {
    const roomId = createRoomID();
    socket.join(roomId);
    users[userId] = {name: 'Admin', roomId}
    let session = {
      id: roomId,
      canvasesRaw: []
    };
    sessions.push(session);
    io.to(userId).emit('create-room',{roomId});
  });


  socket.on('join-room',({roomId, userId, name}) => {
    console.log(sessions);
    console.log(roomId, userId, name)
    users[userId] = {name,roomId};
    socket.join(roomId);
    let session = sessions.find((sess)=> sess.id == roomId);
    if(session.canvasesRaw.length>0){
      io.to(userId).emit('recive-element', session);
    }
    socket.broadcast.to(roomId).emit('new-user',{name, userId});
  });

  socket.on('send-element',(data) => {
    let session = sessions.find((sess)=> sess.id == data.roomId);
    session.canvasesRaw = data.canvasesRaw;
    sessions.map((ses)=> {
      if(ses.id === session.id){
        return session;
      }else{
        return ses;
      }
    })
    socket.broadcast.to(data.roomId).emit('recive-element',session);
  });

  socket.on('mirror',({roomId, width, height, zoom, scrollTop, scrollLeft, zoomPoint}) => {
    socket.broadcast.to(roomId).emit('mirror',{width, height, zoom, scrollTop, scrollLeft, zoomPoint});
  });
  //getting user mouse coord
  socket.on('user-coord', (data)=> {
      socket.broadcast.to(data.roomId).emit('user-coord', data);
  })

  socket.on('disconnect',() => {
    // console.log('disconnect', users[socket.id]);
    const user = users[socket.id];
    if(user){
      socket.broadcast.to(user.roomId).emit('leave',{name: user.name});
    }
    delete users[socket.id];
  });

});

server.listen(port,() => {
    console.log(`server is working on ${port}`);
});
