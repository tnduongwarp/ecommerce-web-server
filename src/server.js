import express from 'express';
import bodyParser from 'body-parser';
import connect from '../config/connectDB.js';
import cors from 'cors';
import dotenv from 'dotenv';
import route from './route/index.js';
import { Server } from 'socket.io';
import http from 'http';
import { messageService } from './utils/message.js';
import { bidService } from './utils/bid.js';
import cron from 'node-cron'
dotenv.config();
connect();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:4200','http://localhost:4001'],
      methods: ['GET', 'POST'],
    },
  });
io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);
  socket.on('fetch-message', (data) => {
      const {owner, receiver} = data;
      messageService.getMessages(owner, receiver)
      .then((res) => socket.emit('messages', JSON.stringify(res)))
      .catch((err) => console.log(err));
  })

  socket.on('send_message', (data) => {
      const { message, owner, receiver } = data;
      // Send to all users in room, including sender
      messageService.saveMessage(message, owner, receiver) // Save message in db
      .then((response) => {
        io.emit('receive_message', response);
      })
      .catch((err) => console.log(err));
  });

  socket.on('update_bid', async (data) => {
    let {from, to} = data
    const bids = await bidService.getAllBidCreated(from, to);
    io.emit('new_bid', bids)
  })
  socket.on('disconnect', () => {
    socket.disconnect(true);
    console.log(socket.id)
  })
});

route(app);
cron.schedule('0 0 * * 1',async () => {
    await bidService.refreshBid()
});
server.listen(3000, ()=> {
    console.log("server is listening on port 3000")
})