import { useState } from "react";

const PostForm = ({ setPosts }) => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");

  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    if (file) reader.readAsDataURL(file);
  };

  const handlePost = () => {
    if (!image) return;

    const user = JSON.parse(localStorage.getItem("currentUser"));
    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    const newPost = {
  id: Date.now(),
  user: user.name,
  userEmail: user.email,
  photo: user.photo,
  caption,
  image,
  likes: [],
  comments: [],
};

    posts.unshift(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));

    setPosts(posts);
    setCaption("");
    setImage("");
  };

  return (
    <div className="bg-white p-4 mb-4 border rounded max-w-md mx-auto">

      <input type="file" onChange={handleImage} />

      {image && (
        <img src={image} className="w-full h-60 object-cover mt-2 rounded" />
      )}

      <input
        type="text"
        placeholder="Write a caption..."
        className="w-full mt-2 p-2 border"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />

      <button
        onClick={handlePost}
        className="w-full bg-blue-500 text-white py-2 mt-2 rounded"
      >
        Share
      </button>
    </div>
  );
};

export default PostForm;