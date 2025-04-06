import User from "../models/userModels.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/helpers/generateTokenAndSetCookie.js";
import {v2 as cloudinary} from "cloudinary";
import mongoose from "mongoose";
import Post from "../models/postModel.js";

const getUserProfile = async (req, res) => {
    const {query} = req.params;
    try{
        let user;
        if(mongoose.Types.ObjectId.isValid(query)){
            user = await User.findOne({_id:query}).select("-password").select("-updatedAt");
        } else {
            user = await User.findOne({username:query}).select("-password").select("-updatedAt");
        }
        if(!user){
            return res.status(404).json({error : "User not found"});
        }
        res.status(200).json(user);
    } catch(err){
        res.status(500).json({error:err.message});
        console.log("Error in getUserProfile : ", err.message);
    }
};

const signupUser = async (req, res)=>{
    try{
        const {name, email, username, password} = req.body;
        const user = await User.findOne({$or : [{email}, {username}]});
        if(user){
            return res.status(400).json({error:"User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            name: name,
            email:email,
            username:username,
            password:hashedPassword
        });
        await newUser.save();
        if(newUser){
            generateTokenAndSetCookie(newUser._id, res);

            res.status(201).json({
                _id:newUser._id,
                name:newUser.name,
                email : newUser.email,
                username:newUser.username,
                bio:newUser.bio,
                profilePic:newUser.profilePic,
            });
        } else {
            res.status(400).json({error: "Invalid User data"});
        }
    } catch(err){
        res.status(500).json({error:err.message});
        console.log("Error in SignUpUser : ", err.message);
    }
}

const loginUser = async (req, res) => {
    try{
        const {username, password} = req.body;
        const user = await User.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
        if(!user || !isPasswordCorrect){
            return res.status(400).json({error : "Invalid Username or Password"});
        }

        generateTokenAndSetCookie(user._id, res);
        res.status(200).json({
            _id:user._id,
            name:user.name,
            username:user.username,
            email:user.email,
            bio:user.bio,
            profilePic:user.profilePic,
        });
    } catch(err){
        res.status(500).json({error:err.message});
        console.log("Error in loginUser : ", err.message);
    }
};

const logoutUser = async (req, res) => {
    try{    
        res.cookie("jwt", "", {maxAge:1}); // maxAge becomes 1 means cookie time runs out and hence logged out...
        res.status(200).json({message:"Logged Out Successfully"});
    } catch(err){
        res.status(500).json({error:err.message});
        console.log("Error in logoutUser : ", err.message);
    }
};

const followUser = async(req, res) => {
    try{
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currUser = await User.findById(req.user._id);
        if(id === req.user._id.toString()){
            return res.status(400).json({error : "You can't follow/unfollow yourself"});
        }
        if(!userToModify || !currUser){
            return res.status(400).json({error:"User not found"});
        }
        const isFollowing = currUser.following.includes(id);
        if(isFollowing){
            // unfollow
            await User.findByIdAndUpdate(req.user._id, {$pull : {following : id}});
            await User.findByIdAndUpdate(id, {$pull : {followers : req.user._id}});
            res.status(200).json({message:"Unfollowed Successfully"});
        } else {
            // follow
            await User.findByIdAndUpdate(req.user._id, {$push : {following : id}});
            await User.findByIdAndUpdate(id, {$push : {followers : req.user._id}});
            res.status(200).json({message:"Followed Successfully"});
        }
    }catch(err){
        res.status(500).json({error:err.message});
        console.log("Error in followUser : ", err.message);
    }
};
 
const updateUser = async(req, res) => {
    const {name, email, username, password, bio} = req.body;
    let {profilePic} = req.body;

    const userId = req.user._id;
    try{
        let user = await User.findById(userId);
        if(!user){
            res.status(400).json({error : "User not found"});
        }

        if(req.params.id !== userId.toString()){
            return res.status(400).json({error:"Cannot update other User's Profile"});
        }

        if(password){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            user.password = hashedPassword;
        }

        if(profilePic){
            if(user.profilePic){
                await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
            }
            const uploadedResponse = await cloudinary.uploader.upload(profilePic);
            profilePic = uploadedResponse.secure_url;
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.username = username || user.username;
        user.profilePic = profilePic || user.profilePic;
        user.bio = bio || user.bio;

        user = await user.save();

        await Post.updateMany(
            {"replies.userId":userId},
            {
                $set:{
                    "replies.$[reply].username": user.username,
                    "replies.$[reply].userProfilePic" : user.profilePic,
                }
            },
            {arrayFilters: [{"reply.userId" : userId}]}
        )

        user.password=null;
        res.status(200).json(user);
    } catch(err){
        res.status(500).json({error:err.message});
        console.log("Error in updateUser : ", err.message);
    }
};

const getSuggestedUsers = async(req, res) => {
    try{
        const userId = req.user._id;
        const userFollowedByYou = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match : {
                    _id : {$ne : userId},
                }
            },
            {
                $sample : {size:10}
            }
        ])

        const filteredUsers = users.filter((user) => !userFollowedByYou.following.includes(user._id));
        const suggestedUsers = filteredUsers.slice(0, 5);

        suggestedUsers.forEach((user) => user.password = null);
        res.status(200).json(suggestedUsers);
    }catch(err){ 
        res.status(500).json({error : err.message});
    }
};  

export {signupUser, loginUser, logoutUser, followUser, updateUser, getUserProfile, getSuggestedUsers};