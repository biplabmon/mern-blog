import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, deletepost, getposts, updatePost } from '../controllers/post.controllers.js';


const router = express.Router();

router.post('/create', verifyToken, create);   // create a new post
router.get('/getposts', getposts);
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, updatePost);

export default router;