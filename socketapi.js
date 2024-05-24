const socket = require("socket.io");
const userModel = require("./models/userModel");
const chatModel = require("./models/chatModel");

const createSocketServer = (server) => {
  const io =  socket(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    console.log("A user connected!");
    let currentUser;
    socket.on("server_joined", async (data) => {
      currentUser = await userModel.findOne({ username: data.user });

      console.log(data);
      await userModel.findOneAndUpdate(
        { username: data.user },
        {
          socketId: socket.id,
        }
      );

      const activeUsers = await userModel.find({
        // socketId: { $nin: ["", socket.id] },
        username: { $nin: data.user },
      });

      // console.log(activeUsers)
      socket.emit("activeUsers", activeUsers);
    });

    socket.on("sendPrivateMessage", async (message) => {
      const receiverUser = await userModel.findOne({
        username: message.receiver,
      });

      if (!receiverUser.chats.includes(message.sender)) {
        receiverUser.chats.push(message.sender);
        currentUser.chats.push(message.receiver);
        await currentUser.save();
        await receiverUser.save();
      }

      const newMessage = await chatModel({
        sender: message.sender,
        receiver: message.receiver,
        message: message.message,
      });

      await newMessage.save();

      socket.to(receiverUser.socketId).emit("receive_private_message", message);
    });

    socket.on("fetchMessages", async (data) => {
      console.log(data.receiver.username);
      const allMessages = await chatModel.find({
        $or: [
          {
            sender: data.sender.username,
            receiver: data.receiver.username,
          },
          {
            sender: data.receiver.username,
            receiver: data.sender.username,
          },
        ],
      });

      socket.emit("fetchPrivateMessages", allMessages);
    });

    socket.on("disconnect", async () => {
      console.log("A user disconnected!");
      await userModel.findOneAndUpdate(
        {
          socketId: socket.id,
        },
        {
          socketId: "",
        }
        
      );
    });
  });
};


module.exports = {createSocketServer}