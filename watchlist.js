// =========================================
// MovieVault
// watchlist.js
// Part 1 - Load & Display Watchlist
// =========================================


// ===============================
// DOM Elements
// ===============================

const watchlistContainer = document.getElementById("watchlistContainer");
const emptyState = document.getElementById("emptyState");


// ===============================
// Load Page
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    loadWatchlist();

});


// ===============================
// Get Watchlist From Local Storage
// ===============================

function getWatchlist() {

    return JSON.parse(localStorage.getItem("watchlist")) || [];

}


// ===============================
// Load Watchlist
// ===============================

function loadWatchlist() {

    const movies = getWatchlist();
    console.log(movies);

    watchlistContainer.innerHTML = "";

    if (movies.length === 0) {

        emptyState.style.display = "block";

        return;

    }

    emptyState.style.display = "none";

    movies.forEach(movie => {

        createMovieCard(movie);

    });

}


// ===============================
// Create Movie Card
// ===============================

function createMovieCard(movie) {

    const card = document.createElement("div");

    card.className = "movie-card";

    card.innerHTML = `

        <div class="movie-poster">

            <img
                src="${IMAGE_BASE_URL + movie.poster_path}"
                alt="${movie.title}">

            <span class="badge">

                ⭐ ${movie.vote_average.toFixed(1)}

            </span>

        </div>

        <div class="movie-info">

            <h3 class="movie-title">

                ${movie.title}

            </h3>

            <div class="movie-meta">

                <span>

                    📅 ${movie.release_date}

                </span>

            </div>

            <div class="card-buttons">

                <button
                    class="watch-btn remove-btn"
                    data-id="${movie.id}">

                    <i class="fa-solid fa-trash"></i>

                    Remove

                </button>

                <button
                    class="trailer-btn play-btn"
                    data-id="${movie.id}">

                    <i class="fa-solid fa-play"></i>

                </button>

            </div>

        </div>

    `;

    watchlistContainer.appendChild(card);

}


// =========================================
// MovieVault
// watchlist.js
// Part 2 - Remove + Clear + Trailer
// =========================================


// ===============================
// Event Delegation
// ===============================

watchlistContainer.addEventListener("click", async (e) => {

    // Remove Movie
    if (e.target.closest(".remove-btn")) {

        const id = Number(
            e.target.closest(".remove-btn").dataset.id
        );

        removeMovie(id);

    }

    // Play Trailer
    if (e.target.closest(".play-btn")) {

        const id = Number(
            e.target.closest(".play-btn").dataset.id
        );

        playTrailer(id);

    }

});


// ===============================
// Remove Movie
// ===============================

function removeMovie(id) {

    let movies = getWatchlist();

    movies = movies.filter(movie => movie.id !== id);

    localStorage.setItem(
        "watchlist",
        JSON.stringify(movies)
    );

    loadWatchlist();

}


// ===============================
// Clear Watchlist
// ===============================

const clearBtn = document.getElementById("clearWatchlist");

clearBtn.addEventListener("click", () => {

    const confirmDelete = confirm(
        "Are you sure you want to remove all movies?"
    );

    if (!confirmDelete) return;

    localStorage.removeItem("watchlist");

    loadWatchlist();

});


// ===============================
// Play Trailer
// ===============================

async function playTrailer(movieId) {

    const trailer = await getTrailer(movieId);

    if (!trailer) {

        alert("Trailer not available.");

        return;

    }

    const modal = document.getElementById("trailerModal");

    const player = document.getElementById("youtubePlayer");

    player.src =
        `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;

    modal.classList.add("active");

}


// ===============================
// Close Modal
// ===============================

const closeModal = document.getElementById("closeModal");

closeModal.addEventListener("click", () => {

    closeTrailer();

});


document.getElementById("trailerModal").addEventListener("click", (e) => {

    if (e.target.id === "trailerModal") {

        closeTrailer();

    }

});


function closeTrailer() {

    const modal = document.getElementById("trailerModal");

    const player = document.getElementById("youtubePlayer");

    player.src = "";

    modal.classList.remove("active");

}



// =========================================
// MovieVault
// watchlist.js
// Part 3 - Theme + Scroll + Movie Counter
// =========================================


// ===============================
// Theme (Dark / Light)
// ===============================

const themeBtn = document.getElementById("themeBtn");

// Load saved theme
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {

    document.body.classList.add("light");

    themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';

} else {

    themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';

}

// Toggle theme
themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light");

    if (document.body.classList.contains("light")) {

        localStorage.setItem("theme", "light");

        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';

    } else {

        localStorage.setItem("theme", "dark");

        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';

    }

});


// ===============================
// Scroll To Top Button
// ===============================

const scrollBtn = document.getElementById("scrollTop");

window.addEventListener("scroll", () => {

    if (window.scrollY > 300) {

        scrollBtn.classList.add("show");

    } else {

        scrollBtn.classList.remove("show");

    }

});

scrollBtn.addEventListener("click", () => {

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

});


// ===============================
// ESC Key Closes Trailer
// ===============================

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        closeTrailer();

    }

});


// ===============================
// Movie Counter
// ===============================

function updateMovieCount() {

    const movies = getWatchlist();

    const heading = document.querySelector(".section-header h2");

    heading.textContent = `Saved Movies (${movies.length})`;

}

// Update count when page loads
updateMovieCount();


// ===============================
// Update Counter After Changes
// ===============================

// Keep original loadWatchlist
const originalLoadWatchlist = loadWatchlist;

// Replace with updated version
loadWatchlist = function () {

    originalLoadWatchlist();

    updateMovieCount();

};


// ===============================
// Success Message
// ===============================

console.log("🎬 MovieVault Watchlist Loaded Successfully!");