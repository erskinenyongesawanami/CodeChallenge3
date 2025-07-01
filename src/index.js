const BASE_URL = 'http://localhost:3000/posts';

let currentPost = null; // Keep track of the currently selected post

function main() {
  displayPosts();
  addNewPostListener();
  addEditPostListener();
}

function displayPosts() {
  fetch(BASE_URL)
    .then(res => res.json())
    .then(posts => {
      const postItemsDiv = document.getElementById('post-items');
      postItemsDiv.innerHTML = '';

      posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'post-item';
        div.innerHTML = `<strong>${post.title}</strong><br/><small>${post.author} • ${post.date || 'Unknown'}</small>`;
        div.addEventListener('click', () => handlePostClick(post.id));
        postItemsDiv.appendChild(div);
      });

      if (posts.length > 0) {
        handlePostClick(posts[0].id); // Show first post by default
      }
    });
}

function handlePostClick(postId) {
  fetch(`${BASE_URL}/${postId}`)
    .then(res => res.json())
    .then(post => {
      currentPost = post;
      renderPostDetail(post);
    });
}

function renderPostDetail(post) {
  const postDetail = document.getElementById('post-detail');
  postDetail.innerHTML = `
    <h2>${post.title}</h2>
    <p><strong>By ${post.author}</strong> • ${post.date || 'Unknown'}</p>
    <img src="${post.image}" alt="${post.title}">
    <p>${post.content}</p>
    <button id="edit-btn">✏️ Edit</button>
    <button id="delete-btn" class="delete-btn">🗑️ Delete</button>
  `;

  document.getElementById('edit-btn').addEventListener('click', () => {
    document.getElementById('edit-title').value = post.title;
    document.getElementById('edit-content').value = post.content;
    document.getElementById('edit-post-form').classList.remove('hidden');
  });

  document.getElementById('delete-btn').addEventListener('click', () => {
    deletePost(post.id);
  });
}

function addNewPostListener() {
  const form = document.getElementById('new-post-form');
  form.addEventListener('submit', e => {
    e.preventDefault();

    const title = document.getElementById('new-title').value;
    const author = document.getElementById('new-author').value;
    const image = document.getElementById('new-image').value;
    const content = document.getElementById('new-content').value;

    const newPost = {
      title,
      author,
      image,
      content,
      date: new Date().toISOString().split('T')[0]
    };

    fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPost)
    })
    .then(res => res.json())
    .then(() => {
      form.reset();
      displayPosts();
    });
  });
}

function addEditPostListener() {
  const editForm = document.getElementById('edit-post-form');

  editForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!currentPost) return;

    const updatedPost = {
      ...currentPost,
      title: document.getElementById('edit-title').value,
      content: document.getElementById('edit-content').value
    };

    fetch(`${BASE_URL}/${currentPost.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPost)
    })
    .then(res => res.json())
    .then(post => {
      currentPost = post;
      renderPostDetail(post);
      document.getElementById('edit-post-form').classList.add('hidden');
      displayPosts();
    });
  });

  document.getElementById('cancel-edit').addEventListener('click', () => {
    editForm.classList.add('hidden');
  });
}

function deletePost(id) {
  fetch(`${BASE_URL}/${id}`, {
    method: 'DELETE'
  })
  .then(() => {
    document.getElementById('post-detail').innerHTML = `<h2>Select a post to view details</h2>`;
    displayPosts();
  });
}

document.addEventListener('DOMContentLoaded', main);
