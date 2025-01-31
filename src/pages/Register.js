import { useRef, useState } from "react";
import "./register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Register() {
  const username = useRef();
  const email = useRef();
  const password = useRef();
  const passwordAgain = useRef();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const validatePassword = () => {
    if (password.current && passwordAgain.current) {
      if (passwordAgain.current.value !== password.current.value) {
        passwordAgain.current.setCustomValidity("Passwords don't match!");
      } else {
        passwordAgain.current.setCustomValidity("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors

    if (passwordAgain.current.value !== password.current.value) {
      setError("Passwords don't match!");
      return;
    }

    const user = {
      username: username.current.value,
      email: email.current.value,
      password: password.current.value,
    };

    try {
      await axios.post("http://localhost:5000/api/users/register", user);
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data) {
        // If the server sends a string message
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        }
        // If the server sends an object with a message property
        else if (err.response.data.message) {
          setError(err.response.data.message);
        }
        // Fallback error message
        else {
          setError("Registration failed. Please try again.");
        }
      } else if (err.request) {
        setError("Network error. Please try again.");
      } else {
        setError("An error occurred. Please try again.");
      }
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="register">
      <div className="registerWrapper">
        <div className="registerLeft">
          <h3 className="registerLogo">Social Media</h3>
          <span className="registerDesc">
            Connect with friends and the world around you.
          </span>
        </div>
        <div className="registerRight">
          <form className="registerBox" onSubmit={handleSubmit}>
            {error && <div className="registerError">{error}</div>}
            <input
              placeholder="Username"
              required
              ref={username}
              className="registerInput"
              minLength="3"
            />
            <input
              placeholder="Email"
              required
              ref={email}
              className="registerInput"
              type="email"
            />
            <input
              placeholder="Password"
              required
              ref={password}
              className="registerInput"
              type="password"
              minLength="6"
              onChange={validatePassword}
            />
            <input
              placeholder="Password Again"
              required
              ref={passwordAgain}
              className="registerInput"
              type="password"
              onChange={validatePassword}
            />
            <button className="registerButton" type="submit">
              Sign Up
            </button>
            <Link to="/login" className="loginRegisterButton">
              Log into Account
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
