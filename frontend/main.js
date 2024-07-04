const baseUrl = "http://localhost:10000";

document.addEventListener("DOMContentLoaded", () => {
  let creatingPost = false;
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

  if (localStorage.getItem("token")) {
    console.log("Token found in local storage");
    document.getElementById("logout").style.display = "block";
    document.getElementById("profile").style.display = "block";
    document.getElementById("createPost").style.display = "block";
    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "none";
    fetchPosts();
  }

  // Get users
  async function fetchUsers() {
    try {
      const response = await fetch(`${baseUrl}/users`);
      const users = await response.json();
      console.log(users);
      createProfileLinks(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  // Save user id as query parameter

  function createProfileLinks(users) {
    const profileLink = document.getElementById("profile");

    users.forEach((user) => {
      profileLink.href = `?id=${user.id}`;
      console.log(profileLink.href);
    });
  }

  // Get id as query parameter

  function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams);
    return urlParams.get(param);
  }

  // Get posts
  async function fetchPosts() {
    try {
      const response = await fetch(`${baseUrl}/posts`);
      const posts = await response.json();
      displayPosts(posts);
      console.log(posts.map((post) => post.user));
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  // Show posts
  function displayPosts(posts) {
    const postsContainer = document.getElementById("posts");
    postsContainer.innerHTML = "";

    const userPostsContainer = document.getElementById("userPosts");
    userPostsContainer.innerHTML = "";

    const bounds = [];

    const id = getQueryParam("id");
    console.log(id);

    // Filter posts to include only those that belong to the user with the specified ID
    const userPosts = posts.filter((post) => post.user.id === id);

    userPosts.forEach((post) => {
      const userPostElement = document.createElement("div");
      userPostElement.classList.add("post");
      userPostElement.innerHTML = `
            <h3>${post.title}</h3>
            <p>${post.description}</p>
						<p>Posted: ${post.timestamp}</p>`;

      userPostsContainer.appendChild(userPostElement);
    });

    posts.forEach((post) => {
      const postElement = document.createElement("div");
      postElement.classList.add("post");
      postElement.innerHTML = `
				<h3>${post.title}</h3>
				<p>${post.description}</p>
				<p>Posted: ${post.timestamp}</p>
			`;
      postsContainer.appendChild(postElement);

      let marker = L.marker([post.latitude, post.longitude]).addTo(map);

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
    if (document.getElementById("registerModal").style.display === "block") {
      document.getElementById("registerModal").style.display = "none";
    }
    document.getElementById("loginModal").style.display = "block";
  });

  document.getElementById("loginButton").addEventListener("click", async () => {
    const name = document.getElementById("loginName").value;
    const password = document.getElementById("loginPassword").value;
    const logout = document.getElementById("logout");
    const profile = document.getElementById("profile");
    const createPost = document.getElementById("createPost");
    const registration = document.getElementById("register");

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

      if (user.token) {
        localStorage.setItem("token", user.token);
        alert("Login successful!");
        document.getElementById("loginModal").style.display = "none";
        document.getElementById("login").style.display = "none";

        logout.style.display = "block";
        profile.style.display = "block";
        createPost.style.display = "block";
        registration.style.display = "none";

        fetchPosts();

        setTimeout(() => {
          localStorage.removeItem("token");
          logout.style.display = "none";
          profile.style.display = "none";
          createPost.style.display = "none";
          registration.style.display = "block";
          document.getElementById("login").style.display = "block";
          alert("Session expired, please login again!");
        }, 1000 * 60 * 60); // 1 hour
      } else {
        alert("Login failed!");
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  });

  // Handle registration

  document.getElementById("register").addEventListener("click", (e) => {
    e.preventDefault();
    if (document.getElementById("loginModal").style.display === "block") {
      document.getElementById("loginModal").style.display = "none";
    }
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
        document.getElementById("registerModal").style.display = "none";
        document.getElementById("register").style.display = "none";

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
			document.getElementById("profileModal").style.display = "none";
    });
  });

  // Handle logout

  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    document.getElementById("logout").style.display = "none";
    document.getElementById("profile").style.display = "none";
    document.getElementById("createPost").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.getElementById("register").style.display = "block";
    alert("Logged out!");
  });

  // Handle create post

  let latitude = 0;
  let longitude = 0;
  let newMarker = {};

  document.getElementById("createPost").addEventListener("click", () => {
    document.getElementById("postForm").style.display = "block";
    creatingPost = true;
    updateMapClickListener();
  });

  function updateMapClickListener() {
    if (creatingPost) {
      map.on("click", onMapClick); // Attach the event listener if creatingPost is true
    } else {
      map.off("click", onMapClick); // Remove the event listener if creatingPost is false
    }
  }

  function onMapClick(e) {
    marker = new L.marker(e.latlng, { draggable: "true" });
    marker.on("dragend", function (event) {
      let marker = event.target;
      let position = marker.getLatLng();
      marker.setLatLng(new L.LatLng(position.lat, position.lng), {
        draggable: "true",
      });
      map.panTo(new L.LatLng(position.lat, position.lng));
      latitude = marker.getLatLng().lat;
      longitude = marker.getLatLng().lng;
    });
    map.addLayer(marker);
  }

  const cancelPost = document.getElementById("cancelPost");

  cancelPost.addEventListener("click", () => {
    document.getElementById("postForm").style.display = "none";
    map.removeLayer(newMarker);
  });

  document.getElementById("postButton").addEventListener("click", async (e) => {
    e.preventDefault();
    const title = document.getElementById("postTitle").value;
    const description = document.getElementById("postDescription").value;
    const timestamp = new Date().toISOString();
    const token = localStorage.getItem("token");

    latitude = latitude.toString();
    longitude = longitude.toString();

    console.log(latitude, longitude);
    console.log(timestamp);

    try {
      const data = { title, description, latitude, longitude, timestamp };
      const response = await fetch(`${baseUrl}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const newPost = await response.json();
      document.getElementById("postForm").style.display = "none";
      console.log(newPost);
    } catch (error) {
      console.error("Error creating post:", error);
    }
    creatingPost = false;
    fetchPosts();
  });

  // Handle profile

  document.getElementById("profile").addEventListener("click", async (e) => {
    e.preventDefault();
    document.getElementById("profileModal").style.display = "block";

    async function fetchUserById(userId) {
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${baseUrl}/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(userId);

        const user = await response.json();
        displayProfile(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }
    const userId = getQueryParam("id");
    if (userId) {
      fetchUserById(userId);
    } else {
      alert("No user ID specified");
    }
  });

  function displayProfile(user) {
    document.getElementById("profileName").value = user.name;
    document.getElementById("profileEmail").value = user.email;
    document.getElementById("profileLocation").value = user.location;
    document.getElementById("profileRole").value = user.role;
  }
});
