document.addEventListener("DOMContentLoaded", main);

const POST_URL = "http://localhost:3000/posts";
const postListDiv = document.getElementById("post-list");
const postDetailDiv = document.getElementById("post-detail");
const editForm = document.getElementById("edit-post-form");

let currentPost = null;

function main() {
  displayPosts();
  addNewPostListener();
  setupEditForm();
}

function displayPosts() {
  fetch(POST_URL)
    .then((res) => res.json())
    .then((posts) => {
      postListDiv.innerHTML = "";
      posts.forEach(renderPostTitle);
      if (posts.length > 0) {
        handlePostClick(posts[0].id); // auto-show first post
      }
    });
}

function renderPostTitle(post) {
  const postItem = document.createElement("div");
  postItem.textContent = post.title;
  postItem.classList.add("post-title");
  postItem.style.cursor = "pointer";
  postItem.addEventListener("click", () => handlePostClick(post.id));
  postListDiv.appendChild(postItem);
}

function handlePostClick(id) {
  fetch(`${POST_URL}/${id}`)
    .then((res) => res.json())
    .then((post) => {
      currentPost = post;
      renderPostDetail(post);
    });
}

function renderPostDetail(post) {
  postDetailDiv.innerHTML = `
    <h2>${post.title}</h2>
    <p>${post.content}</p>
    <p><strong>Author:</strong> ${post.author}</p>
    <button id="edit-btn">Edit</button>
    <button id="delete-btn">Delete</button>
  `;

  document.getElementById("edit-btn").addEventListener("click", showEditForm);
  document.getElementById("delete-btn").addEventListener("click", handleDelete);
}

function addNewPostListener() {
  const form = document.getElementById("new-post-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newTitle = document.getElementById("new-title").value;
    const newAuthor = document.getElementById("new-author").value;
    const newContent = document.getElementById("new-content").value;

    const newPost = {
      title: newTitle,
      author: newAuthor,
      content: newContent,
    };

    fetch(POST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost),
    })
      .then((res) => res.json())
      .then((savedPost) => {
        renderPostTitle(savedPost);
        form.reset();
      });
  });
}

function showEditForm() {
  document.getElementById("edit-title").value = currentPost.title;
  document.getElementById("edit-content").value = currentPost.content;
  editForm.classList.remove("hidden");
}

function setupEditForm() {
  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const updatedTitle = document.getElementById("edit-title").value;
    const updatedContent = document.getElementById("edit-content").value;

    const updatedPost = {
      title: updatedTitle,
      content: updatedContent,
    };

    fetch(`${POST_URL}/${currentPost.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPost),
    })
      .then((res) => res.json())
      .then((updatedData) => {
        currentPost = { ...currentPost, ...updatedData };
        displayPosts();
        renderPostDetail(currentPost);
        editForm.classList.add("hidden");
      });
  });

  document.getElementById("cancel-edit").addEventListener("click", () => {
    editForm.classList.add("hidden");
  });
}

function handleDelete() {
  fetch(`${POST_URL}/${currentPost.id}`, {
    method: "DELETE",
  }).then(() => {
    currentPost = null;
    displayPosts();
    postDetailDiv.innerHTML = "<p>Select a post to view its details.</p>";
  });
}
