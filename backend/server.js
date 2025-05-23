import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./db/connectDB.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import {v2 as cloudinary} from "cloudinary";
import {app, server} from "./socket/socket.js";

const PORT = process.env.PORT || 5000;

dotenv.config();
connectDB();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MiddleWares
app.use(express.json({limit:"30mb"})); //parse incoming JSON from req object
app.use(express.urlencoded({extended:true})); // Parse form data in req.body
app.use(cookieParser()); //Enable and access cookies

// Routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});