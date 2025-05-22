const token = document.cookie;
const getCurrentUser = () => localStorage.getItem("currentUserId");

//logika pobierania zapisanych kosmetyków obecnego użytkownika
async function fetchCosmetics() {
  try {
    const current_user = getCurrentUser();
    const response = await fetch(
      `http://127.0.0.1:5000/users/${current_user}/saved_cosmetics`,
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

//cała aplikacja
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

//render aplikacji
const root = ReactDOM.createRoot(document.getElementById("app"));
root.render(<App />);
