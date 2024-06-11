import e from "express";
import User from "../model/user.models.js";
import {v2 as cloudinary} from 'cloudinary';    
import Post from "../model/post.model.js";
import Notification from "../model/notification.models.js";

export const createPost = async (req, res) => {
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString();

        const user = await User.findById(userId)
        if(!user) return res.status(404).json("User not found")
        if(!text && !img) return res.status(400).json("Post can't be empty")

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url
        }

        const newPost = new Post({
            ...Post,
            user: userId,
            text,
            img
        })

        await newPost.save()
        res.status(201).json(newPost)
    } catch (error) {
        res.status(500).json({error: "Server error in creating post"})
        console.log("error in createPost",error.message)

    }
}



export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)

        if(!post) return res.status(404).json("Post not found")

        if(post.user.toString() !== req.user._id.toString()) return res.status(401).json("You not authorized to delete this post")
        
        if(post.img){
            const imgiD = post.img.split('/').pop().slice(".")[0]
            await cloudinary.uploader.destroy(imgiD)
        }

        await Post.findByIdAndDelete(req.params.id)
        res.status(200).json("Post deleted")
    } catch (error) {
        res.status(500).json({error: "Server error in deleting post"})
        console.log("error in deletePost",error.message)
    }
}

export const createOnPost = async (req, res) => {
   try {
    const {text} = req.body;
    const userId = req.user._id;
    const postId = req.params.id;

    if(!text) return res.status(400).json("Text field is required")

    const post = await Post.findById(postId)
    if(!post) return res.status(404).json("Post not found")

    const newComment = {
        ...post,
        text,
        user: userId,
    }

    post.comments.push(newComment)
    await post.save()

    res.status(201).json(post)

   } catch (error) {
         res.status(500).json({error: "Server error in creating comment"})
         console.log("error in createOnPost",error.message)
   }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id;
        const {id: postId} = req.params;

        const post = await Post.findById(postId)
        if(!post) return res.status(404).json("Post not found")
        
        const userLiked = post.likes.includes(userId)

        if(userLiked){
           //unliked
           await Post.updateOne({_id: postId}, {$pull: {likes: userId}})

           await User.updateOne({_id: userId}, {$pull: {likedPosts: postId}})

           const updatedLikes = post.likes.filter((id) => id.toString() !== userId.toString())
           res.status(200).json(updatedLikes)
        }else{
            //liked
            post.likes.push(userId)
            await User.updateOne({_id: userId}, {$push: {likedPosts: postId}})
            await post.save()
            

            const notification = new Notification({
                from: userId,
                to: post.user,
                type: 'like',
                postId
            })

            await notification.save()
            const updatedLikes = post.likes
            res.status(200).json(updatedLikes)
        }
    } catch (error) {
        res.status(500).json({error: "Server error in liking post"})
        console.log("error in likeUnlikePost",error.message)
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({createdAt: -1}).populate({
            path: 'user',
            select: "-password"
        }).populate({
            path: 'comments.user',
            select: "-password"
       
        })

        if(posts.length === 0) return res.status(404).json([])
        res.status(200).json(posts)


    } catch (error) {
        res.status(500).json({error: "Server error in getting posts"})
        console.log("error in getAllPosts",error.message)    
    }
}


export const getlikesOnPost = async (req, res) => {
    
    const userId = req.params.id;


    try {
        const user = await User.findById(userId)
        if(!user) return res.status(404).json("User not found")
        const likedPosts = await Post.find({_id: {$in: user.likedPosts}}).populate({
            path: 'user',
            select: "-password"
        }).populate({
            path: 'comments.user',
            select: "-password"
        })

        res.status(200).json(likedPosts)
    } catch (error) {
        res.status(500).json({error: "Server error in getting liked posts"})
        console.log("error in getlikesOnPost",error.message)      
    }
}

export const getFollowingPosts = async (req, res) => {
    const userId = req.user._id;

    try {
        const user = await User.findById(userId)
        if(!user) return res.status(404).json("User not found")
            
        const following = user.following;
        const feedposts = await Post.find({user: {$in: following}}).sort({createdAt: -1}).populate({
            path: 'user',
            select: "-password"
        }).populate({
            path: 'comments.user',
            select: "-password"
        })

        res.status(200).json(feedposts)

    } catch (error) {
        res.status(500).json({error: "Server error in getting following posts"})
        console.log("error in getFollowingPosts",error.message)
    }
}

export const getUserPosts = async (req, res) => {
    const {username} = req.params;

    try {
        const user = await User.findOne({username})
        if(!user) return res.status(404).json("User not found")
        const posts = await Post.find({user: user._id}).sort({createdAt: -1}).populate({
            path: 'user',
            select: "-password"
        }).populate({
            path: 'comments.user',
            select: "-password"
        })
        res.status(200).json(posts)
    }catch (error) {
        res.status(500).json({error: "Server error in getting user posts"})
        console.log("error in getUserPosts",error.message)
    }
}   