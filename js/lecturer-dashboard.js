import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://jlvcgwbjgdnmtqdwiwgp.supabase.co";
const SUPABASE_KEY = "sb_publishable_92EM6fOxHQLOKq5o8ik1_Q_9XIA84d1";

const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// Check logged-in lecturer
const { data: { user }, error: userError } =
    await supabase.auth.getUser();

if (userError || !user) {
    window.location.href = "login.html";
}

// Get lecturer profile
const { data: profile, error: profileError } =
    await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();

if (profileError) {
    console.error(profileError);

    document.getElementById("lecturerName").textContent =
        "Could not load your profile.";
} else {
    document.getElementById("lecturerName").textContent =
        profile.full_name || "Lecturer";
}


// CREATE CLASS
const createClassBtn =
    document.getElementById("createClassBtn");

createClassBtn.addEventListener("click", async function () {

    const className =
        document.getElementById("className").value.trim();

    const description =
        document.getElementById("classDescription").value.trim();

    const message =
        document.getElementById("classMessage");

    if (!className) {
        message.textContent =
            "Please enter a class name.";
        return;
    }

    message.textContent =
        "Creating class...";

    // Generate a random class code
    const classCode =
        "CL" +
        Math.random()
            .toString(36)
            .substring(2, 7)
            .toUpperCase();

    const { data, error } =
        await supabase
            .from("classes")
            .insert([
                {
                    lecturer_id: user.id,
                    class_name: className,
                    description: description,
                    class_code: classCode
                }
            ])
            .select()
            .single();

    if (error) {
        console.error(error);

        message.textContent =
            "Could not create class: " +
            error.message;

        return;
    }

    message.textContent =
        "Class created successfully! Your class code is: " +
        data.class_code;

    document.getElementById("className").value = "";
    document.getElementById("classDescription").value = "";
});

// VIEW MY CLASSES
const myClassesBtn =
    document.getElementById("myClassesBtn");

