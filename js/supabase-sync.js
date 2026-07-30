// =========================================
// MovieVault Add-on Layer
// js/supabase-sync.js
// =========================================

// 1. Initialize Supabase Client
const SUPABASE_URL = "https://qoxnkivrnpnjkukoeibk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_8ckoUtOdPCbpr_qe5U-jJg_O_XRpQAZ";

// Reference global window object SDK explicitly to avoid naming collisions
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUser = null;

// 2. Inject Auth Button into current Navbar UI
function injectAuthUI() {
    const navRight = document.querySelector(".nav-right");
    if (!navRight) return;

    const authContainer = document.createElement("div");
    authContainer.style.display = "inline-flex";
    authContainer.style.gap = "10px";
    authContainer.style.alignItems = "center";
    authContainer.style.marginRight = "15px";

    authContainer.innerHTML = `
        <button id="authActionBtn" style="padding: 10px 18px; border-radius: 30px; border: none; font-weight: 600; cursor: pointer; background: var(--primary); color: white; transition: .3s;">
            Login / Signup
        </button>
        <span id="userDisplay" style="font-size: 13px; color: var(--text-light); max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"></span>
    `;

    navRight.insertBefore(authContainer, navRight.firstChild);

    document.getElementById("authActionBtn").addEventListener("click", handleAuthAction);
}

// 3. Handle Auth UI Interaction via Custom Modal
  function handleAuthAction() {
    if (currentUser) {
        supabaseClient.auth.signOut().then(() => {
            alert("Logged out successfully!");
            localStorage.removeItem("watchlist");
            window.location.reload();
        });
        return;
    }

    // Check if modal already exists on page, if not create it
    let modal = document.getElementById("customAuthModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "customAuthModal";
        modal.className = "auth-modal";
        modal.innerHTML = `
            <div class="auth-box">
                <button class="close-btn" id="closeAuthModal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: var(--text); cursor: pointer; font-size: 16px;"><i class="fa-solid fa-xmark"></i></button>
                <h3 id="authModalTitle">Sign In</h3>
                <div class="auth-form-group">
                    <label>Email Address</label>
                    <input type="email" id="authEmail" class="auth-input" placeholder="name@example.com">
                </div>
                <div class="auth-form-group">
                    <label>Password</label>
                    <input type="password" id="authPassword" class="auth-input" placeholder="••••••••">
                </div>
                <button id="authSubmit" class="auth-submit-btn">Sign In</button>
                <div id="authToggle" class="auth-toggle-mode">Don't have an account? <span>Sign Up</span></div>
            </div>
        `;
        document.body.appendChild(modal);

        // Track modal visual toggle state variable
        let isSignUpMode = false;

        const toggleBtn = document.getElementById("authToggle");
        const title = document.getElementById("authModalTitle");
        const submitBtn = document.getElementById("authSubmit");

        toggleBtn.addEventListener("click", () => {
            isSignUpMode = !isSignUpMode;
            title.textContent = isSignUpMode ? "Create Account" : "Sign In";
            submitBtn.textContent = isSignUpMode ? "Sign Up" : "Sign In";
            toggleBtn.innerHTML = isSignUpMode ? "Already have an account? <span>Sign In</span>" : "Don't have an account? <span>Sign Up</span>";
        });

        document.getElementById("closeAuthModal").addEventListener("click", () => modal.classList.remove("active"));
        modal.addEventListener("click", (e) => { if(e.target === modal) modal.classList.remove("active"); });

        submitBtn.addEventListener("click", async () => {
            const email = document.getElementById("authEmail").value.trim();
            const password = document.getElementById("authPassword").value;
            
            if(!email || !password) return alert("Please fill in all fields.");
            
            submitBtn.disabled = true;
            submitBtn.textContent = "Processing...";

            let result;
            if (isSignUpMode) {
                result = await supabaseClient.auth.signUp({ email, password });
            } else {
                result = await supabaseClient.auth.signInWithPassword({ email, password });
            }

            submitBtn.disabled = false;
            submitBtn.textContent = isSignUpMode ? "Sign Up" : "Sign In";

            if (result.error) {
                alert("Auth Error: " + result.error.message);
            } else {
                alert(isSignUpMode ? "Account registered successfully!" : "Logged in successfully!");
                window.location.reload();
            }
        });
    }

    modal.classList.add("active");
}

// 4. Update Auth Button Status based on State
function updateAuthUI(user) {
    currentUser = user;
    const btn = document.getElementById("authActionBtn");
    const display = document.getElementById("userDisplay");
    
    if (!btn) return;

    if (user) {
        btn.textContent = "Logout";
        btn.style.background = "#334155";
        display.textContent = user.email;
        // Pull database watchlist into localStorage on login
        syncDatabaseToLocal();
    } else {
        btn.textContent = "Login / Signup";
        btn.style.background = "var(--primary)";
        display.textContent = "";
    }
}

// 5. Database Synchronization Core Operations
async function syncLocalToDatabase() {
    if (!currentUser) return;
    const localMovies = JSON.parse(localStorage.getItem("watchlist")) || [];
    
    for (const movie of localMovies) {
        await supabaseClient.from("watchlist").upsert({
            user_id: currentUser.id,
            movie_id: movie.id,
            movie_data: movie
        }, { onConflict: "user_id,movie_id" });
    }
}

async function syncDatabaseToLocal() {
    if (!currentUser) return;
    const { data, error } = await supabaseClient
        .from("watchlist")
        .select("movie_data")
        .eq("user_id", currentUser.id);

    if (!error && data) {
        const remoteMovies = data.map(item => item.movie_data);
        localStorage.setItem("watchlist", JSON.stringify(remoteMovies));
        
        // If we are on the watchlist view, run the UI reload function safely
        if (typeof loadWatchlist === "function") {
            loadWatchlist();
        }
    }
}

async function removeRemoteMovie(movieId) {
    if (!currentUser) return;
    await supabaseClient.from("watchlist").delete().eq("user_id", currentUser.id).eq("movie_id", movieId);
}

async function clearRemoteWatchlist() {
    if (!currentUser) return;
    await supabaseClient.from("watchlist").delete().eq("user_id", currentUser.id);
}

// 6. Monkey-Patching localStorage to Intercept Mutations
function initLocalStorageInterceptor() {
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.setItem = function (key, value) {
        originalSetItem.apply(this, arguments);
        if (key === "watchlist") {
            syncLocalToDatabase();
        }
    };

    localStorage.removeItem = function (key) {
        originalRemoveItem.apply(this, arguments);
        if (key === "watchlist") {
            clearRemoteWatchlist();
        }
    };
    
    // Intercept removals specific to single items
    const originalRemoveMovie = window.removeMovie;
    if (typeof originalRemoveMovie === "function") {
        window.removeMovie = function(id) {
            removeRemoteMovie(id);
            originalRemoveMovie.apply(this, arguments);
        };
    }
}

// 7. Initial App Boot Routine
document.addEventListener("DOMContentLoaded", async () => {
    injectAuthUI();
    initLocalStorageInterceptor();

    // Listen to real-time session changes from Supabase Auth
    supabaseClient.auth.onAuthStateChange((event, session) => {
        const user = session ? session.user : null;
        updateAuthUI(user);
    });
});