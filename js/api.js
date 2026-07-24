// ==============================
// TMDB Configuration
// ==============================

const API_KEY = "18e5aa99c4f8ceca0fe4c3ac86e6b382";

const BASE_URL = "https://api.themoviedb.org/3";

const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";


// ==============================
// Get Trending Movies
// ==============================

async function getTrendingMovies() {

    try {

        const response = await fetch(
            `${BASE_URL}/trending/movie/week?api_key=${API_KEY}`
        );

        const data = await response.json();

        return data.results;

    }

    catch (error) {

        console.error("Trending Error:", error);

        return [];

    }

}


// ==============================
// Search Movies
// ==============================

async function searchMovies(query) {

    try {

        const response = await fetch(
            `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
        );

        const data = await response.json();

        return data.results;

    }

    catch (error) {

        console.error(error);

        return [];

    }

}


// ==============================
// Get Trailer
// ==============================

async function getTrailer(movieId) {

    try {

        const response = await fetch(
            `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
        );

        const data = await response.json();

        const trailer = data.results.find(video =>
            video.site === "YouTube" &&
            video.type === "Trailer"
        );

        return trailer;

    }

    catch (error) {

        console.log(error);

        return null;

    }

}