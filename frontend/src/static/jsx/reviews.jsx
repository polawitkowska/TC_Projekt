const token = document.cookie;
const currentUserId = localStorage.getItem("currentUserId");

//logika dodawania recenzji
const AddReview = ({ cosmetic_id }) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newRating, setNewRating] = React.useState(null);
  const [newComment, setNewComment] = React.useState("");

  const handleAdd = () => {
    setIsAdding(true);
  };

  const handleRating = (rating) => {
    setNewRating(rating);
  };

  const handleComment = (comment) => {
    setNewComment(comment);
  };

  const handleClose = () => {
    setIsAdding(false);
  };

  async function handleSubmit(rating, comment) {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/cosmetics/${cosmetic_id}/reviews`,
        {
          method: "POST",
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

        setNewRating(null);
        setNewComment("");
        setIsAdding(false);
      }
    } catch (error) {
      console.error("Error posting review:", error);
    }
  }
  return (
    <>
      {isAdding ? (
        <form
          className="newReview"
          onSubmit={() => handleSubmit(newRating, newComment)}
        >
          <button type="button" className="button" onClick={handleClose}>
            X
          </button>
          <input
            type="number"
            name="rating"
            placeholder="Oceń produkt (0-5)"
            min={0}
            max={5}
            onChange={(e) => handleRating(e.target.value)}
            className="input"
          />
          <input
            type="text"
            name="comment"
            placeholder="Napisz opinię"
            onChange={(e) => handleComment(e.target.value)}
            className="input"
          />
          <button type="submit" className="button">
            Wyślij
          </button>
        </form>
      ) : (
        <button className="button" onClick={handleAdd}>
          Dodaj opinie
        </button>
      )}
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
          `http://127.0.0.1:5000/reviews/${review_id}`,
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
      const response = await fetch(
        `http://127.0.0.1:5000/users/${currentUserId}/reviews/${review_id}`,
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
      const response = await fetch(
        `http://127.0.0.1:5000/users/${currentUserId}/reviews/${review_id}`,
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
  const [isViewing, setIsViewing] = React.useState(false);
  const [reviews, setReviews] = React.useState([]);

  const handleView = () => {
    setIsViewing(true);
  };

  async function fetchReviews(user_id) {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/users/${user_id}/reviews`,
        { method: "GET" }
      );

      const data = await response.json();

      if (response.ok) {
        fetchCosmetic(data)
          .then((fetchedReview) => setReviews(fetchedReview))
          .catch((error) => console.error(error));
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
            `http://127.0.0.1:5000/cosmetics/${review.cosmetic_id}`,
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

  const handleClose = () => {
    setIsViewing(false);
  };

  React.useEffect(() => {
    const user_id = localStorage.getItem("currentUserId");
    if (isViewing) {
      fetchReviews(user_id);
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
            {reviews.map(({ cosmetic, review }) => (
              <li key={review.id}>
                <h4>
                  {cosmetic.brand}, {cosmetic.name}
                </h4>
                <p>Rating: {review.rating}</p>
                <p>{review.comment}</p>
                <EditReview review_id={review.id} />{" "}
                <DeleteReview review_id={review.id} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <button onClick={handleView} className="button">
          Wyświetl swoje opinie
        </button>
      )}
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
        `http://127.0.0.1:5000//cosmetics/${cosmetic_id}/reviews`,
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
            `http://127.0.0.1:5000/users/${review.user_id}`,
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
