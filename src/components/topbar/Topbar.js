import "./topbar.css";
import { Search, Person, Chat, Notifications, ExitToApp, Settings, AccountCircle } from "@material-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Topbar() {
  const { user, dispatch } = useContext(AuthContext);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const toggleDropdown = (e) => {
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="topbarContainer">
      <div className="topbarLeft">
        <Link to="/" style={{ textDecoration: "none" }}>
          <span className="logo">Connekt</span>
        </Link>
      </div>
      <div className="topbarCenter">
        <div className="searchbar">
          <Search className="searchIcon" />
          <input
            placeholder="Search for friend, post or video"
            className="searchInput"
          />
        </div>
      </div>
      <div className="topbarRight">
        <div className="topbarLinks">
          <Link to="/" className="topbarLink">Homepage</Link>
          <Link to={`/profile/${user?.username}`} className="topbarLink">Timeline</Link>
        </div>
        <div className="topbarIcons">
          <div className="topbarIconItem">
            <Person />
            <span className="topbarIconBadge">1</span>
          </div>
          <div className="topbarIconItem">
            <Chat />
            <span className="topbarIconBadge">2</span>
          </div>
          <div className="topbarIconItem">
            <Notifications />
            <span className="topbarIconBadge">1</span>
          </div>
        </div>
        <div className="profileSection" ref={dropdownRef}>
          <img
            src={user?.profilePicture 
              ? `http://localhost:5000${user.profilePicture}`
              : "/assets/person/noAvatar.png"}
            alt=""
            className="topbarImg"
            onClick={toggleDropdown}
          />
          {showDropdown && (
            <div className="profileDropdown">
              <Link to={`/profile/${user?.username}`} className="dropdownItem">
                <AccountCircle className="dropdownIcon" />
                <span>Profile</span>
              </Link>
              <Link to="/settings" className="dropdownItem">
                <Settings className="dropdownIcon" />
                <span>Settings</span>
              </Link>
              <div className="dropdownItem" onClick={handleLogout}>
                <ExitToApp className="dropdownIcon" />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
