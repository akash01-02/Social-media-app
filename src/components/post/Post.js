import "./post.css";
import { MoreVert, ThumbUp, Send, Delete } from "@material-ui/icons";
import { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { format } from "timeago.js";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function Post({ post, onDelete }) {
  const [like, setLike] = useState(post.likes.length);
  const [isLiked, setIsLiked] = useState(false);
  const [user, setUser] = useState({});
  const [showMenu, setShowMenu] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const { user: currentUser } = useContext(AuthContext);
  const menuRef = useRef();
  const commentInputRef = useRef();

  useEffect(() => {
    setIsLiked(post.likes.includes(currentUser._id));
  }, [currentUser._id, post.likes]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/${post.userId}`);
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
      }
    };
    fetchUser();
  }, [post.userId]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${post._id}`);
        setComments(res.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };
    if (showComments) {
      fetchComments();
    }
  }, [post._id, showComments]);

  const likeHandler = async () => {
    try {
      await axios.put(`http://localhost:5000/api/posts/${post._id}/like`, {
        userId: currentUser._id
      });
      setLike(isLiked ? like - 1 : like + 1);
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Error updating like:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/api/posts/${post._id}`, {
        data: { userId: currentUser._id }
      });

      if (response.status === 200) {
        onDelete(post._id);
        setShowMenu(false);
      }
    } catch (err) {
      console.error("Error deleting post:", err);
      if (err.response?.status === 403) {
        alert("You can only delete your own posts");
      } else {
        alert("Error deleting post. Please try again.");
      }
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await axios.post("http://localhost:5000/api/comments", {
        userId: currentUser._id,
        postId: post._id,
        text: newComment
      });

      setComments([...comments, { ...res.data, user: currentUser }]);
      setNewComment("");
      setShowComments(true);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`http://localhost:5000/api/comments/${commentId}`, {
        data: { userId: currentUser._id }
      });
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error("Error deleting comment:", err);
    }
  };

  return (
    <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <Link to={`/profile/${user.username}`}>
              <img
                className="postProfileImg"
                src={user.profilePicture 
                  ? `http://localhost:5000${user.profilePicture}`
                  : "/assets/person/noAvatar.png"}
                alt=""
              />
            </Link>
            <span className="postUsername">{user.username}</span>
            <span className="postDate">{format(post.createdAt)}</span>
          </div>
          <div className="postTopRight" ref={menuRef}>
            {post.userId === currentUser._id && (
              <div className="postMenu">
                <MoreVert onClick={() => setShowMenu(!showMenu)} className="postMenuIcon" />
                {showMenu && (
                  <div className="postMenuOptions">
                    <div className="postMenuOption" onClick={handleDelete}>
                      <Delete className="postMenuOptionIcon" />
                      <span>Delete</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="postCenter">
          <span className="postText">{post?.desc}</span>
          {post.img && (
            <img className="postImg" src={`http://localhost:5000${post.img}`} alt="" />
          )}
        </div>
        <div className="postBottom">
          <div className="postBottomLeft">
            <ThumbUp
              className={`likeIcon ${isLiked ? 'liked' : ''}`}
              onClick={likeHandler}
            />
            <span className="postLikeCounter">{like} likes</span>
          </div>
          <div className="postBottomRight">
            <span className="postCommentText" onClick={() => setShowComments(!showComments)}>
              {comments.length} comments
            </span>
          </div>
        </div>
        
        {showComments && (
          <div className="commentsSection">
            <form className="commentForm" onSubmit={handleCommentSubmit}>
              <input
                ref={commentInputRef}
                className="commentInput"
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="commentSubmitButton">
                <Send />
              </button>
            </form>
            
            <div className="commentsList">
              {comments.map((comment) => (
                <div key={comment._id} className="commentItem">
                  <Link to={`/profile/${comment.user?.username}`}>
                    <img
                      className="commentProfileImg"
                      src={comment.user?.profilePicture 
                        ? `http://localhost:5000${comment.user.profilePicture}`
                        : "/assets/person/noAvatar.png"}
                      alt=""
                    />
                  </Link>
                  <div className="commentContent">
                    <div className="commentHeader">
                      <span className="commentUsername">{comment.user?.username}</span>
                      <span className="commentDate">{format(comment.createdAt)}</span>
                    </div>
                    <p className="commentText">{comment.text}</p>
                    {comment.userId === currentUser._id && (
                      <span 
                        className="commentDelete"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        Delete
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
