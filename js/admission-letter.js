import { supabase } from "./app.js";


// =====================================================
// DOM ELEMENTS
// =====================================================

const admissionLetter =
    document.getElementById(
        "admissionLetter"
    );

const admissionMessage =
    document.getElementById(
        "admissionMessage"
    );

const admissionActions =
    document.getElementById(
        "admissionActions"
    );


// =====================================================
// LOAD ADMISSION DETAILS
// =====================================================

async function loadAdmissionDetails() {

    admissionLetter.innerHTML = `
        <div class="admin-loading">
            Loading admission information...
        </div>
    `;


    // Get logged-in user

    const {
        data: {
            user
        },
        error: userError
    } = await supabase.auth.getUser();


    if (userError) {

        console.error(
            "User error:",
            userError
        );

        admissionLetter.innerHTML = `
            <div class="admin-loading">
                Unable to identify your account.
            </div>
        `;

        return;
    }


    // Redirect if not logged in

    if (!user) {

        window.location.href =
            "login.html";

        return;
    }


    // =================================================
    // GET ADMISSION INFORMATION
    // =================================================

    const {
        data,
        error
    } = await supabase.rpc(
        "get_my_admission_details"
    );


    if (error) {

        console.error(
            "Admission details error:",
            error
        );

        admissionLetter.innerHTML = `
            <div class="admin-loading">

                Unable to load your admission information.

                <br><br>

                ${error.message}

            </div>
        `;

        return;
    }


    // =================================================
    // NO ADMISSION FOUND
    // =================================================

    if (!data) {

        admissionLetter.innerHTML = `
            <div class="admin-loading">

                <h3>
                    No Admission Found
                </h3>

                <p>
                    You do not currently have an approved
                    university admission.
                </p>

            </div>
        `;

        return;
    }


    // =================================================
    // DISPLAY ADMISSION LETTER
    // =================================================

    admissionLetter.innerHTML = `

        <div class="admission-letter">


            <!-- UNIVERSITY -->

            <div class="admission-university">

                <h1>
                    ${data.university_name}
                </h1>

                <p>
                    ${data.university_code || ""}
                </p>

                <hr>

            </div>


            <!-- TITLE -->

            <div class="admission-title">

                <h2>
                    LETTER OF ADMISSION
                </h2>

                <p>
                    Academic Year ${data.admission_year}
                </p>

            </div>


            <!-- STUDENT INFORMATION -->

            <div class="admin-grid">


                <div>

                    <strong>
                        Student Name
                    </strong>

                    <p>
                        ${data.student_name}
                    </p>

                </div>


                <div>

                    <strong>
                        Admission Number
                    </strong>

                    <p>
                        ${data.admission_number}
                    </p>

                </div>


                <div>

                    <strong>
                        Department
                    </strong>

                    <p>
                        ${data.department_name}
                    </p>

                </div>


                <div>

                    <strong>
                        Programme
                    </strong>

                    <p>
                        ${data.programme_name}
                    </p>

                </div>


                <div>

                    <strong>
                        Programme Code
                    </strong>

                    <p>
                        ${data.programme_code || "N/A"}
                    </p>

                </div>


                <div>

                    <strong>
                        Level
                    </strong>

                    <p>
                        ${data.programme_level || "N/A"}
                    </p>

                </div>


                <div>

                    <strong>
                        Duration
                    </strong>

                    <p>
                        ${
                            data.duration_years
                                ? `${data.duration_years} Years`
                                : "N/A"
                        }
                    </p>

                </div>


                <div>

                    <strong>
                        Admission Status
                    </strong>

                    <p>
                        ${data.status}
                    </p>

                </div>

            </div>


            <!-- LETTER MESSAGE -->

            <div class="admission-message">

                <p>
                    Dear ${data.student_name},
                </p>

                <p>
                    We are pleased to confirm your admission
                    to ${data.university_name}.
                </p>

                <p>
                    You have been admitted to the
                    <strong>
                        ${data.programme_name}
                    </strong>
                    programme in the
                    <strong>
                        ${data.department_name}
                    </strong>
                    department for the
                    <strong>
                        ${data.admission_year}
                    </strong>
                    academic year.
                </p>

                <p>
                    Your official admission number is:
                    <strong>
                        ${data.admission_number}
                    </strong>
                </p>

                <p>
                    Please keep this admission information
                    for your university records.
                </p>

            </div>


            <!-- STATUS -->

            <div class="admission-confirmation">

                <strong>
                    Admission Confirmed
                </strong>

                <p>
                    Status: ${data.status}
                </p>

            </div>


        </div>

    `;


    // Show print button

    admissionActions.style.display =
        "flex";

}


// =====================================================
// START
// =====================================================

loadAdmissionDetails();