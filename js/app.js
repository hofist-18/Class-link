import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


// =====================================================
// SUPABASE CONNECTION
// =====================================================

const SUPABASE_URL =
    "https://jlvcgwbjgdnmtqdwiwgp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_92EM6fOxHQLOKq5o8ik1_Q_9XIA84d1";


export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


console.log("ClassLink connected to Supabase!");


// =====================================================
// SIGN UP
// =====================================================

const signupForm =
    document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const fullName =
                document.getElementById("fullName").value;

            const email =
                document.getElementById("email").value;

            const password =
                document.getElementById("password").value;

            const role =
                document.getElementById("role").value;

            const message =
                document.getElementById("message");

            message.textContent =
                "Creating account...";


            const { data, error } =
                await supabase.auth.signUp({

                    email: email,

                    password: password,

                    options: {
                        data: {
                            full_name: fullName,
                            role: role
                        }
                    }

                });


            if (error) {

                message.textContent =
                    "Error: " + error.message;

                return;
            }


            message.textContent =
                "Account created successfully!";

            signupForm.reset();

        }
    );
}


// =====================================================
// LOGIN
// =====================================================

const loginForm =
    document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;

            const message =
                document.getElementById(
                    "loginMessage"
                );

            message.textContent =
                "Logging in...";


            const { data, error } =
                await supabase.auth.signInWithPassword({

                    email: email,

                    password: password

                });


            if (error) {

                console.error(error);

                message.textContent =
                    "Login failed: " +
                    error.message;

                return;
            }


            // =================================================
            // GET USER PROFILE
            // =================================================

            const {
                data: profile,
                error: profileError
            } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", data.user.id)
                .single();


            if (profileError) {

                console.error(profileError);

                message.textContent =
                    "Could not load your profile.";

                return;
            }


            // =================================================
            // ROLE-BASED DASHBOARD ROUTING
            // =================================================

            if (profile.role === "university_admin") {

                window.location.href =
                    "university-admin-dashboard.html";

                return;
            }


            if (profile.role === "lecturer") {

                window.location.href =
                    "lecturer-dashboard.html";

                return;
            }


            if (profile.role === "student") {

                window.location.href =
                    "student-dashboard.html";

                return;
            }


            // =================================================
            // UNKNOWN ROLE
            // =================================================

            console.error(
                "Unknown user role:",
                profile.role
            );

            message.textContent =
                "Your account role is not configured. Please contact ClassLink support.";

        }
    );
}


// =====================================================
// HOME PAGE SIGNUP BUTTONS
// =====================================================

window.lecturerSignup = function() {

    window.location.href =
        "signup.html?role=lecturer";

};


window.studentSignup = function() {

    window.location.href =
        "signup.html?role=student";

};


// =====================================================
// LOGIN PASSWORD SHOW / HIDE
// =====================================================

const toggleLoginPassword =
    document.getElementById(
        "toggleLoginPassword"
    );

const loginPassword =
    document.getElementById(
        "loginPassword"
    );


if (
    toggleLoginPassword &&
    loginPassword
) {

    toggleLoginPassword.addEventListener(
        "click",
        function() {

            if (
                loginPassword.type ===
                "password"
            ) {

                loginPassword.type =
                    "text";

                toggleLoginPassword.textContent =
                    "🙈";

                toggleLoginPassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                loginPassword.type =
                    "password";

                toggleLoginPassword.textContent =
                    "👁️";

                toggleLoginPassword.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );
}


// =====================================================
// SIGN UP PASSWORD SHOW / HIDE
// =====================================================

const toggleSignupPassword =
    document.getElementById(
        "toggleSignupPassword"
    );

const signupPassword =
    document.getElementById(
        "password"
    );


if (
    toggleSignupPassword &&
    signupPassword
) {

    toggleSignupPassword.addEventListener(
        "click",
        function() {

            if (
                signupPassword.type ===
                "password"
            ) {

                signupPassword.type =
                    "text";

                toggleSignupPassword.textContent =
                    "🙈";

                toggleSignupPassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                signupPassword.type =
                    "password";

                toggleSignupPassword.textContent =
                    "👁️";

                toggleSignupPassword.setAttribute(
                    "aria-label",
                    "Show password"
                );

            }

        }
    );
}


// =====================================================
// COOKIE CONSENT
// =====================================================

const cookieBanner =
    document.getElementById(
        "cookieBanner"
    );

const acceptCookies =
    document.getElementById(
        "acceptCookies"
    );

const rejectCookies =
    document.getElementById(
        "rejectCookies"
    );


const cookieChoice =
    localStorage.getItem(
        "classlinkCookieConsent"
    );


if (
    cookieBanner &&
    !cookieChoice
) {

    cookieBanner.style.display =
        "block";
}


if (acceptCookies) {

    acceptCookies.addEventListener(
        "click",
        function() {

            localStorage.setItem(
                "classlinkCookieConsent",
                "accepted"
            );

            cookieBanner.style.display =
                "none";

        }
    );

}


if (rejectCookies) {

    rejectCookies.addEventListener(
        "click",
        function() {

            localStorage.setItem(
                "classlinkCookieConsent",
                "rejected"
            );

            cookieBanner.style.display =
                "none";

        }
    );

}