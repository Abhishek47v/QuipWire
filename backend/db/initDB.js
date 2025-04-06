import mongoose from "mongoose";
import Message from "../models/messageModel.js";
import Conversation from "../models/ConversationModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModels.js";
import dotenv from 'dotenv';
dotenv.config();


async function main() {
    try {
        const conn = await mongoose.connect("mongodb+srv://abhishekverma:abhishek67247612v@cluster0.ftk4z.mongodb.net/quipwires?retryWrites=true&w=majority&appName=Cluster0");
        console.log(`Connected to MongoDB: ${conn.connection.host}`);
        return conn;
    } catch (err) {
        console.log("Error connecting to DB: ", err.message);
        process.exit(1);
    }
}

const initDB = async () => {
    try {
        await Message.deleteMany({});
        await Conversation.deleteMany({});
        await Post.deleteMany({});
        await User.deleteMany({});
        console.log("Data Initialized");
    } catch (err) {
        console.error("Error during data initialization: ", err.message);
    }
}

main().then(() => {
    initDB();
});
