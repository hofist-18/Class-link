// =====================================================
// SHARED SUPABASE CONNECTION
// =====================================================

export { supabase } from "./supabase.js";

import { supabase } from "./supabase.js";

console.log("ClassLink connected to Supabase!");

// =====================================================
// READ CLASSLINK SYSTEM SETTINGS
// =====================================================

async function getPlatformSetting(settingKey) {

    const { data, error } = await supabase
        .from("system_settings")
        .select("setting_value")
        .eq("setting_key", settingKey)
        .maybeSingle();

    if (error) {

        console.error(
            "Could not load system setting:",
            settingKey,
            error
        );

        return null;
    }

    return data?.setting_value ?? null;
}


// =====================================================
// ENFORCE MAINTENANCE MODE FOR EXISTING SESSIONS
// =====================================================

async function enforceMaintenanceMode() {

    const maintenanceSetting =
        await getPlatformSetting("maintenance_mode");

    if (
        !maintenanceSetting ||
        maintenanceSetting.enabled !== true
    ) {
        return;
    }

    const {
        data: { session },
        error
    } = await supabase.auth.getSession();

    if (error || !session) {
        return;
    }

    const {
        data: profile,
        error: profileError
    } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

    if (profileError || !profile) {
        return;
    }

    if (profile.role === "super_admin") {
        return;
    }

    await supabase.auth.signOut();

    alert(
        "ClassLink is currently undergoing maintenance. Please try again later."
    );

    window.location.href = "login.html";
}


// Run maintenance check
if (
    document.getElementById("loginForm") ||
    document.getElementById("signupForm")
) {
    enforceMaintenanceMode();
}

// =====================================================
// AUTHENTICATION INITIALIZER
// =====================================================

