import { useState } from "react";
import "./App.css";

function App() {
  const [dark, setDark] = useState(false);
  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState("");
  const [deptYear, setDeptYear] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const suggestions = ["Excellent", "Good", "Average", "Bad", "Needs Improvement"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};
    const regNoRegex = /^\d{2}[A-Za-z]{3}\d{4}$/;
    if (!regNo) {
      newErrors.regNo = "Register Number is required.";
    } else if (!regNoRegex.test(regNo)) {
      newErrors.regNo =
        "Register Number must be 9 characters: 2 digits (year) + 3 letters (major) + 4 digits (student no).";
    }

    const nameRegex = /^[A-Za-z.\s]+$/;
    if (!name) {
      newErrors.name = "Name is required.";
    } else if (!nameRegex.test(name)) {
      newErrors.name = "Only alphabets, spaces and dot (.) are allowed.";
    }

    if (!deptYear) {
      newErrors.deptYear = "Department Year is required.";
    }

    if (rating === 0) {
      newErrors.rating = "Please select a rating.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const feedbackData = { regNo, name, deptYear, comment, rating };

    try {
      // ✅ Use environment variable instead of localhost
      const API_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedbackData),
      });

      if (response.ok) {
        setSubmitted(true);
        setRegNo("");
        setName("");
        setDeptYear("");
        setComment("");
        setRating(0);
      } else {
        alert("❌ Error submitting feedback");
      }
    } catch (error) {
      alert("❌ Failed to submit feedback. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`page ${dark ? "dark" : ""}`}>
        <div className="submitted-card">
          <h1>✅ Feedback Submitted!</h1>
          <p>Thank you for your response.</p>
          <button className="go-back-btn" onClick={() => setSubmitted(false)}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`page ${dark ? "dark" : ""}`}>
      <div className="toggle-wrapper">
        <button className="theme-toggle" onClick={() => setDark(!dark)}>
          {dark ? "Night mode ON" : "Night mode OFF"}
        </button>
      </div>

      <div className="form-card">
        <h1>Feedback Form</h1>
        <form onSubmit={handleSubmit}>
          {/* Register Number */}
          <div className="form-group">
            <label>Register Number</label>
            <input
              type="text"
              value={regNo}
              onChange={(e) => {
                const val = e.target.value.toUpperCase();
                setRegNo(val);
                if (/^\d{2}/.test(val)) {
                  setDeptYear("20" + val.substring(0, 2));
                } else {
                  setDeptYear("");
                }
              }}
              placeholder="Eg: 20BEE2001"
            />
            {errors.regNo && <div className="error-text">{errors.regNo}</div>}
          </div>

          {/* Name */}
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Eg: R. Karthik"
            />
            {errors.name && <div className="error-text">{errors.name}</div>}
          </div>

          {/* Department Year */}
          <div className="form-group">
            <label>Department Year</label>
            <input type="text" value={deptYear} readOnly placeholder="Eg: 2020" />
            {errors.deptYear && <div className="error-text">{errors.deptYear}</div>}
          </div>

          {/* Comments */}
          <div className="form-group">
            <label>Comments</label>
            <textarea
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type your feedback here"
            ></textarea>

            <div className="suggestions">
              {suggestions.map((text) => (
                <span key={text} className="chip" onClick={() => setComment(text)}>
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="form-group">
            <label>Rating</label>
            <div className="stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= rating ? "star active" : "star"}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>
            {errors.rating && <div className="error-text">{errors.rating}</div>}
          </div>

          <button className="submit-btn" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;