import { useContext, useRef, useState } from "react";
import "./login.css";
import { loginCall } from "../apiCalls";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { CircularProgress } from "@material-ui/core";

export default function Login() {
  const email = useRef();
  const password = useRef();
  const { isFetching, dispatch } = useContext(AuthContext);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
    
    try {
      await loginCall(
        { email: email.current.value, password: password.current.value },
        dispatch
      );
    } catch (err) {
      console.error("Login error:", err);
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
          setError("Login failed. Please check your credentials and try again.");
        }
      } else if (err.request) {
        setError("Network error. Please try again.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="login">
      <div className="loginWrapper">
        <div className="loginLeft">
          <h3 className="loginLogo">Connekt</h3>
          <span className="loginDesc">
            Connect with friends and the world around you.
          </span>
        </div>
        <div className="loginRight">
          <form className="loginBox" onSubmit={handleSubmit}>
            {error && <div className="loginError">{error}</div>}
            <input
              placeholder="Email"
              type="email"
              required
              className="loginInput"
              ref={email}
            />
            <input
              placeholder="Password"
              type="password"
              required
              minLength="6"
              className="loginInput"
              ref={password}
            />
            <button className="loginButton" type="submit" disabled={isFetching}>
              {isFetching ? (
                <CircularProgress color="inherit" size="20px" />
              ) : (
                "Log In"
              )}
            </button>
            <Link to="/register" style={{ textAlign: "center", textDecoration: "none" }}>
              <button className="loginRegisterButton" type="button">
                Create a New Account
              </button>
            </Link>
          </form>
        </div>
      </div>
    </div>
  );
}
