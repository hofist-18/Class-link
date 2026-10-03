import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL =
    "https://jlvcgwbjgdnmtqdwiwgp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_92EM6fOxHQLOKq5o8ik1_Q_9XIA84d1";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =====================================================
// CHECK LOGIN
// =====================================================

const {
    data: { user },
    error: userError
} = await supabase.auth.getUser();

if (userError || !user) {

    window.location.href = "login.html";

} else {

    // =================================================
    // GET STUDENT PROFILE
    // =================================================

    const {
        data: profile,
        error: profileError
    } = await supabase
        .from("profiles")
        .select("full_name, role, profile_photo_url")
        .eq("id", user.id)
        .single();


    if (profileError) {

        console.error(profileError);

        const studentName =
            document.getElementById("studentName");

        if (studentName) {
            studentName.textContent =
                "Could not load your profile.";
        }

    } else {

        const studentFullName =
            profile.full_name || "Student";

        const studentName =
            document.getElementById("studentName");

        const studentGreetingName =
            document.getElementById(
                "studentGreetingName"
            );

        if (studentName) {
            studentName.textContent =
                studentFullName;
        }

        if (studentGreetingName) {
            studentGreetingName.textContent =
                studentFullName;
        }

        // =================================================
// LOAD STUDENT PROFILE PHOTO
// =================================================

const studentDashboardPhoto =
    document.getElementById(
        "studentDashboardPhoto"
    );

if (studentDashboardPhoto) {

    if (profile.profile_photo_url) {

        const {
            data: photoData,
            error: photoError
        } = await supabase.storage
            .from("profile-photos")
            .createSignedUrl(
                profile.profile_photo_url,
                3600
            );

        if (photoError) {
            console.error(
                "Photo loading error:",
                photoError
            );
        }

        if (
            photoData &&
            photoData.signedUrl
        ) {

            studentDashboardPhoto.src =
                photoData.signedUrl;

            studentDashboardPhoto.style.display =
                "block";
        }

    } else {

        console.log(
            "No profile photo path found."
        );

    }
}

    }

    // =================================================
    // JOIN CLASS
    // =================================================

    const joinClassBtn =
        document.getElementById("joinClassBtn");

    if (joinClassBtn) {

        joinClassBtn.addEventListener(
            "click",
            async function () {

                const classCode =
                    document
                        .getElementById("classCode")
                        .value
                        .trim()
                        .toUpperCase();

                const message =
                    document.getElementById(
                        "joinMessage"
                    );


                if (!classCode) {

                    message.textContent =
                        "Please enter a class code.";

                    return;
                }


                message.textContent =
                    "Joining class...";


                // Find class

                const {
                    data: classData,
                    error: classError
                } = await supabase
                    .from("classes")
                    .select(
                        "id, class_name"
                    )
                    .eq(
                        "class_code",
                        classCode
                    )
                    .single();


                if (
                    classError ||
                    !classData
                ) {

                    console.error(
                        classError
                    );

                    message.textContent =
                        "Class not found. Check the class code.";

                    return;
                }


                // Add student to class

                const {
                    error: joinError
                } = await supabase
                    .from("class_members")
                    .insert([
                        {
                            class_id:
                                classData.id,

                            student_id:
                                user.id
                        }
                    ]);


                if (joinError) {

                    console.error(
                        joinError
                    );

                    if (
                        joinError.code ===
                        "23505"
                    ) {

                        message.textContent =
                            "You have already joined this class.";

                    } else {

                        message.textContent =
                            "Could not join class: " +
                            joinError.message;
                    }

                    return;
                }


                message.textContent =
                    "Successfully joined " +
                    classData.class_name +
                    "!";


                document.getElementById(
                    "classCode"
                ).value = "";


                // Refresh overview

                loadStudentOverview();

            }
        );

    }


    // =================================================
    // VIEW MY CLASSES
    // =================================================

    const myClassesBtn =
        document.getElementById(
            "myClassesBtn"
        );

    if (myClassesBtn) {

        myClassesBtn.addEventListener(
            "click",
            async function () {

                const list =
                    document.getElementById(
                        "myClassesList"
                    );

                list.innerHTML =
                    "Loading your classes...";


                const {
                    data: memberships,
                    error
                } = await supabase
                    .from("class_members")
                    .select(`
                        class_id,
                        classes (
                            class_name,
                            description,
                            class_code
                        )
                    `)
                    .eq(
                        "student_id",
                        user.id
                    );


                if (error) {

                    console.error(error);

                    list.innerHTML =
                        "Could not load your classes.";

                    return;
                }


                if (
                    !memberships ||
                    memberships.length === 0
                ) {

                    list.innerHTML =
                        "You haven't joined any classes yet.";

                    return;
                }


                list.innerHTML = "";


                memberships.forEach(
                    function (membership) {

                        const classInfo =
                            membership.classes;


                        const classCard =
                            document.createElement(
                                "div"
                            );


                        classCard.className =
                            "my-class-card";


                        classCard.innerHTML = `

                            <h3>
                                📚 ${classInfo.class_name}
                            </h3>

                            <p>
                                ${
                                    classInfo.description ||
                                    "No description"
                                }
                            </p>

                            <div class="student-class-code">

                                <span>
                                    Class Code
                                </span>

                                <strong>
                                    ${classInfo.class_code}
                                </strong>

                            </div>

                        `;


                        list.appendChild(
                            classCard
                        );

                    }
                );

            }
        );

    }


    // =================================================
    // LOGOUT
    // =================================================

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            async function () {

                const {
                    error
                } = await supabase.auth.signOut();


                if (error) {

                    console.error(error);

                    return;
                }


                window.location.href =
                    "login.html";

            }
        );

    }


    // =================================================
    // LEARNING MATERIALS
    // =================================================

    const materialsBtn =
        document.getElementById(
            "materialsBtn"
        );


    if (materialsBtn) {

        materialsBtn.addEventListener(
            "click",
            async function () {

                const materialsList =
                    document.getElementById(
                        "materialsList"
                    );


                materialsList.innerHTML =
                    "Loading materials...";


                // Get student's classes

                const {
                    data: memberships,
                    error: membershipError
                } = await supabase
                    .from("class_members")
                    .select("class_id")
                    .eq(
                        "student_id",
                        user.id
                    );


                if (membershipError) {

                    console.error(
                        membershipError
                    );

                    materialsList.innerHTML =
                        "Could not load your classes.";

                    return;
                }


                if (
                    !memberships ||
                    memberships.length === 0
                ) {

                    materialsList.innerHTML =
                        "You haven't joined any classes yet.";

                    return;
                }


                const classIds =
                    memberships.map(
                        function (membership) {

                            return membership.class_id;

                        }
                    );


                // Get materials

                const {
                    data: materials,
                    error: materialsError
                } = await supabase
                    .from("materials")
                    .select(`
                        id,
                        class_id,
                        title,
                        description,
                        file_url,
                        created_at,
                        classes (
                            class_name
                        )
                    `)
                    .in(
                        "class_id",
                        classIds
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


                if (materialsError) {

                    console.error(
                        materialsError
                    );

                    materialsList.innerHTML =
                        "Could not load learning materials.";

                    return;
                }


                if (
                    !materials ||
                    materials.length === 0
                ) {

                    materialsList.innerHTML =
                        "No learning materials have been uploaded yet.";

                    return;
                }


                materialsList.innerHTML = "";


                for (
                    const material of materials
                ) {

                    const materialCard =
                        document.createElement(
                            "div"
                        );


                    materialCard.className =
                        "material-card";


                    materialCard.innerHTML = `

                        <h3>
                            ${material.title}
                        </h3>

                        <p>
                            <strong>
                                Class:
                            </strong>

                            ${
                                material.classes?.class_name ||
                                "Unknown class"
                            }
                        </p>

                        <p>
                            ${
                                material.description ||
                                "No description"
                            }
                        </p>

                        <button class="open-material-btn">
                            Open Material
                        </button>

                    `;


                    materialsList.appendChild(
                        materialCard
                    );


                    const openButton =
                        materialCard.querySelector(
                            ".open-material-btn"
                        );


                    openButton.addEventListener(
                        "click",
                        async function () {

                            openButton.textContent =
                                "Opening...";


                            const {
                                data: signedUrl,
                                error: urlError
                            } =
                                await supabase.storage
                                    .from("materials")
                                    .createSignedUrl(
                                        material.file_url,
                                        3600
                                    );


                            if (urlError) {

                                console.error(
                                    urlError
                                );

                                openButton.textContent =
                                    "Could not open";

                                return;
                            }


                            window.open(
                                signedUrl.signedUrl,
                                "_blank"
                            );


                            openButton.textContent =
                                "Open Material";

                        }
                    );

                }

            }
        );

    }


    // =================================================
    // ASSIGNMENTS + SUBMISSIONS
    // =================================================

    const assignmentsBtn =
        document.getElementById(
            "assignmentsBtn"
        );


    if (assignmentsBtn) {

        assignmentsBtn.addEventListener(
            "click",
            async function () {

                const assignmentsList =
                    document.getElementById(
                        "assignmentsList"
                    );


                assignmentsList.innerHTML =
                    "Loading assignments...";


                const {
                    data: memberships,
                    error: membershipError
                } = await supabase
                    .from("class_members")
                    .select("class_id")
                    .eq(
                        "student_id",
                        user.id
                    );


                if (membershipError) {

                    console.error(
                        membershipError
                    );

                    assignmentsList.innerHTML =
                        "Could not load your classes.";

                    return;
                }


                if (
                    !memberships ||
                    memberships.length === 0
                ) {

                    assignmentsList.innerHTML =
                        "You haven't joined any classes yet.";

                    return;
                }


                const classIds =
                    memberships.map(
                        function (membership) {

                            return membership.class_id;

                        }
                    );


                const {
                    data: assignments,
                    error: assignmentsError
                } = await supabase
                    .from("assignments")
                    .select(`
                        id,
                        title,
                        description,
                        due_date,
                        classes (
                            class_name
                        )
                    `)
                    .in(
                        "class_id",
                        classIds
                    )
                    .order(
                        "due_date",
                        {
                            ascending: true
                        }
                    );


                if (assignmentsError) {

                    console.error(
                        assignmentsError
                    );

                    assignmentsList.innerHTML =
                        "Could not load assignments.";

                    return;
                }


                if (
                    !assignments ||
                    assignments.length === 0
                ) {

                    assignmentsList.innerHTML =
                        "No assignments have been posted yet.";

                    return;
                }


                assignmentsList.innerHTML = "";


                for (
                    const assignment of assignments
                ) {

                    const assignmentCard =
                        document.createElement(
                            "div"
                        );


                    assignmentCard.className =
                        "assignment-card";


                    const dueDate =
                        new Date(
                            assignment.due_date
                        );


                    assignmentCard.innerHTML = `

                        <h3>
                            ${assignment.title}
                        </h3>

                        <p>
                            <strong>
                                Class:
                            </strong>

                            ${
                                assignment.classes?.class_name ||
                                "Unknown class"
                            }
                        </p>

                        <p>
                            ${
                                assignment.description ||
                                "No instructions"
                            }
                        </p>

                        <p>
                            <strong>
                                Due:
                            </strong>

                            ${dueDate.toLocaleString()}
                        </p>

                        <input
                            type="file"
                            class="submission-file"
                            accept=".pdf,.doc,.docx,.ppt,.pptx"
                        >

                        <button class="submit-assignment-btn">
                            Submit Assignment
                        </button>

                        <p class="submission-message"></p>

                    `;


                    assignmentsList.appendChild(
                        assignmentCard
                    );


                    const fileInput =
                        assignmentCard.querySelector(
                            ".submission-file"
                        );


                    const submitButton =
                        assignmentCard.querySelector(
                            ".submit-assignment-btn"
                        );


                    const submissionMessage =
                        assignmentCard.querySelector(
                            ".submission-message"
                        );


                    submitButton.addEventListener(
                        "click",
                        async function () {

                            const file =
                                fileInput.files[0];


                            if (!file) {

                                submissionMessage.textContent =
                                    "Please select a file.";

                                return;
                            }


                            submissionMessage.textContent =
                                "Uploading submission...";


                            const safeFileName =
                                file.name.replace(
                                    /[^a-zA-Z0-9._-]/g,
                                    "_"
                                );


                            const filePath =
                                user.id +
                                "/" +
                                assignment.id +
                                "/" +
                                crypto.randomUUID() +
                                "-" +
                                safeFileName;


                            const {
                                error: uploadError
                            } =
                                await supabase.storage
                                    .from("submissions")
                                    .upload(
                                        filePath,
                                        file,
                                        {
                                            upsert: false
                                        }
                                    );


                            if (uploadError) {

                                console.error(
                                    uploadError
                                );

                                submissionMessage.textContent =
                                    "Upload failed: " +
                                    uploadError.message;

                                return;
                            }


                            const {
                                error: submissionError
                            } =
                                await supabase
                                    .from("submissions")
                                    .insert([
                                        {
                                            assignment_id:
                                                assignment.id,

                                            student_id:
                                                user.id,

                                            file_url:
                                                filePath
                                        }
                                    ]);


                            if (submissionError) {

                                console.error(
                                    submissionError
                                );

                                submissionMessage.textContent =
                                    "Could not save submission: " +
                                    submissionError.message;

                                return;
                            }


                            submissionMessage.textContent =
                                "Assignment submitted successfully!";


                            fileInput.value = "";

                        }
                    );

                }

            }
        );

    }


    // =================================================
    // MY MARKS / RESULTS
    // =================================================

    const marksBtn =
        document.getElementById(
            "marksBtn"
        );


    if (marksBtn) {

        marksBtn.addEventListener(
            "click",
            async function () {

                const marksList =
                    document.getElementById(
                        "marksList"
                    );


                marksList.innerHTML =
                    "Loading your results...";


                const {
                    data: marks,
                    error
                } = await supabase
                    .from("marks")
                    .select(`
                        id,
                        mark,
                        max_mark,
                        category,
                        feedback,
                        graded_at,
                        class_id,
                        assignments (
                            title
                        ),
                        classes (
                            class_name
                        )
                    `)
                    .eq(
                        "student_id",
                        user.id
                    )
                    .order(
                        "graded_at",
                        {
                            ascending: false
                        }
                    );


                if (error) {

                    console.error(
                        "Error loading results:",
                        error
                    );

                    marksList.innerHTML =
                        "Could not load your results.";

                    return;
                }


                if (
                    !marks ||
                    marks.length === 0
                ) {

                    marksList.innerHTML =
                        "You haven't received any marks yet.";

                    return;
                }


                const formalResults =
                    marks.filter(
                        function (result) {

                            return (
                                result.category ===
                                    "CAT 1" ||

                                result.category ===
                                    "CAT 2" ||

                                result.category ===
                                    "Exam"
                            );

                        }
                    );


                const assignmentMarks =
                    marks.filter(
                        function (result) {

                            return (
                                result.category ===
                                "Assignment"
                            );

                        }
                    );


                let html = "";


                const subjects = {};


                formalResults.forEach(
                    function (result) {

                        const classId =
                            result.class_id;


                        if (!classId) {
                            return;
                        }


                        if (!subjects[classId]) {

                            subjects[classId] = {

                                className:
                                    result.classes?.class_name ||
                                    "Subject",

                                cat1: null,

                                cat2: null,

                                exam: null

                            };

                        }


                        if (
                            result.category ===
                            "CAT 1"
                        ) {

                            subjects[classId].cat1 =
                                result;

                        }


                        if (
                            result.category ===
                            "CAT 2"
                        ) {

                            subjects[classId].cat2 =
                                result;

                        }


                        if (
                            result.category ===
                            "Exam"
                        ) {

                            subjects[classId].exam =
                                result;

                        }

                    }
                );


                const subjectResults =
                    Object.values(
                        subjects
                    );


                if (
                    subjectResults.length > 0
                ) {

                    html += `

                        <div class="marks-section-heading">

                            <h3>
                                📊 Subject Results
                            </h3>

                            <p>
                                CATs contribute 30% and the Exam contributes 70%.
                            </p>

                        </div>

                    `;

                }


                let totalFinalMarks = 0;

                let completedSubjects = 0;


                subjectResults.forEach(
                    function (subject) {

                        let cat1Percentage =
                            null;

                        let cat2Percentage =
                            null;

                        let examPercentage =
                            null;


                        if (
                            subject.cat1
                        ) {

                            cat1Percentage =
                                (
                                    Number(
                                        subject.cat1.mark
                                    ) /
                                    Number(
                                        subject.cat1.max_mark
                                    )
                                ) * 100;

                        }


                        if (
                            subject.cat2
                        ) {

                            cat2Percentage =
                                (
                                    Number(
                                        subject.cat2.mark
                                    ) /
                                    Number(
                                        subject.cat2.max_mark
                                    )
                                ) * 100;

                        }


                        if (
                            subject.exam
                        ) {

                            examPercentage =
                                (
                                    Number(
                                        subject.exam.mark
                                    ) /
                                    Number(
                                        subject.exam.max_mark
                                    )
                                ) * 100;

                        }


                        let catAverage =
                            null;


                        if (
                            cat1Percentage !== null &&
                            cat2Percentage !== null
                        ) {

                            catAverage =
                                (
                                    cat1Percentage +
                                    cat2Percentage
                                ) / 2;

                        }


                        let finalMark =
                            null;


                        if (
                            catAverage !== null &&
                            examPercentage !== null
                        ) {

                            finalMark =
                                (
                                    catAverage * 0.30
                                ) +
                                (
                                    examPercentage * 0.70
                                );


                            totalFinalMarks +=
                                finalMark;


                            completedSubjects++;

                        }


                        html += `

                            <div class="mark-card">

                                <div class="mark-card-header">

                                    <div>

                                        <h3>
                                            ${subject.className}
                                        </h3>

                                        <p>
                                            Final Subject Result
                                        </p>

                                    </div>

                                    ${
                                        finalMark !== null

                                        ?

                                        `
                                            <div class="final-mark">
                                                ${finalMark.toFixed(1)}%
                                            </div>
                                        `

                                        :

                                        `
                                            <div class="final-mark">
                                                Pending
                                            </div>
                                        `
                                    }

                                </div>


                                <div class="result-breakdown">

                                    <div class="result-item">

                                        <span>
                                            CAT 1
                                        </span>

                                        <strong>
                                            ${
                                                cat1Percentage !== null
                                                    ? cat1Percentage.toFixed(1) + "%"
                                                    : "—"
                                            }
                                        </strong>

                                    </div>


                                    <div class="result-item">

                                        <span>
                                            CAT 2
                                        </span>

                                        <strong>
                                            ${
                                                cat2Percentage !== null
                                                    ? cat2Percentage.toFixed(1) + "%"
                                                    : "—"
                                            }
                                        </strong>

                                    </div>


                                    <div class="result-item">

                                        <span>
                                            CAT Average
                                        </span>

                                        <strong>
                                            ${
                                                catAverage !== null
                                                    ? catAverage.toFixed(1) + "%"
                                                    : "—"
                                            }
                                        </strong>

                                    </div>


                                    <div class="result-item">

                                        <span>
                                            Exam
                                        </span>

                                        <strong>
                                            ${
                                                examPercentage !== null
                                                    ? examPercentage.toFixed(1) + "%"
                                                    : "—"
                                            }
                                        </strong>

                                    </div>

                                </div>


                                ${
                                    finalMark !== null

                                    ?

                                    `
                                        <div class="result-formula">

                                            CAT Average × 30%
                                            +
                                            Exam × 70%
                                            =

                                            <strong>
                                                ${finalMark.toFixed(1)}%
                                            </strong>

                                        </div>
                                    `

                                    :

                                    `
                                        <p class="result-pending">

                                            Final mark will appear after
                                            CAT 1, CAT 2 and Exam are entered.

                                        </p>
                                    `
                                }

                            </div>

                        `;

                    }
                );


                if (
                    completedSubjects > 0
                ) {

                    const overallMean =
                        totalFinalMarks /
                        completedSubjects;


                    html += `

                        <div class="mark-card overall-result-card">

                            <h3>
                                🎓 Overall Mean Mark
                            </h3>

                            <div class="overall-result-number">

                                ${overallMean.toFixed(1)}%

                            </div>

                            <p>

                                Based on
                                ${completedSubjects}
                                completed subject(s).

                            </p>

                        </div>

                    `;

                }


                if (
                    assignmentMarks.length > 0
                ) {

                    html += `

                        <div class="marks-section-heading">

                            <h3>
                                📝 Assignment Progress
                            </h3>

                            <p>

                                Assignments are for progress tracking
                                and do not affect your final subject mark.

                            </p>

                        </div>

                    `;


                    assignmentMarks.forEach(
                        function (result) {

                            const maxMark =
                                Number(
                                    result.max_mark ||
                                    100
                                );


                            const percentage =
                                (
                                    Number(
                                        result.mark
                                    ) /
                                    maxMark
                                ) * 100;


                            html += `

                                <div class="mark-card">

                                    <h3>
                                        ${
                                            result.assignments?.title ||
                                            "Assignment"
                                        }
                                    </h3>

                                    <p>

                                        <strong>
                                            Class:
                                        </strong>

                                        ${
                                            result.classes?.class_name ||
                                            "Unknown class"
                                        }

                                    </p>

                                    <p>

                                        <strong>
                                            Mark:
                                        </strong>

                                        ${result.mark}/${maxMark}

                                    </p>

                                    <p>

                                        <strong>
                                            Percentage:
                                        </strong>

                                        ${percentage.toFixed(1)}%

                                    </p>

                                    <p>

                                        <strong>
                                            Feedback:
                                        </strong>

                                        ${
                                            result.feedback ||
                                            "No feedback provided"
                                        }

                                    </p>

                                </div>

                            `;

                        }
                    );

                }


                marksList.innerHTML =
                    html;

            }
        );

    }


    // =================================================
    // ANNOUNCEMENTS
    // =================================================

    const announcementsBtn =
        document.getElementById(
            "announcementsBtn"
        );


    if (announcementsBtn) {

        announcementsBtn.addEventListener(
            "click",
            async function () {

                const list =
                    document.getElementById(
                        "studentAnnouncementsList"
                    );


                list.innerHTML =
                    "Loading announcements...";


                const {
                    data: memberships,
                    error: membershipError
                } = await supabase
                    .from("class_members")
                    .select("class_id")
                    .eq(
                        "student_id",
                        user.id
                    );


                if (membershipError) {

                    console.error(
                        membershipError
                    );

                    list.innerHTML =
                        "Could not load your classes.";

                    return;
                }


                if (
                    !memberships ||
                    memberships.length === 0
                ) {

                    list.innerHTML =
                        "You have not joined any classes yet.";

                    return;
                }


                const classIds =
                    memberships.map(
                        function (membership) {

                            return membership.class_id;

                        }
                    );


                const {
                    data: announcements,
                    error
                } = await supabase
                    .from("announcements")
                    .select(`
                        id,
                        title,
                        message,
                        created_at,
                        classes (
                            class_name
                        )
                    `)
                    .in(
                        "class_id",
                        classIds
                    )
                    .order(
                        "created_at",
                        {
                            ascending: false
                        }
                    );


                if (error) {

                    console.error(error);

                    list.innerHTML =
                        "Could not load announcements.";

                    return;
                }


                if (
                    !announcements ||
                    announcements.length === 0
                ) {

                    list.innerHTML =
                        "No announcements yet.";

                    return;
                }


                list.innerHTML = "";


                announcements.forEach(
                    function (announcement) {

                        const card =
                            document.createElement(
                                "div"
                            );


                        card.className =
                            "announcement-card";


                        card.innerHTML = `

                            <h3>
                                ${announcement.title}
                            </h3>

                            <p>

                                <strong>
                                    Class:
                                </strong>

                                ${
                                    announcement.classes?.class_name ||
                                    "Unknown class"
                                }

                            </p>

                            <p>
                                ${announcement.message}
                            </p>

                            <small>

                                ${
                                    new Date(
                                        announcement.created_at
                                    ).toLocaleString()
                                }

                            </small>

                        `;


                        list.appendChild(
                            card
                        );

                    }
                );

            }
        );

    }


    // =================================================
    // STUDENT ATTENDANCE
    // =================================================

    const attendanceBtn =
        document.getElementById(
            "attendanceBtn"
        );


    if (attendanceBtn) {

        attendanceBtn.addEventListener(
            "click",
            async function () {

                const list =
                    document.getElementById(
                        "studentAttendanceList"
                    );


                list.innerHTML =
                    "Loading your attendance...";


                const {
                    data: memberships,
                    error: membershipError
                } = await supabase
                    .from("class_members")
                    .select("class_id")
                    .eq(
                        "student_id",
                        user.id
                    );


                if (membershipError) {

                    console.error(
                        membershipError
                    );

                    list.innerHTML =
                        "Could not load your classes.";

                    return;
                }


                if (
                    !memberships ||
                    memberships.length === 0
                ) {

                    list.innerHTML =
                        "You have not joined any classes yet.";

                    return;
                }


                const classIds =
                    memberships.map(
                        function (membership) {

                            return membership.class_id;

                        }
                    );


                const {
                    data: sessions,
                    error: sessionError
                } = await supabase
                    .from("attendance_sessions")
                    .select(`
                        id,
                        session_title,
                        session_date,
                        classes (
                            class_name
                        )
                    `)
                    .in(
                        "class_id",
                        classIds
                    )
                    .order(
                        "session_date",
                        {
                            ascending: false
                        }
                    );


                if (sessionError) {

                    console.error(
                        sessionError
                    );

                    list.innerHTML =
                        "Could not load attendance sessions.";

                    return;
                }


                if (
                    !sessions ||
                    sessions.length === 0
                ) {

                    list.innerHTML =
                        "No attendance sessions yet.";

                    return;
                }


                list.innerHTML = "";


                for (
                    const session of sessions
                ) {

                    const {
                        data: record,
                        error: recordError
                    } = await supabase
                        .from("attendance_records")
                        .select("status")
                        .eq(
                            "session_id",
                            session.id
                        )
                        .eq(
                            "student_id",
                            user.id
                        )
                        .maybeSingle();


                    if (recordError) {

                        console.error(
                            recordError
                        );

                        continue;
                    }


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "attendance-card";


                    const status =
                        record?.status ||
                        "Not marked";


                    card.innerHTML = `

                        <h3>
                            ${session.session_title}
                        </h3>

                        <p>

                            <strong>
                                Class:
                            </strong>

                            ${
                                session.classes?.class_name ||
                                "Unknown class"
                            }

                        </p>

                        <p>

                            <strong>
                                Date:
                            </strong>

                            ${session.session_date}

                        </p>

                        <p>

                            <strong>
                                Status:
                            </strong>

                            ${status}

                        </p>

                    `;


                    list.appendChild(
                        card
                    );

                }

            }
        );

    }


    // =================================================
    // STUDENT OVERVIEW
    // =================================================

    async function loadStudentOverview() {

        const classesCount =
            document.getElementById(
                "overviewClasses"
            );

        const assignmentsCount =
            document.getElementById(
                "overviewAssignments"
            );

        const pendingAssignments =
            document.getElementById(
                "overviewPendingAssignments"
            );

        const materialsCount =
            document.getElementById(
                "overviewMaterials"
            );

        const gradedCount =
            document.getElementById(
                "overviewGraded"
            );

        const averageMark =
            document.getElementById(
                "overviewAverageMark"
            );

        const attendancePercentage =
            document.getElementById(
                "overviewAttendance"
            );


        if (
            !classesCount ||
            !assignmentsCount ||
            !pendingAssignments ||
            !materialsCount ||
            !gradedCount ||
            !averageMark ||
            !attendancePercentage
        ) {

            return;
        }


        const {
            data: memberships,
            error: membershipError
        } = await supabase
            .from("class_members")
            .select("class_id")
            .eq(
                "student_id",
                user.id
            );


        if (membershipError) {

            console.error(
                "Membership error:",
                membershipError
            );

            return;
        }


        const classIds =
            (memberships || []).map(
                function (item) {

                    return item.class_id;

                }
            );


        classesCount.textContent =
            classIds.length;


        if (
            classIds.length === 0
        ) {

            assignmentsCount.textContent =
                "0";

            pendingAssignments.textContent =
                "0";

            materialsCount.textContent =
                "0";

            gradedCount.textContent =
                "0";

            averageMark.textContent =
                "0%";

            attendancePercentage.textContent =
                "0%";

            return;
        }


        // ASSIGNMENTS

        const {
            data: assignments,
            error: assignmentError
        } = await supabase
            .from("assignments")
            .select("id")
            .in(
                "class_id",
                classIds
            );


        if (assignmentError) {

            console.error(
                "Assignments error:",
                assignmentError
            );

            assignmentsCount.textContent =
                "0";

            pendingAssignments.textContent =
                "0";

        } else {

            assignmentsCount.textContent =
                assignments?.length || 0;


            const assignmentIds =
                (assignments || []).map(
                    function (assignment) {

                        return assignment.id;

                    }
                );


            if (
                assignmentIds.length === 0
            ) {

                pendingAssignments.textContent =
                    "0";

            } else {

                const {
                    data: submissions,
                    error: submissionsError
                } = await supabase
                    .from("submissions")
                    .select("assignment_id")
                    .eq(
                        "student_id",
                        user.id
                    )
                    .in(
                        "assignment_id",
                        assignmentIds
                    );


                if (submissionsError) {

                    console.error(
                        "Submissions error:",
                        submissionsError
                    );

                    pendingAssignments.textContent =
                        "0";

                } else {

                    const submittedIds =
                        new Set(
                            (submissions || []).map(
                                function (submission) {

                                    return submission.assignment_id;

                                }
                            )
                        );


                    const pendingCount =
                        assignmentIds.filter(
                            function (assignmentId) {

                                return !submittedIds.has(
                                    assignmentId
                                );

                            }
                        ).length;


                    pendingAssignments.textContent =
                        pendingCount;

                }

            }

        }


        // LEARNING MATERIALS

        const {
            data: materials,
            error: materialsError
        } = await supabase
            .from("materials")
            .select("id")
            .in(
                "class_id",
                classIds
            );


        if (materialsError) {

            console.error(
                "Materials error:",
                materialsError
            );

            materialsCount.textContent =
                "0";

        } else {

            materialsCount.textContent =
                materials?.length || 0;

        }


        // MARKS

        const {
            data: marks,
            error: marksError
        } = await supabase
            .from("marks")
            .select(
                "id, mark, max_mark, category"
            )
            .eq(
                "student_id",
                user.id
            );


        if (marksError) {

            console.error(
                "Marks error:",
                marksError
            );

            gradedCount.textContent =
                "0";

            averageMark.textContent =
                "0%";

        } else {

            gradedCount.textContent =
                marks?.length || 0;


            const percentages =
                (marks || [])
                    .map(
                        function (item) {

                            const mark =
                                Number(
                                    item.mark
                                );

                            const maxMark =
                                Number(
                                    item.max_mark ||
                                    100
                                );


                            if (
                                !Number.isFinite(mark) ||
                                !Number.isFinite(maxMark) ||
                                maxMark <= 0
                            ) {

                                return null;

                            }


                            return (
                                mark /
                                maxMark
                            ) * 100;

                        }
                    )
                    .filter(
                        function (percentage) {

                            return (
                                percentage !== null &&
                                Number.isFinite(
                                    percentage
                                )
                            );

                        }
                    );


            if (
                percentages.length > 0
            ) {

                const totalPercentage =
                    percentages.reduce(
                        function (
                            total,
                            percentage
                        ) {

                            return (
                                total +
                                percentage
                            );

                        },
                        0
                    );


                const average =
                    Math.round(
                        totalPercentage /
                        percentages.length
                    );


                averageMark.textContent =
                    average + "%";

            } else {

                averageMark.textContent =
                    "0%";

            }

        }


        // ATTENDANCE

        const {
            data: sessions,
            error: sessionsError
        } = await supabase
            .from("attendance_sessions")
            .select("id")
            .in(
                "class_id",
                classIds
            );


        if (sessionsError) {

            console.error(
                "Attendance sessions error:",
                sessionsError
            );

            attendancePercentage.textContent =
                "0%";

        } else if (
            !sessions ||
            sessions.length === 0
        ) {

            attendancePercentage.textContent =
                "0%";

        } else {

            const sessionIds =
                sessions.map(
                    function (session) {

                        return session.id;

                    }
                );


            const {
                data: attendance,
                error: attendanceError
            } = await supabase
                .from("attendance_records")
                .select(
                    "session_id, status"
                )
                .eq(
                    "student_id",
                    user.id
                )
                .in(
                    "session_id",
                    sessionIds
                );


            if (attendanceError) {

                console.error(
                    "Attendance records error:",
                    attendanceError
                );

                attendancePercentage.textContent =
                    "0%";

            } else {

                const attendedCount =
                    (attendance || []).filter(
                        function (record) {

                            return (
                                record.status ===
                                    "present" ||

                                record.status ===
                                    "late"
                            );

                        }
                    ).length;


                const percentage =
                    Math.round(
                        (
                            attendedCount /
                            sessions.length
                        ) * 100
                    );


                attendancePercentage.textContent =
                    percentage + "%";

            }

        }

    }


    // =================================================
    // STUDENT MESSAGES
    // =================================================

    const messageReceiver =
        document.getElementById(
            "messageReceiver"
        );

    const sendMessageBtn =
        document.getElementById(
            "sendMessageBtn"
        );

    const messageText =
        document.getElementById(
            "messageText"
        );

    const messageStatus =
        document.getElementById(
            "messageStatus"
        );

    const messagesList =
        document.getElementById(
            "messagesList"
        );


    // =================================================
    // LOAD LECTURERS
    // =================================================

    async function loadMessageLecturers() {

        if (!messageReceiver) {
            return;
        }


        messageReceiver.innerHTML = `

            <option value="">
                Loading lecturers...
            </option>

        `;


        const {
            data: memberships,
            error: membershipError
        } = await supabase
            .from("class_members")
            .select(`
                class_id,
                classes (
                    id,
                    class_name,
                    lecturer_id
                )
            `)
            .eq(
                "student_id",
                user.id
            );


        if (membershipError) {

            console.error(
                "Error loading classes:",
                membershipError
            );

            messageReceiver.innerHTML = `

                <option value="">
                    Could not load lecturers
                </option>

            `;

            return;
        }


        if (
            !memberships ||
            memberships.length === 0
        ) {

            messageReceiver.innerHTML = `

                <option value="">
                    You have not joined any classes
                </option>

            `;

            return;
        }


        const lecturerIds = [];


        memberships.forEach(
            function (membership) {

                const lecturerId =
                    membership.classes?.lecturer_id;


                if (
                    lecturerId &&
                    !lecturerIds.includes(
                        lecturerId
                    )
                ) {

                    lecturerIds.push(
                        lecturerId
                    );

                }

            }
        );


        if (
            lecturerIds.length === 0
        ) {

            messageReceiver.innerHTML = `

                <option value="">
                    No lecturers found
                </option>

            `;

            return;
        }


        const {
            data: lecturers,
            error: lecturerError
        } = await supabase
            .from("profiles")
            .select(`
                id,
                full_name
            `)
            .in(
                "id",
                lecturerIds
            );


        if (lecturerError) {

            console.error(
                "Error loading lecturers:",
                lecturerError
            );

            messageReceiver.innerHTML = `

                <option value="">
                    Could not load lecturers
                </option>

            `;

            return;
        }


        messageReceiver.innerHTML = `

            <option value="">
                Select a lecturer
            </option>

        `;


        lecturers.forEach(
            function (lecturer) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    lecturer.id;


                option.textContent =
                    lecturer.full_name ||
                    "Lecturer";


                messageReceiver.appendChild(
                    option
                );

            }
        );

    }


    // =================================================
    // SEND MESSAGE
    // =================================================

    if (sendMessageBtn) {

        sendMessageBtn.addEventListener(
            "click",
            async function () {

                const receiverId =
                    messageReceiver.value;


                const message =
                    messageText.value.trim();


                if (!receiverId) {

                    messageStatus.textContent =
                        "Please select a lecturer.";

                    return;
                }


                if (!message) {

                    messageStatus.textContent =
                        "Please write a message.";

                    return;
                }


                sendMessageBtn.disabled =
                    true;


                sendMessageBtn.textContent =
                    "Sending...";


                const {
                    error
                } = await supabase
                    .from("messages")
                    .insert({

                        sender_id:
                            user.id,

                        receiver_id:
                            receiverId,

                        message:
                            message

                    });


                if (error) {

                    console.error(error);

                    messageStatus.textContent =
                        "Could not send message.";

                } else {

                    messageStatus.textContent =
                        "✅ Message sent successfully.";

                    messageText.value = "";

                    await loadMessages();

                }


                sendMessageBtn.disabled =
                    false;


                sendMessageBtn.textContent =
                    "💬 Send Message";

            }
        );

    }


    // =================================================
    // LOAD MESSAGES
    // =================================================

    async function loadMessages() {

        if (!messagesList) {
            return;
        }


        messagesList.innerHTML =
            "Loading messages...";


        const {
            data: messages,
            error
        } = await supabase
            .from("messages")
            .select(`
                id,
                sender_id,
                receiver_id,
                message,
                created_at,
                read_at
            `)
            .or(
                `sender_id.eq.${user.id},receiver_id.eq.${user.id}`
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


        if (error) {

            console.error(error);

            messagesList.innerHTML =
                "Could not load messages.";

            return;
        }


        if (
            !messages ||
            messages.length === 0
        ) {

            messagesList.innerHTML = `

                <p class="empty-state">
                    No messages yet.
                </p>

            `;

            return;
        }


        messagesList.innerHTML = "";


        messages.forEach(
            function (item) {

                const messageCard =
                    document.createElement(
                        "div"
                    );


                messageCard.className =
                    "message-card";


                const isSent =
                    item.sender_id ===
                    user.id;


                messageCard.innerHTML = `

                    <div class="message-card-top">

                        <strong>

                            ${
                                isSent
                                    ? "You"
                                    : "Lecturer"
                            }

                        </strong>

                        <span>

                            ${
                                new Date(
                                    item.created_at
                                ).toLocaleString()
                            }

                        </span>

                    </div>


                    <p>
                        ${item.message}
                    </p>

                `;


                messagesList.appendChild(
                    messageCard
                );

            }
        );

    }


    // =================================================
    // LOAD STUDENT FEE ELIGIBILITY
    // =================================================

    async function loadStudentFeeEligibility() {

        const feeEligibility =
            document.getElementById(
                "studentFeeEligibility"
            );


        if (!feeEligibility) {
            return;
        }


        feeEligibility.innerHTML = `

            <p class="empty-state">
                Loading fee status...
            </p>

        `;


        // Get current logged-in student

        const {
            data: {
                user: currentUser
            },
            error: currentUserError
        } = await supabase.auth.getUser();


        if (
            currentUserError ||
            !currentUser
        ) {

            feeEligibility.innerHTML = `

                <p class="empty-state">
                    Unable to identify your account.
                </p>

            `;

            return;
        }


        // Get fee eligibility

        const {
            data,
            error
        } = await supabase.rpc(
            "get_student_fee_eligibility",
            {
                p_student_id:
                    currentUser.id
            }
        );


        if (error) {

            console.error(
                "Fee eligibility error:",
                error
            );


            feeEligibility.innerHTML = `

                <p class="empty-state">
                    Unable to load fee status.
                </p>

            `;

            return;
        }


        if (
            !data ||
            data.length === 0
        ) {

            feeEligibility.innerHTML = `

                <p class="empty-state">
                    No fee account found.
                </p>

            `;

            return;
        }


        const fee =
            data[0];


        const amountDue =
            Number(
                fee.amount_due || 0
            );


        const amountPaid =
            Number(
                fee.amount_paid || 0
            );


        const balance =
            Number(
                fee.balance || 0
            );


        const paymentPercentage =
            Number(
                fee.payment_percentage || 0
            );


        const minimumPercentage =
            Number(
                fee.minimum_percentage || 0
            );


        // =================================================
        // ELIGIBLE
        // =================================================

        if (fee.eligible) {

            feeEligibility.innerHTML = `

                <div class="fee-status-card fee-status-success">

                    <div class="fee-status-header">

                        <div>

                            <h3>
                                🟢 Eligible for Examination
                            </h3>

                            <p>
                                You have met the minimum
                                fee payment requirement.
                            </p>

                        </div>

                    </div>


                    <div class="fee-status-grid">

                        <div class="fee-status-item">

                            <span>
                                Amount Due
                            </span>

                            <strong>
                                KSh ${amountDue.toLocaleString()}
                            </strong>

                        </div>


                        <div class="fee-status-item">

                            <span>
                                Amount Paid
                            </span>

                            <strong>
                                KSh ${amountPaid.toLocaleString()}
                            </strong>

                        </div>


                        <div class="fee-status-item">

                            <span>
                                Balance
                            </span>

                            <strong>
                                KSh ${balance.toLocaleString()}
                            </strong>

                        </div>


                        <div class="fee-status-item">

                            <span>
                                Payment Percentage
                            </span>

                            <strong>
                                ${paymentPercentage}%
                            </strong>

                        </div>


                        <div class="fee-status-item">

                            <span>
                                Minimum Required
                            </span>

                            <strong>
                                ${minimumPercentage}%
                            </strong>

                        </div>

                    </div>

                </div>

            `;

        }

        // =================================================
        // NOT ELIGIBLE
        // =================================================

        else {

            feeEligibility.innerHTML = `

                <div class="fee-status-card fee-status-danger">

                    <div class="fee-status-header">

                        <div>

                            <h3>
                                🔴 Not Yet Eligible
                            </h3>

                            <p>
                                You have not yet reached
                                the minimum fee payment
                                requirement for examination.
                            </p>

                        </div>

                    </div>


                    <div class="fee-status-grid">

                        <div class="fee-status-item">

                            <span>
                                Amount Due
                            </span>

                            <strong>
                                KSh ${amountDue.toLocaleString()}
                            </strong>

                        </div>


                        <div class="fee-status-item">

                            <span>
                                Amount Paid
                            </span>

                            <strong>
                                KSh ${amountPaid.toLocaleString()}
                            </strong>

                        </div>


                        <div class="fee-status-item">

                            <span>
                                Balance
                            </span>

                            <strong>
                                KSh ${balance.toLocaleString()}
                            </strong>

                        </div>


                        <div class="fee-status-item">

                            <span>
                                Payment Percentage
                            </span>

                            <strong>
                                ${paymentPercentage}%
                            </strong>

                        </div>


                        <div class="fee-status-item">

                            <span>
                                Minimum Required
                            </span>

                            <strong>
                                ${minimumPercentage}%
                            </strong>

                        </div>

                    </div>


                    <div class="fee-status-note">

                        <strong>
                            Additional payment required:
                        </strong>

                        KSh ${
                            Math.max(
                                0,
                                (
                                    amountDue *
                                    (
                                        minimumPercentage /
                                        100
                                    )
                                ) -
                                amountPaid
                            ).toLocaleString()
                        }

                    </div>

                </div>

            `;

        }

    }

    async function loadExamRegistration() {
    const examSection =
        document.getElementById(
            "examRegistrationSection"
        );

    if (!examSection) {
        return;
    }

    examSection.innerHTML = `
        <p class="empty-state">
            Loading examination registration...
        </p>
    `;

    const {
        data: {
            user: currentUser
        },
        error: currentUserError
    } = await supabase.auth.getUser();

    if (
        currentUserError ||
        !currentUser
    ) {
        examSection.innerHTML = `
            <p class="empty-state">
                Unable to identify your account.
            </p>
        `;
        return;
    }

    /*
     * Get the student's current fee eligibility.
     */
    const {
        data: feeData,
        error: feeError
    } = await supabase.rpc(
        "get_student_fee_eligibility",
        {
            p_student_id:
                currentUser.id
        }
    );

    if (feeError) {
        console.error(
            "Exam fee eligibility error:",
            feeError
        );

        examSection.innerHTML = `
            <p class="empty-state">
                Unable to check examination eligibility.
            </p>
        `;

        return;
    }

    if (
        !feeData ||
        feeData.length === 0
    ) {
        examSection.innerHTML = `
            <p class="empty-state">
                No fee account found.
            </p>
        `;

        return;
    }

    const fee = feeData[0];

    /*
     * Get the academic year and semester
     * associated with the student's fee account.
     */
    const {
        data: feeAccount,
        error: feeAccountError
    } = await supabase
        .from("student_fee_accounts")
        .select(`
            id,
            fee_structures (
                academic_year_id,
                semester_id,
                academic_years (
                    year_number
                ),
                semesters (
                    semester_number
                )
            )
        `)
        .eq(
            "id",
            fee.fee_account_id
        )
        .single();

    if (feeAccountError) {
        console.error(
            "Fee account error:",
            feeAccountError
        );

        examSection.innerHTML = `
            <p class="empty-state">
                Unable to load examination period.
            </p>
        `;

        return;
    }

    const feeStructure =
        feeAccount?.fee_structures;

    if (!feeStructure) {
        examSection.innerHTML = `
            <p class="empty-state">
                Examination period could not be determined.
            </p>
        `;

        return;
    }

    const academicYearId =
        feeStructure.academic_year_id;

    const semesterId =
        feeStructure.semester_id;

    const yearNumber =
        feeStructure.academic_years
            ?.year_number || "N/A";

    const semesterNumber =
        feeStructure.semesters
            ?.semester_number || "N/A";

    /*
     * Check whether the student has
     * already registered.
     */
    const {
        data: registration,
        error: registrationError
    } = await supabase
        .from("exam_registrations")
        .select(`
            id,
            registration_status,
            registered_at
        `)
        .eq(
            "student_id",
            currentUser.id
        )
        .eq(
            "academic_year_id",
            academicYearId
        )
        .eq(
            "semester_id",
            semesterId
        )
        .maybeSingle();

    if (registrationError) {
        console.error(
            "Exam registration error:",
            registrationError
        );

        examSection.innerHTML = `
            <p class="empty-state">
                Unable to load examination registration.
            </p>
        `;

        return;
    }

    /*
     * Student is already registered.
     */
    if (
        registration &&
        registration.registration_status ===
            "registered"
    ) {
        const registeredDate =
            registration.registered_at
                ? new Date(
                    registration.registered_at
                ).toLocaleDateString()
                : "N/A";

        examSection.innerHTML = `
            <div class="fee-status-card fee-status-success">

                <div class="fee-status-header">
                    <div>
                        <h3>
                            🟢 Examination Registered
                        </h3>

                        <p>
                            You are registered for
                            Year ${yearNumber},
                            Semester ${semesterNumber}.
                        </p>
                    </div>
                </div>

                <div class="fee-status-grid">

                    <div class="fee-status-item">
                        <span>Academic Year</span>
                        <strong>
                            Year ${yearNumber}
                        </strong>
                    </div>

                    <div class="fee-status-item">
                        <span>Semester</span>
                        <strong>
                            Semester ${semesterNumber}
                        </strong>
                    </div>

                    <div class="fee-status-item">
                        <span>Status</span>
                        <strong>
                            Registered
                        </strong>
                    </div>

                    <div class="fee-status-item">
                        <span>Registered On</span>
                        <strong>
                            ${registeredDate}
                        </strong>
                    </div>

                </div>

            </div>
        `;

        return;
    }

    /*
     * Student has not registered.
     */
    if (!fee.eligible) {

        const amountDue =
            Number(
                fee.amount_due || 0
            );

        const amountPaid =
            Number(
                fee.amount_paid || 0
            );

        const minimumPercentage =
            Number(
                fee.minimum_percentage || 0
            );

        const additionalPayment =
            Math.max(
                0,
                (
                    amountDue *
                    (
                        minimumPercentage /
                        100
                    )
                ) -
                amountPaid
            );

        examSection.innerHTML = `
            <div class="fee-status-card fee-status-danger">

                <div class="fee-status-header">
                    <div>
                        <h3>
                            🔴 Examination Registration Locked
                        </h3>

                        <p>
                            You must meet the minimum
                            fee payment requirement
                            before registering for examinations.
                        </p>
                    </div>
                </div>

                <div class="fee-status-grid">

                    <div class="fee-status-item">
                        <span>Academic Year</span>
                        <strong>
                            Year ${yearNumber}
                        </strong>
                    </div>

                    <div class="fee-status-item">
                        <span>Semester</span>
                        <strong>
                            Semester ${semesterNumber}
                        </strong>
                    </div>

                    <div class="fee-status-item">
                        <span>Payment</span>
                        <strong>
                            ${fee.payment_percentage}%
                        </strong>
                    </div>

                    <div class="fee-status-item">
                        <span>Required</span>
                        <strong>
                            ${fee.minimum_percentage}%
                        </strong>
                    </div>

                </div>

                <div class="fee-status-note">

                    <strong>
                        Registration unavailable.
                    </strong>

                    Additional payment required:
                    <strong>
                        KSh ${additionalPayment.toLocaleString()}
                    </strong>

                </div>

            </div>
        `;

        return;
    }

    /*
     * Student is eligible, so show
     * the registration button.
     */
    examSection.innerHTML = `
        <div class="fee-status-card fee-status-success">

            <div class="fee-status-header">
                <div>
                    <h3>
                        🟢 Eligible for Examination Registration
                    </h3>

                    <p>
                        Your fee payment requirement
                        has been satisfied.
                    </p>
                </div>
            </div>

            <div class="fee-status-grid">

                <div class="fee-status-item">
                    <span>Academic Year</span>
                    <strong>
                        Year ${yearNumber}
                    </strong>
                </div>

                <div class="fee-status-item">
                    <span>Semester</span>
                    <strong>
                        Semester ${semesterNumber}
                    </strong>
                </div>

                <div class="fee-status-item">
                    <span>Payment</span>
                    <strong>
                        ${fee.payment_percentage}%
                    </strong>
                </div>

                <div class="fee-status-item">
                    <span>Required</span>
                    <strong>
                        ${fee.minimum_percentage}%
                    </strong>
                </div>

            </div>

            <button
                id="registerForExamsBtn"
                class="primary-button"
                type="button"
            >
                Register for Examinations
            </button>

            <p
                id="examRegistrationMessage"
                class="form-message"
            ></p>

        </div>
    `;

    const registerButton =
        document.getElementById(
            "registerForExamsBtn"
        );

    if (registerButton) {

        registerButton.addEventListener(
            "click",
            async function() {

                registerButton.disabled = true;

                registerButton.textContent =
                    "Registering...";

                const message =
                    document.getElementById(
                        "examRegistrationMessage"
                    );

                if (message) {
                    message.textContent = "";
                }

                const {
                    data: registrationId,
                    error
                } = await supabase.rpc(
                    "register_for_exams",
                    {
                        p_academic_year_id:
                            academicYearId,

                        p_semester_id:
                            semesterId
                    }
                );

                if (error) {

                    console.error(
                        "Exam registration failed:",
                        error
                    );

                    if (message) {
                        message.textContent =
                            error.message ||
                            "Examination registration failed.";
                    }

                    registerButton.disabled =
                        false;

                    registerButton.textContent =
                        "Register for Examinations";

                    return;
                }

                console.log(
                    "Exam registration successful:",
                    registrationId
                );

                await loadExamRegistration();
            }
        );
    }
}

async function loadExamCard() {
    const examCardSection =
        document.getElementById(
            "examCardSection"
        );

    if (!examCardSection) {
        return;
    }

    examCardSection.innerHTML = `
        <p class="empty-state">
            Checking examination card...
        </p>
    `;

    const {
        data: {
            user: currentUser
        },
        error: currentUserError
    } = await supabase.auth.getUser();

    if (
        currentUserError ||
        !currentUser
    ) {
        examCardSection.innerHTML = `
            <p class="empty-state">
                Unable to identify your account.
            </p>
        `;
        return;
    }

    /*
     * Find the student's registered examination.
     */
    const {
        data: registration,
        error: registrationError
    } = await supabase
        .from("exam_registrations")
        .select(`
            id,
            academic_year_id,
            semester_id,
            registration_status,
            registered_at
        `)
        .eq(
            "student_id",
            currentUser.id
        )
        .eq(
            "registration_status",
            "registered"
        )
        .order(
            "registered_at",
            {
                ascending: false
            }
        )
        .limit(1)
        .maybeSingle();

    if (registrationError) {
        console.error(
            "Exam registration lookup error:",
            registrationError
        );

        examCardSection.innerHTML = `
            <p class="empty-state">
                Unable to check examination registration.
            </p>
        `;

        return;
    }

    if (!registration) {
        examCardSection.innerHTML = `
            <div class="fee-status-card fee-status-danger">
                <div class="fee-status-header">
                    <div>
                        <h3>
                            🔒 Exam Card Unavailable
                        </h3>

                        <p>
                            You must complete examination
                            registration before an exam card
                            can be issued.
                        </p>
                    </div>
                </div>
            </div>
        `;

        return;
    }

    /*
     * Check whether an exam card already exists.
     */
    const {
        data: existingCard,
        error: cardError
    } = await supabase
        .from("exam_cards")
        .select(`
            id,
            card_number,
            issued_at,
            status
        `)
        .eq(
            "exam_registration_id",
            registration.id
        )
        .eq(
            "status",
            "active"
        )
        .maybeSingle();

    if (cardError) {
        console.error(
            "Exam card lookup error:",
            cardError
        );

        examCardSection.innerHTML = `
            <p class="empty-state">
                Unable to check your examination card.
            </p>
        `;

        return;
    }

    /*
     * If a card already exists, display it.
     */
    if (existingCard) {

        const issuedDate =
            existingCard.issued_at
                ? new Date(
                    existingCard.issued_at
                ).toLocaleDateString()
                : "N/A";

        examCardSection.innerHTML = `
            <div class="fee-status-card fee-status-success">

                <div class="fee-status-header">
                    <div>
                        <h3>
                            🟢 Examination Card Ready
                        </h3>

                        <p>
                            Your examination card has
                            been issued successfully.
                        </p>
                    </div>
                </div>

                <div class="fee-status-grid">

                    <div class="fee-status-item">
                        <span>Card Number</span>
                        <strong>
                            ${existingCard.card_number}
                        </strong>
                    </div>

                    <div class="fee-status-item">
                        <span>Status</span>
                        <strong>
                            Active
                        </strong>
                    </div>

                    <div class="fee-status-item">
                        <span>Issued On</span>
                        <strong>
                            ${issuedDate}
                        </strong>
                    </div>

                </div>

                <button
                    id="viewExamCardBtn"
                    class="primary-button"
                    type="button"
                >
                    View Examination Card
                </button>

            </div>
        `;

        const viewButton =
            document.getElementById(
                "viewExamCardBtn"
            );

        if (viewButton) {
            viewButton.addEventListener(
                "click",
                function() {
                    viewExamCard(
                        existingCard.id
                    );
                }
            );
        }

        return;
    }

    /*
     * No card exists yet.
     *
     * Ask the secure backend function
     * to issue one.
     */
    examCardSection.innerHTML = `
        <div class="fee-status-card fee-status-success">

            <div class="fee-status-header">
                <div>
                    <h3>
                        🟢 Eligible for Exam Card
                    </h3>

                    <p>
                        Your examination registration
                        is complete.
                    </p>
                </div>
            </div>

            <button
                id="issueExamCardBtn"
                class="primary-button"
                type="button"
            >
                Issue Examination Card
            </button>

            <p
                id="examCardMessage"
                class="form-message"
            ></p>

        </div>
    `;

    const issueButton =
        document.getElementById(
            "issueExamCardBtn"
        );

    if (issueButton) {

        issueButton.addEventListener(
            "click",
            async function() {

                issueButton.disabled = true;

                issueButton.textContent =
                    "Issuing Card...";

                const message =
                    document.getElementById(
                        "examCardMessage"
                    );

                if (message) {
                    message.textContent = "";
                }

                const {
                    data: cardId,
                    error
                } = await supabase.rpc(
                    "issue_exam_card",
                    {
                        p_exam_registration_id:
                            registration.id
                    }
                );

                if (error) {

                    console.error(
                        "Exam card issuance error:",
                        error
                    );

                    if (message) {
                        message.textContent =
                            error.message ||
                            "Unable to issue examination card.";
                    }

                    issueButton.disabled =
                        false;

                    issueButton.textContent =
                        "Issue Examination Card";

                    return;
                }

                console.log(
                    "Exam card issued:",
                    cardId
                );

                await loadExamCard();
            }
        );
    }
}


/*
 * Display the examination card.
 */
function viewExamCard(cardId) {

    window.open(
        `exam-card.html?id=${encodeURIComponent(cardId)}`,
        "_blank"
    );
}

// =====================================================
// DASHBOARD SIDEBAR DRAWER
// =====================================================

const dashboardMenuBtn =
    document.getElementById("dashboardMenuBtn");

const dashboardSidebar =
    document.getElementById("dashboardSidebar");

const dashboardSidebarClose =
    document.getElementById("dashboardSidebarClose");

const dashboardOverlay =
    document.getElementById("dashboardOverlay");


function openDashboardSidebar() {

    if (dashboardSidebar) {
        dashboardSidebar.classList.add("active");
    }

    if (dashboardOverlay) {
        dashboardOverlay.classList.add("active");
    }
}


function closeDashboardSidebar() {

    if (dashboardSidebar) {
        dashboardSidebar.classList.remove("active");
    }

    if (dashboardOverlay) {
        dashboardOverlay.classList.remove("active");
    }
}


if (dashboardMenuBtn) {

    dashboardMenuBtn.addEventListener(
        "click",
        openDashboardSidebar
    );

}


if (dashboardSidebarClose) {

    dashboardSidebarClose.addEventListener(
        "click",
        closeDashboardSidebar
    );

}


if (dashboardOverlay) {

    dashboardOverlay.addEventListener(
        "click",
        closeDashboardSidebar
    );

}


    // =================================================
    // INITIAL DASHBOARD LOAD
    // =================================================

    loadStudentOverview();

    loadMessageLecturers();

    loadMessages();

    loadStudentFeeEligibility();

    loadExamRegistration();

    loadExamCard();

}