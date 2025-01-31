import "./rightbar.css";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { Add, Remove, Edit, Check, Close } from "@material-ui/icons";

export default function Rightbar({ user: initialUser }) {
  const [friends, setFriends] = useState([]);
  const { user: currentUser, dispatch } = useContext(AuthContext);
  const [followed, setFollowed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(initialUser);
  const [editedInfo, setEditedInfo] = useState({
    city: initialUser?.city || "",
    from: initialUser?.from || "",
    relationship: initialUser?.relationship || 0
  });

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setFollowed(currentUser.following.includes(initialUser?._id));
      setEditedInfo({
        city: initialUser.city || "",
        from: initialUser.from || "",
        relationship: initialUser.relationship || 0
      });
    }
  }, [currentUser, initialUser]);

  useEffect(() => {
    const getFriends = async () => {
      try {
        if (user) {
          const friendList = await axios.get(`http://localhost:5000/api/users/friends/${user._id}`);
          setFriends(friendList.data);
        }
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };
    getFriends();
  }, [user]);

  const handleFollow = async () => {
    try {
      if (followed) {
        await axios.put(`http://localhost:5000/api/users/${user._id}/unfollow`, {
          userId: currentUser._id,
        });
        dispatch({ type: "UNFOLLOW", payload: user._id });
      } else {
        await axios.put(`http://localhost:5000/api/users/${user._id}/follow`, {
          userId: currentUser._id,
        });
        dispatch({ type: "FOLLOW", payload: user._id });
      }
      setFollowed(!followed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedInfo({
        city: user.city || "",
        from: user.from || "",
        relationship: user.relationship || 0
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Convert relationship to number since select value is string
      const updateData = {
        ...editedInfo,
        userId: currentUser._id,
        relationship: parseInt(editedInfo.relationship)
      };

      const res = await axios.put(`http://localhost:5000/api/users/${user._id}`, updateData);
      
      // Update the user state with the response data
      const updatedUser = res.data;
      setUser(prev => ({
        ...prev,
        city: updatedUser.city,
        from: updatedUser.from,
        relationship: updatedUser.relationship
      }));
      
      // Update AuthContext if it's the current user
      if (currentUser._id === user._id) {
        dispatch({
          type: "UPDATE_USER",
          payload: {
            city: updatedUser.city,
            from: updatedUser.from,
            relationship: updatedUser.relationship
          }
        });
      }
      
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating user info:", err);
    }
  };

  const HomeRightbar = () => {
    return (
      <>
        <div className="birthdayContainer">
          <img className="birthdayImg" src="/assets/gift.png" alt="" />
          <span className="birthdayText">
            <b>Sarah Connor</b> and <b>3 other friends</b> have a birthday today.
          </span>
        </div>
        <img className="rightbarAd" src="/assets/ad.png" alt="" />
        <h4 className="rightbarTitle">Online Friends</h4>
        <ul className="rightbarFriendList">
          {/* Add online friends here */}
        </ul>
      </>
    );
  };

  const ProfileRightbar = () => {
    const isCurrentUser = user.username === currentUser.username;

    return (
      <>
        {!isCurrentUser && (
          <button className="rightbarFollowButton" onClick={handleFollow}>
            {followed ? "Unfollow" : "Follow"}
            {followed ? <Remove /> : <Add />}
          </button>
        )}
        <div className="rightbarInfoHeader">
          <h4 className="rightbarTitle">User information</h4>
          {isCurrentUser && (
            <button 
              className="editButton" 
              onClick={handleEditToggle}
            >
              {isEditing ? <Close /> : <Edit />}
            </button>
          )}
        </div>
        <div className="rightbarInfo">
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">City:</span>
            {isEditing ? (
              <input
                type="text"
                name="city"
                value={editedInfo.city}
                onChange={handleInputChange}
                className="infoInput"
                placeholder="Enter your city"
              />
            ) : (
              <span className="rightbarInfoValue">{user.city || "-"}</span>
            )}
          </div>
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">From:</span>
            {isEditing ? (
              <input
                type="text"
                name="from"
                value={editedInfo.from}
                onChange={handleInputChange}
                className="infoInput"
                placeholder="Enter your country"
              />
            ) : (
              <span className="rightbarInfoValue">{user.from || "-"}</span>
            )}
          </div>
          <div className="rightbarInfoItem">
            <span className="rightbarInfoKey">Relationship:</span>
            {isEditing ? (
              <select
                name="relationship"
                value={editedInfo.relationship}
                onChange={handleInputChange}
                className="infoInput"
              >
                <option value="0">-</option>
                <option value="1">Single</option>
                <option value="2">Married</option>
                <option value="3">In a relationship</option>
              </select>
            ) : (
              <span className="rightbarInfoValue">
                {user.relationship === 1
                  ? "Single"
                  : user.relationship === 2
                  ? "Married"
                  : user.relationship === 3
                  ? "In a relationship"
                  : "-"}
              </span>
            )}
          </div>
          {isEditing && (
            <button className="saveButton" onClick={handleSave}>
              <Check /> Save
            </button>
          )}
        </div>
        <h4 className="rightbarTitle">User friends</h4>
        <div className="rightbarFollowings">
          {friends.map((friend) => (
            <Link
              to={"/profile/" + friend.username}
              style={{ textDecoration: "none" }}
              key={friend._id}
            >
              <div className="rightbarFollowing">
                <img
                  src={friend.profilePicture 
                    ? `http://localhost:5000${friend.profilePicture}`
                    : "/assets/person/noAvatar.png"}
                  alt=""
                  className="rightbarFollowingImg"
                />
                <span className="rightbarFollowingName">{friend.username}</span>
              </div>
            </Link>
          ))}
        </div>
      </>
    );
  };

  return (
    <div className="rightbar">
      <div className="rightbarWrapper">
        {user ? <ProfileRightbar /> : <HomeRightbar />}
      </div>
    </div>
  );
}
