import React from "react";
import { ViewProfile, Edit, Add } from "./buttons";
import { ViewReviewsOfUser, ViewReviewsOfCosmetic, AddReview } from "./reviews";
import { SearchBar } from "./search";

const token = document.cookie;
const getCurrentId = () => localStorage.getItem("currentUserId");
const getCurrentEmail = () => localStorage.getItem("currentEmail");
const getCurrentUsername = () => localStorage.getItem("currentUsername");

//edytowanie konta
const EditAccount = () => {
  const currentUserId = getCurrentId();
  const currentEmail = getCurrentEmail();
  const currentUsername = getCurrentUsername();
  const [isEditing, setIsEditing] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState(`${currentEmail}`);
  const [newUsername, setNewUsername] = React.useState(`${currentUsername}`);

  const handleEdit = () => {
    setIsEditing(true);
  };

  async function handleSubmit(email, username) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${currentUserId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("currentEmail", email);
        localStorage.setItem("currentUsername", username);
      }
    } catch (error) {
      console.error("Error editing account:", error);
    }
  }

  const handleClose = () => {
    setIsEditing(false);
  };
  return (
    <>
      {isEditing ? (
        <form
          className="edit"
          id="edit"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(newEmail, newUsername);
          }}
        >
          <button onClick={handleClose} className="button" type="button">
            X
          </button>
          <input
            type="email"
            name="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="Podaj nowy email"
          />
          <input
            type="text"
            name="username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Podaj nową nazwę użytkownika"
          />
          <button className="button" type="submit">
            Zapisz zmiany
          </button>
        </form>
      ) : (
        <button onClick={handleEdit} className="button">
          Edytuj profil
        </button>
      )}
    </>
  );
};

const DeleteAccount = () => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [password, setPassword] = React.useState("");

  async function handleDelete() {
    const currentUserId = getCurrentId();
    try {
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
      } else {
        console.log("Password incorrect");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  }

  const handleConfirmDelete = () => {
    setIsDeleting(true);
  };

  const handleCancel = () => {
    setIsDeleting(false);
    setPassword("");
  };

  return (
    <>
      {isDeleting ? (
        <form
          className="delete"
          id="delete"
          onSubmit={(event) => {
            event.preventDefault();
            handleDelete();
          }}
        >
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Podaj hasło"
          />
          <button className="button" type="submit">
            Potwierdź usunięcie
          </button>
          <button onClick={handleCancel} className="button" type="button">
            Anuluj usunięcie
          </button>
        </form>
      ) : (
        <button onClick={handleConfirmDelete} className="button">
          Usuń konto
        </button>
      )}
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
  const currentUserId = getCurrentId();

  async function handleRemove() {
    try {
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

      const data = await response.json();
      if (response.ok) {
        console.log("Cosmetic removed");
      }
    } catch (error) {
      console.error("Error removing cosmetic:", error);
    }
  }

  return (
    <>
      <button className="button" onClick={handleRemove}>
        Usuń produkt
      </button>
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
