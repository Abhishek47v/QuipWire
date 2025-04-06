import express from "express";
import {createPost, getPost, deletePost, likePost, replyPost, getFeedPosts, getUserPosts } from "../controller/postController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

router.get("/feed", protectRoute, getFeedPosts);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.put("/like/:id", protectRoute, likePost);
router.put("/reply/:id", protectRoute, replyPost);

export default router;