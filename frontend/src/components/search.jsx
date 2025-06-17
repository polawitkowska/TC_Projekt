import React from "react";
import { AddReview } from "./reviews";
import { Edit } from "./buttons";
import keycloak from "../keycloak";

const getKeycloakToken = () => {
  return keycloak.token || null;
};

//zapisywanie kosmetyku
const SaveCosmetic = ({ cosmetic_id }) => {
  async function handleAdd() {
    try {
      const token = getKeycloakToken();

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cosmetics/${cosmetic_id}/save`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        console.log("Cosmetic added successfully");
      }
    } catch (error) {
      console.error("Error adding cosmetic:", error);
    }
  }
  return (
    <>
      <button className="button" onClick={handleAdd}>
        Zapisz produkt
      </button>
    </>
  );
};

//wyszukiwanie
const SearchBar = () => {
  const [searchedCosmetics, setsearchedCosmetics] = React.useState([]);

  async function handleSearch(phrase) {
    if (phrase) {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/cosmetics/${phrase}`,
          {
            method: "GET",
          }
        );

        const data = await response.json();
        if (response.ok) {
          setsearchedCosmetics(data);
          return true;
        }
      } catch (error) {
        console.error("Error fetching:", error);
        return false;
      }
    } else {
      setsearchedCosmetics([]);
    }
  }
  return (
    <>
      <input
        type="text"
        placeholder="Wyszukaj kosmetyki"
        onChange={(e) => handleSearch(e.target.value)}
        className="input"
      />
      <ul className="ul">
        {searchedCosmetics.length > 0 && <p className="p">Wyniki:</p>}
        {searchedCosmetics.map((cosmetic) => (
          <li key={cosmetic.id} className="li">
            <p className="p">
              {cosmetic.brand} - {cosmetic.name}, Kategoria: {cosmetic.category}
            </p>
            <div className="buttons">
              <AddReview cosmetic_id={cosmetic.id} />
              <SaveCosmetic cosmetic_id={cosmetic.id} />
              <Edit cosmetic_id={cosmetic.id} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export { SaveCosmetic };
export { SearchBar };
