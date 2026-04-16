import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    bio: "",
    photo: "",
    followers: [],
    following: [],
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, photo: reader.result }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.name ||
      !form.username ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.dob ||
      !form.bio
    ) {
      return setError("All fields are required");
    }

    if (!form.email.includes("@")) {
      return setError("Invalid email format");
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    if (form.password !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    const today = new Date();
    const birthDate = new Date(form.dob);
    const age = today.getFullYear() - birthDate.getFullYear();

    if (age < 13) {
      return setError("You must be at least 13 years old");
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const cleanUsername = form.username.toLowerCase().trim();

    const usernameExists = users.find(
      (u) => u.username === cleanUsername
    );
    if (usernameExists) {
      return setError("Username already taken");
    }

    const emailExists = users.find((u) => u.email === form.email);
    if (emailExists) {
      return setError("Email already registered");
    }

    const newUser = {
      ...form,
      username: cleanUsername,
    };

    delete newUser.confirmPassword;

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Registered Successfully 🎉");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-500">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-2xl w-[360px]"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Create Account 🚀
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded text-sm mb-3 text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
          />

          <input
            name="username"
            placeholder="@username"
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-green-400"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer"
            >
              👁️
            </span>
          </div>

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
          />

          <input
            type="date"
            name="dob"
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400"
          />

          <textarea
            name="bio"
            placeholder="Bio"
            onChange={handleChange}
            rows="3"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400 resize-none"
          />

          <input type="file" onChange={handlePhotoChange} />

          {form.photo && (
            <img
              src={form.photo}
              alt="preview"
              className="w-16 h-16 rounded-full mx-auto object-cover"
            />
          )}

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition"
          >
            Register
          </button>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-green-600 cursor-pointer font-medium"
            >
              Login
            </span>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Register;