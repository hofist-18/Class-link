import { supabase } from "./app.js";


// =====================================================
// DOM ELEMENTS
// =====================================================

const applicationForm =
    document.getElementById(
        "universityApplicationForm"
    );

const universitySelect =
    document.getElementById(
        "applicationUniversity"
    );

const programmeSelect =
    document.getElementById(
        "applicationProgramme"
    );

const admissionYearSelect =
    document.getElementById(
        "applicationAdmissionYear"
    );

const applicationFormMessage =
    document.getElementById(
        "applicationFormMessage"
    );

const submitApplicationBtn =
    document.getElementById(
        "submitApplicationBtn"
    );

const myApplicationsList =
    document.getElementById(
        "myApplicationsList"
    );


// =====================================================
// CURRENT USER
// =====================================================

let currentUser = null;


// =====================================================
// GET CURRENT USER
// =====================================================

async function getCurrentUser() {

    const {
        data: {
            user
        },
        error
    } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    if (!user) {

        window.location.href =
            "login.html";

        return null;
    }

    currentUser = user;

    return user;
}


// =====================================================
// LOAD UNIVERSITIES
// =====================================================

async function loadUniversities() {

    universitySelect.innerHTML = `
        <option value="">
            Loading universities...
        </option>
    `;

    const {
        data: universities,
        error
    } = await supabase
        .from("universities")
        .select(`
            id,
            name,
            code
        `)
        .order(
            "name"
        );

    if (error) {

        console.error(
            "University loading error:",
            error
        );

        universitySelect.innerHTML = `
            <option value="">
                Unable to load universities
            </option>
        `;

        return;
    }

    universitySelect.innerHTML = `
        <option value="">
            Select university
        </option>
    `;

    universities.forEach(
        function(university) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                university.id;

            option.textContent =
                university.code
                    ? `${university.name} (${university.code})`
                    : university.name;

            universitySelect.appendChild(
                option
            );

        }
    );
}


// =====================================================
// LOAD PROGRAMMES
// =====================================================

async function loadProgrammes(
    universityId
) {

    programmeSelect.innerHTML = `
        <option value="">
            Select programme
        </option>
    `;

    programmeSelect.disabled =
        true;

    if (!universityId) {
        return;
    }

    const {
        data: programmes,
        error
    } = await supabase
        .from("programmes")
        .select(`
            id,
            name,
            code,
            level,
            duration_years,

            departments (
                university_id,
                name
            )
        `)
        .order(
            "name"
        );

    if (error) {

        console.error(
            "Programme loading error:",
            error
        );

        programmeSelect.innerHTML = `
            <option value="">
                Unable to load programmes
            </option>
        `;

        return;
    }


    // Only show programmes belonging
    // to the selected university.

    const universityProgrammes =
        programmes.filter(
            function(programme) {

                return (
                    programme.departments
                        ?.university_id ===
                    universityId
                );

            }
        );


    if (!universityProgrammes.length) {

        programmeSelect.innerHTML = `
            <option value="">
                No programmes available
            </option>
        `;

        return;
    }


    universityProgrammes.forEach(
        function(programme) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                programme.id;

            option.textContent =
                programme.code
                    ? `${programme.name} (${programme.code})`
                    : programme.name;

            programmeSelect.appendChild(
                option
            );

        }
    );

    programmeSelect.disabled =
        false;
}


// =====================================================
// UNIVERSITY CHANGE
// =====================================================

if (universitySelect) {

    universitySelect.addEventListener(
        "change",
        async function() {

            await loadProgrammes(
                universitySelect.value
            );

        }
    );
}


// =====================================================
// LOAD MY APPLICATIONS
// =====================================================

