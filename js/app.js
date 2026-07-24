document.addEventListener("DOMContentLoaded", () => {

    loadTrendingMovies();

});

async function loadTrendingMovies() {

    const movies = await getTrendingMovies();

    displayMovies(movies, "trendingMovies");

}

function displayMovies(movies, searchResults){

    const container = document.getElementById(searchResults);

    container.innerHTML = "";

    movies.forEach(movie=>{

        const card=document.createElement("div");

        card.className="movie-card";

        card.innerHTML=`

        <div class="movie-poster">

            <img src="${IMAGE_BASE_URL+movie.poster_path}">

        </div>

        <div class="movie-info">

            <h3 class="movie-title">${movie.title}</h3>

            <div class="movie-meta">

                <span>⭐ ${movie.vote_average.toFixed(1)}</span>

                <span>${movie.release_date}</span>

            </div>

            <div class="card-buttons">

                <button class="watch-btn">

                    ❤️ Watch Later

                </button>

                <button class="trailer-btn">

                    ▶

                </button>

            </div>

        </div>

        `;

        card.querySelector(".watch-btn").addEventListener("click",()=>{

            addToWatchlist(movie);

        });

        card.querySelector(".trailer-btn").addEventListener("click",()=>{

            watchTrailer(movie.id);

        });

        container.appendChild(card);

    });

}

// =========================
// Search
// =========================

const searchBtn = document.getElementById("searchBtn");

const searchInput = document.getElementById("searchInput");

searchBtn.addEventListener("click", doSearch);

searchInput.addEventListener("keypress", function(e){

    if(e.key==="Enter"){

        doSearch();

    }

});

async function doSearch() {

    const query = searchInput.value.trim();

    if (query === "") return;

    const movies = await searchMovies(query);

    // Show search section
    document.getElementById("searchSection").style.display = "block";

    // Display movies
    displayMovies(movies, "searchResults");

    // Scroll to search results
    document.getElementById("searchSection").scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

}

// =========================
// Trailer
// =========================

async function watchTrailer(id){

    const trailer = await getTrailer(id);

    if(!trailer){

        alert("Trailer not available");

        return;

    }

    const modal = document.getElementById("trailerModal");

    const player = document.getElementById("youtubePlayer");

    player.src = `https://www.youtube.com/embed/${trailer.key}`;

    modal.classList.add("active");

}

document.getElementById("closeModal").onclick = ()=>{

    document.getElementById("trailerModal").classList.remove("active");

    document.getElementById("youtubePlayer").src="";

};

// =========================
// Watch Later
// =========================

function addToWatchlist(movie) {

    let watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

    if (watchlist.some(item => item.id === movie.id)) {
        alert("Already Added");
        return;
    }

    watchlist.push(movie);

    localStorage.setItem("watchlist", JSON.stringify(watchlist));

    alert("Added to Watch Later ❤️");
}

// =========================
// Dark Mode
// =========================

const themeBtn=document.getElementById("themeBtn");

themeBtn.onclick=()=>{

    document.body.classList.toggle("light");

};


// =========================
// Scroll Button
// =========================

const scrollBtn=document.getElementById("scrollTop");

window.addEventListener("scroll",()=>{

    if(window.scrollY>500){

        scrollBtn.classList.add("show");

    }

    else{

        scrollBtn.classList.remove("show");

    }

});

scrollBtn.onclick=()=>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

};