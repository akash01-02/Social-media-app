import { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./profile.css";
import Topbar from "../components/topbar/Topbar";
import Sidebar from "../components/sidebar/Sidebar";
import Feed from "../components/feed/Feed";
import Rightbar from "../components/rightbar/Rightbar";
import { AuthContext } from "../context/AuthContext";
import { Edit } from "@material-ui/icons";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { username } = useParams();
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const profilePictureInput = useRef();
  const coverPictureInput = useRef();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`http://localhost:5000/api/users?username=${username}`);
        setUser(res.data);
      } catch (err) {
        console.error("Error fetching user:", err);
        setError(err.response?.data || "Error loading user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username]);

  const handleImageUpload = async (file, type) => {
    if (!file) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      // Upload image
      const uploadRes = await axios.post("http://localhost:5000/api/upload", formData);
      const imagePath = uploadRes.data.path;

      // Update user profile
      const updateData = type === "profile" 
        ? { profilePicture: imagePath }
        : { coverPicture: imagePath };

      await axios.put(`http://localhost:5000/api/users/${user._id}`, {
        userId: currentUser._id,
        ...updateData
      });

      // Update local state
      setUser(prev => ({
        ...prev,
        ...(type === "profile" 
          ? { profilePicture: imagePath }
          : { coverPicture: imagePath })
      }));

      // Update AuthContext if it's the current user's profile
      if (currentUser._id === user._id && type === "profile") {
        dispatch({
          type: "UPDATE_USER",
          payload: { profilePicture: imagePath }
        });
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to update image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="profile">Loading...</div>;
  }

  if (error) {
    return <div className="profile">Error: {error}</div>;
  }

  if (!user) {
    return <div className="profile">User not found</div>;
  }

  const isCurrentUser = currentUser?._id === user._id;

  return (
    <>
      <Topbar />
      <div className="profile">
        <Sidebar />
        <div className="profileRight">
          <div className="profileRightTop">
            <div className="profileCover">
              <div className="coverImageContainer">
                <img
                  className="profileCoverImg"
                  src={user.coverPicture 
                    ? `http://localhost:5000${user.coverPicture}` 
                    : "/assets/person/noCover.png"}
                  alt=""
                />
                {isCurrentUser && (
                  <div className="imageEditOverlay" onClick={() => coverPictureInput.current.click()}>
                    <Edit />
                    <input
                      type="file"
                      ref={coverPictureInput}
                      className="imageInput"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], "cover")}
                    />
                  </div>
                )}
              </div>
              <div className="profileImageContainer">
                <img
                  className="profileUserImg"
                  src={user.profilePicture 
                    ? `http://localhost:5000${user.profilePicture}` 
                    : "/assets/person/noAvatar.png"}
                  alt=""
                />
                {isCurrentUser && (
                  <div className="imageEditOverlay" onClick={() => profilePictureInput.current.click()}>
                    <Edit />
                    <input
                      type="file"
                      ref={profilePictureInput}
                      className="imageInput"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], "profile")}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="profileInfo">
              <h4 className="profileInfoName">{user.username}</h4>
              <span className="profileInfoDesc">{user.desc}</span>
            </div>
          </div>
          <div className="profileRightBottom">
            <Feed username={username} />
            <Rightbar user={user} />
          </div>
        </div>
      </div>
      {uploading && (
        <div className="uploadingOverlay">
          <div className="uploadingMessage">Uploading image...</div>
        </div>
      )}
    </>
  );
}
