import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function PostJob() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [salary, setSalary] = useState(""); // ✅ Salary state
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ✅ Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/jobs/categories/");
        const data = Array.isArray(res.data) ? res.data : res.data.results;
        setCategories(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  // ✅ Submit Job
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
  await api.post("/jobs/employer/jobs/", {
  title,
  description,
  location,
  category: category ? Number(category) : null,
  salary: salary || "",   // 🔥 send as TEXT
});

      alert("Job posted successfully");
      navigate("/employer/dashboard");
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError("Unauthorized or failed to post job");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4" style={{ maxWidth: "600px" }}>
        <h3>Post New Job</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            className="form-control mb-2"
            placeholder="Job Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="form-control mb-2"
            placeholder="Job Description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            className="form-control mb-2"
            placeholder="Location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          {/* ✅ Salary Field (Same style as Edit Job) */}
   <input
  type="text"
  className="form-control mb-2"
  placeholder="Salary (Example: 3.5 LPA / ₹25,000 per month / Negotiable)"
  value={salary}
  onChange={(e) => setSalary(e.target.value)}
/>
             {/* <input
            className="form-control mb-3"
            name="salary"
            value={form.salary || ""}
            onChange={handleChange}
            placeholder="Salary (optional)"
          /> */}

         <select
  className="form-control mb-3"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="">No Category (Optional)</option>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.name}
    </option>
  ))}
</select>

          <button className="btn btn-primary w-100">Post Job</button>
        </form>
      </div>
    </>
  );
}