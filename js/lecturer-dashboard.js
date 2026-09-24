import { createClient } from
    "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";


// =====================================================
// SUPABASE
// =====================================================

const SUPABASE_URL =
    "https://jlvcgwbjgdnmtqdwiwgp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_92EM6fOxHQLOKq5o8ik1_Q_9XIA84d1";


const supabase =
    createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// =====================================================
// GLOBAL VARIABLES
// =====================================================

let currentUser = null;

let currentProfile = null;


// =====================================================
// HELPERS
// =====================================================

function getElement(id) {

    return document.getElementById(id);

}


function setMessage(
    id,
    message,
    isError = false
) {

    const element =
        getElement(id);

    if (!element) {
        return;
    }

    element.textContent =
        message || "";

    element.style.color =
        isError
            ? "#dc2626"
            : "#16a34a";

}


function escapeHtml(value) {

    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll(
            "'",
            "&#039;"
        );

}


function getInitials(name) {

    return String(
        name || "Student"
    )
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            function (part) {

                return part
                    .charAt(0)
                    .toUpperCase();

            }
        )
        .join("");

}


function formatDate(value) {

    if (!value) {
        return "";
    }

    return new Date(
        value
    ).toLocaleString();

}


// =====================================================
// AUTHENTICATION
// =====================================================

async function getCurrentUser() {

    const {
        data,
        error
    } = await supabase.auth.getUser();


    if (
        error ||
        !data ||
        !data.user
    ) {

        window.location.href =
            "login.html";

        return null;

    }


    return data.user;

}


// =====================================================
// PROFILE
// =====================================================

async function loadCurrentProfile() {

    const {
        data,
        error
    } = await supabase
        .from("profiles")
        .select(
            "id, full_name, role"
        )
        .eq(
            "id",
            currentUser.id
        )
        .single();


    if (error) {

        console.error(
            "Profile error:",
            error
        );

        return null;

    }


    return data;

}


// =====================================================
// MY CLASSES
// =====================================================

async function loadMyClasses() {

    const list =
        getElement(
            "myClassesList"
        );


    if (
        !list ||
        !currentUser
    ) {

        return;

    }


    const {
        data: classes,
        error
    } = await supabase
        .from("classes")
        .select(
            `
            id,
            class_name,
            description,
            class_code,
            created_at
            `
        )
        .eq(
            "lecturer_id",
            currentUser.id
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
            "<p>Error loading classes.</p>";

        return;

    }


    if (
        !classes ||
        classes.length === 0
    ) {

        list.innerHTML =
            `
            <p class="empty-state">
                You have not created any classes yet.
            </p>
            `;

        return;

    }


    list.innerHTML = "";


    for (
        const classItem
        of classes
    ) {

        const card =
            document.createElement(
                "div"
            );


        card.className =
            "class-card";


        card.innerHTML = `

            <div class="class-card-content">

                <h3>
                    ${escapeHtml(
                        classItem.class_name
                    )}
                </h3>

                <p>
                    ${escapeHtml(
                        classItem.description ||
                        "No description"
                    )}
                </p>

                <div class="class-code">

                    <strong>
                        Class Code:
                    </strong>

                    <span>
                        ${escapeHtml(
                            classItem.class_code
                        )}
                    </span>

                    <button
                        class="copyClassCodeBtn"
                        data-code="${
                            escapeHtml(
                                classItem.class_code
                            )
                        }"
                    >
                        Copy
                    </button>

                </div>

                <div
                    class="class-student-count"
                    id="student-count-${classItem.id}"
                >
                    Loading students...
                </div>

                <button
                    class="viewClassStudentsBtn"
                    data-class-id="${classItem.id}"
                >
                    👥 View Students
                </button>

                <div
                    class="class-students-list"
                    id="students-${classItem.id}"
                ></div>

            </div>

        `;


        list.appendChild(
            card
        );


        const {
            count
        } = await supabase
            .from("class_members")
            .select(
                "id",
                {
                    count: "exact",
                    head: true
                }
            )
            .eq(
                "class_id",
                classItem.id
            );


        const countElement =
            getElement(
                `student-count-${classItem.id}`
            );


        if (countElement) {

            countElement.textContent =
                `${count || 0} student(s) enrolled`;

        }

    }


    list
        .querySelectorAll(
            ".copyClassCodeBtn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    async function () {

                        try {

                            await navigator
                                .clipboard
                                .writeText(
                                    button.dataset.code
                                );

                            button.textContent =
                                "Copied!";


                            setTimeout(
                                function () {

                                    button.textContent =
                                        "Copy";

                                },
                                1200
                            );

                        } catch {

                            alert(
                                "Class code: " +
                                button.dataset.code
                            );

                        }

                    }
                );

            }
        );


    list
        .querySelectorAll(
            ".viewClassStudentsBtn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        loadClassStudents(
                            button.dataset.classId
                        );

                    }
                );

            }
        );

}


// =====================================================
// VIEW CLASS STUDENTS
// =====================================================

async function loadClassStudents(
    classId
) {

    const list =
        getElement(
            `students-${classId}`
        );


    if (!list) {
        return;
    }


    list.innerHTML =
        "<p>Loading students...</p>";


    const {
        data: members,
        error
    } = await supabase
        .from("class_members")
        .select(
            `
            student_id,
            profiles (
                full_name
            )
            `
        )
        .eq(
            "class_id",
            classId
        );


    if (error) {

        console.error(error);

        list.innerHTML =
            "<p>Error loading students.</p>";

        return;

    }


    if (
        !members ||
        members.length === 0
    ) {

        list.innerHTML =
            "<p>No students enrolled yet.</p>";

        return;

    }


    list.innerHTML =
        members
            .map(
                function (member) {

                    return `

                        <div class="student-row">

                            <div class="student-avatar">

                                ${escapeHtml(
                                    getInitials(
                                        member.profiles?.full_name
                                    )
                                )}

                            </div>

                            <strong>
                                ${escapeHtml(
                                    member.profiles?.full_name ||
                                    "Student"
                                )}
                            </strong>

                        </div>

                    `;

                }
            )
            .join("");

}