export function initializeAuthForms() {

// =====================================================
// UNIVERSITY DROPDOWNS
// =====================================================

const signupUniversity =
    document.getElementById("university");

const loginUniversity =
    document.getElementById("loginUniversity");


// =====================================================
// LOAD UNIVERSITIES
// =====================================================

async function loadUniversities(selectElement) {

    if (!selectElement) {
        return;
    }

    // Show loading option

    selectElement.innerHTML = "";

    const loadingOption =
        document.createElement("option");

    loadingOption.value = "";

    loadingOption.textContent =
        "Loading universities...";

    selectElement.appendChild(
        loadingOption
    );

    try {

        // Get universities from Supabase

        const {
            data,
            error
        } = await supabase
            .from("universities")
            .select("id, name")
            .order(
                "name",
                {
                    ascending: true
                }
            );

        // Handle Supabase error

        if (error) {

            console.error(
                "University loading error:",
                error
            );

            selectElement.innerHTML = "";

            const errorOption =
                document.createElement("option");

            errorOption.value = "";

            errorOption.textContent =
                "Could not load universities";

            selectElement.appendChild(
                errorOption
            );

            return;
        }

        // Make sure universities exist

        if (
            !data ||
            data.length === 0
        ) {

            console.error(
                "No universities were returned from Supabase."
            );

            selectElement.innerHTML = "";

            const emptyOption =
                document.createElement("option");

            emptyOption.value = "";

            emptyOption.textContent =
                "No universities found";

            selectElement.appendChild(
                emptyOption
            );

            return;
        }

        // Clear dropdown

        selectElement.innerHTML = "";

        // Default option

        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";

        defaultOption.textContent =
            "Select your university / institution";

        selectElement.appendChild(
            defaultOption
        );

        // Add every university

        data.forEach(
            function(university) {

                const option =
                    document.createElement("option");

                option.value =
                    university.id;

                option.textContent =
                    university.name;

                selectElement.appendChild(
                    option
                );

            }
        );

        // =================================================
        // PRESELECT UNIVERSITY FROM HOMEPAGE
        // =================================================

        if (
            selectElement.id === "loginUniversity"
        ) {

            const urlParams =
                new URLSearchParams(
                    window.location.search
                );

            const selectedUniversity =
                urlParams.get("university");

            if (selectedUniversity) {

                selectElement.value =
                    selectedUniversity;

            }

        }

        console.log(
            "Universities loaded successfully:",
            data.length
        );

    } catch (error) {

        console.error(
            "Unexpected university loading error:",
            error
        );

        selectElement.innerHTML = "";

        const errorOption =
            document.createElement("option");

        errorOption.value = "";

        errorOption.textContent =
            "Could not load universities";

        selectElement.appendChild(
            errorOption
        );

    }

}


// =====================================================
// LOAD SIGNUP UNIVERSITIES
// =====================================================

if (signupUniversity) {

    loadUniversities(
        signupUniversity
    );

}


// =====================================================
// LOAD LOGIN UNIVERSITIES
// =====================================================

if (loginUniversity) {

    loadUniversities(
        loginUniversity
    );

}


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

            // =================================================
            // GET VALUES
            // =================================================

            const fullName =
                document
                    .getElementById("fullName")
                    .value
                    .trim();

            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("password")
                    .value;

            const role =
                document
                    .getElementById("role")
                    .value;

            const universityId =
                document
                    .getElementById("university")
                    .value;

            const message =
                document.getElementById("message");


            // =================================================
            // VALIDATION
            // =================================================

            if (!fullName) {

                message.textContent =
                    "Please enter your full name.";

                return;
            }

            if (!email) {

                message.textContent =
                    "Please enter your email.";

                return;
            }

            if (!universityId) {

                message.textContent =
                    "Please select your university.";

                return;
            }

            if (!role) {

                message.textContent =
                    "Please select your role.";

                return;
            }

            if (!password) {

                message.textContent =
                    "Please enter a password.";

                return;
            }

            if (password.length < 6) {

                message.textContent =
                    "Password must be at least 6 characters.";

                return;
            }


            // =================================================
            // CHECK WHETHER REGISTRATION IS ENABLED
            // =================================================

            const registrationSetting =
                await getPlatformSetting("registration");

            if (
                registrationSetting &&
                registrationSetting.enabled === false
            ) {

                message.textContent =
                    "New account registration is currently disabled. Please contact ClassLink support.";

                return;
            }


            // =================================================
            // CREATE ACCOUNT
            // =================================================

            message.textContent =
                "Creating account...";

            const {
                data,
                error
            } = await supabase.auth.signUp({

                email: email,

                password: password,

                options: {

                    data: {

                        full_name: fullName,

                        role: role,

                        university_id: universityId

                    }

                }

            });


            // =================================================
            // SIGNUP ERROR
            // =================================================

            if (error) {

                console.error(
                    "Signup error:",
                    error
                );

                message.textContent =
                    "Error: " + error.message;

                return;
            }


            // =================================================
            // SIGNUP SUCCESS
            // =================================================

            console.log(
                "Signup successful:",
                data
            );

            message.textContent =
                "Account created successfully!";

            signupForm.reset();

            // Reset university dropdown

            if (signupUniversity) {

                signupUniversity.value = "";

            }

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


            // =================================================
            // GET LOGIN VALUES
            // =================================================

            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();

            const password =
                document
                    .getElementById("loginPassword")
                    .value;

            const selectedUniversity =
                document
                    .getElementById("loginUniversity")
                    .value;

            const message =
                document.getElementById("loginMessage");


            // =================================================
            // VALIDATION
            // =================================================

            if (!selectedUniversity) {

                message.textContent =
                    "Please select your university / institution.";

                return;
            }

            if (!email) {

                message.textContent =
                    "Please enter your email.";

                return;
            }

            if (!password) {

                message.textContent =
                    "Please enter your password.";

                return;
            }


            // =================================================
            // LOGIN
            // =================================================

            message.textContent =
                "Logging in...";

            const {
                data,
                error
            } = await supabase.auth
                .signInWithPassword({

                    email: email,

                    password: password

                });


            // =================================================
            // LOGIN ERROR
            // =================================================

            if (error) {

                console.error(
                    "Login error:",
                    error
                );

                message.textContent =
                    "Login failed: " + error.message;

                return;
            }


            // =================================================
            // GET PROFILE
            // =================================================

            const {
                data: profile,
                error: profileError
            } = await supabase
                .from("profiles")
                .select("role, university_id")
                .eq("id", data.user.id)
                .single();


            // =================================================
            // PROFILE ERROR
            // =================================================

            if (profileError) {

                console.error(
                    "Profile error:",
                    profileError
                );

                message.textContent =
                    "Could not load your profile.";

                await supabase.auth.signOut();

                return;
            }


            // =================================================
            // CHECK PLATFORM MAINTENANCE MODE
            // =================================================

            const maintenanceSetting =
                await getPlatformSetting("maintenance_mode");

            if (
                maintenanceSetting &&
                maintenanceSetting.enabled === true &&
                profile.role !== "super_admin"
            ) {

                message.textContent =
                    "ClassLink is currently undergoing maintenance. Please try again later.";

                await supabase.auth.signOut();

                return;
            }


            // =================================================
            // SUPER ADMIN ROUTING
            // =================================================

            if (profile.role === "super_admin") {

                console.log(
                    "Super Admin login successful."
                );

                window.location.href =
                    "super-admin-dashboard.html";

                return;
            }


            // =================================================
            // CHECK UNIVERSITY ASSIGNMENT
            // =================================================

            if (!profile.university_id) {

                console.error(
                    "No university assigned to this profile."
                );

                message.textContent =
                    "Your account is not linked to a university. Please contact ClassLink support.";

                await supabase.auth.signOut();

                return;
            }


            // =================================================
            // CHECK SELECTED UNIVERSITY
            // =================================================

            if (
                String(profile.university_id) !==
                String(selectedUniversity)
            ) {

                console.warn(
                    "University mismatch:",
                    {
                        selected: selectedUniversity,

                        account: profile.university_id
                    }
                );

                message.textContent =
                    "The selected university does not match your account.";

                await supabase.auth.signOut();

                return;
            }


            // =================================================
            // UNIVERSITY VERIFIED
            // =================================================

            console.log(
                "University verified successfully."
            );


            // =================================================
            // ROLE ROUTING
            // =================================================

            if (
                profile.role === "university_admin"
            ) {

                window.location.href =
                    "university-admin-dashboard.html";

                return;
            }

            if (
                profile.role === "lecturer"
            ) {

                window.location.href =
                    "lecturer-dashboard.html";

                return;
            }

            if (
                profile.role === "student"
            ) {

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

            await supabase.auth.signOut();

        }
    );

}


