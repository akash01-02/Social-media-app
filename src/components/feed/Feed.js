import { useContext, useEffect, useState } from "react";
import Post from "../post/Post";
import Share from "../share/Share";
import "./feed.css";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";

export default function Feed({ username }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = username
        ? await axios.get(`http://localhost:5000/api/posts/profile/${username}`)
        : await axios.get(`http://localhost:5000/api/posts/timeline/${user._id}`);
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [username, user._id]);

  const handleNewPost = async (newPost) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
  };

  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
  };

  if (loading) {
    return (
      <div className="feedLoader">
        <div className="loadingSpinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="feed">
      <div className="feedWrapper">
        {(!username || username === user.username) && (
          <Share onPostSuccess={handleNewPost} />
        )}
        {posts.length === 0 ? (
          <div className="noPostsMessage">
            <p>No posts available.</p>
            {!username && <p>Be the first to share something!</p>}
          </div>
        ) : (
          posts.map((post) => (
            <Post 
              key={post._id} 
              post={post} 
              onDelete={handleDeletePost}
            />
          ))
        )}
      </div>
    </div>
  );
}
