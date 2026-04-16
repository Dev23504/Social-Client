import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Settings = ({ updateUser }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    dob: "",
    bio: "",
    photo: "",
    oldPassword: "",
    newPassword: "",
    showEmail: true,
    allowFollowers: true,
    notifyLikes: true,
    notifyComments: true,
  });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!storedUser) navigate("/login");
    else {
      setUser(storedUser);
      setForm({
        ...form,
        name: storedUser.name || "",
        username: storedUser.username || "",
        email: storedUser.email || "",
        dob: storedUser.dob || "",
        bio: storedUser.bio || "",
        photo: storedUser.photo || "",
        showEmail: storedUser.showEmail ?? true,
        allowFollowers: storedUser.allowFollowers ?? true,
        notifyLikes: storedUser.notifyLikes ?? true,
        notifyComments: storedUser.notifyComments ?? true,
      });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, photo: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (form.oldPassword && form.oldPassword !== user.password) {
      return alert("Old password incorrect");
    }

    const updatedUser = {
      ...user,
      name: form.name,
      username: form.username,
      email: form.email,
      dob: form.dob,
      bio: form.bio,
      photo: form.photo,
      password: form.newPassword ? form.newPassword : user.password,
      showEmail: form.showEmail,
      allowFollowers: form.allowFollowers,
      notifyLikes: form.notifyLikes,
      notifyComments: form.notifyComments,
    };

    let allUsers = JSON.parse(localStorage.getItem("users")) || [];
    const index = allUsers.findIndex((u) => u.email === user.email);
    if (index !== -1) allUsers[index] = updatedUser;
    localStorage.setItem("users", JSON.stringify(allUsers));
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setUser(updatedUser);
    if (updateUser) updateUser();
    alert("Settings updated!");
  };

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      let allUsers = JSON.parse(localStorage.getItem("users")) || [];
      allUsers = allUsers.filter((u) => u.email !== user.email);
      localStorage.setItem("users", JSON.stringify(allUsers));
      localStorage.removeItem("currentUser");
      navigate("/register");
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md flex flex-col gap-4">

        <h2 className="text-2xl font-bold text-center">Settings</h2>

        <div className="flex flex-col gap-2">
          <img
            src={form.photo || "https://via.placeholder.com/150"}
            alt="profile"
            className="w-28 h-28 rounded-full object-cover mx-auto border-2 border-indigo-500"
          />
          <input type="file" onChange={handlePhotoChange} className="mx-auto" />
        </div>

        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 rounded" />
        <input name="username" value={form.username} onChange={handleChange} placeholder="Username" className="border p-2 rounded" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="border p-2 rounded" />
        <input name="dob" value={form.dob} onChange={handleChange} placeholder="DOB" type="date" className="border p-2 rounded" />
        <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" className="border p-2 rounded resize-none" />

        <input type="password" name="oldPassword" value={form.oldPassword} onChange={handleChange} placeholder="Old Password" className="border p-2 rounded" />
        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="New Password" className="border p-2 rounded" />

        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="showEmail" checked={form.showEmail} onChange={handleChange} />
            Show Email on Profile
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="allowFollowers" checked={form.allowFollowers} onChange={handleChange} />
            Allow Followers
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="notifyLikes" checked={form.notifyLikes} onChange={handleChange} />
            Notify on Likes
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" name="notifyComments" checked={form.notifyComments} onChange={handleChange} />
            Notify on Comments
          </label>
        </div>

        <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-semibold">Save Settings</button>
        <button onClick={handleLogout} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold">Logout</button>
        <button onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold">Delete Account</button>

      </div>
    </div>
  );
};

export default Settings;