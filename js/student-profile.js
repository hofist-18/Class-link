import { supabase } from "./app.js";


// =====================================================
// ELEMENTS
// =====================================================

const profileFullName =
    document.getElementById("profileFullName");

const profileEmail =
    document.getElementById("profileEmail");

const profileRole =
    document.getElementById("profileRole");

const profileUniversity =
    document.getElementById("profileUniversity");

const profileAdmissionNumber =
    document.getElementById("profileAdmissionNumber");

const profileAdmissionYear =
    document.getElementById("profileAdmissionYear");

const profileDepartment =
    document.getElementById("profileDepartment");

const profileProgramme =
    document.getElementById("profileProgramme");

const profileAcademicYear =
    document.getElementById("profileAcademicYear");

const profileSemester =
    document.getElementById("profileSemester");

const profileStatus =
    document.getElementById("profileStatus");

const profileMessage =
    document.getElementById("profileMessage");


// =====================================================
// LOAD STUDENT PROFILE
// =====================================================

async function loadStudentProfile() {

    try {

        profileMessage.textContent =
            "Loading your profile...";

        // -------------------------------------------------
        // GET LOGGED-IN USER
        // -------------------------------------------------

        const {
            data: { user },
            error: userError
        } = await supabase.auth.getUser();


        if (userError) {
            throw userError;
        }


        if (!user) {

            window.location.href =
                "login.html";

            return;
        }


        // -------------------------------------------------
        // GET PROFILE
        // -------------------------------------------------
const { data: profile, error: profileError } =
    await supabase
        .from("profiles")
        .select(`
            full_name,
            role,
            university_id
        `)
        .eq("id", user.id)
        .single();


        if (profileError) {
            throw profileError;
        }


        // -------------------------------------------------
        // DISPLAY PERSONAL INFORMATION
        // -------------------------------------------------

        profileFullName.textContent =
            profile.full_name || "Not provided";

        profileEmail.textContent =
            user.email || "Not provided";

        profileRole.textContent =
            profile.role || "Student";


if (profile.university_id) {

    const { data: university, error: universityError } =
        await supabase
            .from("universities")
            .select("name")
            .eq("id", profile.university_id)
            .single();

    if (universityError) {
        throw universityError;
    }

    profileUniversity.textContent =
        university.name || "Not assigned";

} else {

    profileUniversity.textContent =
        "Not assigned";

}



        // -------------------------------------------------
        // GET STUDENT PROGRAMME
        // -------------------------------------------------

        const { data: studentProgramme, error: programmeError } =
            await supabase
                .from("student_programmes")
                .select(`
                    admission_number,
                    admission_year,
                    status,
                    programmes (
                        name,
                        code,
                        departments (
                            name,
                            code
                        )
                    )
                `)
                .eq("student_id", user.id)
                .single();


        if (programmeError) {

            if (programmeError.code === "PGRST116") {

                profileAdmissionNumber.textContent =
                    "Not assigned";

                profileAdmissionYear.textContent =
                    "Not assigned";

                profileDepartment.textContent =
                    "Not assigned";

                profileProgramme.textContent =
                    "Not registered";

                profileStatus.textContent =
                    "Not registered";

            } else {

                throw programmeError;

            }

        } else {

            // ---------------------------------------------
            // ACADEMIC INFORMATION
            // ---------------------------------------------

            profileAdmissionNumber.textContent =
                studentProgramme.admission_number ||
                "Not assigned";


            profileAdmissionYear.textContent =
                studentProgramme.admission_year ||
                "Not assigned";


            profileStatus.textContent =
                studentProgramme.status ||
                "Not assigned";


            if (
                studentProgramme.programmes
            ) {

                profileProgramme.textContent =
                    studentProgramme.programmes.name ||
                    "Not assigned";


                if (
                    studentProgramme.programmes.departments
                ) {

                    profileDepartment.textContent =
                        studentProgramme
                            .programmes
                            .departments
                            .name ||
                        "Not assigned";

                } else {

                    profileDepartment.textContent =
                        "Not assigned";

                }

            } else {

                profileProgramme.textContent =
                    "Not assigned";

                profileDepartment.textContent =
                    "Not assigned";

            }

        }



        // -------------------------------------------------
        // GET CURRENT SEMESTER REGISTRATION
        // -------------------------------------------------

        const { data: semesterRegistration, error: semesterError } =
            await supabase
                .from("student_semesters")
                .select(`
                    semester_id,
                    status,
                    semesters (
                        semester_number,
                        academic_years (
                            year_number,
                            programmes (
                                name
                            )
                        )
                    )
                `)
                .eq("student_id", user.id)
                .eq("status", "registered")
                .order("registered_at", {
                    ascending: false
                })
                .limit(1);


        if (semesterError) {
            throw semesterError;
        }


        if (
            semesterRegistration &&
            semesterRegistration.length > 0
        ) {

            const registration =
                semesterRegistration[0];

            const semester =
                registration.semesters;


            if (semester) {

                profileSemester.textContent =
                    `Semester ${semester.semester_number}`;


                if (
                    semester.academic_years
                ) {

                    profileAcademicYear.textContent =
                        `Year ${semester.academic_years.year_number}`;

                } else {

                    profileAcademicYear.textContent =
                        "Not assigned";

                }

            } else {

                profileSemester.textContent =
                    "Not assigned";

                profileAcademicYear.textContent =
                    "Not assigned";

            }

        } else {

            profileSemester.textContent =
                "Not registered";

            profileAcademicYear.textContent =
                "Not registered";

        }


        // -------------------------------------------------
        // SUCCESS
        // -------------------------------------------------

        profileMessage.textContent = "";


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

        profileMessage.textContent =
            "Unable to load your profile information.";

    }

}


// =====================================================
// START
// =====================================================

loadStudentProfile();