import Conversation from "../models/ConversationModel.js";
import Message from "../models/messageModel.js";
import { getRecipientSocketId, io } from "../socket/socket.js";
import {v2 as cloudinary} from "cloudinary";
import cron from "node-cron";

async function sendMessage(req, res) {
    try {
        const { recipientId, message, date, time, isScheduled } = req.body;
        let { img } = req.body;
        const senderId = req.user._id;
        let formattedDate;

        if (isScheduled) {
            if (!date || !time) {
                return res.status(400).json({ error: "Date and time are required for scheduled messages." });
            }
            const dateParts = date.split("-");
            if (dateParts.length !== 3 || !/^\d{4}$/.test(dateParts[0]) || !/^\d{2}$/.test(dateParts[1]) || !/^\d{2}$/.test(dateParts[2])) {
                return res.status(400).json({ error: "Invalid date format. Please use yyyy-mm-dd." });
            }
            if (!/^\d{2}:\d{2}(:\d{2})?$/.test(time)) {
                return res.status(400).json({ error: "Invalid time format. Please use HH:mm or HH:mm:ss." });
            }
            const [year, month, day] = dateParts;
            formattedDate = `${year}-${month}-${day}`;
        }
        

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, recipientId] },
        });

        if (!conversation) {
            conversation = new Conversation({
                participants: [senderId, recipientId],
                lastMessage: {
                    text: message,
                    sender: senderId,
                },
            });
            await conversation.save();
        }

        if (img) {
            const uploadedResponse = await cloudinary.uploader.upload(img);
            img = uploadedResponse.secure_url;
        }

        const newMessage = new Message({
            conversationId: conversation._id,
            sender: senderId,
            text: message,
            img: img || "",
            isScheduled,
            date,
            time,
        });

        await Promise.all([
            newMessage.save(),
            conversation.updateOne({
                lastMessage: {
                    text: message,
                    sender: senderId,
                },
            }),
        ]);

        if (isScheduled) {
            const scheduledTime = new Date(`${formattedDate}T${time}`);
            const currentTime = new Date(); 

            if (scheduledTime <= currentTime) {
                const recipientSocketId = getRecipientSocketId(recipientId);
                if (recipientSocketId) {
                    io.to(recipientSocketId).emit("newMessage", newMessage);
                }
                newMessage.isScheduled = false;
                await newMessage.save();
            } else {
                cron.schedule('* * * * *', async () => {
                    const updatedCurrentTime = new Date();
                    const newScheduledTime = new Date(`${formattedDate}T${time}`);
        
                    if (newScheduledTime <= updatedCurrentTime && newMessage.isScheduled) {
                        const recipientSocketId = getRecipientSocketId(recipientId);
                        if (recipientSocketId) {
                            io.to(recipientSocketId).emit("newMessage", newMessage);
                        }
                        newMessage.isScheduled = false;
                        await newMessage.save(); 
                    }
                });
            }
        } else {
            const recipientSocketId = getRecipientSocketId(recipientId);
            if (recipientSocketId) {
                io.to(recipientSocketId).emit("newMessage", newMessage);
            }
        }
        

        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

async function getMessages(req, res) {
    const {otherUserId} = req.params;
    const userId = req.user._id;
    try{
        const conversation = await Conversation.findOne({
            participants : {$all : [userId, otherUserId]},
        });

        if(!conversation){
            return res.status(404).json({error:"Conversation not found"});
        }

        const messages = await Message.find({
            conversationId : conversation._id,
        }).sort({createdAt : 1});

        res.status(200).json(messages);
    } catch(err){
        res.status(500).json({error:err.message});
    }
}

async function getConversations(req, res){
    const userId = req.user._id;
    try{    
        const conversations = await Conversation.find({participants : userId }).populate({
            path : "participants",
            select  : "username profilePic",
        });
        conversations.forEach((conversation) => {
            conversation.participants = conversation.participants.filter(
                (participant) => participant._id.toString() !== userId.toString()
            );
        });
        res.status(200).json(conversations);
    } catch(err){
        res.status(500).json({error:err.message});
    }
}

export { sendMessage, getMessages, getConversations };