// =====================================================
// CREATE CLASS
// =====================================================

function setupCreateClass() {

    const button =
        getElement(
            "createClassBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async function () {

            const name =
                getElement(
                    "className"
                )?.value.trim();


            const description =
                getElement(
                    "classDescription"
                )?.value.trim();


            if (!name) {

                setMessage(
                    "classMessage",
                    "Enter a class name.",
                    true
                );

                return;

            }


            button.disabled =
                true;


            button.textContent =
                "Creating...";


            const classCode =
                "CL" +
                Math.random()
                    .toString(36)
                    .substring(2, 7)
                    .toUpperCase();


            const {
                error
            } = await supabase
                .from("classes")
                .insert(
                    {
                        lecturer_id:
                            currentUser.id,

                        class_name:
                            name,

                        description:
                            description ||
                            null,

                        class_code:
                            classCode
                    }
                );


            if (error) {

                console.error(error);

                setMessage(
                    "classMessage",
                    "Error creating class: " +
                    error.message,
                    true
                );

            } else {

                setMessage(
                    "classMessage",
                    "Class created successfully. Code: " +
                    classCode
                );


                if (
                    getElement(
                        "className"
                    )
                ) {

                    getElement(
                        "className"
                    ).value = "";

                }


                if (
                    getElement(
                        "classDescription"
                    )
                ) {

                    getElement(
                        "classDescription"
                    ).value = "";

                }


                await loadMyClasses();

                await loadAssignmentClasses();

                await loadMaterialClasses();

                await loadAnnouncementClasses();

                await loadAttendanceClasses();

                await loadLecturerOverview();

            }


            button.disabled =
                false;


            button.textContent =
                "➕ Create Class";

        }
    );

}


// =====================================================
// CLASS DROPDOWNS
// =====================================================

async function getLecturerClasses() {

    const {
        data,
        error
    } = await supabase
        .from("classes")
        .select(
            "id, class_name"
        )
        .eq(
            "lecturer_id",
            currentUser.id
        )
        .order(
            "class_name"
        );


    if (error) {

        console.error(error);

        return [];

    }


    return data || [];

}


function fillClassSelect(
    select,
    classes
) {

    if (!select) {
        return;
    }


    select.innerHTML =
        `
        <option value="">
            Select Class
        </option>
        `;


    classes.forEach(
        function (classItem) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                classItem.id;


            option.textContent =
                classItem.class_name;


            select.appendChild(
                option
            );

        }
    );

}


async function loadAssignmentClasses() {

    const assignmentSelect =
        getElement(
            "assignmentClass"
        );


    const resultsSelect =
        getElement(
            "resultsClass"
        );


    if (
        !assignmentSelect &&
        !resultsSelect
    ) {

        return;

    }


    const classes =
        await getLecturerClasses();


    fillClassSelect(
        assignmentSelect,
        classes
    );


    fillClassSelect(
        resultsSelect,
        classes
    );

}


// =====================================================
// MATERIAL CLASSES
// =====================================================

async function loadMaterialClasses() {

    const select =
        getElement(
            "materialClass"
        );


    if (!select) {
        return;
    }


    const classes =
        await getLecturerClasses();


    fillClassSelect(
        select,
        classes
    );

}


// =====================================================
// ANNOUNCEMENT CLASSES
// =====================================================

async function loadAnnouncementClasses() {

    const select =
        getElement(
            "announcementClass"
        );


    if (!select) {
        return;
    }


    const classes =
        await getLecturerClasses();


    fillClassSelect(
        select,
        classes
    );

}


// =====================================================
// ATTENDANCE CLASSES
// =====================================================

async function loadAttendanceClasses() {

    const select =
        getElement(
            "attendanceClass"
        );


    if (!select) {
        return;
    }


    const classes =
        await getLecturerClasses();


    fillClassSelect(
        select,
        classes
    );

}


// =====================================================
// LEARNING MATERIALS
// =====================================================

async function loadMaterials() {

    const list =
        getElement(
            "materialsList"
        );


    if (!list) {
        return;
    }


    const {
        data: materials,
        error
    } = await supabase
        .from("materials")
        .select(
            `
            id,
            title,
            description,
            file_url,
            created_at,
            classes (
                class_name
            )
            `
        )
        .eq(
            "lecturer_id",
            currentUser.id
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
            "<p>Error loading materials.</p>";

        return;

    }


    if (
        !materials ||
        materials.length === 0
    ) {

        list.innerHTML =
            "<p>No learning materials uploaded yet.</p>";

        return;

    }


    list.innerHTML = "";


    materials.forEach(
        function (material) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "material-item";


            item.innerHTML = `

                <h4>
                    ${escapeHtml(
                        material.title
                    )}
                </h4>

                <p>
                    ${escapeHtml(
                        material.description ||
                        ""
                    )}
                </p>

                <small>
                    Class:
                    ${escapeHtml(
                        material.classes?.class_name ||
                        ""
                    )}
                </small>

                <br>

                <small>
                    ${formatDate(
                        material.created_at
                    )}
                </small>

                <br><br>

                <button
                    class="downloadMaterialBtn"
                >
                    📥 Open Material
                </button>

            `;


            list.appendChild(
                item
            );


            item
                .querySelector(
                    ".downloadMaterialBtn"
                )
                .addEventListener(
                    "click",
                    async function () {

                        const {
                            data,
                            error
                        } = await supabase
                            .storage
                            .from(
                                "materials"
                            )
                            .createSignedUrl(
                                material.file_url,
                                3600
                            );


                        if (error) {

                            console.error(
                                error
                            );

                            alert(
                                "Could not open this material."
                            );

                            return;

                        }


                        window.open(
                            data.signedUrl,
                            "_blank"
                        );

                    }
                );

        }
    );

}


// =====================================================
// UPLOAD MATERIAL
// =====================================================

