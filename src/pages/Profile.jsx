import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Profile = ({ updateFeed }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [editPhoto, setEditPhoto] = useState(false);
  const [showList, setShowList] = useState({ type: "", visible: false });
  const [usersList, setUsersList] = useState([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState(null);
  const [commentInput, setCommentInput] = useState({});

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!storedUser) navigate("/login");
    else {
      setUser(storedUser);
      const allUsers = JSON.parse(localStorage.getItem("users")) || [];
      setUsersList(allUsers);
    }
  }, [navigate]);

  const saveUser = (updatedUser) => {
    setUser(updatedUser);
    const allUsers = JSON.parse(localStorage.getItem("users")) || [];
    const index = allUsers.findIndex((u) => u.email === updatedUser.email);
    if (index !== -1) allUsers[index] = updatedUser;
    localStorage.setItem("users", JSON.stringify(allUsers));
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    if (updateFeed) updateFeed();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedUser = { ...user, photo: reader.result };
      saveUser(updatedUser);
      setEditPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteProfile = () => {
    if (window.confirm("Are you sure you want to delete your profile?")) {
      let allUsers = JSON.parse(localStorage.getItem("users")) || [];
      allUsers = allUsers.filter((u) => u.email !== user.email);
      localStorage.setItem("users", JSON.stringify(allUsers));
      localStorage.removeItem("currentUser");
      navigate("/register");
    }
  };

  const openList = (type) => setShowList({ type, visible: true });
  const closeList = () => setShowList({ type: "", visible: false });

  const getListUsers = () => {
    if (!user) return [];
    if (showList.type === "followers") {
      return usersList.filter((u) => user.followers.includes(u.username));
    } else if (showList.type === "following") {
      return usersList.filter((u) => user.following.includes(u.username));
    }
    return [];
  };

  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setNewPostImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCreatePost = () => {
    if (!newPostContent && !newPostImage)
      return alert("Add content or image");
    const newPost = {
      id: Date.now(),
      content: newPostContent,
      image: newPostImage,
      likes: 0,
      likedBy: [],
      comments: [],
    };
    const updatedUser = { ...user, posts: [...(user.posts || []), newPost] };
    saveUser(updatedUser);
    setNewPostContent("");
    setNewPostImage(null);
  };

  const handleEditPost = (postId) => {
    const newContent = prompt("Edit your post content");
    if (!newContent) return;
    const updatedPosts = user.posts.map((p) =>
      p.id === postId ? { ...p, content: newContent } : p
    );
    saveUser({ ...user, posts: updatedPosts });
  };

  const handleDeletePost = (postId) => {
    if (!window.confirm("Delete this post?")) return;
    const updatedPosts = user.posts.filter((p) => p.id !== postId);
    saveUser({ ...user, posts: updatedPosts });
  };

  const handleLike = (postId) => {
    const updatedPosts = user.posts.map((p) => {
      if (p.id === postId) {
        if (!p.likedBy) p.likedBy = [];
        if (p.likedBy.includes(user.username)) return p;
        return {
          ...p,
          likes: (p.likes || 0) + 1,
          likedBy: [...p.likedBy, user.username],
        };
      }
      return p;
    });
    saveUser({ ...user, posts: updatedPosts });
  };

  const handleAddComment = (postId) => {
    const text = commentInput[postId];
    if (!text) return;
    const updatedPosts = user.posts.map((p) =>
      p.id === postId
        ? {
            ...p,
            comments: [...(p.comments || []), { username: user.username, text }],
          }
        : p
    );
    saveUser({ ...user, posts: updatedPosts });
    setCommentInput({ ...commentInput, [postId]: "" });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-3 sm:p-6">

      <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-md max-w-md mx-auto flex flex-col items-center gap-3 sm:gap-4">

        <div className="relative">
          <img
            src={user.photo || "https://via.placeholder.com/150"}
            className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-2 border-indigo-500"
          />
          <button
            onClick={() => setEditPhoto(true)}
            className="absolute bottom-0 right-0 bg-indigo-500 text-white px-2 py-1 text-xs rounded-full"
          >
            Edit
          </button>
        </div>

        {editPhoto && (
          <input type="file" onChange={handlePhotoChange} className="text-sm" />
        )}

        <h2 className="text-xl sm:text-2xl font-bold">@{user.username}</h2>
        <p className="text-gray-700 text-sm">{user.name}</p>
        <p className="text-gray-500 text-xs sm:text-sm break-all text-center">
          {user.email}
        </p>
        <p className="text-gray-500 text-xs sm:text-sm">{user.dob}</p>
        <p className="text-gray-700 text-center text-sm">{user.bio}</p>

        <div className="flex gap-8 sm:gap-10 mt-2 text-center">
          <div onClick={() => openList("followers")} className="cursor-pointer">
            <p className="font-bold">{user.followers.length}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>

          <div onClick={() => openList("following")} className="cursor-pointer">
            <p className="font-bold">{user.following.length}</p>
            <p className="text-xs text-gray-500">Following</p>
          </div>
        </div>

        <button
          onClick={handleDeleteProfile}
          className="mt-3 sm:mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-semibold w-full"
        >
          Delete Profile
        </button>
      </div>

      <div className="max-w-md mx-auto mt-4 sm:mt-6 bg-white p-3 sm:p-4 rounded-xl shadow-md flex flex-col gap-3">
        <textarea
          className="border p-2 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="What's on your mind?"
          value={newPostContent}
          onChange={(e) => setNewPostContent(e.target.value)}
        />

        {newPostImage && (
          <img
            src={newPostImage}
            className="w-full h-52 sm:h-60 object-cover rounded-lg"
          />
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <input type="file" onChange={handlePostImageChange} />
          <button
            onClick={handleCreatePost}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg w-full sm:w-auto"
          >
            Post
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto mt-4 sm:mt-6 flex flex-col gap-4">
        <h3 className="text-lg sm:text-xl font-bold">Posts</h3>

        {user.posts?.slice().reverse().map((post) => {
          const liked = post.likedBy?.includes(user.username);

          return (
            <div key={post.id} className="bg-white p-3 sm:p-4 rounded-xl shadow">

              {post.image && (
                <img
                  src={post.image}
                  className="w-full h-56 sm:h-72 object-cover rounded-lg"
                />
              )}

              <p className="mt-2 text-sm">{post.content}</p>

              <div className="flex flex-wrap gap-2 mt-2">
                <button className="bg-yellow-400 text-white px-2 py-1 text-xs rounded">
                  Edit
                </button>
                <button className="bg-red-500 text-white px-2 py-1 text-xs rounded">
                  Delete
                </button>
                <button
                  onClick={() => handleLike(post.id)}
                  disabled={liked}
                  className={`px-2 py-1 text-xs rounded text-white ${
                    liked ? "bg-gray-400" : "bg-red-500"
                  }`}
                >
                  ❤️ {post.likes || 0}
                </button>
              </div>

              <div className="mt-2">
                {post.comments?.map((c, i) => (
                  <p key={i} className="text-xs text-gray-600">
                    <b>@{c.username}</b> {c.text}
                  </p>
                ))}

                <div className="flex gap-2 mt-2">
                  <input
                    className="border p-1 text-sm flex-1 rounded"
                    placeholder="Comment..."
                    value={commentInput[post.id] || ""}
                    onChange={(e) =>
                      setCommentInput({
                        ...commentInput,
                        [post.id]: e.target.value,
                      })
                    }
                  />
                  <button className="bg-indigo-600 text-white px-2 text-xs rounded">
                    Send
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {showList.visible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm p-4 rounded-xl">
            <h2 className="font-bold mb-3">{showList.type}</h2>

            {getListUsers().map((u) => (
              <div key={u.username} className="flex items-center gap-3 p-2">
                <img
                  src={u.photo}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <p className="text-sm">@{u.username}</p>
              </div>
            ))}

            <button
              onClick={closeList}
              className="mt-3 bg-gray-500 text-white px-3 py-1 rounded w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile; 