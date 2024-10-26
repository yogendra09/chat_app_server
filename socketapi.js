const socket = require("socket.io");
const userModel = require("./models/userModel");
const chatModel = require("./models/chatModel");
const groupModel = require("./models/groupModel");
const createSocketServer = (server) => {
  const io = socket(server, {
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

      await userModel.findOneAndUpdate(
        { username: data.user },
        {
          socketId: socket.id,
        }
      );

      const activeUsers = await userModel.find({
        socketId: { $nin: ["", socket.id] },
      });

      const allGroups = await groupModel.find({
        users: {
          $in: [currentUser._id],
        },
      });
      allGroups.forEach((group) => {
        socket.emit("group-joined", group);
      });
      
      console.log(allGroups);
      
      // console.log(activeUsers)
      socket.emit("activeUsers", {activeUsers,allGroups});
    });

    socket.on("sendPrivateMessage", async (message) => {
      const receiverUser = await userModel.findOne({
        username: message.receiver,
      });

      if (!receiverUser.chats.includes(message.sender)) {
        receiverUser?.chats?.push(message.sender);
        currentUser?.chats?.push(message.receiver);
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
      const isUser = await userModel.findOne({
        username: conversationDetails.receiver /* insta */,
      });

      if (isUser) {
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
      } else {
        const allMessages = await messageModel.find({
          receiver: conversationDetails.receiver /* insta */,
        });

        socket.emit("send-conversation", allMessages);
      }
    });


    socket.on('create-new-group', async (groupDetails) => {
      const currentUser = await userModel.findOne({
        username: groupDetails.sender
    })
      const newGroup = await groupModel.create({
          name: groupDetails.groupName
      })

     await newGroup.users.push(currentUser._id);
      await newGroup.save()

      socket.emit("group-created", newGroup)

  })

  socket.on("join-group", async joiningDetails => {
      const group = await groupModel.findOne({
          name: joiningDetails.groupName
      })

      const currentUser = await userModel.findOne({
          username: joiningDetails.sender
      })

      group.users.push(currentUser._id)

      await group.save()

      socket.emit('group-joined', {
          profileImage: group.profileImage,
          name: group.name
      })

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

module.exports = { createSocketServer };