function setupMaterialUpload() {

    const button =
        getElement(
            "uploadMaterialBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async function () {

            const classId =
                getElement(
                    "materialClass"
                )?.value;


            const title =
                getElement(
                    "materialTitle"
                )?.value.trim();


            const description =
                getElement(
                    "materialDescription"
                )?.value.trim();


            const file =
                getElement(
                    "materialFile"
                )?.files?.[0];


            if (
                !classId ||
                !title ||
                !file
            ) {

                setMessage(
                    "materialMessage",
                    "Select a class, enter a title and choose a file.",
                    true
                );

                return;

            }


            button.disabled =
                true;


            button.textContent =
                "Uploading...";


            const safeName =
                file.name.replace(
                    /[^a-zA-Z0-9._-]/g,
                    "_"
                );


            const path =
                `${currentUser.id}/${Date.now()}-${safeName}`;


            const {
                error: uploadError
            } = await supabase
                .storage
                .from(
                    "materials"
                )
                .upload(
                    path,
                    file,
                    {
                        upsert:
                            false,

                        contentType:
                            file.type ||
                            undefined
                    }
                );


            if (uploadError) {

                console.error(
                    uploadError
                );

                setMessage(
                    "materialMessage",
                    "Upload failed: " +
                    uploadError.message,
                    true
                );

            } else {

                const {
                    error: insertError
                } = await supabase
                    .from("materials")
                    .insert(
                        {
                            class_id:
                                classId,

                            lecturer_id:
                                currentUser.id,

                            title:
                                title,

                            description:
                                description ||
                                null,

                            file_url:
                                path
                        }
                    );


                if (insertError) {

                    console.error(
                        insertError
                    );

                    setMessage(
                        "materialMessage",
                        "Material record failed: " +
                        insertError.message,
                        true
                    );

                } else {

                    setMessage(
                        "materialMessage",
                        "Material uploaded successfully."
                    );


                    if (
                        getElement(
                            "materialTitle"
                        )
                    ) {

                        getElement(
                            "materialTitle"
                        ).value = "";

                    }


                    if (
                        getElement(
                            "materialDescription"
                        )
                    ) {

                        getElement(
                            "materialDescription"
                        ).value = "";

                    }


                    if (
                        getElement(
                            "materialFile"
                        )
                    ) {

                        getElement(
                            "materialFile"
                        ).value = "";

                    }


                    await loadMaterials();

                }

            }


            button.disabled =
                false;


            button.textContent =
                "📤 Upload Material";

        }
    );

}


// =====================================================
// CREATE ASSIGNMENT
// =====================================================

function setupCreateAssignment() {

    const button =
        getElement(
            "createAssignmentBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async function () {

            const classId =
                getElement(
                    "assignmentClass"
                )?.value;


            const title =
                getElement(
                    "assignmentTitle"
                )?.value.trim();


            const description =
                getElement(
                    "assignmentDescription"
                )?.value.trim();


            const dueDate =
                getElement(
                    "assignmentDueDate"
                )?.value;


            if (
                !classId ||
                !title
            ) {

                setMessage(
                    "assignmentMessage",
                    "Select a class and enter an assignment title.",
                    true
                );

                return;

            }


            button.disabled =
                true;


            button.textContent =
                "Creating...";


            const {
                error
            } = await supabase
                .from("assignments")
                .insert(
                    {
                        class_id:
                            classId,

                        lecturer_id:
                            currentUser.id,

                        title:
                            title,

                        description:
                            description ||
                            null,

                        due_date:
                            dueDate ||
                            null
                    }
                );


            if (error) {

                console.error(error);

                setMessage(
                    "assignmentMessage",
                    "Error creating assignment: " +
                    error.message,
                    true
                );

            } else {

                setMessage(
                    "assignmentMessage",
                    "Assignment created successfully."
                );


                if (
                    getElement(
                        "assignmentTitle"
                    )
                ) {

                    getElement(
                        "assignmentTitle"
                    ).value = "";

                }


                if (
                    getElement(
                        "assignmentDescription"
                    )
                ) {

                    getElement(
                        "assignmentDescription"
                    ).value = "";

                }


                if (
                    getElement(
                        "assignmentDueDate"
                    )
                ) {

                    getElement(
                        "assignmentDueDate"
                    ).value = "";

                }


                await loadAssignments();

                await loadLecturerOverview();

            }


            button.disabled =
                false;


            button.textContent =
                "➕ Create Assignment";

        }
    );

}


// =====================================================
// LOAD ASSIGNMENTS
// =====================================================

async function loadAssignments() {

    const list =
        getElement(
            "lecturerAssignmentsList"
        );


    if (!list) {
        return;
    }


    const {
        data: assignments,
        error
    } = await supabase
        .from("assignments")
        .select(
            `
            id,
            class_id,
            title,
            description,
            due_date,
            created_at,
            classes (
                class_name
            )
            `
        )
        .eq(
            "lecturer_id",
            currentUser.id
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
            "<p>Error loading assignments.</p>";

        return;

    }


    if (
        !assignments ||
        assignments.length === 0
    ) {

        list.innerHTML =
            "<p>No assignments created yet.</p>";

        return;

    }


    list.innerHTML = "";


    assignments.forEach(
        function (assignment) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "assignment-item";


            item.innerHTML = `

                <h4>
                    ${escapeHtml(
                        assignment.title
                    )}
                </h4>

                <p>
                    ${escapeHtml(
                        assignment.description ||
                        ""
                    )}
                </p>

                <small>
                    Class:
                    ${escapeHtml(
                        assignment.classes?.class_name ||
                        ""
                    )}
                </small>

                <br>

                <small>
                    Due:
                    ${
                        assignment.due_date
                            ? formatDate(
                                assignment.due_date
                            )
                            : "No due date"
                    }
                </small>

                <br><br>

                <button
                    class="viewSubmissionsBtn"
                >
                    👥 View Submissions
                </button>

                <div
                    id="submissions-${assignment.id}"
                ></div>

            `;


            list.appendChild(
                item
            );


            item
                .querySelector(
                    ".viewSubmissionsBtn"
                )
                .addEventListener(
                    "click",
                    function () {

                        loadSubmissions(
                            assignment.id,
                            assignment.class_id
                        );

                    }
                );

        }
    );

}


