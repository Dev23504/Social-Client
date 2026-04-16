import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = ({ setUser }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = () => {
    setError("");

    if (!email || !password) {
      return setError("Please fill all fields");
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
      setUser(user);
      navigate("/");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-[350px]">
        
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Welcome Back 👋
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded text-sm mb-3 text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4">
          
          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="border p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 cursor-pointer"
            >
              👁️
            </span>
          </div>

          <button
            onClick={handleLogin}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition duration-300"
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <span
              className="text-indigo-600 cursor-pointer font-medium"
              onClick={() => navigate("/register")}
            >
              Register
            </span>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;