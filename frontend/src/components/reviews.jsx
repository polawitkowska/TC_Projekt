import React from "react";
import { Modal } from "./Modal";

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

const currentUserId = localStorage.getItem("currentUserId");

//logika dodawania recenzji
const AddReview = ({ cosmetic_id }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [rating, setRating] = React.useState("");
  const [comment, setComment] = React.useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const token = getTokenFromCookie();

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cosmetics/${cosmetic_id}/reviews`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rating: Number(rating), comment }),
        }
      );

      if (response.ok) {
        setIsModalOpen(false);
        setRating("");
        setComment("");
      }
    } catch (error) {
      console.error("Error posting review:", error);
    }
  }

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="button">
        Dodaj opinię
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Dodaj opinię"
      >
        <form className="form" onSubmit={handleSubmit}>
          <input
            type="number"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="Oceń produkt (0-5)"
            min="0"
            max="5"
            className="input"
          />
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Napisz opinię"
            className="input"
          />
          <div className="modal-actions">
            <button type="submit" className="button">
              Dodaj opinię
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

//logika edytowania recenzji
const EditReview = ({ review_id }) => {
  const [isEditing, setIsEditing] = React.useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleClose = () => {
    setIsEditing(false);
  };

  const [rating, setRating] = React.useState("");
  const [comment, setComment] = React.useState("");

  React.useEffect(() => {
    async function fetchReview() {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/reviews/${review_id}`,
          { method: "GET" }
        );
        const data = await response.json();
        if (response.ok) {
          setRating(data.rating);
          setComment(data.comment);
        }
      } catch (error) {
        console.error("Error fetching review:", error);
      }
    }

    if (isEditing) {
      fetchReview();
    }
  }, [isEditing, review_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getTokenFromCookie();

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${currentUserId}/reviews/${review_id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rating, comment }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        console.log(data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  return (
    <>
      {isEditing ? (
        <form className="edit" onSubmit={handleSubmit}>
          <button type="button" className="button" onClick={handleClose}>
            X
          </button>
          <input
            type="number"
            name="rating"
            value={rating}
            placeholder="Oceń produkt (0-5)"
            min={0}
            max={5}
            onChange={(e) => setRating(e.target.value)}
            className="input"
          />
          <input
            type="text"
            name="comment"
            value={comment}
            placeholder="Napisz opinię"
            onChange={(e) => setComment(e.target.value)}
            className="input"
          />
          <button type="submit" className="button">
            Zapisz
          </button>
        </form>
      ) : (
        <button onClick={handleEdit} className="button">
          Edytuj opinię
        </button>
      )}
    </>
  );
};

//logika usuwania recenzji
const DeleteReview = ({ review_id }) => {
  const handleDelete = async () => {
    try {
      const token = getTokenFromCookie();

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${currentUserId}/reviews/${review_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        console.log("Review deleted successfully");
      } else {
        console.error("Failed to delete review");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  return (
    <button onClick={handleDelete} className="button">
      Usuń opinię
    </button>
  );
};

//logika wyświetlania recenzji użytkownika
const ViewReviewsOfUser = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [reviews, setReviews] = React.useState([]);

  async function fetchReviews() {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/users/${currentUserId}/reviews`,
        { method: "GET" }
      );

      const data = await response.json();
      if (response.ok) {
        if (data.message !== "User doesn't have any reviews") {
          const cosmeticWithReview = await fetchCosmetic(data);
          setReviews(cosmeticWithReview);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }

  async function fetchCosmetic(passedReviews) {
    try {
      const results = await Promise.all(
        passedReviews.map(async (review) => {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/cosmetics/${review.cosmetic_id}`,
            { method: "GET" }
          );
          const cosmetic = await response.json();
          return { cosmetic, review };
        })
      );
      return results;
    } catch (error) {
      console.error("Error fetching cosmetic:", error);
    }
  }

  React.useEffect(() => {
    if (isModalOpen) {
      fetchReviews();
    }
  }, [isModalOpen]);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="button">
        Wyświetl swoje recenzje
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Twoje recenzje"
      >
        {reviews.length > 0 ? (
          <ul className="reviews-list">
            {reviews.map(({ cosmetic, review }) => (
              <li key={review.id} className="review-item">
                <h4 className="h4">
                  {cosmetic.brand}, {cosmetic.name}
                </h4>
                <p className="p">Ocena: {review.rating}/5</p>
                <p className="p">{review.comment}</p>
                <div className="review-actions">
                  <EditReview review_id={review.id} />
                  <DeleteReview review_id={review.id} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="p">Nie masz żadnych recenzji</p>
        )}
      </Modal>
    </>
  );
};

//wyświetlanie recenzji kosmetyku
const ViewReviewsOfCosmetic = ({ cosmetic_id }) => {
  const [isViewing, setIsViewing] = React.useState(false);
  const [reviews, setReviews] = React.useState([]);

  const handleView = () => {
    setIsViewing(true);
  };

  async function fetchReviews(cosmetic_id) {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/cosmetics/${cosmetic_id}/reviews`,
        { method: "GET" }
      );

      const data = await response.json();

      if (response.ok) {
        fetchUser(data)
          .then((fetchedUser) => setReviews(fetchedUser))
          .catch((error) => console.error(error));
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  }

  async function fetchUser(passedReviews) {
    try {
      const results = await Promise.all(
        passedReviews.map(async (review) => {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/users/${review.user_id}`,
            { method: "GET" }
          );
          const user = await response.json();
          return { user, review };
        })
      );
      return results;
    } catch (error) {
      console.error("Error fetching cosmetic:", error);
    }
  }

  const handleClose = () => {
    setIsViewing(false);
  };

  React.useEffect(() => {
    if (isViewing) {
      fetchReviews(cosmetic_id);
    }
  }, [isViewing]);

  return (
    <>
      {isViewing ? (
        <>
          <button onClick={handleClose} className="button">
            Schowaj opinie
          </button>
          <ul className="reviews">
            {reviews.map(({ user, review }) => (
              <li key={review.id}>
                <h4>User: {user.username}</h4>
                <p>Rating: {review.rating}</p>
                <p>{review.comment}</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <button onClick={handleView} className="button">
          Wyświetl opinie
        </button>
      )}
    </>
  );
};

export {
  AddReview,
  EditReview,
  DeleteReview,
  ViewReviewsOfUser,
  ViewReviewsOfCosmetic,
};