async function loadMyApplications() {

    myApplicationsList.innerHTML = `
        <div class="admin-loading">
            Loading applications...
        </div>
    `;


    const {
        data: applications,
        error
    } = await supabase
        .from("university_applications")
        .select(`
            id,
            university_id,
            programme_id,
            admission_year,
            application_status,
            application_date,
            reviewed_at,
            rejection_reason,

            universities (
                name,
                code
            ),

            programmes (
                name,
                code,

                departments (
                    name,
                    code
                )
            )
        `)
        .eq(
            "applicant_id",
            currentUser.id
        )
        .order(
            "application_date",
            {
                ascending:
                    false
            }
        );


    if (error) {

        console.error(
            "Application loading error:",
            error
        );

        myApplicationsList.innerHTML = `
            <div class="admin-loading">

                Unable to load your applications.

                <br><br>

                ${error.message}

            </div>
        `;

        return;
    }


    if (
        !applications ||
        !applications.length
    ) {

        myApplicationsList.innerHTML = `
            <div class="admin-loading">

                You have not submitted any applications yet.

            </div>
        `;

        return;
    }


    // =================================================
    // LOAD ADMISSION NUMBERS
    // =================================================

    for (
        const application of applications
    ) {

        application.admissionNumber =
            null;


        if (
            application.application_status !==
            "approved"
        ) {

            continue;
        }


        const {
            data: studentProgramme,
            error: admissionError
        } = await supabase
            .from("student_programmes")
            .select(`
                admission_number,
                admission_year,
                status
            `)
            .eq(
                "student_id",
                currentUser.id
            )
            .eq(
                "programme_id",
                application.programme_id
            )
            .maybeSingle();


        if (admissionError) {

            console.error(
                "Admission number loading error:",
                admissionError
            );

            continue;
        }


        if (studentProgramme) {

            application.admissionNumber =
                studentProgramme.admission_number;

        }

    }


    // =================================================
    // DISPLAY APPLICATIONS
    // =================================================

    myApplicationsList.innerHTML =
        applications.map(
            function(application) {

                const status =
                    application.application_status;


                let statusClass =
                    "application-status";


                if (
                    status ===
                    "pending"
                ) {

                    statusClass +=
                        " application-status-pending";

                }


                if (
                    status ===
                    "approved"
                ) {

                    statusClass +=
                        " application-status-approved";

                }


                if (
                    status ===
                    "rejected"
                ) {

                    statusClass +=
                        " application-status-rejected";

                }


                return `

                    <div class="admin-card">


                        <!-- APPLICATION HEADER -->

                        <div class="admin-section-heading">

                            <div>

                                <h3>
                                    ${
                                        application
                                            .universities
                                            ?.name ||
                                        "University"
                                    }
                                </h3>

                                <p>
                                    ${
                                        application
                                            .programmes
                                            ?.name ||
                                        "Programme"
                                    }
                                </p>

                            </div>


                            <div
                                class="${statusClass}"
                            >
                                ${status}
                            </div>

                        </div>


                        <!-- APPLICATION DETAILS -->

                        <div class="admin-grid">


                            <!-- UNIVERSITY -->

                            <div>

                                <strong>
                                    University
                                </strong>

                                <p>
                                    ${
                                        application
                                            .universities
                                            ?.name ||
                                        "N/A"
                                    }
                                </p>

                            </div>


                            <!-- PROGRAMME -->

                            <div>

                                <strong>
                                    Programme
                                </strong>

                                <p>
                                    ${
                                        application
                                            .programmes
                                            ?.name ||
                                        "N/A"
                                    }
                                </p>

                            </div>


                            <!-- DEPARTMENT -->

                            <div>

                                <strong>
                                    Department
                                </strong>

                                <p>
                                    ${
                                        application
                                            .programmes
                                            ?.departments
                                            ?.name ||
                                        "N/A"
                                    }
                                </p>

                            </div>


                            <!-- ADMISSION YEAR -->

                            <div>

                                <strong>
                                    Admission Year
                                </strong>

                                <p>
                                    ${
                                        application
                                            .admission_year
                                    }
                                </p>

                            </div>


                            <!-- ADMISSION NUMBER -->

                            ${
                                application.admissionNumber
                                    ? `

                                        <div>

                                            <strong>
                                                Admission Number
                                            </strong>

                                            <p>
                                                ${
                                                    application
                                                        .admissionNumber
                                                }
                                            </p>

                                        </div>

                                    `
                                    : ""
                            }


                            <!-- APPLICATION DATE -->

                            <div>

                                <strong>
                                    Application Date
                                </strong>

                                <p>
                                    ${
                                        application
                                            .application_date
                                            ? new Date(
                                                application
                                                    .application_date
                                            ).toLocaleDateString()
                                            : "N/A"
                                    }
                                </p>

                            </div>


                            <!-- REVIEWED DATE -->

                            ${
                                application.reviewed_at
                                    ? `

                                        <div>

                                            <strong>
                                                Reviewed
                                            </strong>

                                            <p>
                                                ${
                                                    new Date(
                                                        application
                                                            .reviewed_at
                                                    ).toLocaleDateString()
                                                }
                                            </p>

                                        </div>

                                    `
                                    : ""
                            }


                        </div>


                        <!-- REJECTION REASON -->

                        ${
                            status ===
                            "rejected" &&
                            application.rejection_reason

                                ? `

                                    <div
                                        class="admin-form-message"
                                    >

                                        <strong>
                                            Rejection Reason:
                                        </strong>

                                        <br>

                                        ${
                                            application
                                                .rejection_reason
                                        }

                                    </div>

                                `
                                : ""
                        }


                    </div>

                `;

            }
        ).join("");
}