// =====================================================
// VIEW SUBMISSIONS
// =====================================================

async function loadSubmissions(
    assignmentId,
    classId
) {

    const container =
        getElement(
            `submissions-${assignmentId}`
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<p>Loading submissions...</p>";


    const {
        data: submissions,
        error
    } = await supabase
        .from("submissions")
        .select(
            `
            id,
            student_id,
            file_url,
            submitted_at,
            profiles (
                full_name
            )
            `
        )
        .eq(
            "assignment_id",
            assignmentId
        )
        .order(
            "submitted_at",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(error);

        container.innerHTML =
            "<p>Error loading submissions.</p>";

        return;

    }


    if (
        !submissions ||
        submissions.length === 0
    ) {

        container.innerHTML =
            "<p>No submissions yet.</p>";

        return;

    }


    container.innerHTML = "";


    for (
        const submission
        of submissions
    ) {

        const {
            data: existingMarks
        } = await supabase
            .from("marks")
            .select(
                `
                id,
                mark,
                max_mark,
                category,
                feedback,
                graded_at
                `
            )
            .eq(
                "assignment_id",
                assignmentId
            )
            .eq(
                "student_id",
                submission.student_id
            )
            .eq(
                "category",
                "Assignment"
            )
            .limit(1);


        let existing =
            existingMarks?.[0] ||
            null;


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "submission-item";


        row.innerHTML = `

            <div>

                <strong>
                    ${escapeHtml(
                        submission.profiles?.full_name ||
                        "Student"
                    )}
                </strong>

                <br>

                <small>
                    Submitted:
                    ${formatDate(
                        submission.submitted_at
                    )}
                </small>

                <br><br>

                <button
                    class="openSubmissionBtn"
                >
                    📄 Open Submission
                </button>

            </div>


            <div class="submission-grading">

                <label>
                    Mark
                </label>

                <div class="mark-input-row">

                    <input
                        type="number"
                        class="student-mark"
                        min="0"
                        value="${
                            existing?.mark ??
                            ""
                        }"
                        placeholder="Mark obtained"
                    >

                    <span>
                        /
                    </span>

                    <input
                        type="number"
                        class="student-max-mark"
                        min="1"
                        value="${
                            existing?.max_mark ??
                            100
                        }"
                        placeholder="Maximum mark"
                    >

                </div>


                <br>


                <label>
                    Category
                </label>

                <select
                    class="student-mark-category"
                >

                    <option
                        value="Assignment"
                        selected
                    >
                        Assignment
                    </option>

                </select>


                <br><br>


                <textarea
                    class="student-feedback"
                    placeholder="Feedback for the student"
                >${escapeHtml(
                    existing?.feedback ||
                    ""
                )}</textarea>


                <br><br>


                <button
                    class="saveMarkBtn"
                >
                    💾 Save Mark
                </button>


                <p
                    class="markMessage"
                ></p>

            </div>

        `;


        container.appendChild(
            row
        );


        row
            .querySelector(
                ".openSubmissionBtn"
            )
            .addEventListener(
                "click",
                async function () {

                    const {
                        data,
                        error
                    } = await supabase
                        .storage
                        .from(
                            "submissions"
                        )
                        .createSignedUrl(
                            submission.file_url,
                            3600
                        );


                    if (error) {

                        console.error(
                            error
                        );

                        alert(
                            "Could not open submission."
                        );

                        return;

                    }


                    window.open(
                        data.signedUrl,
                        "_blank"
                    );

                }
            );


        row
            .querySelector(
                ".saveMarkBtn"
            )
            .addEventListener(
                "click",
                async function (event) {

                    const saveButton =
                        event.currentTarget;


                    const markInput =
                        row.querySelector(
                            ".student-mark"
                        );


                    const maxMarkInput =
                        row.querySelector(
                            ".student-max-mark"
                        );


                    const feedbackInput =
                        row.querySelector(
                            ".student-feedback"
                        );


                    const message =
                        row.querySelector(
                            ".markMessage"
                        );


                    const mark =
                        Number(
                            markInput.value
                        );


                    const maxMark =
                        Number(
                            maxMarkInput.value
                        );


                    const feedback =
                        feedbackInput
                            .value
                            .trim();


                    if (
                        markInput.value === "" ||
                        maxMarkInput.value === "" ||
                        mark < 0 ||
                        maxMark <= 0 ||
                        mark > maxMark
                    ) {

                        message.textContent =
                            "Enter a valid mark.";

                        message.style.color =
                            "#dc2626";

                        return;

                    }


                    saveButton.disabled =
                        true;


                    saveButton.textContent =
                        "Saving...";


                    const payload = {

                        class_id:
                            classId,

                        assignment_id:
                            assignmentId,

                        student_id:
                            submission.student_id,

                        mark:
                            mark,

                        max_mark:
                            maxMark,

                        category:
                            "Assignment",

                        feedback:
                            feedback ||
                            null

                    };


                    let saveError =
                        null;


                    if (existing?.id) {

                        const {
                            error
                        } = await supabase
                            .from("marks")
                            .update(
                                payload
                            )
                            .eq(
                                "id",
                                existing.id
                            );


                        saveError =
                            error;

                    } else {

                        const {
                            data,
                            error
                        } = await supabase
                            .from("marks")
                            .insert(
                                payload
                            )
                            .select()
                            .single();


                        saveError =
                            error;


                        if (!error) {

                            existing =
                                data;

                        }

                    }


                    if (saveError) {

                        console.error(
                            saveError
                        );

                        message.textContent =
                            "Error saving mark: " +
                            saveError.message;

                        message.style.color =
                            "#dc2626";

                    } else {

                        const percentage =
                            Math.round(
                                (
                                    mark /
                                    maxMark
                                ) * 100
                            );


                        message.textContent =
                            `✅ Mark saved! ${mark}/${maxMark} (${percentage}%)`;

                        message.style.color =
                            "#16a34a";

                    }


                    saveButton.disabled =
                        false;


                    saveButton.textContent =
                        "💾 Save Mark";


                    await loadLecturerOverview();

                }
            );

    }

}


// =====================================================
// VIEW ASSIGNMENTS BUTTON
// =====================================================

function setupViewAssignments() {

    const button =
        getElement(
            "viewAssignmentsBtn"
        );


    if (button) {

        button.addEventListener(
            "click",
            loadAssignments
        );

    }

}


// =====================================================
// ENTER RESULTS
// CAT 1 / CAT 2 / EXAM
// =====================================================

async function loadResultsStudents() {

    const classId =
        getElement(
            "resultsClass"
        )?.value;


    const category =
        getElement(
            "resultsCategory"
        )?.value;


    const maxMark =
        Number(
            getElement(
                "resultsMaxMark"
            )?.value
        );


    const message =
        getElement(
            "resultsMessage"
        );


    const list =
        getElement(
            "resultsStudentsList"
        );


    if (!classId) {

        setMessage(
            "resultsMessage",
            "Please select a class.",
            true
        );

        return;

    }


    if (!category) {

        setMessage(
            "resultsMessage",
            "Select CAT 1, CAT 2 or Exam.",
            true
        );

        return;

    }


    if (
        !maxMark ||
        maxMark <= 0
    ) {

        setMessage(
            "resultsMessage",
            "Enter a valid maximum mark.",
            true
        );

        return;

    }


    if (!list) {
        return;
    }


    message.textContent =
        "Loading students...";


    message.style.color =
        "#64748b";


    list.innerHTML =
        "";


    const {
        data: members,
        error
    } = await supabase
        .from("class_members")
        .select(
            `
            student_id,
            profiles (
                full_name
            )
            `
        )
        .eq(
            "class_id",
            classId
        );


    if (error) {

        console.error(error);

        setMessage(
            "resultsMessage",
            "Error loading students: " +
            error.message,
            true
        );

        return;

    }


    if (
        !members ||
        members.length === 0
    ) {

        setMessage(
            "resultsMessage",
            "No students are enrolled in this class.",
            true
        );

        return;

    }


    message.textContent =
        `${members.length} student(s) loaded.`;


    message.style.color =
        "#16a34a";


    for (
        const member
        of members
    ) {

        const {
            data: existingMarks,
            error: markError
        } = await supabase
            .from("marks")
            .select(
                `
                id,
                mark,
                max_mark,
                category,
                feedback
                `
            )
            .eq(
                "class_id",
                classId
            )
            .eq(
                "student_id",
                member.student_id
            )
            .eq(
                "category",
                category
            )
            .limit(1);


        if (markError) {

            console.error(
                markError
            );

        }


        let existing =
            existingMarks?.[0] ||
            null;


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "result-student-row";


        row.innerHTML = `

            <div
                class="result-student-info"
            >

                <div
                    class="attendance-avatar"
                >
                    ${escapeHtml(
                        getInitials(
                            member.profiles?.full_name
                        )
                    )}
                </div>

                <strong>
                    ${escapeHtml(
                        member.profiles?.full_name ||
                        "Student"
                    )}
                </strong>

            </div>


            <div
                class="result-student-actions"
            >

                <input
                    type="number"
                    class="result-mark-input"
                    min="0"
                    max="${maxMark}"
                    value="${
                        existing?.mark ??
                        ""
                    }"
                    placeholder="Mark"
                >


                <span>
                    /
                    ${maxMark}
                </span>


                <button
                    class="saveResultBtn"
                >
                    💾 Save
                </button>


                <p
                    class="resultSaveMessage"
                ></p>

            </div>

        `;


        list.appendChild(
            row
        );


        const markInput =
            row.querySelector(
                ".result-mark-input"
            );


        const saveButton =
            row.querySelector(
                ".saveResultBtn"
            );


        const saveMessage =
            row.querySelector(
                ".resultSaveMessage"
            );


        saveButton.addEventListener(
            "click",
            async function () {

                const mark =
                    Number(
                        markInput.value
                    );


                const selectedMaxMark =
                    Number(
                        getElement(
                            "resultsMaxMark"
                        )?.value
                    );


                if (
                    markInput.value === "" ||
                    !Number.isFinite(mark) ||
                    mark < 0 ||
                    !selectedMaxMark ||
                    selectedMaxMark <= 0 ||
                    mark > selectedMaxMark
                ) {

                    saveMessage.textContent =
                        "Enter a valid mark.";

                    saveMessage.style.color =
                        "#dc2626";

                    return;

                }


                saveButton.disabled =
                    true;


                saveButton.textContent =
                    "Saving...";


                const payload = {

                    class_id:
                        classId,

                    student_id:
                        member.student_id,

                    mark:
                        mark,

                    max_mark:
                        selectedMaxMark,

                    category:
                        category,

                    assignment_id:
                        null,

                    feedback:
                        null

                };


                let saveError =
                    null;


                if (existing?.id) {

                    const {
                        error
                    } = await supabase
                        .from("marks")
                        .update(
                            payload
                        )
                        .eq(
                            "id",
                            existing.id
                        );


                    saveError =
                        error;

                } else {

                    const {
                        data,
                        error
                    } = await supabase
                        .from("marks")
                        .insert(
                            payload
                        )
                        .select()
                        .single();


                    saveError =
                        error;


                    if (!error) {

                        existing =
                            data;

                    }

                }


                if (saveError) {

                    console.error(
                        saveError
                    );

                    saveMessage.textContent =
                        "Error: " +
                        saveError.message;

                    saveMessage.style.color =
                        "#dc2626";

                } else {

                    const percentage =
                        Math.round(
                            (
                                mark /
                                selectedMaxMark
                            ) * 100
                        );


                    saveMessage.textContent =
                        `✅ Saved ${mark}/${selectedMaxMark} (${percentage}%)`;


                    saveMessage.style.color =
                        "#16a34a";

                }


                saveButton.disabled =
                    false;


                saveButton.textContent =
                    "💾 Save";

            }
        );

    }

}


function setupResults() {

    const button =
        getElement(
            "loadResultsBtn"
        );


    if (button) {

        button.addEventListener(
            "click",
            loadResultsStudents
        );

    }

}


// =====================================================
// ANNOUNCEMENTS
// =====================================================

function setupCreateAnnouncement() {

    const button =
        getElement(
            "createAnnouncementBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async function () {

            const classId =
                getElement(
                    "announcementClass"
                )?.value;


            const title =
                getElement(
                    "announcementTitle"
                )?.value.trim();


            const message =
                getElement(
                    "announcementMessage"
                )?.value.trim();


            if (
                !classId ||
                !title ||
                !message
            ) {

                setMessage(
                    "announcementMessageStatus",
                    "Fill in the class, title and message.",
                    true
                );

                return;

            }


            button.disabled =
                true;


            button.textContent =
                "Posting...";


            const {
                error
            } = await supabase
                .from("announcements")
                .insert(
                    {
                        class_id:
                            classId,

                        lecturer_id:
                            currentUser.id,

                        title:
                            title,

                        message:
                            message
                    }
                );


            if (error) {

                console.error(error);

                setMessage(
                    "announcementMessageStatus",
                    "Error posting announcement: " +
                    error.message,
                    true
                );

            } else {

                setMessage(
                    "announcementMessageStatus",
                    "Announcement posted successfully."
                );


                if (
                    getElement(
                        "announcementTitle"
                    )
                ) {

                    getElement(
                        "announcementTitle"
                    ).value = "";

                }


                if (
                    getElement(
                        "announcementMessage"
                    )
                ) {

                    getElement(
                        "announcementMessage"
                    ).value = "";

                }


                await loadAnnouncements();

                await loadLecturerOverview();

            }


            button.disabled =
                false;


            button.textContent =
                "📢 Post Announcement";

        }
    );

}


