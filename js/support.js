// =============================================
// CLASSLINK SUPPORT SYSTEM
// =============================================

import { supabase } from "./app.js";


// =============================================
// HTML ELEMENTS
// =============================================

const supportForm =
    document.getElementById("supportForm");

const supportFormStatus =
    document.getElementById("supportFormStatus");


// =============================================
// CHECK SUPPORT PAGE
// =============================================

if (supportForm) {

    supportForm.addEventListener(
        "submit",
        submitSupportRequest
    );

}


// =============================================
// SUBMIT SUPPORT REQUEST
// =============================================

async function submitSupportRequest(event) {

    event.preventDefault();

    const submitButton =
        supportForm.querySelector('button[type="submit"]');


    // GET FORM VALUES

    const name =
        document.getElementById("supportName").value.trim();

    const email =
        document.getElementById("supportEmail").value.trim();

    const role =
        document.getElementById("supportRole").value;

    const subject =
        document.getElementById("supportSubject").value;

    const message =
        document.getElementById("supportMessage").value.trim();


    // VALIDATE MESSAGE LENGTH

    if (message.length < 10) {

        supportFormStatus.textContent =
            "Please provide at least 10 characters describing your problem.";

        supportFormStatus.style.color = "#dc2626";

        return;

    }


    // SHOW LOADING STATE

    submitButton.disabled = true;

    submitButton.textContent = "Sending...";

    supportFormStatus.textContent =
        "Submitting your support request...";

    supportFormStatus.style.color = "#2563eb";


    try {

        // =====================================
        // SAVE REQUEST TO SUPABASE
        // =====================================

        const {
            error
        } = await supabase

            .from("support_requests")

            .insert([
                {
                    name: name,
                    email: email,
                    role: role,
                    subject: subject,
                    message: message
                }
            ]);


        // =====================================
        // HANDLE DATABASE ERROR
        // =====================================

        if (error) {

            console.error(
                "Support submission error:",
                error
            );

            throw error;

        }


        // =====================================
        // SUCCESS
        // =====================================

        supportForm.reset();

        supportFormStatus.textContent =
            "Your support request has been submitted successfully! Thank you for contacting ClassLink.";

        supportFormStatus.style.color = "#15803d";


    } catch (error) {

        console.error(
            "Unexpected support error:",
            error
        );

        supportFormStatus.textContent =
            "We could not submit your request. Please try again.";

        supportFormStatus.style.color = "#dc2626";

    } finally {

        submitButton.disabled = false;

        submitButton.textContent = "Send Message →";

    }

}