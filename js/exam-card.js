import {
    supabase
} from "./app.js";


async function loadExamCard() {

    const container =
        document.getElementById(
            "examCardContent"
        );

    if (!container) {
        return;
    }


    const {
        data: {
            user: currentUser
        },
        error: userError
    } = await supabase.auth.getUser();


    if (
        userError ||
        !currentUser
    ) {

        container.innerHTML = `
            <p class="empty-state">
                Please log in to view your examination card.
            </p>
        `;

        return;
    }


    const params =
        new URLSearchParams(
            window.location.search
        );

    const cardId =
        params.get("id");


    if (!cardId) {

        container.innerHTML = `
            <p class="empty-state">
                Examination card was not specified.
            </p>
        `;

        return;
    }


    const {
        data: examCard,
        error: cardError
    } = await supabase
        .from("exam_cards")
        .select(`
            id,
            card_number,
            issued_at,
            status,
            student_id,
            university_id,
            exam_registration_id
        `)
        .eq(
            "id",
            cardId
        )
        .eq(
            "student_id",
            currentUser.id
        )
        .maybeSingle();


    if (
        cardError ||
        !examCard
    ) {

        console.error(
            "Exam card error:",
            cardError
        );

        container.innerHTML = `
            <p class="empty-state">
                Examination card could not be found.
            </p>
        `;

        return;
    }


    /*
     * Get student profile
     */
const {
    data: profile,
    error: profileError
} = await supabase
    .from("profiles")
    .select(`
        full_name
    `)
    .eq(
        "id",
        currentUser.id
    )
    .maybeSingle();

    if (profileError) {

        console.error(
            "Profile error:",
            profileError
        );

    }

    const {
    data: studentProgramme,
    error: studentProgrammeError
} = await supabase
    .from("student_programmes")
    .select(`
        admission_number
    `)
    .eq(
        "student_id",
        currentUser.id
    )
    .eq(
        "status",
        "active"
    )
    .maybeSingle();


const admissionNumber =
    studentProgramme?.admission_number ||
    "N/A";


    /*
     * Get registration information
     */
    const {
        data: registration,
        error: registrationError
    } = await supabase
        .from("exam_registrations")
        .select(`
            academic_year_id,
            semester_id,
            registration_status,
            registered_at
        `)
        .eq(
            "id",
            examCard.exam_registration_id
        )
        .eq(
            "student_id",
            currentUser.id
        )
        .maybeSingle();


    if (
        registrationError ||
        !registration
    ) {

        container.innerHTML = `
            <p class="empty-state">
                Examination registration information
                could not be loaded.
            </p>
        `;

        return;
    }


    /*
     * Get academic year
     */
    const {
        data: academicYear
    } = await supabase
        .from("academic_years")
        .select(`
            year_number
        `)
        .eq(
            "id",
            registration.academic_year_id
        )
        .maybeSingle();


    /*
     * Get semester
     */
    const {
        data: semester
    } = await supabase
        .from("semesters")
        .select(`
            semester_number
        `)
        .eq(
            "id",
            registration.semester_id
        )
        .maybeSingle();


    const issuedDate =
        examCard.issued_at
            ? new Date(
                examCard.issued_at
            ).toLocaleDateString()
            : "N/A";

            const {
    data: registeredUnits,
    error: registeredUnitsError
} = await supabase
    .from("student_units")
    .select(`
        unit_id,
        semester_id,
        status,
        units (
            unit_code,
            unit_name,
            credit_hours
        )
    `)
    .eq(
        "student_id",
        currentUser.id
    )
    .eq(
        "semester_id",
        registration.semester_id
    )
    .eq(
        "status",
        "registered"
    );


if (registeredUnitsError) {

    console.error(
        "Registered units error:",
        registeredUnitsError
    );

}


    const studentName =
        profile?.full_name ||
        "Student";


    const yearNumber =
        academicYear?.year_number ||
        "N/A";


    const semesterNumber =
        semester?.semester_number ||
        "N/A";


   container.innerHTML = `

    <div id="officialExamCard" class="registrar-exam-card">

        <div class="registrar-header">

            <h1>
                OFFICE OF THE REGISTRAR, ACADEMIC AFFAIRS
            </h1>

            <h2>
                AUTHORITY TO SIT END OF SEMESTER EXAMINATION
            </h2>

        </div>


        <div class="exam-card-student-info">

    <div class="exam-info-row">
    <span>Admission No.</span>
    <strong>
        ${admissionNumber}
    </strong>
</div>

            <div class="exam-info-row">
                <span>Student Name</span>
                <strong>
                    ${studentName}
                </strong>
            </div>

            <div class="exam-info-row">
                <span>Programme</span>
                <strong>
                    Bachelor of Science in Computer Science
                </strong>
            </div>

            <div class="exam-info-row exam-info-highlight">

                <span>
                    Academic Year
                </span>

                <strong>
                    ${yearNumber}
                </strong>

                <span>
                    Semester
                </span>

                <strong>
                    ${semesterNumber}
                </strong>

            </div>

        </div>


        <div class="exam-registration-number">

            <span>
                Examination Registration No.
            </span>

            <strong>
                ${examCard.card_number}
            </strong>

        </div>


        <table class="exam-units-table">

            <thead>

                <tr>
                    <th>Code</th>
                    <th>Description</th>
                    <th>Booklet No.</th>
                    <th>Lecturer Signature</th>
                </tr>

            </thead>
<tbody>

    ${
        registeredUnits &&
        registeredUnits.length > 0

        ? registeredUnits.map(function(item) {

            return `
                <tr>

                    <td>
                        ${item.units?.unit_code || "N/A"}
                    </td>

                    <td>
                        ${item.units?.unit_name || "N/A"}
                    </td>

                    <td>
                        __________
                    </td>

                    <td>
                        __________________
                    </td>

                </tr>
            `;

        }).join("")

        : `
            <tr>

                <td colspan="4">
                    No registered units found.
                </td>

            </tr>
        `
    }

</tbody>

        </table>


        <div class="exam-card-warning">

            <p>
                <strong>
                    This card is NOT transferable nor is it replaceable.
                </strong>
            </p>

            <p>
                It MUST be presented together with the student
                identity card to the invigilator when required.
            </p>

            <p>
                The invigilator MUST sign on the card as he/she
                collects the scripts.
            </p>

        </div>


        <div class="exam-signature-section">

            <div class="signature-box">

                <strong>
                    STUDENT'S SIGNATURE
                </strong>

                <div class="signature-line">
                    ______________________________
                </div>

                <small>
                    Sign here
                </small>

            </div>


            <div class="signature-box">

                <strong>
                    ACADEMIC REGISTRAR'S SIGNATURE & STAMP
                </strong>

                <div class="signature-line">
                    ______________________________
                </div>

                <small>
                    Sign here
                </small>

            </div>

        </div>


        <div class="exam-card-bottom">

            <div>

                <strong>
                    EXAMS CARD GENERATED ON:
                </strong>

                ${issuedDate}

            </div>


    <div class="qr-placeholder">

    <img
        src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
            window.location.origin +
            "/verify-exam-card.html?card=" +
            examCard.card_number
        )}"
        alt="Exam Card Verification QR Code"
    >

</div>

        </div>


        <div class="exam-card-serial">

            CARD S/NO:
            <strong>
                ${examCard.card_number}
            </strong>

        </div>

    </div>


    <div class="exam-card-actions">

        <button
            id="printExamCardBtn"
            class="primary-button"
            type="button"
        >
            🖨️ Print / Save as PDF
        </button>

    </div>

`;

    const printButton =
        document.getElementById(
            "printExamCardBtn"
        );


    if (printButton) {

        printButton.addEventListener(
            "click",
            function() {

                window.print();

            }
        );

    }

}


loadExamCard();