// =====================================================
// LOAD ANNOUNCEMENTS
// =====================================================

async function loadAnnouncements() {

    const list =
        getElement(
            "lecturerAnnouncementsList"
        );


    if (!list) {
        return;
    }


    const {
        data: announcements,
        error
    } = await supabase
        .from("announcements")
        .select(
            `
            id,
            title,
            message,
            created_at,
            classes (
                class_name
            )
            `
        )
        .eq(
            "lecturer_id",
            currentUser.id
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
            "<p>Error loading announcements.</p>";

        return;

    }


    if (
        !announcements ||
        announcements.length === 0
    ) {

        list.innerHTML =
            "<p>No announcements yet.</p>";

        return;

    }


    list.innerHTML =
        announcements
            .map(
                function (item) {

                    return `

                        <div
                            class="announcement-item"
                        >

                            <h4>
                                ${escapeHtml(
                                    item.title
                                )}
                            </h4>

                            <p>
                                ${escapeHtml(
                                    item.message
                                )}
                            </p>

                            <small>
                                Class:
                                ${escapeHtml(
                                    item.classes?.class_name ||
                                    ""
                                )}
                            </small>

                            <br>

                            <small>
                                ${formatDate(
                                    item.created_at
                                )}
                            </small>

                        </div>

                    `;

                }
            )
            .join("");

}


