import React from "react";
import "./styles/styles.css";
import Account from "./components/account";
import LoginForm from "./components/login";

const getCurrentUser = () => localStorage.getItem("currentUserId");

// Function to extract token from cookies
const getTokenFromCookie = () => {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'token') {
      return value;
    }
  }
  return null;
};

async function fetchCosmetics() {
  try {
    const token = getTokenFromCookie();
    const current_user = getCurrentUser();
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/users/${current_user}/saved_cosmetics`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    if (response.ok) {
      return data;
    }
  } catch (error) {
    console.log(error);
    return [];
  }
}

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [cosmetics, setCosmetics] = React.useState([]);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (isLoggedIn) {
      fetchCosmetics()
        .then((data) => setCosmetics(data))
        .catch((error) => setError(error.message));
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <LoginForm onLoginSuccess={() => setIsLoggedIn(true)} />;
  } else {
    return <Account cosmetics={cosmetics} error={error} />;
  }
};

export default App;
