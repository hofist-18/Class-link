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

const profilePhotoInput =
    document.getElementById("profilePhotoInput");

const uploadProfilePhotoBtn =
    document.getElementById("uploadProfilePhotoBtn");

const profilePhotoMessage =
    document.getElementById("profilePhotoMessage");

const profilePhotoImage =
    document.getElementById("profilePhotoImage");

const profilePhotoPlaceholder =
    document.getElementById("profilePhotoPlaceholder");


// =====================================================
// SHOW PROFILE PHOTO
// =====================================================

function showProfilePhoto(photoUrl) {

    if (!photoUrl) {

        profilePhotoImage.style.display =
            "none";

        profilePhotoImage.src =
            "";

        profilePhotoPlaceholder.style.display =
            "block";

        return;
    }


    profilePhotoImage.src =
        photoUrl;

    profilePhotoImage.style.display =
        "block";

    profilePhotoPlaceholder.style.display =
        "none";
}


// =====================================================
// GET PRIVATE PHOTO URL
// =====================================================

async function getProfilePhotoUrl(
    photoPath
) {

    if (!photoPath) {
        return null;
    }


    const {
        data,
        error
    } = await supabase.storage
        .from("profile-photos")
        .createSignedUrl(
            photoPath,
            3600
        );


    if (error) {

        console.error(
            "Photo URL error:",
            error
        );

        return null;
    }


    return data?.signedUrl || null;
}


// =====================================================
// LOAD STUDENT PROFILE PHOTO
// =====================================================

async function loadProfilePhoto(
    userId
) {

    const {
        data: profile,
        error
    } = await supabase
        .from("profiles")
        .select(
            "profile_photo_url"
        )
        .eq(
            "id",
            userId
        )
        .single();


    if (error) {

        console.error(
            "Photo profile error:",
            error
        );

        return;
    }


    const photoPath =
        profile?.profile_photo_url;


    if (!photoPath) {

        showProfilePhoto(null);

        return;
    }


    const photoUrl =
        await getProfilePhotoUrl(
            photoPath
        );


    showProfilePhoto(
        photoUrl
    );
}


// =====================================================
// UPLOAD PROFILE PHOTO
// =====================================================

