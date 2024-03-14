import Comment from "../models/comment.model.js";
import { errorHandler } from "../utils/error.js";


// create a new comment
export const createComment = async (req, res, next) => {
    try {
        const { content, userId, postId } = req.body;

        if (userId !== req.user.id) {
            return next(errorHandler(403, 'You are not allowed to create a comment'))
        };

        const newComment = new Comment({
            content,
            userId,
            postId
        });
        await newComment.save();

        res.status(201).json(newComment);
    } catch (error) {
        next(error);
    };
};

// get tha all the comments
export const getPostComments = async (req, res, next) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId }).sort({
            createdAt: -1
        });

        res.status(200).json(comments);
    } catch (error) {
        next(error);
    };
};

// like count of an comment
export const likeComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return next(errorHandler(404, 'Comment not found'));
        };

        const userIndex = comment.likes.indexOf(req.user.id);
        if (userIndex === -1) {
            comment.numberOfLikes += 1;
            comment.likes.push(req.user.id);
        } else {
            comment.numberOfLikes -= 1;
            comment.likes.splice(userIndex, 1)
        };
        await comment.save();

        res.status(200).json(comment);
    } catch (error) {
        next(error);
    };
};

// edit any comment of Post
export const editComment = async (req, res, next) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if(!comment){
            return next(errorHandler(404, "Comment not found!"));
        };
        if(comment.userId !== req.user.id && !req.user.isAdmin){
            return next(errorHandler(403, "You are not allow to edit this comment"));
        };

        const editedComment = await Comment.findByIdAndUpdate(
            req.params.commentId,
            {
                content: req.body.content
            }, {new: true}
        );

        res.status(200).json(editComment);
    } catch (error) {
        next(error)
    };
 };