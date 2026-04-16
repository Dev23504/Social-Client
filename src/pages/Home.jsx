import { useState, useEffect } from "react";
import Chat from "../pages/Chat";

const Home = ({ refresh }) => {
  const [allPosts, setAllPosts] = useState([]);
  const [commentInput, setCommentInput] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const loadPosts = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const posts = [];
    users.forEach((user) => {
      if (user.posts && user.posts.length > 0) {
        user.posts.forEach((post) => {
          posts.push({
            ...post,
            username: user.username,
            photo: user.photo,
          });
        });
      }
    });
    posts.sort((a, b) => b.id - a.id);
    setAllPosts(posts);
  };

  const loadSuggestions = () => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const filtered = users.filter(
      (u) =>
        u.username !== currentUser.username &&
        !(currentUser.following || []).includes(u.username)
    );
    setSuggestions(filtered);
  };

  useEffect(() => {
    loadPosts();
    loadSuggestions();
  }, [refresh]);

  const handleFollow = (target) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updatedUsers = users.map((u) => {
      if (u.username === currentUser.username) {
        return {
          ...u,
          following: [...new Set([...(u.following || []), target])],
        };
      }
      if (u.username === target) {
        return {
          ...u,
          followers: [...new Set([...(u.followers || []), currentUser.username])],
        };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        ...currentUser,
        following: [...new Set([...(currentUser.following || []), target])],
      })
    );

    loadSuggestions();
  };

  const handleUnfollow = (target) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const updatedUsers = users.map((u) => {
      if (u.username === currentUser.username) {
        return {
          ...u,
          following: (u.following || []).filter((f) => f !== target),
        };
      }
      if (u.username === target) {
        return {
          ...u,
          followers: (u.followers || []).filter((f) => f !== currentUser.username),
        };
      }
      return u;
    });

    const updatedCurrentUser = {
      ...currentUser,
      following: (currentUser.following || []).filter((f) => f !== target),
    };

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

    loadSuggestions();
  };

  const handleLike = (postId, postUser) => {
    if (!currentUser) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex((u) => u.username === postUser);
    if (userIndex === -1) return;

    const updatedPosts = users[userIndex].posts.map((p) => {
      if (p.id === postId) {
        if (!p.likedBy) p.likedBy = [];
        if (p.likedBy.includes(currentUser.username)) return p;
        return {
          ...p,
          likes: (p.likes || 0) + 1,
          likedBy: [...p.likedBy, currentUser.username],
        };
      }
      return p;
    });

    users[userIndex].posts = updatedPosts;
    localStorage.setItem("users", JSON.stringify(users));
    loadPosts();
  };

  const handleAddComment = (postId) => {
    const text = commentInput[postId];
    if (!text) return;

    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.forEach((user) => {
      if (user.posts && user.posts.length > 0) {
        user.posts = user.posts.map((p) => {
          if (p.id === postId) {
            if (!p.comments) p.comments = [];
            return {
              ...p,
              comments: [...p.comments, { username: currentUser.username, text }],
            };
          }
          return p;
        });
      }
    });

    localStorage.setItem("users", JSON.stringify(users));
    setCommentInput({ ...commentInput, [postId]: "" });
    loadPosts();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex gap-6 p-5">
      <div className="w-1/4 flex flex-col gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-bold mb-3">Suggestions</h2>
          {suggestions.map((u, i) => (
            <div key={i} className="flex justify-between items-center mb-2">
              <span
                className="cursor-pointer hover:text-blue-500"
                onClick={() => setSelectedUser(u.username)}
              >
                {u.username}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedUser(u.username)}
                  className="bg-green-500 text-white px-2 py-1 rounded"
                >
                  Message
                </button>

                <button
                  onClick={() => handleFollow(u.username)}
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                >
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-bold mb-3">Following</h2>

          {(currentUser.following || []).length === 0 ? (
            <p className="text-gray-500">No following</p>
          ) : (
            currentUser.following.map((u, i) => (
              <div key={i} className="flex justify-between items-center mb-2">
                <span
                  className="cursor-pointer hover:text-blue-500"
                  onClick={() => setSelectedUser(u)}
                >
                  {u}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Message
                  </button>

                  <button
                    onClick={() => handleUnfollow(u)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Unfollow
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="w-2/4 flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold">Feed</h2>

        {allPosts.length === 0 ? (
          <p className="text-gray-500">No posts</p>
        ) : (
          allPosts.map((post) => {
            const liked = post.likedBy?.includes(currentUser?.username);

            return (
              <div key={post.id} className="bg-white p-4 rounded-xl shadow w-full max-w-md">
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={post.photo || "https://via.placeholder.com/40"}
                    className="w-10 h-10 rounded-full"
                  />
                  <span
                    className="font-medium cursor-pointer hover:text-blue-500"
                    onClick={() => setSelectedUser(post.username)}
                  >
                    @{post.username}
                  </span>
                </div>

                {post.image && (
                  <img src={post.image} className="w-full rounded mb-2" />
                )}

                <p className="mb-2">{post.content}</p>

                <button
                  onClick={() => handleLike(post.id, post.username)}
                  className={`px-3 py-1 rounded text-white ${
                    liked ? "bg-gray-400" : "bg-red-500"
                  }`}
                  disabled={liked}
                >
                  ❤️ {post.likes || 0}
                </button>

                {post.comments?.map((c, idx) => (
                  <p key={idx} className="text-sm text-gray-600">
                    <b>@{c.username}</b> {c.text}
                  </p>
                ))}

                <div className="flex gap-2 mt-2">
                  <input
                    value={commentInput[post.id] || ""}
                    onChange={(e) =>
                      setCommentInput({ ...commentInput, [post.id]: e.target.value })
                    }
                    className="border p-1 flex-1 rounded"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="bg-indigo-500 text-white px-2 rounded"
                  >
                    Post
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="w-1/4">
        <Chat user={currentUser} selectedUser={selectedUser} />
      </div>
    </div>
  );
};

export default Home;