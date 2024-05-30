import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import { createOnPost, createPost, deletePost, getAllPosts, getFollowingPosts, getUserPosts, getlikesOnPost, likeUnlikePost } from '../controllers/posts.controller.js';

const router = express.Router();

router.get('/all',protectRoute,getAllPosts);
router.get('/following',protectRoute,getFollowingPosts);
router.get('/likes/:id',protectRoute,getlikesOnPost);
router.get('/user/:username',protectRoute,getUserPosts);
router.post('/create',protectRoute,createPost);
router.post('/like/:id',protectRoute,likeUnlikePost);
router.post('/comment/:id',protectRoute,createOnPost);
router.delete('/:id',protectRoute,deletePost);


export default router