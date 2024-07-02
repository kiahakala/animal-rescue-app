const baseUrl = "http://localhost:10000";

document.addEventListener("DOMContentLoaded", () => {
  const map = L.map("map").setView([51.505, -0.09], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    map.setView([latitude, longitude], 13);
  });

  fetchUsers();

  fetchPosts();

  async function fetchUsers() {
    try {
      const response = await fetch(`${baseUrl}/users`);
      const users = await response.json();
      console.log(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  async function fetchPosts() {
    try {
      const response = await fetch(`${baseUrl}/posts`);
      const posts = await response.json();
      displayPosts(posts);
      console.log(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  function displayPosts(posts) {
    const postsContainer = document.getElementById("posts");
    postsContainer.innerHTML = "";

    const bounds = [];

    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");
      postElement.innerHTML = `
				<h3>${post.title}</h3>
				<p>${post.description}</p>
				<p>Location: ${post.location}</p>
			`;
      postsContainer.appendChild(postElement);

      console.log(post.latitude, post.longitude);

      let marker = L.marker([post.latitude, post.longitude]).addTo(map);

      console.log(marker);

      marker.bindPopup(`
					<h3>${post.title}</h3>
					<p>${post.description}</p>
					<p>Location: ${post.location}</p>
				`);

      bounds.push([post.latitude, post.longitude]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds);
    }
  }

  // Handle login
  document.getElementById("login").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "block";
  });

  document.getElementById("loginButton").addEventListener("click", async () => {
    const name = document.getElementById("loginName").value;
    const password = document.getElementById("loginPassword").value;

    try {
      const data = { name, password };
      const response = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const user = await response.json();

      console.log(user);

      if (user.token) {
        localStorage.setItem("token", user.token);
        alert("Login successful!");
        document.getElementById("loginModal").style.display = "none";
      } else {
        alert("Login failed!");
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  });

  // Handle register

  document.getElementById("register").addEventListener("click", () => {
    document.getElementById("registerModal").style.display = "block";
  });

  document
    .getElementById("registerButton")
    .addEventListener("click", async () => {
      const name = document.getElementById("registerName").value;
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      const location = document.getElementById("registerLocation").value;
      const role = document.getElementById("registerRole");

      console.log(role.value);

      try {
        const response = await fetch(`${baseUrl}/users`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            email,
            password,
            location,
            role: role.value,
          }),
        });

        const data = await response.json();

        console.log(data);
      } catch (error) {
        console.error("Error logging in:", error);
      }
    });

  // Close modals
  const closeButtons = document.querySelectorAll(".closeButton");
  closeButtons.forEach((closeButton) => {
    closeButton.addEventListener("click", () => {
      document.getElementById("loginModal").style.display = "none";
      document.getElementById("registerModal").style.display = "none";
    });
  });
});
