import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


const SUPABASE_URL = "https://jlvcgwbjgdnmtqdwiwgp.supabase.co";

const SUPABASE_KEY = "sb_publishable_92EM6fOxHQLOKq5o8ik1_Q_9XIA84d1";


const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


console.log("ClassLink connected to Supabase!");


// SIGN UP

const signupForm = document.getElementById("signupForm");

if (signupForm) {

    signupForm.addEventListener("submit", async function(event) {

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


        message.textContent = "Creating account...";


        // Create authentication account

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

    });

}

// LOGIN

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function(event) {

        event.preventDefault();


        const email =
            document.getElementById("loginEmail").value.trim();

        const password =
            document.getElementById("loginPassword").value;

        const message =
            document.getElementById("loginMessage");


        message.textContent = "Logging in...";


        const { data, error } =
            await supabase.auth.signInWithPassword({

                email: email,

                password: password

            });


        if (error) {

            console.error(error);

            message.textContent =
                "Login failed: " + error.message;

            return;

        }


        // Get the user's profile

        const { data: profile, error: profileError } =
            await supabase
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


        // Send user to the correct dashboard

        if (profile.role === "lecturer") {

            window.location.href =
                "lecturer-dashboard.html";

        } else if (profile.role === "student") {

            window.location.href =
                "student-dashboard.html";

        }

    });

}