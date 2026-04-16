import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaHome, FaCog, FaComments, FaSearch, FaBars, FaTimes } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div className="bg-white shadow-md px-4 sm:px-6 py-3 flex items-center justify-between relative">

      <h1
        onClick={() => navigate("/")}
        className="text-xl sm:text-2xl font-bold text-indigo-600 cursor-pointer"
      >
        DevSocial 🚀
      </h1>

      <div className="hidden md:block relative">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="border pl-10 pr-4 py-2 rounded-full w-[220px] lg:w-[280px] focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>

      <div className="hidden md:flex items-center gap-6">

        <button onClick={() => navigate("/")} className="flex items-center gap-1 hover:text-indigo-600">
          <FaHome /> Home
        </button>

        <button onClick={() => navigate("/chat")} className="flex items-center gap-1 hover:text-indigo-600">
          <FaComments /> Chat
        </button>

        <button onClick={() => navigate("/settings")} className="flex items-center gap-1 hover:text-indigo-600">
          <FaCog /> Settings
        </button>

        <div onClick={() => navigate("/profile")} className="flex items-center gap-2 cursor-pointer">
          <img
            src={user?.photo || "https://via.placeholder.com/40"}
            alt="profile"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium text-sm">@{user?.username || "user"}</span>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>

      <button
        className="md:hidden text-2xl"
        onClick={() => setOpen(!open)}
      >
        {open ? <FaTimes /> : <FaBars />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-lg flex flex-col gap-4 p-4 md:hidden z-50">

          <button onClick={() => { navigate("/"); setOpen(false); }} className="flex items-center gap-2">
            <FaHome /> Home
          </button>

          <button onClick={() => { navigate("/chat"); setOpen(false); }} className="flex items-center gap-2">
            <FaComments /> Chat
          </button>

          <button onClick={() => { navigate("/settings"); setOpen(false); }} className="flex items-center gap-2">
            <FaCog /> Settings
          </button>

          <button onClick={() => { navigate("/profile"); setOpen(false); }} className="flex items-center gap-2">
            <img
              src={user?.photo || "https://via.placeholder.com/40"}
              className="w-8 h-8 rounded-full"
            />
            Profile
          </button>

          <button
            onClick={() => { logout(); setOpen(false); }}
            className="bg-red-500 text-white py-2 rounded-lg"
          >
            Logout
          </button>

        </div>
      )}

    </div>
  );
};

export default Navbar;