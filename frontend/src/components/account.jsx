import React from "react";
import { ViewProfile, Edit, Add } from "./buttons";
import { ViewReviewsOfUser, ViewReviewsOfCosmetic, AddReview } from "./reviews";
import { Modal } from "./Modal";
import { SearchBar } from "./search";

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

const currentEmail = localStorage.getItem("currentEmail");
const currentUsername = localStorage.getItem("currentUsername");

// edytowanie konta
const EditAccount = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState(`${currentEmail}`);
  const [newUsername, setNewUsername] = React.useState(`${currentUsername}`);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="button">
        Edytuj profil
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edytuj profil"
      >
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(newEmail, newUsername);
          }}
        >
          <input
            className="input"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Nowy email"
          />
          <input
            className="input"
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Nowa nazwa użytkownika"
          />
          <div className="modal-actions">
            <button className="button" type="submit">
              Zapisz zmiany
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

async function handleSubmit(email, username) {
  try {
    const token = getTokenFromCookie();
    const currentUserId = localStorage.getItem("currentUserId");

    console.log("Sending update request with:", { email, username });

    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/users/${currentUserId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          username: username.trim(),
        }),
      }
    );

    console.log("Response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Success response:", data);
      localStorage.setItem("currentEmail", email);
      localStorage.setItem("currentUsername", username);
      window.location.reload();
    } else {
      const errorData = await response.text();
      console.error("Error response:", errorData);
      try {
        const errorJson = JSON.parse(errorData);
        alert(
          `Błąd: ${errorJson.error || errorJson.message || "Nieznany błąd"}`
        );
      } catch {
        alert(`Błąd serwera: ${response.status} - ${errorData}`);
      }
    }
  } catch (error) {
    console.error("Error editing account:", error);
  }
}

const DeleteAccount = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");

  async function handleDelete() {
    try {
      const token = getTokenFromCookie();
      const currentUserId = localStorage.getItem("currentUserId");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${currentUserId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      if (response.ok) {
        localStorage.clear();
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  }

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="button">
        Usuń konto
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Usuń konto"
      >
        <form
          className="form"
          onSubmit={(event) => {
            event.preventDefault();
            handleDelete();
          }}
        >
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Potwierdź hasłem"
          />
          <div className="modal-actions">
            <button
              className="button"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Anuluj
            </button>
            <button className="button" type="submit">
              Usuń konto
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

//przycisk wylogowania
const Logout = () => {
  return (
    <button
      onClick={() => {
        document.cookie = ``;
        localStorage.clear();
        window.location.reload();
      }}
      className="button"
    >
      Wyloguj
    </button>
  );
};

//usuwanie kosmetyku z zapisanych
const RemoveCosmetic = ({ cosmetic_id }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  async function handleRemove() {
    try {
      const token = getTokenFromCookie();
      const currentUserId = localStorage.getItem("currentUserId");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${currentUserId}/cosmetics/${cosmetic_id}/saved`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setIsModalOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error removing cosmetic:", error);
    }
  }

  return (
    <>
      <button className="button" onClick={() => setIsModalOpen(true)}>
        Usuń produkt
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Usuń produkt"
      >
        <p>Czy na pewno chcesz usunąć ten produkt z zapisanych?</p>
        <div className="modal-actions">
          <button className="button" onClick={() => setIsModalOpen(false)}>
            Anuluj
          </button>
          <button className="button" onClick={handleRemove}>
            Usuń
          </button>
        </div>
      </Modal>
    </>
  );
};

//strona konta
const Account = ({ cosmetics, error }) => {
  return (
    <>
      <header className="header">
        <nav className="nav">
          <ViewProfile />
          <ViewReviewsOfUser />
          <EditAccount />
          <DeleteAccount />
          <Logout />
        </nav>
        <h1 className="h1">Agregator kosmetyków</h1>
        <SearchBar />
      </header>

      <main className="main">
        <h2 className="h2">Moje zapisane kosmetyki</h2>
        <ul className="ul">
          {cosmetics.map((cosmetic) => (
            <li key={cosmetic.id} className="li">
              <p className="p">
                {cosmetic.brand} - {cosmetic.name}, Kategoria:{" "}
                {cosmetic.category}
              </p>
              <div className="buttons">
                <AddReview cosmetic_id={cosmetic.id} />
                <ViewReviewsOfCosmetic cosmetic_id={cosmetic.id} />
                <Edit cosmetic_id={cosmetic.id} />
                <RemoveCosmetic cosmetic_id={cosmetic.id} />
              </div>
            </li>
          ))}
        </ul>
        <Add />
      </main>
      {error && <div className="error">{error}</div>}
    </>
  );
};

export { EditAccount, DeleteAccount, Logout, RemoveCosmetic };
export default Account;
