import { useState } from "react";

const Postlist = ({ posts, setPosts }) => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [commentText, setCommentText] = useState("");

  const likePost = (id) => {
    const updated = posts.map((p) => {
      if (p.id === id) {
        let likes = p.likes || [];
        if (likes.includes(currentUser.email)) {
          likes = likes.filter((l) => l !== currentUser.email);
        } else {
          likes.push(currentUser.email);
        }
        return { ...p, likes };
      }
      return p;
    });

    setPosts(updated);
    localStorage.setItem("posts", JSON.stringify(updated));
  };

  const addComment = (id) => {
    if (!commentText) return;

    const updated = posts.map((p) => {
      if (p.id === id) {
        let comments = p.comments || [];
        comments.push({
          user: currentUser.name,
          text: commentText,
        });
        return { ...p, comments };
      }
      return p;
    });

    setPosts(updated);
    localStorage.setItem("posts", JSON.stringify(updated));
    setCommentText("");
  };

  return (
    <div className="flex flex-col items-center">
      {posts.map((post) => (
        <div
          key={post.id}
          className="w-full max-w-md bg-white border mb-6 rounded"
        >

          <div className="flex items-center gap-3 p-3">
            <img
              src={post.photo}
              className="w-8 h-8 rounded-full object-cover"
            />
            <h3 className="font-semibold text-sm">{post.user}</h3>
          </div>

          {post.image && (
            <img
              src={post.image}
              className="w-full h-[400px] object-cover"
            />
          )}

          <div className="p-3">

            <div className="flex gap-4 text-xl mb-2">
              <span
                onClick={() => likePost(post.id)}
                className="cursor-pointer"
              >
                ❤️
              </span>
            </div>

            <p className="text-sm font-semibold">
              {post.likes?.length || 0} likes
            </p>

            <p className="text-sm mt-1">
              <span className="font-semibold">{post.user}</span>{" "}
              {post.caption}
            </p>

            <div className="mt-2">
              {post.comments?.map((c, i) => (
                <p key={i} className="text-sm">
                  <span className="font-semibold">{c.user}</span> {c.text}
                </p>
              ))}
            </div>

            <div className="flex items-center mt-2 border-t pt-2">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-1 outline-none text-sm"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />

              <button
                onClick={() => addComment(post.id)}
                className="text-blue-500 text-sm font-semibold"
              >
                Post
              </button>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
};

export default Postlist;