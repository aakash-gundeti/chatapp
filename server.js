import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";

import userRoutes from "./routes/user.routes.js";
import { userModel } from "./models/user.model.js";
import { chatModel } from "./models/chat.model.js";
import { connectToDatabase } from "./db.config.js";
import { ObjectId } from "mongodb";

const app = express();
const server = http.createServer(app);

app.use("/", userRoutes);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const usp = io.of("/user-namespace");

usp.on("connection", async function (socket) {
  console.log("User Connected");
  const userId = socket.handshake.auth.token;
  await userModel.findByIdAndUpdate({ _id: userId }, { $set: { status: "1" } });

  //broadcast message
  socket.broadcast.emit("getOnlineUser", { user_id: userId });

  socket.on("disconnect", async () => {
    console.log("User disconnected");

    const userId = socket.handshake.auth.token;
    await userModel.findByIdAndUpdate(
      { _id: userId },
      { $set: { status: "0" } },
    );

    socket.broadcast.emit("getOfflineUser", { user_id: userId });
  });

  //sending message
  socket.on("send-message", async function (data) {
    const receiver = await userModel.findById({_id: data.senderId});
    socket.broadcast.emit("loadNewChat", {data:data, receiver:receiver});
  });

  socket.on("getChats", async function(data){
    const chats = await chatModel.aggregate([
      {
        $match: {
          $or: [
            {senderId: new ObjectId(data.senderId), receiverId: new ObjectId(data.receiverId)},
            {senderId: new ObjectId(data.receiverId), receiverId: new ObjectId(data.senderId)},
          ]
        }
      },
      {
        $lookup: {
          from: 'users', // Ensure this matches the name of your users collection
          localField: 'senderId',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'receiverId',
          foreignField: '_id',
          as: 'receiver'
        }
      },
      {
        $unwind: '$sender'
      },
      {
        $unwind: '$receiver'
      },
      {
        $project: {
          _id: 1,
          message: 1,
          createdAt: 1,
          updatedAt: 1,
          sender: {
            _id: '$sender._id',
            name: '$sender.name'
          },
          receiver: {
            _id: '$receiver._id',
            name: '$receiver.name'
          }
        }
      }
    ]);
    
    socket.emit("loadChats", { chats: chats });

  })

  socket.on('typing', () => {
    socket.broadcast.emit('typingIndicator', { userId });
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('stopTypingIndicator', { userId });
  });
});

server.listen(3000, () => {
  console.log("Server is running");
  connectToDatabase();
});
