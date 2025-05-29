import React from "react";

//przycisk wyświetlania profilu
const ViewProfile = () => {
  const current_user = localStorage.getItem("currentUserId");
  const [isViewing, setIsViewing] = React.useState(false);
  const [userData, setUserData] = React.useState({});

  const handleView = () => {
    setIsViewing(true);
  };

  async function fetchUser() {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/users/${current_user}`,
        { method: "GET" }
      );

      const data = await response.json();
      if (response.ok) {
        setIsViewing(true);
        return data;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }

  React.useEffect(() => {
    if (isViewing) {
      fetchUser()
        .then((data) => setUserData(data))
        .catch((error) => console.error(error));
    }
  }, [isViewing]);

  const handleClose = () => {
    setIsViewing(false);
  };

  return (
    <>
      {isViewing ? (
        <div className="accountView">
          <button className="button" onClick={handleClose}>
            Schowaj profil
          </button>
          <h3 className="h3">Username: {userData.username}</h3>
          <p className="p">E-mail: {userData.email}</p>
          <p className="p">User ID: {userData.id}</p>
        </div>
      ) : (
        <button onClick={handleView} className="button">
          Wyświetl profil
        </button>
      )}
    </>
  );
};

//przycisk dodania kosmetyku do bazy danych
const Add = () => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [brand, setBrand] = React.useState("");
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");

  function handleAdd() {
    setIsAdding(true);
  }

  function handleClose() {
    setIsAdding(false);
  }

  const handleBrand = (brand) => {
    setBrand(brand);
  };

  const handleName = (name) => {
    setName(name);
  };

  const handleCategory = (category) => {
    setCategory(category);
  };

  async function handleSubmit(newBrand, newName, newCategory) {
    try {
      const response = await fetch(`http://127.0.0.1:5000/cosmetics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: newBrand,
          name: newName,
          category: newCategory,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data);
        setBrand("");
        setName("");
        setCategory("");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Error adding data:", error);
    }
  }

  return (
    <>
      {isAdding ? (
        <form className="addCosmetic">
          <button onClick={handleClose} className="button">
            X
          </button>
          <input
            type="text"
            placeholder="Podaj markę kosmetyku"
            onChange={(e) => handleBrand(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Podaj nazwę kosmetyku"
            onChange={(e) => handleName(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Podaj kategorie kosmetyku"
            onChange={(e) => handleCategory(e.target.value)}
            className="input"
          />

          <button
            type="submit"
            onClick={() => handleSubmit(brand, name, category)}
            className="button"
          >
            Dodaj kosmetyk
          </button>
        </form>
      ) : (
        <button onClick={handleAdd} className="button">
          Dodaj nowy kosmetyk do bazy danych
        </button>
      )}
    </>
  );
};

//przycisk edytowania informacji o kosmetyku
const Edit = ({ cosmetic_id }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [brand, setBrand] = React.useState("");
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("");

  function handleEdit() {
    setIsEditing(true);
  }

  function handleClose() {
    setIsEditing(false);
  }

  const handleBrand = (brand) => {
    setBrand(brand);
  };

  const handleName = (name) => {
    setName(name);
  };

  const handleCategory = (category) => {
    setCategory(category);
  };

  async function handleSubmit(newBrand, newName, newCategory) {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/cosmetics/${cosmetic_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            brand: newBrand,
            name: newName,
            category: newCategory,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log(data);
        setBrand("");
        setName("");
        setCategory("");
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error editing data:", error);
    }
  }

  return (
    <>
      {isEditing ? (
        <form
          className="editCosmetic"
          onSubmit={() => handleSubmit(brand, name, category)}
        >
          <button onClick={handleClose} className="button">
            X
          </button>

          <input
            type="text"
            placeholder="Podaj nową markę kosmetyku"
            onChange={(e) => handleBrand(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Podaj nową nazwę kosmetyku"
            onChange={(e) => handleName(e.target.value)}
            className="input"
          />
          <input
            type="text"
            placeholder="Podaj nową kategorię kosmetyku"
            onChange={(e) => handleCategory(e.target.value)}
            className="input"
          />

          <button type="submit" className="button">
            Zapisz zmiany
          </button>
        </form>
      ) : (
        <button onClick={handleEdit} className="button">
          Edytuj kosmetyk
        </button>
      )}
    </>
  );
};

export { ViewProfile, Add, Edit };
