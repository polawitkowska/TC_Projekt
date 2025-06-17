import React from "react";
import "./styles/styles.css";
import Account from "./components/account";
import LoginForm from "./components/login";

const getCurrentUser = () => localStorage.getItem("currentUserId");

const getTokenFromCookie = () => {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "token") {
      return value;
    }
  }
  return null;
};

async function fetchCosmetics() {
  try {
    const token = getTokenFromCookie();
    const current_user = getCurrentUser();

    if (!token) {
      console.log("No token found");
      return [];
    }

    if (!current_user) {
      console.log("No current user found");
      return [];
    }

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

    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } else {
      console.error("Failed to fetch cosmetics:", response.status);
      return [];
    }
  } catch (error) {
    console.error("Error fetching cosmetics:", error);
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
