import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://jlvcgwbjgdnmtqdwiwgp.supabase.co";
const SUPABASE_KEY = "sb_publishable_92EM6fOxHQLOKq5o8ik1_Q_9XIA84d1";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// CHECK LOGIN
const { data: { user }, error: userError } =
    await supabase.auth.getUser();

if (userError || !user) {
    window.location.href = "login.html";
}


// GET STUDENT PROFILE
const { data: profile, error: profileError } =
    await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

if (profileError) {
    console.error(profileError);

    document.getElementById("studentName").textContent =
        "Could not load your profile.";
} else {
    const studentFullName =
        profile.full_name || "Student";

    document.getElementById("studentName").textContent =
        studentFullName;

    document.getElementById("studentGreetingName").textContent =
        studentFullName;
}


// JOIN CLASS
const joinClassBtn =
    document.getElementById("joinClassBtn");

joinClassBtn.addEventListener("click", async function () {

    const classCode =
        document.getElementById("classCode")
        .value
        .trim()
        .toUpperCase();

    const message =
        document.getElementById("joinMessage");

    if (!classCode) {
        message.textContent =
            "Please enter a class code.";

        return;
    }

    message.textContent =
        "Joining class...";


    // Find class using the code
    const { data: classData, error: classError } =
        await supabase
            .from("classes")
            .select("id, class_name")
            .eq("class_code", classCode)
            .single();


    if (classError || !classData) {

        console.error(classError);

        message.textContent =
            "Class not found. Check the class code.";

        return;
    }


    // Add student to class
    const { error: joinError } =
        await supabase
            .from("class_members")
            .insert([
                {
                    class_id: classData.id,
                    student_id: user.id
                }
            ]);


    if (joinError) {

        console.error(joinError);

        if (joinError.code === "23505") {

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
        classData.class_name + "!";

    document.getElementById("classCode").value = "";
});

// VIEW MY CLASSES
const myClassesBtn =
    document.getElementById("myClassesBtn");

myClassesBtn.addEventListener("click", async function () {

    const list =
        document.getElementById("myClassesList");

    list.innerHTML = "Loading your classes...";

    const { data: memberships, error } =
        await supabase
            .from("class_members")
            .select(`
                class_id,
                classes (
                    class_name,
                    description,
                    class_code
                )
            `)
            .eq("student_id", user.id);

    if (error) {
        console.error(error);

        list.innerHTML =
            "Could not load your classes.";

        return;
    }

    if (!memberships || memberships.length === 0) {

        list.innerHTML =
            "You haven't joined any classes yet.";

        return;
    }

    list.innerHTML = "";

    memberships.forEach(function (membership) {

        const classInfo = membership.classes;

        const classCard =
            document.createElement("div");

        classCard.className = "my-class-card";

classCard.innerHTML = `
    <h3>📚 ${classInfo.class_name}</h3>

    <p>
        ${classInfo.description || "No description"}
    </p>

    <div class="student-class-code">
        <span>Class Code</span>
        <strong>${classInfo.class_code}</strong>
    </div>

`;

        list.appendChild(classCard);

    });
});


// LOGOUT
const logoutBtn =
    document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async function () {

    const { error } =
        await supabase.auth.signOut();

    if (error) {
        console.error(error);
        return;
    }

    window.location.href = "login.html";
});

// ===============================
// LEARNING MATERIALS
// ===============================


const materialsBtn =
    document.getElementById("materialsBtn");

if (materialsBtn) {

    materialsBtn.addEventListener(
        "click",
        async function () {

            const materialsList =
                document.getElementById("materialsList");

            materialsList.innerHTML =
                "Loading materials...";


            // Get classes the student has joined

            const { data: memberships, error: membershipError } =
                await supabase
                    .from("class_members")
                    .select("class_id")
                    .eq("student_id", user.id);


            if (membershipError) {

                console.error(membershipError);

                materialsList.innerHTML =
                    "Could not load your classes.";

                return;
            }


            if (!memberships || memberships.length === 0) {

                materialsList.innerHTML =
                    "You haven't joined any classes yet.";

                return;
            }


            // Get the class IDs

            const classIds =
                memberships.map(function (membership) {
                    return membership.class_id;
                });


            // Get materials belonging to those classes

            const { data: materials, error: materialsError } =
                await supabase
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
                    .in("class_id", classIds)

                    .order("created_at", {
                        ascending: false
                    });


            if (materialsError) {

                console.error(materialsError);

                materialsList.innerHTML =
                    "Could not load learning materials.";

                return;
            }


            if (!materials || materials.length === 0) {

                materialsList.innerHTML =
                    "No learning materials have been uploaded yet.";

                return;
            }


            materialsList.innerHTML = "";


            // Display each material

            for (const material of materials) {

                const materialCard =
                    document.createElement("div");

                materialCard.className =
                    "material-card";


                materialCard.innerHTML = `
                    <h3>${material.title}</h3>

                    <p>
                        <strong>Class:</strong>
                        ${material.classes?.class_name || "Unknown class"}
                    </p>

                    <p>
                        ${material.description || "No description"}
                    </p>

                    <button class="open-material-btn">
                        Open Material
                    </button>
                `;


                materialsList.appendChild(materialCard);


                const openButton =
                    materialCard.querySelector(
                        ".open-material-btn"
                    );


                openButton.addEventListener(
                    "click",
                    async function () {

                        openButton.textContent =
                            "Opening...";


                        // Create a temporary secure link

                        const { data: signedUrl, error: urlError } =
                            await supabase.storage
                                .from("materials")
                                .createSignedUrl(
                                    material.file_url,
                                    3600
                                );


                        if (urlError) {

                            console.error(urlError);

                            openButton.textContent =
                                "Could not open";

                            return;
                        }


                        // Open the material

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

// ===============================
// ASSIGNMENTS + SUBMISSIONS
// ===============================

const assignmentsBtn =
    document.getElementById("assignmentsBtn");

if (assignmentsBtn) {

    assignmentsBtn.addEventListener(
        "click",
        async function () {

            const assignmentsList =
                document.getElementById("assignmentsList");

            assignmentsList.innerHTML =
                "Loading assignments...";


            // Get student's classes

            const { data: memberships, error: membershipError } =
                await supabase
                    .from("class_members")
                    .select("class_id")
                    .eq("student_id", user.id);


            if (membershipError) {

                console.error(membershipError);

                assignmentsList.innerHTML =
                    "Could not load your classes.";

                return;
            }


            if (!memberships || memberships.length === 0) {

                assignmentsList.innerHTML =
                    "You haven't joined any classes yet.";

                return;
            }


            const classIds =
                memberships.map(function (membership) {
                    return membership.class_id;
                });


            // Get assignments

            const { data: assignments, error: assignmentsError } =
                await supabase
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
                    .in("class_id", classIds)
                    .order("due_date", {
                        ascending: true
                    });


            if (assignmentsError) {

                console.error(assignmentsError);

                assignmentsList.innerHTML =
                    "Could not load assignments.";

                return;
            }


            if (!assignments || assignments.length === 0) {

                assignmentsList.innerHTML =
                    "No assignments have been posted yet.";

                return;
            }


            assignmentsList.innerHTML = "";


            // Display assignments

            for (const assignment of assignments) {

                const assignmentCard =
                    document.createElement("div");

                assignmentCard.className =
                    "assignment-card";


                const dueDate =
                    new Date(assignment.due_date);


                assignmentCard.innerHTML = `
                    <h3>${assignment.title}</h3>

                    <p>
                        <strong>Class:</strong>
                        ${assignment.classes?.class_name || "Unknown class"}
                    </p>

                    <p>
                        ${assignment.description || "No instructions"}
                    </p>

                    <p>
                        <strong>Due:</strong>
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


                // Submit assignment

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


                        // Create unique file path

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


                        // Upload file

                        const { error: uploadError } =
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

                            console.error(uploadError);

                            submissionMessage.textContent =
                                "Upload failed: " +
                                uploadError.message;

                            return;
                        }


                        // Save submission information

                        const { error: submissionError } =
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

                            console.error(submissionError);

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

// ===============================
// MY MARKS
// ===============================

const marksBtn =
    document.getElementById("marksBtn");

if (marksBtn) {

    marksBtn.addEventListener(
        "click",
        async function () {

            const marksList =
                document.getElementById("marksList");

            marksList.innerHTML =
                "Loading your marks...";


            // Get student's marks

            const { data: marks, error } =
                await supabase
                    .from("marks")
                    .select(`
                        id,
                        mark,
                        feedback,
                        graded_at,
                        assignments (
                            title,
                            classes (
                                class_name
                            )
                        )
                    `)
                    .eq("student_id", user.id)
                    .order("graded_at", {
                        ascending: false
                    });


            if (error) {

                console.error(error);

                marksList.innerHTML =
                    "Could not load your marks.";

                return;
            }


            if (!marks || marks.length === 0) {

                marksList.innerHTML =
                    "You haven't received any marks yet.";

                return;
            }


            marksList.innerHTML = "";


            // Display marks

            marks.forEach(function (result) {

                const markCard =
                    document.createElement("div");

                markCard.className =
                    "mark-card";


                markCard.innerHTML = `
                    <h3>
                        ${result.assignments?.title || "Assignment"}
                    </h3>

                    <p>
                        <strong>Class:</strong>
                        ${result.assignments?.classes?.class_name || "Unknown class"}
                    </p>

                    <p>
                        <strong>Mark:</strong>
                        ${result.mark}/100
                    </p>

                    <p>
                        <strong>Feedback:</strong>
                        ${result.feedback || "No feedback provided"}
                    </p>

                    <p>
                        <strong>Graded:</strong>
                        ${new Date(
                            result.graded_at
                        ).toLocaleString()}
                    </p>
                `;


                marksList.appendChild(markCard);
            });
        }
    );
}

// ===============================
// ANNOUNCEMENTS
// ===============================

const announcementsBtn =
    document.getElementById("announcementsBtn");

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


            // Get classes the student has joined

            const { data: memberships, error: membershipError } =
                await supabase
                    .from("class_members")
                    .select("class_id")
                    .eq("student_id", user.id);


            if (membershipError) {

                console.error(membershipError);

                list.innerHTML =
                    "Could not load your classes.";

                return;
            }


            if (!memberships ||
                memberships.length === 0) {

                list.innerHTML =
                    "You have not joined any classes yet.";

                return;
            }


            const classIds =
                memberships.map(function (membership) {
                    return membership.class_id;
                });


            // Get announcements

            const { data: announcements, error } =
                await supabase
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
                    .in("class_id", classIds)
                    .order("created_at", {
                        ascending: false
                    });


            if (error) {

                console.error(error);

                list.innerHTML =
                    "Could not load announcements.";

                return;
            }


            if (!announcements ||
                announcements.length === 0) {

                list.innerHTML =
                    "No announcements yet.";

                return;
            }


            list.innerHTML = "";


            // Display announcements

            announcements.forEach(
                function (announcement) {

                    const card =
                        document.createElement("div");

                    card.className =
                        "announcement-card";


                    card.innerHTML = `
                        <h3>
                            ${announcement.title}
                        </h3>

                        <p>
                            <strong>Class:</strong>
                            ${announcement.classes?.class_name || "Unknown class"}
                        </p>

                        <p>
                            ${announcement.message}
                        </p>

                        <small>
                            ${new Date(
                                announcement.created_at
                            ).toLocaleString()}
                        </small>
                    `;


                    list.appendChild(card);
                }
            );
        }
    );
}

// ===============================
// STUDENT ATTENDANCE
// ===============================

const attendanceBtn =
    document.getElementById("attendanceBtn");

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


            // Get the student's classes

            const { data: memberships, error: membershipError } =
                await supabase
                    .from("class_members")
                    .select("class_id")
                    .eq("student_id", user.id);


            if (membershipError) {

                console.error(membershipError);

                list.innerHTML =
                    "Could not load your classes.";

                return;
            }


            if (!memberships ||
                memberships.length === 0) {

                list.innerHTML =
                    "You have not joined any classes yet.";

                return;
            }


            const classIds =
                memberships.map(function (membership) {
                    return membership.class_id;
                });


            // Get attendance sessions

            const { data: sessions, error: sessionError } =
                await supabase
                    .from("attendance_sessions")
                    .select(`
                        id,
                        session_title,
                        session_date,
                        classes (
                            class_name
                        )
                    `)
                    .in("class_id", classIds)
                    .order("session_date", {
                        ascending: false
                    });


            if (sessionError) {

                console.error(sessionError);

                list.innerHTML =
                    "Could not load attendance sessions.";

                return;
            }


            if (!sessions ||
                sessions.length === 0) {

                list.innerHTML =
                    "No attendance sessions yet.";

                return;
            }


            list.innerHTML = "";


            // Load each attendance record

            for (const session of sessions) {

                const { data: record, error: recordError } =
                    await supabase
                        .from("attendance_records")
                        .select("status")
                        .eq("session_id", session.id)
                        .eq("student_id", user.id)
                        .maybeSingle();


                if (recordError) {

                    console.error(recordError);

                    continue;
                }


                const card =
                    document.createElement("div");

                card.className =
                    "attendance-card";


                const status =
                    record?.status || "Not marked";


                card.innerHTML = `
                    <h3>
                        ${session.session_title}
                    </h3>

                    <p>
                        <strong>Class:</strong>
                        ${session.classes?.class_name || "Unknown class"}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${session.session_date}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${status}
                    </p>
                `;


                list.appendChild(card);
            }
        }
    );
}

// ===============================
// STUDENT OVERVIEW
// ===============================

async function loadStudentOverview() {

    const classesCount =
        document.getElementById("overviewClasses");

    const assignmentsCount =
        document.getElementById("overviewAssignments");

    const gradedCount =
        document.getElementById("overviewGraded");

    const attendancePercentage =
        document.getElementById("overviewAttendance");


    if (!classesCount ||
        !assignmentsCount ||
        !gradedCount ||
        !attendancePercentage) {

        return;
    }


    // Get student's classes

    const { data: memberships, error: membershipError } =
        await supabase
            .from("class_members")
            .select("class_id")
            .eq("student_id", user.id);


    if (membershipError) {

        console.error(membershipError);
        return;
    }


    const classIds =
        memberships
            ? memberships.map(function (item) {
                return item.class_id;
            })
            : [];


    classesCount.textContent =
        classIds.length;


    if (classIds.length === 0) {

        assignmentsCount.textContent = "0";
        gradedCount.textContent = "0";
        attendancePercentage.textContent = "0%";

        return;
    }


    // Get assignments

    const { data: assignments, error: assignmentError } =
        await supabase
            .from("assignments")
            .select("id")
            .in("class_id", classIds);


    if (!assignmentError) {

        assignmentsCount.textContent =
            assignments?.length || 0;
    }


    // Get graded assignments

    const { data: marks, error: marksError } =
        await supabase
            .from("marks")
            .select("id")
            .eq("student_id", user.id);


    if (!marksError) {

        gradedCount.textContent =
            marks?.length || 0;
    }


    // Get attendance sessions

    const { data: sessions, error: sessionsError } =
        await supabase
            .from("attendance_sessions")
            .select("id")
            .in("class_id", classIds);


    if (sessionsError ||
        !sessions ||
        sessions.length === 0) {

        attendancePercentage.textContent =
            "0%";

        return;
    }


    // Get the student's attendance records

    const sessionIds =
        sessions.map(function (session) {
            return session.id;
        });


    const { data: attendance, error: attendanceError } =
        await supabase
            .from("attendance_records")
            .select("session_id, status")
            .eq("student_id", user.id)
            .in("session_id", sessionIds);


    if (attendanceError) {

        console.error(attendanceError);

        attendancePercentage.textContent =
            "0%";

        return;
    }


    if (!attendance ||
        attendance.length === 0) {

        attendancePercentage.textContent =
            "0%";

        return;
    }


    const presentCount =
        attendance.filter(function (record) {

            return record.status === "present";

        }).length;


    const percentage =
        Math.round(
            (presentCount /
                sessions.length) *
            100
        );


    attendancePercentage.textContent =
        percentage + "%";
}


// Load overview
loadStudentOverview();