import React from "react";
import { Modal } from "./Modal";

//przycisk wyświetlania profilu
const ViewProfile = () => {
  const current_user = localStorage.getItem("currentUserId");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [userData, setUserData] = React.useState({});

  async function fetchUser() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${current_user}`,
        { method: "GET" }
      );

      const data = await response.json();
      if (response.ok) {
        setUserData(data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  React.useEffect(() => {
    if (isModalOpen) {
      fetchUser();
    }
  }, [isModalOpen]);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="button">
        Wyświetl profil
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Profil użytkownika"
      >
        <div className="profile-info">
          <h3 className="h3">Username: {userData.username}</h3>
          <p className="p">E-mail: {userData.email}</p>
          <p className="p">User ID: {userData.id}</p>
        </div>
      </Modal>
    </>
  );
};

//przycisk dodania kosmetyku do bazy danych
const Add = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [brand, setBrand] = React.useState("");
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cosmetics`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ brand, name, category }),
        }
      );

      if (response.ok) {
        setIsModalOpen(false);
        setBrand("");
        setName("");
        setCategory("");
      }
    } catch (error) {
      console.error("Error adding cosmetic:", error);
    }
  }

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="button">
        Dodaj nowy kosmetyk do bazy danych
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Dodaj nowy kosmetyk"
      >
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Podaj markę kosmetyku"
            className="input"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Podaj nazwę kosmetyku"
            className="input"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Podaj kategorię kosmetyku"
            className="input"
          />
          <div className="modal-actions">
            <button type="submit" className="button">
              Dodaj kosmetyk
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

//przycisk edytowania informacji o kosmetyku
const Edit = ({ cosmetic_id }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [brand, setBrand] = React.useState("");
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cosmetics/${cosmetic_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ brand, name, category }),
        }
      );

      if (response.ok) {
        setIsModalOpen(false);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error editing cosmetic:", error);
    }
  }

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="button">
        Edytuj kosmetyk
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edytuj kosmetyk"
      >
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Podaj nową markę kosmetyku"
            className="input"
          />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Podaj nową nazwę kosmetyku"
            className="input"
          />
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Podaj nową kategorię kosmetyku"
            className="input"
          />
          <div className="modal-actions">
            <button type="submit" className="button">
              Zapisz zmiany
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export { ViewProfile, Add, Edit };