function setupViewAnnouncements() {

    const button =
        getElement(
            "viewAnnouncementsBtn"
        );


    if (button) {

        button.addEventListener(
            "click",
            loadAnnouncements
        );

    }

}


// =====================================================
// ATTENDANCE
// =====================================================

function setupCreateAttendance() {

    const button =
        getElement(
            "createAttendanceBtn"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        async function () {

            const classId =
                getElement(
                    "attendanceClass"
                )?.value;


            const title =
                getElement(
                    "attendanceTitle"
                )?.value.trim();


            const date =
                getElement(
                    "attendanceDate"
                )?.value;


            if (
                !classId ||
                !title
            ) {

                setMessage(
                    "attendanceMessage",
                    "Select a class and enter a session title.",
                    true
                );

                return;

            }


            button.disabled =
                true;


            button.textContent =
                "Creating...";


            const {
                error
            } = await supabase
                .from(
                    "attendance_sessions"
                )
                .insert(
                    {
                        class_id:
                            classId,

                        lecturer_id:
                            currentUser.id,

                        session_title:
                            title,

                        session_date:
                            date ||
                            new Date()
                                .toISOString()
                                .slice(
                                    0,
                                    10
                                )
                    }
                );


            if (error) {

                console.error(error);

                setMessage(
                    "attendanceMessage",
                    "Error creating session: " +
                    error.message,
                    true
                );

            } else {

                setMessage(
                    "attendanceMessage",
                    "Attendance session created successfully."
                );


                if (
                    getElement(
                        "attendanceTitle"
                    )
                ) {

                    getElement(
                        "attendanceTitle"
                    ).value = "";

                }


                if (
                    getElement(
                        "attendanceDate"
                    )
                ) {

                    getElement(
                        "attendanceDate"
                    ).value = "";

                }


                await loadAttendanceSessions();

            }


            button.disabled =
                false;


            button.textContent =
                "➕ Create Attendance Session";

        }
    );

}


// =====================================================
// LOAD ATTENDANCE SESSIONS
// =====================================================