// =====================================================
// HOME PAGE SIGNUP BUTTONS
// =====================================================

window.lecturerSignup =
    function() {

        window.location.href =
            "signup.html?role=lecturer";

    };


window.studentSignup =
    function() {

        window.location.href =
            "signup.html?role=student";

    };


// =====================================================
// LOGIN PASSWORD SHOW / HIDE
// =====================================================

const toggleLoginPassword =
    document.getElementById("toggleLoginPassword");

const loginPassword =
    document.getElementById("loginPassword");


if (
    toggleLoginPassword &&
    loginPassword
) {

    toggleLoginPassword.addEventListener(
        "click",
        function() {

            if (
                loginPassword.type === "password"
            ) {

                loginPassword.type = "text";

                toggleLoginPassword.textContent =
                    "🙈";

                toggleLoginPassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                loginPassword.type = "password";

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
// SIGNUP PASSWORD SHOW / HIDE
// =====================================================

const toggleSignupPassword =
    document.getElementById("toggleSignupPassword");

const signupPassword =
    document.getElementById("password");


if (
    toggleSignupPassword &&
    signupPassword
) {

    toggleSignupPassword.addEventListener(
        "click",
        function() {

            if (
                signupPassword.type === "password"
            ) {

                signupPassword.type = "text";

                toggleSignupPassword.textContent =
                    "🙈";

                toggleSignupPassword.setAttribute(
                    "aria-label",
                    "Hide password"
                );

            } else {

                signupPassword.type = "password";

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
    document.getElementById("cookieBanner");

const acceptCookies =
    document.getElementById("acceptCookies");

const rejectCookies =
    document.getElementById("rejectCookies");

const cookieChoice =
    localStorage.getItem("classlinkCookieConsent");


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

}

// =====================================================
// AUTOMATIC INITIALIZATION FOR STANDALONE AUTH PAGES
// =====================================================

if (
    document.getElementById("loginForm") ||
    document.getElementById("signupForm")
) {
    initializeAuthForms();
}