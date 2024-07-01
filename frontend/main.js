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

  fetchPosts();

  async function fetchPosts() {
    try {
      // const response = await fetch(`${baseUrl}/posts/nearby?latitude=${latitude}&longitude=${longitude}&distance=10`);

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

				if (bounds.length > 0) {
					map.fitBounds(bounds);
				}
      
    });
  }
});

// const map = L.map("map").setView([51.505, -0.09], 13);

// let marker = L.marker([51.5, -0.09]).addTo(map);

// let popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(map);
// }

// map.on('click', onMapClick);
