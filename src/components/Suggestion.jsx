import { useEffect, useState } from "react";

const Suggestion = ({ user }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/users/${user.username}`)
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const followUser = async (target) => {
    await fetch("http://localhost:5000/follow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentUser: user.username,
        targetUser: target,
      }),
    });

    setUsers(prev => prev.filter(u => u.username !== target));
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow w-64">
      <h2 className="font-semibold mb-3">Suggestions</h2>

      {users.map((u, i) => (
        <div key={i} className="flex justify-between mb-2">
          <span>{u.username}</span>
          <button onClick={() => followUser(u.username)} className="bg-blue-500 text-white px-2 rounded">
            Follow
          </button>
        </div>
      ))}
    </div>
  );
};

export default Suggestion;