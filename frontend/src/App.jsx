import React from "react";
import "./styles/styles.css";
import Account from "./components/account";
import LoginForm from "./components/login";

const getCurrentUser = () => localStorage.getItem("currentUserId");

async function fetchCosmetics() {
  try {
    const token = document.cookie;
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
