import React from "react";

// logika logowania się
async function login(email, password) {
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/users/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    let data;
    try {
      data = await response.json();
    } catch (err) {
      console.error("Failed to parse JSON from response:", err);
      return false;
    }

    if (response.ok) {
      document.cookie = `${data.access_token}`;
      localStorage.setItem("currentUserId", data.id);
      localStorage.setItem("currentEmail", data.email);
      localStorage.setItem("currentUsername", data.user);

      return true;
    } else {
      console.error("Login failed, response:", data);
      return false;
    }
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

//logika zakładania konta
async function signup(email, username, password) {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Signup failed");
    }

    const data = await response.json();
    console.log("Server response:", data);
    return true;
  } catch (error) {
    console.error("Signup error:", error);
    return false;
  }
}

//strona logowania (tylko jeżeli użytkownik NIE jest zalogowany)
const LoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [newEmail, setNewEmail] = React.useState("");
  const [newUsername, setNewUsername] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [error, setError] = React.useState("");

  async function handleLogIn(e) {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      onLoginSuccess();
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setError("");
    const success = await signup(newEmail, newUsername, newPassword);
    if (success) {
      console.log("New account successfully created! You can now log in");
    } else {
      setError("Failed to create account. Please try again.");
    }
  }

  return (
    <div className="loginPage">
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleLogIn} className="logIn">
        <p className="p">Log in:</p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="input"
        />
        <button type="submit" className="button">
          Login
        </button>
      </form>
      <form onSubmit={handleSignUp} className="signUp">
        <p className="p">Or Sign Up:</p>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Email"
          className="input"
        />
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder="Username"
          className="input"
        />
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Password"
          className="input"
        />
        <button type="submit" className="button">
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
