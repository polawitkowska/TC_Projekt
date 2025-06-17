import React from "react";
import "./styles/styles.css";
import Account from "./components/account";
import keycloak from "./keycloak";

const fetchUserInfo = async () => {
  try {
    const token = getKeycloakToken();
    if (!token) {
      console.log("No Keycloak token found");
      return null;
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const userData = await response.json();
      localStorage.setItem("currentUserId", userData.id);
      localStorage.setItem("currentEmail", userData.email);
      localStorage.setItem("currentUsername", userData.username);
      return userData;
    } else {
      console.error("Failed to fetch user info:", response.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
};

const getCurrentUser = () => localStorage.getItem("currentUserId");
const getKeycloakToken = () => {
  return keycloak.token || null;
};

async function fetchCosmetics() {
  try {
    const token = getKeycloakToken();
    const current_user = getCurrentUser();

    if (!token) {
      console.log("No Keycloak token found");
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
  const [keycloakInitialized, setKeycloakInitialized] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [cosmetics, setCosmetics] = React.useState([]);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const initStarted = React.useRef(false);

  React.useEffect(() => {
    if (initStarted.current) {
      return;
    }
    initStarted.current = true;

    if (keycloak.didInitialize) {
      setKeycloakInitialized(true);
      setIsAuthenticated(keycloak.authenticated || false);
      setLoading(false);
      if (keycloak.authenticated) {
        console.log("User already authenticated");
      }
      return;
    }

    keycloak
      .init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri:
          window.location.origin + "/silent-check-sso.html",
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        setKeycloakInitialized(true);
        setIsAuthenticated(authenticated);
        setLoading(false);
        if (authenticated) {
          console.log("User authenticated");
        }
      })
      .catch((error) => {
        console.error("Keycloak initialization failed:", error);
        setLoading(false);
        initStarted.current = false;
      });
  }, []);
  React.useEffect(() => {
    if (isAuthenticated && keycloakInitialized) {
      // First get user info, then fetch cosmetics
      const loadUserData = async () => {
        const userData = await fetchUserInfo();
        if (userData) {
          console.log("User info loaded, now fetching cosmetics:", userData);
          const cosmeticsData = await fetchCosmetics();
          setCosmetics(cosmeticsData);
        }
      };
      loadUserData().catch((error) => setError(error.message));
    }
  }, [isAuthenticated, keycloakInitialized]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <h1>Agregator kosmetyków</h1>
        <p>Proszę się zalogować, aby kontynuować</p>
        <button
          onClick={() => keycloak.login()}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Zaloguj się
        </button>
      </div>
    );
  } else {
    return <Account cosmetics={cosmetics} error={error} />;
  }
};

export default App;