async function loadAttendanceSessions() {

    const list =
        getElement(
            "attendanceSessionsList"
        );


    if (!list) {
        return;
    }


    const {
        data: sessions,
        error
    } = await supabase
        .from(
            "attendance_sessions"
        )
        .select(
            `
            id,
            class_id,
            session_title,
            session_date,
            created_at,
            classes (
                class_name
            )
            `
        )
        .eq(
            "lecturer_id",
            currentUser.id
        )
        .order(
            "session_date",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(error);

        list.innerHTML =
            "<p>Error loading attendance sessions.</p>";

        return;

    }


    if (
        !sessions ||
        sessions.length === 0
    ) {

        list.innerHTML =
            "<p>No attendance sessions created yet.</p>";

        return;

    }


    list.innerHTML = "";


    sessions.forEach(
        function (session) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "attendance-session-item";


            item.innerHTML = `

                <h4>
                    ${escapeHtml(
                        session.session_title
                    )}
                </h4>

                <p>
                    Class:
                    ${escapeHtml(
                        session.classes?.class_name ||
                        ""
                    )}
                </p>

                <p>
                    Date:
                    ${escapeHtml(
                        session.session_date ||
                        ""
                    )}
                </p>

                <button
                    class="manageAttendanceBtn"
                >
                    📋 Manage Attendance
                </button>

                <div
                    id="attendance-manager-${session.id}"
                ></div>

            `;


            list.appendChild(
                item
            );


            item
                .querySelector(
                    ".manageAttendanceBtn"
                )
                .addEventListener(
                    "click",
                    function () {

                        loadStudentsForAttendance(
                            session.id
                        );

                    }
                );

        }
    );

}


// =====================================================
// MANAGE ATTENDANCE
// =====================================================

async function loadStudentsForAttendance(
    sessionId
) {

    const container =
        getElement(
            `attendance-manager-${sessionId}`
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        "<p>Loading students...</p>";


    const {
        data: session,
        error: sessionError
    } = await supabase
        .from(
            "attendance_sessions"
        )
        .select(
            `
            id,
            class_id,
            session_title
            `
        )
        .eq(
            "id",
            sessionId
        )
        .single();


    if (sessionError) {

        console.error(
            sessionError
        );

        container.innerHTML =
            "<p>Error loading session.</p>";

        return;

    }


    const {
        data: members,
        error: memberError
    } = await supabase
        .from(
            "class_members"
        )
        .select(
            `
            student_id,
            profiles (
                full_name
            )
            `
        )
        .eq(
            "class_id",
            session.class_id
        );


    if (memberError) {

        console.error(
            memberError
        );

        container.innerHTML =
            "<p>Error loading students.</p>";

        return;

    }


    if (
        !members ||
        members.length === 0
    ) {

        container.innerHTML =
            "<p>No students are enrolled in this class.</p>";

        return;

    }


    const studentIds =
        members.map(
            function (member) {

                return member.student_id;

            }
        );


    const {
        data: records
    } = await supabase
        .from(
            "attendance_records"
        )
        .select(
            "id, student_id, status"
        )
        .eq(
            "session_id",
            sessionId
        )
        .in(
            "student_id",
            studentIds
        );


    const recordMap =
        new Map(
            (records || [])
                .map(
                    function (record) {

                        return [
                            record.student_id,
                            record
                        ];

                    }
                )
        );


    container.innerHTML = `

        <div
            class="attendance-manager"
        >

            <div
                class="attendance-manager-header"
            >

                <div>

                    <h4>
                        ${escapeHtml(
                            session.session_title
                        )}
                    </h4>

                    <p>
                        Mark attendance for this session.
                    </p>

                </div>

                <button
                    class="mark-all-present-btn"
                >
                    ✅ Mark All Present
                </button>

            </div>

            <div
                class="attendance-student-list"
            ></div>

        </div>

    `;


    const studentList =
        container.querySelector(
            ".attendance-student-list"
        );


    for (
        const member
        of members
    ) {

        const record =
            recordMap.get(
                member.student_id
            );


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "attendance-student";


        row.innerHTML = `

            <div
                class="attendance-student-info"
            >

                <div
                    class="attendance-avatar"
                >
                    ${escapeHtml(
                        getInitials(
                            member.profiles?.full_name
                        )
                    )}
                </div>

                <div>

                    <strong>
                        ${escapeHtml(
                            member.profiles?.full_name ||
                            "Student"
                        )}
                    </strong>

                </div>

            </div>


            <div
                class="attendance-actions"
            >

                <select
                    class="attendanceStatus"
                >

                    <option
                        value="present"
                        ${
                            record?.status ===
                            "present"
                                ? "selected"
                                : ""
                        }
                    >
                        Present
                    </option>

                    <option
                        value="late"
                        ${
                            record?.status ===
                            "late"
                                ? "selected"
                                : ""
                        }
                    >
                        Late
                    </option>

                    <option
                        value="absent"
                        ${
                            record?.status ===
                            "absent"
                                ? "selected"
                                : ""
                        }
                    >
                        Absent
                    </option>

                    <option
                        value="excused"
                        ${
                            record?.status ===
                            "excused"
                                ? "selected"
                                : ""
                        }
                    >
                        Excused
                    </option>

                </select>


                <button
                    class="saveAttendanceBtn"
                >
                    Save
                </button>

            </div>


            <p
                class="attendanceSaveMessage"
            ></p>

        `;


        studentList.appendChild(
            row
        );


        row
            .querySelector(
                ".saveAttendanceBtn"
            )
            .addEventListener(
                "click",
                async function (event) {

                    const button =
                        event.currentTarget;


                    const status =
                        row.querySelector(
                            ".attendanceStatus"
                        ).value;


                    const message =
                        row.querySelector(
                            ".attendanceSaveMessage"
                        );


                    button.disabled =
                        true;


                    button.textContent =
                        "Saving...";


                    const {
                        error
                    } = await supabase
                        .from(
                            "attendance_records"
                        )
                        .upsert(
                            {
                                session_id:
                                    sessionId,

                                student_id:
                                    member.student_id,

                                status:
                                    status
                            },
                            {
                                onConflict:
                                    "session_id,student_id"
                            }
                        );


                    if (error) {

                        console.error(
                            error
                        );

                        message.textContent =
                            "Error: " +
                            error.message;

                        message.style.color =
                            "#dc2626";

                    } else {

                        message.textContent =
                            "Attendance saved.";

                        message.style.color =
                            "#16a34a";

                    }


                    button.disabled =
                        false;


                    button.textContent =
                        "Save";

                }
            );

    }


    container
        .querySelector(
            ".mark-all-present-btn"
        )
        .addEventListener(
            "click",
            async function (event) {

                const button =
                    event.currentTarget;


                button.disabled =
                    true;


                button.textContent =
                    "Saving...";


                const rows =
                    members.map(
                        function (member) {

                            return {

                                session_id:
                                    sessionId,

                                student_id:
                                    member.student_id,

                                status:
                                    "present"

                            };

                        }
                    );


                const {
                    error
                } = await supabase
                    .from(
                        "attendance_records"
                    )
                    .upsert(
                        rows,
                        {
                            onConflict:
                                "session_id,student_id"
                        }
                    );


                if (error) {

                    console.error(error);

                    alert(
                        "Error marking students present: " +
                        error.message
                    );

                    button.disabled =
                        false;

                    button.textContent =
                        "✅ Mark All Present";

                    return;

                }


                await loadStudentsForAttendance(
                    sessionId
                );

            }
        );

}


function setupViewAttendance() {

    const button =
        getElement(
            "viewAttendanceBtn"
        );


    if (button) {

        button.addEventListener(
            "click",
            loadAttendanceSessions
        );

    }

}


// =====================================================
// LECTURER OVERVIEW
// =====================================================

async function loadLecturerOverview() {

    const classesCount =
        getElement(
            "lecturerOverviewClasses"
        );


    const studentsCount =
        getElement(
            "lecturerOverviewStudents"
        );


    const assignmentsCount =
        getElement(
            "lecturerOverviewAssignments"
        );


    const announcementsCount =
        getElement(
            "lecturerOverviewAnnouncements"
        );


    if (
        !classesCount &&
        !studentsCount &&
        !assignmentsCount &&
        !announcementsCount
    ) {

        return;

    }


    const {
        data: classes,
        error
    } = await supabase
        .from("classes")
        .select(
            "id"
        )
        .eq(
            "lecturer_id",
            currentUser.id
        );


    if (error) {

        console.error(error);

        return;

    }


    const classIds =
        (classes || [])
            .map(
                function (item) {

                    return item.id;

                }
            );


    if (classesCount) {

        classesCount.textContent =
            classIds.length;

    }


    let totalStudents =
        0;


    if (
        classIds.length > 0
    ) {

        const {
            data: members,
            error: memberError
        } = await supabase
            .from(
                "class_members"
            )
            .select(
                "student_id"
            )
            .in(
                "class_id",
                classIds
            );


        if (!memberError) {

            totalStudents =
                new Set(
                    (members || [])
                        .map(
                            function (member) {

                                return member.student_id;

                            }
                        )
                ).size;

        }

    }


    if (studentsCount) {

        studentsCount.textContent =
            totalStudents;

    }


    const {
        count: assignmentCount
    } = await supabase
        .from(
            "assignments"
        )
        .select(
            "id",
            {
                count:
                    "exact",
                head:
                    true
            }
        )
        .eq(
            "lecturer_id",
            currentUser.id
        );


    if (assignmentsCount) {

        assignmentsCount.textContent =
            assignmentCount || 0;

    }


    const {
        count: announcementCount
    } = await supabase
        .from(
            "announcements"
        )
        .select(
            "id",
            {
                count:
                    "exact",
                head:
                    true
            }
        )
        .eq(
            "lecturer_id",
            currentUser.id
        );


    if (announcementsCount) {

        announcementsCount.textContent =
            announcementCount || 0;

    }

}


// =====================================================
// LOGOUT
// =====================================================

function setupLogout() {

    const buttons =
        document.querySelectorAll(
            "#logoutBtn, .sidebar-logout"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                async function () {

                    const {
                        error
                    } = await supabase
                        .auth
                        .signOut();


                    if (error) {

                        console.error(
                            error
                        );

                        return;

                    }


                    window.location.href =
                        "login.html";

                }
            );

        }
    );

}