async function uploadProfilePhoto() {

    try {

        profilePhotoMessage.textContent =
            "";


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


        const file =
            profilePhotoInput.files[0];


        if (!file) {

            profilePhotoMessage.textContent =
                "Please choose a photo first.";

            return;
        }


        // -------------------------------------------------
        // VALIDATE FILE TYPE
        // -------------------------------------------------

        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp"
        ];


        if (
            !allowedTypes.includes(
                file.type
            )
        ) {

            profilePhotoMessage.textContent =
                "Please choose a JPG, PNG or WebP image.";

            return;
        }


        // -------------------------------------------------
        // VALIDATE FILE SIZE
        // -------------------------------------------------

        const maxSize =
            2 * 1024 * 1024;


        if (
            file.size > maxSize
        ) {

            profilePhotoMessage.textContent =
                "Photo must be 2 MB or smaller.";

            return;
        }


        uploadProfilePhotoBtn.disabled =
            true;

        uploadProfilePhotoBtn.textContent =
            "Uploading...";


        // -------------------------------------------------
        // FILE PATH
        // -------------------------------------------------

        const fileExtension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();


        const filePath =
            `${user.id}/profile-photo.${fileExtension}`;


        // -------------------------------------------------
        // REMOVE OLD PHOTO FILES
        // -------------------------------------------------

        const {
            data: existingFiles,
            error: listError
        } = await supabase.storage
            .from("profile-photos")
            .list(
                user.id
            );


        if (listError) {
            throw listError;
        }


        if (
            existingFiles &&
            existingFiles.length > 0
        ) {

            const oldFiles =
                existingFiles.map(
                    function(file) {

                        return `${user.id}/${file.name}`;

                    }
                );


            const {
                error: removeError
            } = await supabase.storage
                .from("profile-photos")
                .remove(
                    oldFiles
                );


            if (removeError) {
                throw removeError;
            }
        }


        // -------------------------------------------------
        // UPLOAD NEW PHOTO
        // -------------------------------------------------

        const {
            error: uploadError
        } = await supabase.storage
            .from("profile-photos")
            .upload(
                filePath,
                file,
                {
                    cacheControl:
                        "3600",
                    upsert:
                        true
                }
            );


        if (uploadError) {
            throw uploadError;
        }

// -------------------------------------------------
// SAVE PHOTO PATH TO PROFILE
// -------------------------------------------------

const {
    data: updatedProfile,
    error: updateError
} = await supabase
    .from("profiles")
    .update({
        profile_photo_url: filePath
    })
    .eq(
        "id",
        user.id
    )
    .select("profile_photo_url")
    .single();


if (updateError) {
    throw updateError;
}


if (
    !updatedProfile ||
    !updatedProfile.profile_photo_url
) {

    throw new Error(
        "Photo uploaded, but the profile photo path was not saved."
    );

}

        // -------------------------------------------------
        // DISPLAY NEW PHOTO
        // -------------------------------------------------

        const photoUrl =
            await getProfilePhotoUrl(
                filePath
            );


        showProfilePhoto(
            photoUrl
        );


        profilePhotoInput.value =
            "";


        profilePhotoMessage.textContent =
            "Profile photo uploaded successfully.";


    } catch (error) {

        console.error(
            "Profile photo upload error:",
            error
        );

        profilePhotoMessage.textContent =
            error.message ||
            "Unable to upload profile photo.";


    } finally {

        uploadProfilePhotoBtn.disabled =
            false;

        uploadProfilePhotoBtn.textContent =
            "Upload Profile Photo";

    }

}


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
        // LOAD PROFILE PHOTO
        // -------------------------------------------------

        await loadProfilePhoto(
            user.id
        );


        // -------------------------------------------------
        // GET PROFILE
        // -------------------------------------------------

        const {
            data: profile,
            error: profileError
        } = await supabase
            .from("profiles")
            .select(`
                full_name,
                role,
                university_id,
                profile_photo_url
            `)
            .eq(
                "id",
                user.id
            )
            .single();


        if (profileError) {
            throw profileError;
        }


        // -------------------------------------------------
        // DISPLAY PERSONAL INFORMATION
        // -------------------------------------------------

        profileFullName.textContent =
            profile.full_name ||
            "Not provided";


        profileEmail.textContent =
            user.email ||
            "Not provided";


        profileRole.textContent =
            profile.role ||
            "Student";


        // -------------------------------------------------
        // UNIVERSITY
        // -------------------------------------------------

        if (
            profile.university_id
        ) {

            const {
                data: university,
                error: universityError
            } = await supabase
                .from("universities")
                .select("name")
                .eq(
                    "id",
                    profile.university_id
                )
                .single();


            if (universityError) {
                throw universityError;
            }


            profileUniversity.textContent =
                university.name ||
                "Not assigned";


        } else {

            profileUniversity.textContent =
                "Not assigned";

        }


        // -------------------------------------------------
        // GET STUDENT PROGRAMME
        // -------------------------------------------------

        const {
            data: studentProgramme,
            error: programmeError
        } = await supabase
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
            .eq(
                "student_id",
                user.id
            )
            .single();


        if (programmeError) {

            if (
                programmeError.code ===
                "PGRST116"
            ) {

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
                    studentProgramme
                        .programmes
                        .name ||
                    "Not assigned";


                if (
                    studentProgramme
                        .programmes
                        .departments
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

        const {
            data: semesterRegistration,
            error: semesterError
        } = await supabase
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
            .eq(
                "student_id",
                user.id
            )
            .eq(
                "status",
                "registered"
            )
            .order(
                "registered_at",
                {
                    ascending: false
                }
            )
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

        profileMessage.textContent =
            "";


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
// PHOTO SELECTION PREVIEW
// =====================================================

if (
    profilePhotoInput
) {

    profilePhotoInput.addEventListener(
        "change",
        function() {

            const file =
                profilePhotoInput.files[0];

            if (!file) {
                return;
            }

            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp"
            ];

            if (
                !allowedTypes.includes(
                    file.type
                )
            ) {

                profilePhotoMessage.textContent =
                    "Please choose a JPG, PNG or WebP image.";

                profilePhotoInput.value =
                    "";

                return;
            }

            const maxSize =
                2 * 1024 * 1024;

            if (
                file.size > maxSize
            ) {

                profilePhotoMessage.textContent =
                    "Photo must be 2 MB or smaller.";

                profilePhotoInput.value =
                    "";

                return;
            }

            const previewUrl =
                URL.createObjectURL(file);

            profilePhotoImage.src =
                previewUrl;

            profilePhotoImage.style.display =
                "block";

            profilePhotoPlaceholder.style.display =
                "none";

            profilePhotoMessage.textContent =
                "Photo selected. Click Upload Profile Photo to save it.";

        }
    );

}


// =====================================================
// PHOTO UPLOAD BUTTON
// =====================================================

if (
    uploadProfilePhotoBtn
) {

    uploadProfilePhotoBtn.addEventListener(
        "click",
        uploadProfilePhoto
    );

}


// =====================================================
// START
// =====================================================

loadStudentProfile();