myClassesBtn.addEventListener("click", async function () {

    const list =
        document.getElementById("myClassesList");

    list.innerHTML = "Loading your classes...";

    const { data: classes, error } =
        await supabase
            .from("classes")
            .select("id, class_name, description, class_code")
            .eq("lecturer_id", user.id);

    if (error) {
        console.error(error);

        list.innerHTML =
            "Could not load your classes.";

        return;
    }

    if (!classes || classes.length === 0) {

        list.innerHTML =
            "You haven't created any classes yet.";

        return;
    }

    list.innerHTML = "";

    classes.forEach(function (classInfo) {

        const classCard =
            document.createElement("div");

        classCard.className = "my-class-card";

classCard.innerHTML = `
    <h3>${classInfo.class_name}</h3>

    <p>
        ${classInfo.description || "No description"}
    </p>

 <p>
    <strong>Class Code:</strong>
    <span class="class-code">${classInfo.class_code}</span>
    <button
        class="copy-code-btn"
        data-code="${classInfo.class_code}">
        📋 Copy Code
    </button>
</p>

    <button class="view-students-btn"
        data-class-id="${classInfo.id}">
        View Students
    </button>

    <div id="students-${classInfo.id}">
    </div>
`;
   

        list.appendChild(classCard);

        const copyCodeBtn =
    classCard.querySelector(".copy-code-btn");

copyCodeBtn.addEventListener("click", async function () {

    const code = this.dataset.code;

    try {

        await navigator.clipboard.writeText(code);

        this.textContent = "✅ Copied!";

        setTimeout(() => {
            this.textContent = "📋 Copy Code";
        }, 2000);

    } catch (error) {

        console.error(error);

        alert("Could not copy the class code.");

    }
});

        const viewStudentsBtn =
    classCard.querySelector(".view-students-btn");

viewStudentsBtn.addEventListener("click", async function () {

    const studentsList =
        document.getElementById(
            "students-" + classInfo.id
        );

    studentsList.innerHTML =
        "Loading students...";

    const { data: members, error } =
        await supabase
            .from("class_members")
            .select(`
                student_id,
                profiles (
                    full_name
                )
            `)
            .eq("class_id", classInfo.id);

    if (error) {
        console.error(error);

        studentsList.innerHTML =
            "Could not load students.";

        return;
    }

    if (!members || members.length === 0) {

        studentsList.innerHTML =
            "<p>No students have joined this class yet.</p>";

        return;
    }

    const studentCount =
    members.length;

studentsList.innerHTML =
    "<div class='student-list'>" +
    "<h4>Students (" + studentCount + "):</h4>" +
    "</div>";

const studentListContainer =
    studentsList.querySelector(".student-list");

members.forEach(function (member) {

    const studentItem =
        document.createElement("div");

    studentItem.className = "student-item";

    const avatar =
        document.createElement("div");

    avatar.className = "student-avatar";

    const name =
        member.profiles?.full_name ||
        "Unnamed student";

    avatar.textContent =
        name.charAt(0).toUpperCase();

    const studentName =
        document.createElement("span");

    studentName.className = "student-name";

    studentName.textContent = name;

    studentItem.appendChild(avatar);
    studentItem.appendChild(studentName);

    studentListContainer.appendChild(studentItem);
});
});
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

// Load lecturer's classes into the material class dropdown

const materialClass =
    document.getElementById("materialClass");

if (materialClass) {

    const { data: lecturerClasses, error: classesError } =
        await supabase
            .from("classes")
            .select("id, class_name")
            .eq("lecturer_id", user.id)
            .order("class_name");

    if (classesError) {

        console.error(classesError);

        materialClass.innerHTML =
            '<option value="">Could not load classes</option>';

    } else {

        lecturerClasses.forEach(function (classInfo) {

            const option =
                document.createElement("option");

            option.value = classInfo.id;

            option.textContent =
                classInfo.class_name;

            materialClass.appendChild(option);
        });
    }
}


// Upload material

const uploadMaterialBtn =
    document.getElementById("uploadMaterialBtn");

if (uploadMaterialBtn) {

    uploadMaterialBtn.addEventListener(
        "click",
        async function () {

            const classId =
                document.getElementById("materialClass").value;

            const title =
                document.getElementById("materialTitle")
                .value
                .trim();

            const description =
                document.getElementById("materialDescription")
                .value
                .trim();

            const file =
                document.getElementById("materialFile")
                .files[0];

            const message =
                document.getElementById("materialMessage");


            // Check required information

            if (!classId) {

                message.textContent =
                    "Please select a class.";

                return;
            }

            if (!title) {

                message.textContent =
                    "Please enter a material title.";

                return;
            }

            if (!file) {

                message.textContent =
                    "Please select a file.";

                return;
            }


            message.textContent =
                "Uploading material...";


            // Create a unique file name

            const safeFileName =
                file.name.replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_"
                );

            const filePath =
                classId +
                "/" +
                crypto.randomUUID() +
                "-" +
                safeFileName;


            // Upload file to Supabase Storage

            const { error: uploadError } =
                await supabase.storage
                    .from("materials")
                    .upload(
                        filePath,
                        file,
                        {
                            upsert: false
                        }
                    );


            if (uploadError) {

                console.error(uploadError);

                message.textContent =
                    "File upload failed: " +
                    uploadError.message;

                return;
            }


            // Save material information in database

            const { error: materialError } =
                await supabase
                    .from("materials")
                    .insert([
                        {
                            class_id: classId,
                            lecturer_id: user.id,
                            title: title,
                            description: description,
                            file_url: filePath
                        }
                    ]);


            if (materialError) {

                console.error(materialError);

                message.textContent =
                    "Could not save material: " +
                    materialError.message;

                return;
            }


            // Success

            message.textContent =
                "Material uploaded successfully!";


            // Clear the form

            document.getElementById("materialTitle")
                .value = "";

            document.getElementById("materialDescription")
                .value = "";

            document.getElementById("materialFile")
                .value = "";

            document.getElementById("materialClass")
                .value = "";
        }
    );
}

// ===============================
// ASSIGNMENTS
// ===============================

const assignmentClass =
    document.getElementById("assignmentClass");

if (assignmentClass) {

    // Load lecturer's classes

    const { data: assignmentClasses, error: assignmentClassesError } =
        await supabase
            .from("classes")
            .select("id, class_name")
            .eq("lecturer_id", user.id)
            .order("class_name");

    if (assignmentClassesError) {

        console.error(assignmentClassesError);

        assignmentClass.innerHTML =
            '<option value="">Could not load classes</option>';

    } else {

        assignmentClasses.forEach(function (classInfo) {

            const option =
                document.createElement("option");

            option.value = classInfo.id;

            option.textContent =
                classInfo.class_name;

            assignmentClass.appendChild(option);
        });
    }
}


// Create assignment

const createAssignmentBtn =
    document.getElementById("createAssignmentBtn");

if (createAssignmentBtn) {

    createAssignmentBtn.addEventListener(
        "click",
        async function () {

            const classId =
                document.getElementById("assignmentClass").value;

            const title =
                document.getElementById("assignmentTitle")
                .value
                .trim();

            const description =
                document.getElementById("assignmentDescription")
                .value
                .trim();

            const dueDate =
                document.getElementById("assignmentDueDate").value;

            const message =
                document.getElementById("assignmentMessage");


            // Validate

            if (!classId) {

                message.textContent =
                    "Please select a class.";

                return;
            }

            if (!title) {

                message.textContent =
                    "Please enter an assignment title.";

                return;
            }

            if (!description) {

                message.textContent =
                    "Please enter the assignment instructions.";

                return;
            }

            if (!dueDate) {

                message.textContent =
                    "Please select a due date.";

                return;
            }


            message.textContent =
                "Creating assignment...";


            // Save assignment

            const { error } =
                await supabase
                    .from("assignments")
                    .insert([
                        {
                            class_id: classId,
                            lecturer_id: user.id,
                            title: title,
                            description: description,
                            due_date: dueDate
                        }
                    ]);


            if (error) {

                console.error(error);

                message.textContent =
                    "Could not create assignment: " +
                    error.message;

                return;
            }


            // Success

            message.textContent =
                "Assignment created successfully!";


            // Clear form

            document.getElementById("assignmentTitle")
                .value = "";

            document.getElementById("assignmentDescription")
                .value = "";

            document.getElementById("assignmentDueDate")
                .value = "";

            document.getElementById("assignmentClass")
                .value = "";
        }
    );
}

// ===============================
// LECTURER ASSIGNMENTS + GRADING
// ===============================

const viewAssignmentsBtn =
    document.getElementById("viewAssignmentsBtn");

if (viewAssignmentsBtn) {

    viewAssignmentsBtn.addEventListener(
        "click",
        async function () {

            const list =
                document.getElementById(
                    "lecturerAssignmentsList"
                );

            list.innerHTML =
                "Loading assignments...";


            const { data: assignments, error } =
                await supabase
                    .from("assignments")
                    .select(`
                        id,
                        title,
                        description,
                        due_date,
                        class_id,
                        classes (
                            class_name
                        )
                    `)
                    .eq("lecturer_id", user.id)
                    .order("due_date", {
                        ascending: true
                    });


            if (error) {

                console.error(error);

                list.innerHTML =
                    "Could not load assignments.";

                return;
            }


            if (!assignments || assignments.length === 0) {

                list.innerHTML =
                    "You haven't created any assignments yet.";

                return;
            }


            list.innerHTML = "";


            for (const assignment of assignments) {

                const card =
                    document.createElement("div");

                card.className =
                    "assignment-card";

                card.innerHTML = `
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
                        ${new Date(
                            assignment.due_date
                        ).toLocaleString()}
                    </p>

                    <button class="view-submissions-btn">
                        View Submissions
                    </button>

                    <div class="submissions-list"></div>
                `;

                list.appendChild(card);


                const button =
                    card.querySelector(
                        ".view-submissions-btn"
                    );

                const submissionsList =
                    card.querySelector(
                        ".submissions-list"
                    );


                button.addEventListener(
                    "click",
                    async function () {

                        submissionsList.innerHTML =
                            "Loading submissions...";


                        const { data: submissions, error: submissionsError } =
                            await supabase
                                .from("submissions")
                                .select(`
                                    id,
                                    student_id,
                                    file_url,
                                    submitted_at,
                                    profiles (
                                        full_name
                                    )
                                `)
                                .eq(
                                    "assignment_id",
                                    assignment.id
                                )
                                .order(
                                    "submitted_at",
                                    {
                                        ascending: true
                                    }
                                );


                        if (submissionsError) {

                            console.error(
                                submissionsError
                            );

                            submissionsList.innerHTML =
                                "Could not load submissions.";

                            return;
                        }


                        if (
                            !submissions ||
                            submissions.length === 0
                        ) {

                            submissionsList.innerHTML =
                                "<p>No students have submitted this assignment yet.</p>";

                            return;
                        }


                        submissionsList.innerHTML =
                            "<h4>Student Submissions</h4>";


                        for (const submission of submissions) {

                            const studentItem =
                                document.createElement("div");

                            studentItem.className =
                                "submission-item";


                            studentItem.innerHTML = `
                                <p>
                                    👨‍🎓
                                    <strong>
                                        ${submission.profiles?.full_name || "Unnamed student"}
                                    </strong>
                                </p>

                                <p>
                                    Submitted:
                                    ${new Date(
                                        submission.submitted_at
                                    ).toLocaleString()}
                                </p>

                                <button class="open-submission-btn">
                                    Open Submission
                                </button>

                                <br><br>

                                <label>
                                    Mark:
                                </label>

                                <input
                                    type="number"
                                    class="student-mark"
                                    min="0"
                                    max="100"
                                    placeholder="0 - 100"
                                >

                                <br><br>

                                <textarea
                                    class="student-feedback"
                                    placeholder="Feedback for the student"
                                ></textarea>

                                <br>

                                <button class="save-mark-btn">
                                    Save Mark
                                </button>

                                <p class="mark-message"></p>
                            `;


                            submissionsList.appendChild(
                                studentItem
                            );


                            const openButton =
                                studentItem.querySelector(
                                    ".open-submission-btn"
                                );

                            const markInput =
                                studentItem.querySelector(
                                    ".student-mark"
                                );

                            const feedbackInput =
                                studentItem.querySelector(
                                    ".student-feedback"
                                );

                            const saveMarkButton =
                                studentItem.querySelector(
                                    ".save-mark-btn"
                                );

                            const markMessage =
                                studentItem.querySelector(
                                    ".mark-message"
                                );


                            // Open student's file

                            openButton.addEventListener(
                                "click",
                                async function () {

                                    openButton.textContent =
                                        "Opening...";


                                    const { data: signedUrl, error: urlError } =
                                        await supabase.storage
                                            .from("submissions")
                                            .createSignedUrl(
                                                submission.file_url,
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
                                        "Open Submission";
                                }
                            );


                            // Load existing mark

                            const { data: existingMark } =
                                await supabase
                                    .from("marks")
                                    .select(
                                        "mark, feedback"
                                    )
                                    .eq(
                                        "assignment_id",
                                        assignment.id
                                    )
                                    .eq(
                                        "student_id",
                                        submission.student_id
                                    )
                                    .maybeSingle();


                            if (existingMark) {

                                markInput.value =
                                    existingMark.mark;

                                feedbackInput.value =
                                    existingMark.feedback || "";
                            }


                            // Save mark

                            saveMarkButton.addEventListener(
                                "click",
                                async function () {

                                    const mark =
                                        markInput.value;

                                    const feedback =
                                        feedbackInput.value
                                        .trim();


                                    if (
                                        mark === "" ||
                                        mark < 0 ||
                                        mark > 100
                                    ) {

                                        markMessage.textContent =
                                            "Enter a mark between 0 and 100.";

                                        return;
                                    }


                                    markMessage.textContent =
                                        "Saving mark...";


                                    const { error: markError } =
                                        await supabase
                                            .from("marks")
                                            .upsert(
                                                {
                                                    assignment_id:
                                                        assignment.id,

                                                    student_id:
                                                        submission.student_id,

                                                    mark:
                                                        Number(mark),

                                                    feedback:
                                                        feedback
                                                },
                                                {
                                                    onConflict:
                                                        "assignment_id,student_id"
                                                }
                                            );


                                    if (markError) {

                                        console.error(
                                            markError
                                        );

                                        markMessage.textContent =
                                            "Could not save mark: " +
                                            markError.message;

                                        return;
                                    }


                                    markMessage.textContent =
                                        "Mark saved successfully!";
                                }
                            );
                        }
                    }
                );
            }
        }
    );
}

// ===============================
// ANNOUNCEMENTS
// ===============================

const announcementClass =
    document.getElementById("announcementClass");

const createAnnouncementBtn =
    document.getElementById("createAnnouncementBtn");

const viewAnnouncementsBtn =
    document.getElementById("viewAnnouncementsBtn");


// Load lecturer's classes into announcement dropdown

if (announcementClass) {

    const { data: classes, error } =
        await supabase
            .from("classes")
            .select("id, class_name")
            .eq("lecturer_id", user.id)
            .order("created_at", {
                ascending: false
            });

    if (!error && classes) {

        classes.forEach(function (classItem) {

            const option =
                document.createElement("option");

            option.value = classItem.id;

            option.textContent =
                classItem.class_name;

            announcementClass.appendChild(option);
        });
    }
}


// Create announcement

if (createAnnouncementBtn) {

    createAnnouncementBtn.addEventListener(
        "click",
        async function () {

            const classId =
                announcementClass.value;

            const title =
                document.getElementById(
                    "announcementTitle"
                ).value.trim();

            const message =
                document.getElementById(
                    "announcementMessage"
                ).value.trim();

            const status =
                document.getElementById(
                    "announcementMessageStatus"
                );


            if (!classId || !title || !message) {

                status.textContent =
                    "Please select a class, enter a title and write a message.";

                return;
            }


            status.textContent =
                "Posting announcement...";


            const { error } =
                await supabase
                    .from("announcements")
                    .insert([{
                        class_id: classId,
                        lecturer_id: user.id,
                        title: title,
                        message: message
                    }]);


            if (error) {

                console.error(error);

                status.textContent =
                    "Could not post announcement.";

                return;
            }


            status.textContent =
                "Announcement posted successfully!";


            document.getElementById(
                "announcementTitle"
            ).value = "";

            document.getElementById(
                "announcementMessage"
            ).value = "";
        }
    );
}


// View lecturer's announcements

if (viewAnnouncementsBtn) {

    viewAnnouncementsBtn.addEventListener(
        "click",
        async function () {

            const list =
                document.getElementById(
                    "lecturerAnnouncementsList"
                );

            list.innerHTML =
                "Loading announcements...";


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
                    .eq("lecturer_id", user.id)
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
// ATTENDANCE
// ===============================

const attendanceClass =
    document.getElementById("attendanceClass");

const createAttendanceBtn =
    document.getElementById("createAttendanceBtn");

const viewAttendanceBtn =
    document.getElementById("viewAttendanceBtn");


// Load lecturer's classes
if (attendanceClass) {

    const { data: classes, error } =
        await supabase
            .from("classes")
            .select("id, class_name")
            .eq("lecturer_id", user.id)
            .order("created_at", {
                ascending: false
            });

    if (!error && classes) {

        classes.forEach(function (classItem) {

            const option =
                document.createElement("option");

            option.value = classItem.id;
            option.textContent = classItem.class_name;

            attendanceClass.appendChild(option);
        });
    }
}


// Create attendance session
if (createAttendanceBtn) {

    createAttendanceBtn.addEventListener(
        "click",
        async function () {

            const classId =
                attendanceClass.value;

            const title =
                document.getElementById(
                    "attendanceTitle"
                ).value.trim();

            const date =
                document.getElementById(
                    "attendanceDate"
                ).value;

            const message =
                document.getElementById(
                    "attendanceMessage"
                );


            if (!classId || !title || !date) {

                message.textContent =
                    "Please select a class, enter a title and choose a date.";

                return;
            }


            message.textContent =
                "Creating attendance session...";


            const { error } =
                await supabase
                    .from("attendance_sessions")
                    .insert([{
                        class_id: classId,
                        lecturer_id: user.id,
                        session_title: title,
                        session_date: date
                    }]);


            if (error) {

                console.error(error);

                message.textContent =
                    "Could not create attendance session.";

                return;
            }


            message.textContent =
                "Attendance session created successfully!";


            document.getElementById(
                "attendanceTitle"
            ).value = "";

            document.getElementById(
                "attendanceDate"
            ).value = "";
        }
    );
}


// View attendance sessions
if (viewAttendanceBtn) {

    viewAttendanceBtn.addEventListener(
        "click",
        async function () {

            const list =
                document.getElementById(
                    "attendanceSessionsList"
                );

            list.innerHTML =
                "Loading attendance sessions...";


            const { data: sessions, error } =
                await supabase
                    .from("attendance_sessions")
                    .select(`
                        id,
                        session_title,
                        session_date,
                        created_at,
                        classes (
                            class_name
                        )
                    `)
                    .eq("lecturer_id", user.id)
                    .order("session_date", {
                        ascending: false
                    });


            if (error) {

                console.error(error);

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


            sessions.forEach(function (session) {

                const card =
                    document.createElement("div");

                card.className =
                    "attendance-card";


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

                    <button
                        class="markAttendanceBtn"
                        data-session-id="${session.id}">
                        Mark Attendance
                    </button>

                    <div
                        id="attendance-${session.id}">
                    </div>
                `;


                list.appendChild(card);
            });


            // Add click events to Mark Attendance buttons

            document
                .querySelectorAll(".markAttendanceBtn")
                .forEach(function (button) {

                    button.addEventListener(
                        "click",
                        function () {

                            loadStudentsForAttendance(
                                button.dataset.sessionId
                            );
                        }
                    );
                });
        }
    );
}


// Load students for attendance
async function loadStudentsForAttendance(sessionId) {

    const container =
        document.getElementById(
            `attendance-${sessionId}`
        );

    container.innerHTML =
        "Loading students...";


    const { data: session, error: sessionError } =
        await supabase
            .from("attendance_sessions")
            .select("class_id")
            .eq("id", sessionId)
            .single();


    if (sessionError) {

        console.error(sessionError);

        container.innerHTML =
            "Could not load session.";

        return;
    }


    const { data: members, error: membersError } =
        await supabase
            .from("class_members")
            .select(`
                student_id,
                profiles (
                    full_name
                )
            `)
            .eq("class_id", session.class_id);


    if (membersError) {

        console.error(membersError);

        container.innerHTML =
            "Could not load students.";

        return;
    }


    if (!members || members.length === 0) {

        container.innerHTML =
            "No students have joined this class.";

        return;
    }


    container.innerHTML = "";


    for (const member of members) {

        const { data: existingRecord } =
            await supabase
                .from("attendance_records")
                .select("status")
                .eq("session_id", sessionId)
                .eq("student_id", member.student_id)
                .maybeSingle();


        const studentRow =
            document.createElement("div");

        studentRow.className =
            "attendance-student";


        studentRow.innerHTML = `
            <p>
                <strong>
                    ${member.profiles?.full_name || "Student"}
                </strong>
            </p>

            <select class="attendanceStatus">
                <option value="present"
                    ${existingRecord?.status === "present" ? "selected" : ""}>
                    Present
                </option>

                <option value="absent"
                    ${existingRecord?.status === "absent" ? "selected" : ""}>
                    Absent
                </option>
            </select>

            <button class="saveAttendanceBtn">
                Save
            </button>

            <p class="attendanceSaveMessage"></p>
        `;


        container.appendChild(studentRow);


        const saveButton =
            studentRow.querySelector(
                ".saveAttendanceBtn"
            );

        saveButton.addEventListener(
            "click",
            async function () {

                const status =
                    studentRow.querySelector(
                        ".attendanceStatus"
                    ).value;

                const saveMessage =
                    studentRow.querySelector(
                        ".attendanceSaveMessage"
                    );


                const { error } =
                    await supabase
                        .from("attendance_records")
                        .upsert({
                            session_id: sessionId,
                            student_id: member.student_id,
                            status: status
                        }, {
                            onConflict:
                                "session_id,student_id"
                        });


                if (error) {

                    console.error(error);

                    saveMessage.textContent =
                        "Could not save attendance.";

                    return;
                }


                saveMessage.textContent =
                    "Attendance saved successfully!";
            }
        );
    }
}

// ===============================
// LECTURER OVERVIEW
// ===============================

async function loadLecturerOverview() {

    const classesCount =
        document.getElementById(
            "lecturerOverviewClasses"
        );

    const studentsCount =
        document.getElementById(
            "lecturerOverviewStudents"
        );

    const assignmentsCount =
        document.getElementById(
            "lecturerOverviewAssignments"
        );

    const announcementsCount =
        document.getElementById(
            "lecturerOverviewAnnouncements"
        );


    if (!classesCount ||
        !studentsCount ||
        !assignmentsCount ||
        !announcementsCount) {

        return;
    }


    // Get lecturer's classes

    const { data: classes, error: classError } =
        await supabase
            .from("classes")
            .select("id")
            .eq("lecturer_id", user.id);


    if (classError) {

        console.error(classError);
        return;
    }


    classesCount.textContent =
        classes?.length || 0;


    const classIds =
        classes
            ? classes.map(function (item) {
                return item.id;
            })
            : [];


    if (classIds.length === 0) {

        studentsCount.textContent = "0";
        assignmentsCount.textContent = "0";
        announcementsCount.textContent = "0";

        return;
    }


    // Get students

    const { data: members, error: memberError } =
        await supabase
            .from("class_members")
            .select("student_id")
            .in("class_id", classIds);


    if (!memberError) {

        const uniqueStudents =
            new Set(
                (members || []).map(function (member) {
                    return member.student_id;
                })
            );

        studentsCount.textContent =
            uniqueStudents.size;
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


    // Get announcements

    const { data: announcements, error: announcementError } =
        await supabase
            .from("announcements")
            .select("id")
            .eq("lecturer_id", user.id);


    if (!announcementError) {

        announcementsCount.textContent =
            announcements?.length || 0;
    }
}


// Load lecturer overview
loadLecturerOverview();