// =====================================================
// SIDEBAR
// =====================================================

function setupSidebarNavigation() {

    const links =
        document.querySelectorAll(
            ".sidebar-link"
        );


    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    links.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    link.classList.add(
                        "active"
                    );

                }
            );

        }
    );

}


// =====================================================
// INITIALISE DASHBOARD
// =====================================================

async function initialiseDashboard() {

    currentUser =
        await getCurrentUser();


    if (!currentUser) {
        return;
    }


    currentProfile =
        await loadCurrentProfile();


    if (!currentProfile) {

        window.location.href =
            "login.html";

        return;

    }


    if (
        currentProfile.role &&
        currentProfile.role !==
            "lecturer"
    ) {

        window.location.href =
            "student-dashboard.html";

        return;

    }


    const lecturerName =
        currentProfile.full_name ||
        "Lecturer";


    const nameElements = [

        getElement(
            "lecturerName"
        ),

        getElement(
            "lecturerGreetingName"
        )

    ];


    nameElements.forEach(
        function (element) {

            if (element) {

                element.textContent =
                    lecturerName;

            }

        }
    );


    // Setup buttons

    setupCreateClass();

    setupMaterialUpload();

    setupCreateAssignment();

    setupViewAssignments();

    setupResults();

    setupCreateAnnouncement();

    setupViewAnnouncements();

    setupCreateAttendance();

    setupViewAttendance();

    setupLogout();

    setupSidebarNavigation();


    const myClassesBtn =
        getElement(
            "myClassesBtn"
        );


    if (myClassesBtn) {

        myClassesBtn.addEventListener(
            "click",
            loadMyClasses
        );

    }


    // Load dashboard data

    await loadMyClasses();

    await loadMaterialClasses();

    await loadMaterials();

    await loadAssignmentClasses();

    await loadAssignments();

    await loadAnnouncementClasses();

    await loadAnnouncements();

    await loadAttendanceClasses();

    await loadAttendanceSessions();

    await loadLecturerOverview();


    console.log(
        "ClassLink lecturer dashboard loaded successfully."
    );

}


// =====================================================
// START
// =====================================================

initialiseDashboard();