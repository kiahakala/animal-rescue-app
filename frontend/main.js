const baseUrl = "http://localhost:10000";

document.addEventListener("DOMContentLoaded", () => {
  let creatingPost = false;
  let editingPost = false;
  let postId = null;
  let markerLocation;
  let loginInterval;

  const postButton = document.getElementById("postButton");

  // Initialize the map
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

  // Check authentication for the right UI view
  if (localStorage.getItem("token")) {
    console.log("Token found in local storage");
    document.getElementById("logout").style.display = "flex";
    document.getElementById("profile").style.display = "flex";
    document.getElementById("createPost").style.display = "flex";
    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "none";
    fetchPosts();
    setupLoginInterval();
  }

  // Handle reverse geocoding
  async function fetchReverse(latitude, longitude) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2`
    );
    const data = await response.json();
    markerLocation = data.name;
    return markerLocation;
  }

  // Get users
  async function fetchUsers() {
    try {
      const response = await fetch(`${baseUrl}/users`);
      const users = await response.json();
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  // Get posts
  async function fetchPosts() {
    try {
      const response = await fetch(`${baseUrl}/posts`);
      const posts = await response.json();
      displayPosts(posts);
      // console.log(posts.map((post) => post.user));
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  }

  // ------------------------- POST SPECIFIC FUNCTIONS -------------------------

  // Show posts
  function displayPosts(posts) {
    ["posts", "userPosts"].forEach(
      (containerId) => (document.getElementById(containerId).innerHTML = "")
    );

    const bounds = [];
    const id = localStorage.getItem("userId");

    // Filter posts to include only those that belong to the user with the specified ID
    const userPosts = posts.filter((post) => post.user.id === id);

    userPosts.forEach(async (post) => {
      const date = new Date(post.timestamp);
      const userPostElement = document.createElement("div");
      let postAttr = document.createAttribute("id");
      postAttr.value = post.id;
      userPostElement.setAttributeNode(postAttr);
      userPostElement.classList.add("post");
      userPostElement.innerHTML = `
            <h3 id="userPostTitle">${post.title}</h3>
            <p id="userPostDesc">${post.description}</p>
						<p id="userPostDate">Julkaistu: ${date.toLocaleString("fi-FI")}</p>`;
      let postControls = document.createElement("div");
      let postControlsAttr = document.createAttribute("class");
      let delSpan = document.createElement("span");
      let editSpan = document.createElement("span");
      let delAttr = document.createAttribute("class");
      let editAttr = document.createAttribute("class");
      postControlsAttr.value = "postControls";
      delAttr.value = "delete";
      editAttr.value = "edit";
      postControls.setAttributeNode(postControlsAttr);
      delSpan.setAttributeNode(delAttr);
      editSpan.setAttributeNode(editAttr);
      let x = document.createTextNode("❌");
      let e = document.createTextNode("✏️");
      delSpan.appendChild(x);
      delSpan.addEventListener("click", () => {
        confirmDelete(post.id);
      });
      editSpan.appendChild(e);
      editSpan.addEventListener("click", () => {
        console.log(post.id);
        handlePostUpdate(post.id);
      });
      postControls.appendChild(delSpan);
      postControls.appendChild(editSpan);

      // Add coordinates to the user post element
      let locationElement = document.createElement("p");

      let coordinates = document.createElement("p");
      let lat = document.createElement("p");
      let lon = document.createElement("p");
      let postLocation = await fetchReverse(post.latitude, post.longitude);
      locationElement.innerHTML = `Sijainti: ${postLocation}`;
      coordinates.innerHTML = "Koordinaatit: ";
      lat.innerHTML = `${post.latitude}`;
      lon.innerHTML = `${post.longitude}`;

      [coordinates, lat, lon].forEach((el) => {
        el.style.display = "none";
      });

      const dataArray = [locationElement, coordinates, lat, lon];
      for (let i = 0; i < dataArray.length; i++) {
        userPostElement.appendChild(dataArray[i]);
      }

      // Add controls to the user post element
      userPostElement.appendChild(postControls);

      document.getElementById("userPosts").appendChild(userPostElement);
    });

    posts.forEach((post) => {
      const date = new Date(post.timestamp);
      const postElement = document.createElement("div");
      postElement.classList.add("post");
      postElement.innerHTML = `
				<h3 id="postedTitle">${post.title}</h3>
        <p id="postedDesc">${post.description}</p>
				<p id="postedDate">Julkaistu: ${date.toLocaleString("fi-FI")}</p>
			`;
      document.getElementById("posts").appendChild(postElement);

      // console.log(post);

      if (post.postStatus === "resolved") {
        postElement.style.backgroundColor = "#005357";
        postElement.style.color = "white";
        postElement.style.opacity = "0.4";
      } else if (post.postStatus === "open") {
        postElement.style.backgroundColor = "white";
      }

      // Set up markers and popups for each post
      async function setupMarker(post) {
        // Handle marker icon based on user role
        const icon = L.icon({
          iconUrl:
            post.user.role === "helper"
              ? "assets/pin-helper.png"
              : "assets/pin-animal.png",
          iconSize: [48, 48],
          iconAnchor: [24, 36],
          popupAnchor: [0, -40],
        });

        let marker = L.marker([post.latitude, post.longitude], {
          icon: icon,
        }).addTo(map);

        marker.bindPopup(`
					<h3>${post.title}</h3>
					<p>${post.description}</p>
					<a href="mailto:${post.user.email}">Lähetä viesti julkaisijalle</a>
				`);

        postElement.addEventListener("click", () => {
          marker.openPopup();
          map.panTo([post.latitude, post.longitude]);
          document.getElementById("map").scrollIntoView({ behavior: "smooth" });
        });
      }

      setupMarker(post);

      bounds.push([post.latitude, post.longitude]);
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds);
    }
  }

  // Handle create post
  let latitude = 0;
  let longitude = 0;
  let newMarker = {};
  const statusCheckBox = document.getElementById("status");
  let postStatus = statusCheckBox.checked ? "open" : "resolved";

  document.getElementById("createPost").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("postForm").style.display = "flex";
    document.getElementById("postFormTitle").textContent = "Luo ilmoitus";
    document.getElementById("postButton").textContent = "Lähetä";
    creatingPost = true;

    postButton.removeEventListener("click", onUpdate);
    postButton.addEventListener("click", onCreate);

    updateMapClickListener();
  });

  function onCreate(e) {
    e.preventDefault();
    createPost();
  }

  function updateMapClickListener() {
    creatingPost || editingPost
      ? map.on("click", onMapClick)
      : map.off("click", onMapClick);
  }

  function onMapClick(e) {
    const userRole = localStorage.getItem("role");
    const iconUrl =
      userRole === "helper" ? "assets/pin-helper.png" : "assets/pin-animal.png";
    const icon = L.icon({
      iconUrl,
      iconSize: [48, 48],
      iconAnchor: [24, 36],
      popupAnchor: [0, -60],
    });

    newMarker = new L.marker(e.latlng, { icon: icon, draggable: "true" });
    latitude = newMarker.getLatLng().lat;
    longitude = newMarker.getLatLng().lng;
    document.getElementById("postCoords").value = `${latitude}, ${longitude}`;
    newMarker.on("dragend", function (event) {
      let marker = event.target;
      let position = marker.getLatLng();
      marker.setLatLng(new L.LatLng(position.lat, position.lng), {
        icon: icon,
        draggable: "true",
      });
      map.panTo(new L.LatLng(position.lat, position.lng));
      latitude = marker.getLatLng().lat;
      longitude = marker.getLatLng().lng;
      document.getElementById("postCoords").value = `${latitude}, ${longitude}`;
    });

    map.addLayer(newMarker);
  }

  statusCheckBox.addEventListener("change", () => {
    postStatus = statusCheckBox.checked ? "open" : "resolved";
  });

  async function createPost() {
    const title = document.getElementById("postTitle").value;
    const description = document.getElementById("postDescription").value;
    const timestamp = new Date().toISOString();
    const token = localStorage.getItem("token");

    try {
      const data = {
        title,
        description,
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        timestamp,
        postStatus,
      };
      const response = await fetch(`${baseUrl}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const newPost = await response.json();
      resetPostForm();
      // console.log(newPost);
    } catch (error) {
      console.error("Error creating post:", error);
    }
    creatingPost = false;
    fetchPosts();
  }

  // Cancel post creation
  const cancelPost = document.getElementById("cancelPost");

  cancelPost.addEventListener("click", () => {
    resetPostForm();
    updateMapClickListener();
  });

  // Confirm post deletion
  function confirmDelete(id) {
    let confirmDelete = confirm("Haluatko varmasti poistaa ilmoituksen?");
    confirmDelete && removePost(id);
  }

  // Handle post deletion
  async function removePost(id) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${baseUrl}/posts/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    // Check if the response has content before parsing JSON
    if (response.status !== 204) {
      let responseJson = await response.json();
      console.log(responseJson);
    } else {
      alert("Post deleted successfully");
    }
    fetchPosts();
  }

  // Handle post update
  function handlePostUpdate(id) {
    editingPost = true;
    postId = id;

    document.getElementById("postForm").style.display = "flex";
    document.getElementById("profileModal").style.display = "none";
    document.getElementById("postFormTitle").textContent = "Muokkaa ilmoitusta";
    document.getElementById("postButton").textContent = "Tallenna muutokset";

    const post = document.getElementById(id);

    let title = post.childNodes[1].textContent;
    let description = post.childNodes[3].textContent;
    let postLocation = post.childNodes[6].textContent;
    let lat = post.childNodes[8].textContent;
    let lon = post.childNodes[9].textContent;
    let postStatus = document.getElementById("status");

    document.getElementById("postTitle").value = title;
    document.getElementById("postDescription").value = description;
    document.getElementById("postCoords").value = `${lat}, ${lon}`;

    postLocation = postLocation.split(": ")[1];
    postStatus = statusCheckBox.checked ? "open" : "resolved";

    postButton.removeEventListener("click", onCreate);
    postButton.addEventListener("click", onUpdate);

    updateMapClickListener();
  }

  function onUpdate(e) {
    e.preventDefault();
    updatePost(postId);
  }

  async function updatePost(id) {
    const title = document.getElementById("postTitle").value;
    const description = document.getElementById("postDescription").value;
    const latitude = document.getElementById("postCoords").value.split(",")[0];
    const longitude = document.getElementById("postCoords").value.split(",")[1];

    const timestamp = new Date().toISOString();
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("userId");

    try {
      const updatedData = {
        title,
        description,
        user,
        latitude,
        longitude,
        timestamp,
        postStatus,
      };

      const response = await fetch(`${baseUrl}/posts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      const updatedPost = await response.json();

      resetPostForm();
      // console.log(updatedPost);
    } catch (error) {
      console.error("Error updating post:", error);
    }
    editingPost = false;
    fetchPosts();
  }

  function resetPostForm() {
    const postForm = document.getElementById("postForm");
    postForm.style.display = "none";
    postForm.childNodes.forEach((el) => {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.value = "";
      }
    });
    map.removeLayer(newMarker);
    newMarker = {};
    creatingPost = false;
    editingPost = false;
  }

  // ------------------------- USER SPECIFIC FUNCTIONS -------------------------

  // Handle login
  // let userLoggedIn = false;

  document.getElementById("login").addEventListener("click", () => {
    if (document.getElementById("registerModal").style.display === "flex") {
      document.getElementById("registerModal").style.display = "none";
    }
    document.getElementById("loginModal").style.display = "flex";
  });

  document.getElementById("loginButton").addEventListener("click", async () => {
    const name = document.getElementById("loginName").value;
    const password = document.getElementById("loginPassword").value;
    const logout = document.getElementById("logout");
    const profile = document.getElementById("profile");
    const createPost = document.getElementById("createPost");
    const posts = document.getElementById("posts");

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
        //userLoggedIn = true;
        localStorage.setItem("token", user.token);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("exp", user.decodedToken.exp);
        localStorage.setItem("role", user.role);
        alert("Login successful!");

        ["loginModal", "login", "register"].forEach((el) => {
          document.getElementById(el).style.display = "none";
        });

        [logout, profile, createPost, posts].forEach((el) => {
          el.style.display = "flex";
        });

        setupLoginInterval();
        fetchPosts();
      } else {
        alert("Login failed!");
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  });

  // Function to check if the token is expired
  function isTokenExpired() {
    const expiration = localStorage.getItem("exp");
    if (!expiration) return true;

    const now = Math.floor(Date.now() / 1000); // Convert from milliseconds to seconds
    return now > expiration;
  }

  function setupLoginInterval() {
    // Define the interval and assign it to loginInterval
    clearInterval(loginInterval);
    loginInterval = setInterval(loginTimer, 60000);
  }

  function loginTimer() {
    console.log("Checking token expiration");
    if (isTokenExpired() && localStorage.getItem("token")) {
      logoutUser();
      clearInterval(loginInterval);
    }
  }

  // Function to log the user out
  function logoutUser() {
    ["token", "userId", "exp", "role"].forEach((item) => {
      localStorage.removeItem(item);
    });
    ["logout", "profile", "createPost", "posts"].forEach((el) => {
      document.getElementById(el).style.display = "none";
    });
    document.getElementById("login").style.display = "flex";
    document.getElementById("register").style.display = "flex";
    if (document.getElementById("profileModal").style.display === "flex") {
      document.getElementById("profileModal").style.display = "none";
    }
    alert("Logged out!");
  }

  document.getElementById("logout").addEventListener("click", () => {
    logoutUser();
    clearInterval(loginInterval);
  });

  // Handle registration
  document.getElementById("register").addEventListener("click", (e) => {
    e.preventDefault();
    if (document.getElementById("loginModal").style.display === "flex") {
      document.getElementById("loginModal").style.display = "none";
    }
    document.getElementById("registerModal").style.display = "flex";
  });

  document
    .getElementById("registerButton")
    .addEventListener("click", async () => {
      const name = document.getElementById("registerName").value;
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      const location = document.getElementById("registerLocation").value;
      const role = document.getElementById("registerRole");

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

  // Handle profile
  document.getElementById("profile").addEventListener("click", async (e) => {
    e.preventDefault();
    document.getElementById("profileModal").style.display = "flex";

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

        const user = await response.json();
        displayProfile(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }

    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchUserById(userId);
    } else {
      alert("No user ID specified");
    }
  });

  function displayProfile(user) {
    Object.keys(user).forEach((key) => {
      let element = document.getElementById(
        `profile${key.charAt(0).toUpperCase() + key.slice(1)}`
      );
      if (element) {
        element.value = key === "password" ? "" : user[key];
      }
    });

    // Update user profile
    const profileButton = document.getElementById("profileButton");

    profileButton.addEventListener("click", async (e) => {
      e.preventDefault();
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      const savedRole = localStorage.getItem("role");

      const name = document.getElementById("profileName").value;
      const email = document.getElementById("profileEmail").value;
      const password = document.getElementById("profilePassword").value;
      const location = document.getElementById("profileLocation").value;
      const role = document.getElementById("profileRole").value;

      try {
        const response = await fetch(`${baseUrl}/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            password,
            location,
            role,
          }),
        });

        const updatedUser = await response.json();

        if (updatedUser.error) {
          alert(updatedUser.error);
        }

        if (updatedUser.role !== savedRole) {
          localStorage.removeItem("role");
          localStorage.setItem("role", updatedUser.role);
        }
        document.getElementById("profileModal").style.display = "none";
      } catch (error) {
        console.error("Error updating user:", error);
      }
    });
  }

  // Close modals
  const closeButtons = document.querySelectorAll(".closeButton");
  closeButtons.forEach((closeButton) => {
    closeButton.addEventListener("click", () => {
      ["loginModal", "registerModal", "profileModal", "infoModal"].forEach(
        (modalId) => (document.getElementById(modalId).style.display = "none")
      );
    });
  });

  // Handle info modal
  document.getElementById("info").addEventListener("click", () => {
    document.getElementById("infoModal").style.display = "flex";
  });
});
