
import Notification from "../model/notification.models.js";
import User from "../model/user.models.js";
import bcrypt from 'bcryptjs'; 
import {v2 as cloudinary} from 'cloudinary'; 

export const getUserProfile = async (req, res) => {
    const {username} = req.params

    try {
        const user = await User.findOne({username}).select('-password');
        if(!user){
            res.status(404).json("User not found")
        }

        res.status(200).json(user)
    } catch (error) {
        res.status(500).json({message: error.message})
        console.log("error in profile",error.message)
    }
}

export const followUnfollowUser = async (req, res) => {

    try {
        
        const {id} = req.params
       
        const userToModify = await User.findById(id)
        const currentUser =  await User.findById(req.user._id)
    
        if(id === req.user._id){
            return res.status(400).json("You can't follow yourself")
        }

        if(!userToModify || !currentUser){
            return res.status(404).json("User not found")
        }

        const isFollowing = currentUser.following.includes(id)

        if(isFollowing){
            // unfollow
            await User.findByIdAndUpdate(id,{$pull:{followers:req.user._id}}) 
            await User.findByIdAndUpdate(req.user._id, {$pull:{following:id}})
            res.status(200).json("Unfollowed")
        }else{
            // follow
            await User.findByIdAndUpdate(id, {$push:{followers:req.user._id}})
            await User.findByIdAndUpdate(req.user._id, { $push:{following:id}})

            const newNotification = new Notification({
                from: req.user._id,
                to: id,
                type: 'follow'
            })
            await newNotification.save()
            //todo return the id of the notification
            res.status(200).json("User Followed successfully")
        }

    } catch (error) {
        res.status(500).json({message: error.message})
        console.log("error in followUnFollwUser",error.message)
    }

}


export const getSuggestedUsers = async(req,res) => {
    try {
        const userId = req.user._id
        const userFollowing = await User.findById(userId).select('following');

        const users = await User.aggregate([
            {$match:{_id:{$ne:userId}}},
            {$sample:{size:10}}
        ])

        const filteredUsers = users.filter(user => !userFollowing.following.includes(user._id))
        const suggestedUsers = filteredUsers.slice(0,4)

        suggestedUsers.forEach(user => {
            user.password = null
        })

        res.status(200).json(suggestedUsers)
    } catch (error) {
        console.log("error in getSuggestedUsers",error.message)
        res.status(500).json({message: error.message})
    }
}


export const updateUser = async (req, res) => {
    const {username,fullName,email, currentPassword, newPassword, bio, link} = req.body
    let {profileImage, coverImage} = req.body;

    const userId = req.user._id

    try {
        let user = await User.findById(userId)
        if(!user){
            return res.status(404).json("User not found")
        }

        if(!newPassword && currentPassword || newPassword && !currentPassword){
            return res.status(400).json("Please enter new password")
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch) return res.status(400).json("currentPassword Invalid password")
            if(newPassword.length < 6) return res.status(400).json("Password must be at least 6 characters")

            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword, salt)
        }

        if(profileImage){
            if(user.profileImage){
                await cloudinary.uploader.destroy(user.profileImage.split("/").pop().split(".")[0]);
            }
          const uploadedResponse = await cloudinary.uploader.upload(profileImage)
          profileImage = uploadedResponse.secure_url
        }

        if(coverImage){
            if (user.coverImage) {
				await cloudinary.uploader.destroy(user.coverImage.split("/").pop().split(".")[0]);
			}

            const uploadedResponse = await cloudinary.uploader.upload(coverImage)
            coverImage = uploadedResponse.secure_url
        }

        user.username = username || user.username
        user.fullName = fullName || user.fullName
        user.email = email || user.email
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImage = profileImage || user.profileImage
        user.coverImage = coverImage || user.coverImage

        user = await user.save()
        user.password = null
        res.status(200).json(user)

    } catch (error) {
        console.log("error in updateUser",error.message)
        res.status(500).json({message: error.message})
    }
}