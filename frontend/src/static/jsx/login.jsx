// logika logowania się
async function login(email, password) {
  try {
    const response = await fetch("http://127.0.0.1:5000/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (response.ok) {
      document.cookie = `${data.access_token}`;
      localStorage.setItem("currentUserId", data.id);
      localStorage.setItem("currentEmail", data.email);
      localStorage.setItem("currentUsername", data.user);

      return true;
    }
    return false;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
}

//logika zakładania konta
async function signup(email, username, password) {
  try {
    const response = await fetch("http://127.0.0.1:5000/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });
    const data = await response.json();
    if (response.ok) {
      //   localStorage.setItem("token", data.access_token);
      //   localStorage.setItem("currentUserId", data.id);
      console.log(data);
      return true;
    }
    return false;
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

  async function handleLogIn(e) {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      onLoginSuccess();
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    const success = await signup(newEmail, newUsername, newPassword);
    if (success) {
      console.log("New account successfully created! You can now log in");
    }
  }

  return (
    <div className="loginPage">
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
