import React, { useState } from "react";
import "./Login.css";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) {
      validateEmail(e.target.value);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) {
      validatePassword(e.target.value);
    }
  };

  const validateEmail = (value) => {
    const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!value.match(pattern)) {
      setEmailError(value ? "Enter a valid email address" : "Email can't be blank");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const validatePassword = (value) => {
    const pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    if (!value.match(pattern)) {
      setPasswordError(
        value
          ? "Must contain 8 characters, at least one number, one uppercase letter and one lowercase letter"
          : "Password can't be blank"
      );
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (isEmailValid && isPasswordValid) {
      navigate("/User");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-wrapper">
          <h1>Task Manager</h1>
          <form onSubmit={handleSubmit}>
            <div className={`login-field email ${emailError ? "shake error" : ""}`}>
              <div className="input-area">
                <input
                  type="text"
                  placeholder="Email Address"
                  value={email}
                  onChange={handleEmailChange}
                />
                <i className="icon fas fa-envelope"></i>
                {emailError && <i className="error error-icon fas fa-exclamation-circle"></i>}
              </div>
              {emailError && <div className="error error-txt">{emailError}</div>}
            </div>
            <div className={`login-field password ${passwordError ? "shake error" : ""}`}>
              <div className="input-area">
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <i className="icon fas fa-lock"></i>
                {passwordError && <i className="error error-icon fas fa-exclamation-circle"></i>}
              </div>
              {passwordError && <div className="error error-txt">{passwordError}</div>}
            </div>
            <div className="pass-txt"><Link to ="/">  Forgot password?</Link> </div>
            <input type="submit" value="Login" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