// =====================================================
// CHECK EXISTING APPLICATION
// =====================================================

async function checkExistingApplication(
    universityId,
    programmeId,
    admissionYear
) {

    const {
        data: existingApplication,
        error
    } = await supabase
        .from("university_applications")
        .select(`
            id,
            application_status
        `)
        .eq(
            "applicant_id",
            currentUser.id
        )
        .eq(
            "university_id",
            universityId
        )
        .eq(
            "programme_id",
            programmeId
        )
        .eq(
            "admission_year",
            admissionYear
        )
        .maybeSingle();


    if (error) {

        console.error(
            "Application check error:",
            error
        );

        return null;
    }


    return existingApplication;
}


// =====================================================
// SUBMIT APPLICATION
// =====================================================

if (applicationForm) {

    applicationForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const universityId =
                universitySelect.value;

            const programmeId =
                programmeSelect.value;

            const admissionYear =
                Number(
                    admissionYearSelect.value
                );


            // =============================================
            // VALIDATION
            // =============================================

            if (
                !universityId ||
                !programmeId ||
                !admissionYear
            ) {

                applicationFormMessage.textContent =
                    "Please complete all application fields.";

                return;
            }


            applicationFormMessage.textContent =
                "Checking your application...";


            submitApplicationBtn.disabled =
                true;


            // =============================================
            // CHECK DUPLICATE APPLICATION
            // =============================================

            const existingApplication =
                await checkExistingApplication(
                    universityId,
                    programmeId,
                    admissionYear
                );


            if (existingApplication) {

                applicationFormMessage.textContent =
                    `You already have a ${existingApplication.application_status} application for this programme and admission year.`;

                submitApplicationBtn.disabled =
                    false;

                return;
            }


            // =============================================
            // SUBMIT
            // =============================================

            applicationFormMessage.textContent =
                "Submitting application...";


            const {
                error
            } = await supabase
                .from(
                    "university_applications"
                )
                .insert({

                    applicant_id:
                        currentUser.id,

                    university_id:
                        universityId,

                    programme_id:
                        programmeId,

                    admission_year:
                        admissionYear

                });


            if (error) {

                console.error(
                    "Application submission error:",
                    error
                );

                applicationFormMessage.textContent =
                    error.message;

                submitApplicationBtn.disabled =
                    false;

                return;
            }


            // =============================================
            // RESET FORM
            // =============================================

            applicationForm.reset();


            programmeSelect.innerHTML = `
                <option value="">
                    Select programme
                </option>
            `;


            programmeSelect.disabled =
                true;


            applicationFormMessage.textContent =
                "Application submitted successfully!";


            // =============================================
            // RELOAD APPLICATIONS
            // =============================================

            await loadMyApplications();


            submitApplicationBtn.disabled =
                false;

        }
    );
}


// =====================================================
// INITIALISE PAGE
// =====================================================

async function initialiseApplicationPage() {

    try {

        const user =
            await getCurrentUser();


        if (!user) {
            return;
        }


        await loadUniversities();

        await loadMyApplications();

    } catch (error) {

        console.error(
            "Application page error:",
            error
        );

        applicationFormMessage.textContent =
            "Unable to load the application page.";

    }
}


// =====================================================
// START
// =====================================================

initialiseApplicationPage();