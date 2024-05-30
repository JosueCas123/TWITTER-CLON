import e from "express";
import Notification from "../model/notification.models.js";


export const getAllNotifications = async (req, res) => {
    try {
          const userId = req.user._id;
          const notification = await Notification.find({to: userId}).populate({
            path: 'from',
            select:"usernane profileImg"
          }) 

          await Notification.updateMany({to: userId}, {read: true})

          res.status(200).json(notification)
    } catch (error) {
        res.status(500).json({error: "Server error in getting notifications"})
        console.log("error in getAllNotifications",error.message)
    }
}

export const deleteNotification = async (req, res) => { 
    try {
        const userId = req.user._id;
        await Notification.deleteMany({to: userId})
        res.status(200).json({message: "All notifications deleted"})
    } catch (error) {
        res.status(500).json({error: "Server error in deleting notifications"})
        console.log("error in deleteNotification",error.message)
    }
}

export const deleteOneNotification = async (req, res) => {
    try {
        const {id} = req.params;
        const notification = await Notification.findById(id);
        if(!notification) return res.status(404).json({error: "Notification not found"})
        
        if(notification.to.toString() !== req.user._id.toString()) return res.status(401).json({error: "You can't delete this notification"})

        await Notification.findByIdAndDelete(id)
        res.status(200).json({message: "Notification deleted"})
    } catch (error) {
        res.status(500).json({error: "Server error in deleting notification"})
        console.log("error in deleteOneNotification",error.message)
    }
}