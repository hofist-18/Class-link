import { supabase } from "./app.js";

// =====================================================
// DOM ELEMENTS
// =====================================================

const adminName =
    document.getElementById("adminName");

const universityInfo =
    document.getElementById("universityInfo");

const departmentsList =
    document.getElementById("departmentsList");

const programmesList =
    document.getElementById("programmesList");

const academicStructureList =
    document.getElementById("academicStructureList");

const unitsList =
    document.getElementById("unitsList");

const applicationsList =
    document.getElementById("applicationsList");

const adminDepartmentsCount =
    document.getElementById("adminDepartmentsCount");

const adminProgrammesCount =
    document.getElementById("adminProgrammesCount");

const adminStudentsCount =
    document.getElementById("adminStudentsCount");

const adminLecturersCount =
    document.getElementById("adminLecturersCount");

const adminLogoutBtn =
    document.getElementById("adminLogoutBtn");

const academicCalendarSection =
    document.getElementById("academicCalendarSection");

const createAcademicCalendarEventBtn =
    document.getElementById("createAcademicCalendarEventBtn");

const academicCalendarModal =
    document.getElementById("academicCalendarModal");

const closeAcademicCalendarModal =
    document.getElementById("closeAcademicCalendarModal");

const academicCalendarForm =
    document.getElementById("academicCalendarForm");

const calendarEventTitle =
    document.getElementById("calendarEventTitle");

const calendarEventDescription =
    document.getElementById("calendarEventDescription");

const calendarEventType =
    document.getElementById("calendarEventType");

const calendarEventAcademicYear =
    document.getElementById("calendarEventAcademicYear");

const calendarEventSemester =
    document.getElementById("calendarEventSemester");

const calendarEventStartDate =
    document.getElementById("calendarEventStartDate");

const calendarEventEndDate =
    document.getElementById("calendarEventEndDate");

const academicCalendarMessage =
    document.getElementById("academicCalendarMessage");

const academicCalendarList =
    document.getElementById("academicCalendarList");


// =====================================================
// BUTTONS
// =====================================================

const addDepartmentBtn =
    document.getElementById("addDepartmentBtn");

const addProgrammeBtn =
    document.getElementById("addProgrammeBtn");

const manageAcademicYearBtn =
    document.getElementById("manageAcademicYearBtn");

const addUnitBtn =
    document.getElementById("addUnitBtn");


// =====================================================
// DEPARTMENT MODAL
// =====================================================

const departmentModal =
    document.getElementById("departmentModal");

const closeDepartmentModal =
    document.getElementById("closeDepartmentModal");

const departmentForm =
    document.getElementById("departmentForm");


// =====================================================
// PROGRAMME MODAL
// =====================================================

const programmeModal =
    document.getElementById("programmeModal");

const closeProgrammeModal =
    document.getElementById("closeProgrammeModal");

const programmeForm =
    document.getElementById("programmeForm");


// =====================================================
// ACADEMIC YEAR MODAL
// =====================================================

const academicYearModal =
    document.getElementById("academicYearModal");

const closeAcademicYearModal =
    document.getElementById("closeAcademicYearModal");

const academicYearForm =
    document.getElementById("academicYearForm");


// =====================================================
// UNIT MODAL
// =====================================================

const unitModal =
    document.getElementById("unitModal");

const closeUnitModal =
    document.getElementById("closeUnitModal");

const unitForm =
    document.getElementById("unitForm");


// =====================================================
// STATE
// =====================================================

let currentUser = null;
let currentProfile = null;

let editingDepartmentId = null;
let editingProgrammeId = null;


// =====================================================
// GET CURRENT USER
// =====================================================

async function getCurrentUser() {

    const {
        data,
        error
    } = await supabase.auth.getUser();

    if (error) {

        console.error(
            "Error getting current user:",
            error
        );

        return null;
    }

    currentUser =
        data.user || null;

    return currentUser;
}


// =====================================================
// LOAD ADMIN PROFILE
// =====================================================

async function loadAdminProfile() {

    if (!currentUser) {
        return false;
    }

    const {
        data: profile,
        error
    } = await supabase
        .from("profiles")
        .select(`
            id,
            full_name,
            role,
            university_id
        `)
        .eq(
            "id",
            currentUser.id
        )
        .single();

    if (error) {

        console.error(
            "Error loading admin profile:",
            error
        );

        alert(
            "Unable to load your profile."
        );

        return false;
    }

    currentProfile =
        profile;

    if (
        !profile ||
        profile.role !==
            "university_admin"
    ) {

        alert(
            "You are not authorized to access the university administration dashboard."
        );

        window.location.href =
            "login.html";

        return false;
    }

    if (adminName) {

        adminName.textContent =
            profile.full_name ||
            "University Administrator";
    }

    return true;
}


// =====================================================
// LOAD UNIVERSITY
// =====================================================

async function loadUniversity() {

    if (
        !currentProfile ||
        !currentProfile.university_id
    ) {
        return;
    }

    const {
        data: university,
        error
    } = await supabase
        .from("universities")
        .select(`
            id,
            name,
            code,
            email,
            phone,
            address
        `)
        .eq(
            "id",
            currentProfile.university_id
        )
        .single();

    if (error) {

        console.error(
            "University loading error:",
            error
        );

        if (universityInfo) {

            universityInfo.innerHTML = `
                <p>
                    Unable to load university information.
                </p>
            `;
        }

        return;
    }

    if (!university) {
        return;
    }

    if (universityInfo) {

        universityInfo.innerHTML = `

            <div class="admin-grid">

                <div>
                    <strong>
                        University
                    </strong>

                    <p>
                        ${university.name || "N/A"}
                    </p>
                </div>

                <div>
                    <strong>
                        Code
                    </strong>

                    <p>
                        ${university.code || "N/A"}
                    </p>
                </div>

                <div>
                    <strong>
                        Email
                    </strong>

                    <p>
                        ${university.email || "N/A"}
                    </p>
                </div>

                <div>
                    <strong>
                        Phone
                    </strong>

                    <p>
                        ${university.phone || "N/A"}
                    </p>
                </div>

                <div>
                    <strong>
                        Address
                    </strong>

                    <p>
                        ${university.address || "N/A"}
                    </p>
                </div>

            </div>

        `;
    }
}


// =====================================================
// LOAD DEPARTMENTS
// =====================================================

async function loadDepartments() {

    if (!departmentsList) {
        return;
    }

    if (
        !currentProfile ||
        !currentProfile.university_id
    ) {
        return;
    }

    departmentsList.innerHTML =
        `<p>Loading departments...</p>`;

    const {
        data: departments,
        error
    } = await supabase
        .from("departments")
        .select(`
            id,
            name,
            code,
            university_id
        `)
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .order(
            "name",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(
            "Department loading error:",
            error
        );

        departmentsList.innerHTML =
            `<p>Unable to load departments.</p>`;

        return;
    }

    adminDepartmentsCount.textContent =
        departments?.length || 0;

    if (
        !departments ||
        departments.length === 0
    ) {

        departmentsList.innerHTML =
            `<p>No departments found.</p>`;

        return;
    }

    departmentsList.innerHTML =
        departments.map(
            function(department) {

                return `

                    <div
                        class="admin-list-item"
                    >

                        <div>

                            <strong>
                                ${department.name}
                            </strong>

                            <p>
                                Code:
                                ${department.code || "N/A"}
                            </p>

                        </div>

                        <div>

                            <button
                                type="button"
                                class="admin-secondary-button edit-department-btn"
                                data-department-id="${department.id}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="admin-danger-button delete-department-btn"
                                data-department-id="${department.id}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                `;
            }
        )
        .join("");
}


// =====================================================
// DEPARTMENT BUTTON EVENTS
// =====================================================

if (addDepartmentBtn) {

    addDepartmentBtn.addEventListener(
        "click",
        function() {

            editingDepartmentId =
                null;

            if (departmentForm) {
                departmentForm.reset();
            }

            const title =
                departmentModal?.querySelector(
                    "h2"
                );

            if (title) {
                title.textContent =
                    "Add Department";
            }

            if (departmentModal) {
                departmentModal.classList.add(
                    "active"
                );
            }
        }
    );
}


// =====================================================
// CLOSE DEPARTMENT MODAL
// =====================================================

if (
    closeDepartmentModal &&
    departmentModal
) {

    closeDepartmentModal.addEventListener(
        "click",
        function() {

            departmentModal.classList.remove(
                "active"
            );
        }
    );
}


if (departmentModal) {

    departmentModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                departmentModal
            ) {

                departmentModal.classList.remove(
                    "active"
                );
            }
        }
    );
}


// =====================================================
// SAVE DEPARTMENT
// =====================================================

if (departmentForm) {

    departmentForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const nameInput =
                document.getElementById(
                    "departmentName"
                );

            const codeInput =
                document.getElementById(
                    "departmentCode"
                );

            const message =
                document.getElementById(
                    "departmentMessage"
                );

            const name =
                nameInput?.value.trim();

            const code =
                codeInput?.value.trim();

            if (!name || !code) {

                if (message) {
                    message.textContent =
                        "Please enter the department name and code.";
                }

                return;
            }

            if (
                !currentProfile ||
                !currentProfile.university_id
            ) {

                if (message) {
                    message.textContent =
                        "University information is unavailable.";
                }

                return;
            }

            if (message) {
                message.textContent =
                    editingDepartmentId
                        ? "Updating department..."
                        : "Creating department...";
            }

            let result;

            if (editingDepartmentId) {

                result =
                    await supabase
                        .from("departments")
                        .update({
                            name: name,
                            code: code
                        })
                        .eq(
                            "id",
                            editingDepartmentId
                        )
                        .eq(
                            "university_id",
                            currentProfile.university_id
                        );

            } else {

                result =
                    await supabase
                        .from("departments")
                        .insert({
                            university_id:
                                currentProfile.university_id,
                            name: name,
                            code: code
                        });
            }

            if (result.error) {

                console.error(
                    "Department save error:",
                    result.error
                );

                if (message) {
                    message.textContent =
                        result.error.message;
                }

                return;
            }

            if (message) {
                message.textContent =
                    editingDepartmentId
                        ? "Department updated successfully."
                        : "Department created successfully.";
            }

            editingDepartmentId =
                null;

            await loadDepartments();

            setTimeout(
                function() {

                    if (departmentModal) {

                        departmentModal.classList.remove(
                            "active"
                        );
                    }

                    if (departmentForm) {
                        departmentForm.reset();
                    }

                    if (message) {
                        message.textContent =
                            "";
                    }

                },
                800
            );
        }
    );
}


// =====================================================
// EDIT / DELETE DEPARTMENT
// =====================================================

if (departmentsList) {

    departmentsList.addEventListener(
        "click",
        async function(event) {

            const editButton =
                event.target.closest(
                    ".edit-department-btn"
                );

            const deleteButton =
                event.target.closest(
                    ".delete-department-btn"
                );


            // -------------------------------------------------
            // EDIT
            // -------------------------------------------------

            if (editButton) {

                const departmentId =
                    editButton.dataset.departmentId;

                const {
                    data: department,
                    error
                } = await supabase
                    .from("departments")
                    .select(`
                        id,
                        name,
                        code
                    `)
                    .eq(
                        "id",
                        departmentId
                    )
                    .single();

                if (error) {

                    console.error(
                        "Error loading department:",
                        error
                    );

                    alert(
                        "Unable to load department."
                    );

                    return;
                }

                editingDepartmentId =
                    department.id;

                document.getElementById(
                    "departmentName"
                ).value =
                    department.name || "";

                document.getElementById(
                    "departmentCode"
                ).value =
                    department.code || "";

                const title =
                    departmentModal?.querySelector(
                        "h2"
                    );

                if (title) {
                    title.textContent =
                        "Edit Department";
                }

                if (departmentModal) {
                    departmentModal.classList.add(
                        "active"
                    );
                }

                return;
            }


            // -------------------------------------------------
            // DELETE
            // -------------------------------------------------

            if (deleteButton) {

                const departmentId =
                    deleteButton.dataset.departmentId;

                const confirmed =
                    confirm(
                        "Are you sure you want to delete this department?"
                    );

                if (!confirmed) {
                    return;
                }

                deleteButton.disabled =
                    true;

                deleteButton.textContent =
                    "Deleting...";

                const {
                    error
                } = await supabase
                    .from("departments")
                    .delete()
                    .eq(
                        "id",
                        departmentId
                    )
                    .eq(
                        "university_id",
                        currentProfile.university_id
                    );

                if (error) {

                    console.error(
                        "Department deletion error:",
                        error
                    );

                    alert(
                        "Unable to delete department:\n\n" +
                        error.message
                    );

                    deleteButton.disabled =
                        false;

                    deleteButton.textContent =
                        "Delete";

                    return;
                }

                await loadDepartments();

                await loadProgrammes();
            }
        }
    );
}


// =====================================================
// LOAD PROGRAMMES
// =====================================================

async function loadProgrammes() {

    if (!programmesList) {
        return;
    }

    if (
        !currentProfile ||
        !currentProfile.university_id
    ) {
        return;
    }

    programmesList.innerHTML =
        `<p>Loading programmes...</p>`;

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
        department_id, 
        departments ( 
            name, 
            code,
            university_id
        ) 
    `)
    .order( 
        "name", 
        { 
            ascending: true 
        } 
    );

if (error) {
    console.error("Programme loading error:", error);
    throw error;
}

const universityProgrammes = (programmes || []).filter(
    programme =>
        programme.departments?.university_id ===
        currentProfile.university_id
);
    if (error) {

        console.error(
            "Programme loading error:",
            error
        );

        programmesList.innerHTML =
            `<p>Unable to load programmes.</p>`;

        return;
    }

    adminProgrammesCount.textContent =
        programmes?.length || 0;

    if (
        !programmes ||
        programmes.length === 0
    ) {

        programmesList.innerHTML =
            `<p>No programmes found.</p>`;

        return;
    }

    programmesList.innerHTML =
        programmes.map(
            function(programme) {

                const departmentName =
                    programme.departments?.name ||
                    "No department";

                return `

                    <div
                        class="admin-list-item"
                    >

                        <div>

                            <strong>
                                ${programme.name}
                            </strong>

                            <p>
                                Code:
                                ${programme.code || "N/A"}
                            </p>

                            <p>
                                Department:
                                ${departmentName}
                            </p>

                        </div>

                        <div>

                            <button
                                type="button"
                                class="admin-secondary-button edit-programme-btn"
                                data-programme-id="${programme.id}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="admin-danger-button delete-programme-btn"
                                data-programme-id="${programme.id}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                `;
            }
        )
        .join("");
}


// =====================================================
// LOAD PROGRAMME DEPARTMENTS
// =====================================================

async function loadProgrammeDepartments() {

    const select =
        document.getElementById(
            "programmeDepartment"
        );

    if (!select) {
        return;
    }

    const {
        data: departments,
        error
    } = await supabase
        .from("departments")
        .select(`
            id,
            name,
            code
        `)
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .order(
            "name",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(
            "Error loading programme departments:",
            error
        );

        return;
    }

    select.innerHTML = `
        <option value="">
            Select department
        </option>
    `;

    (departments || []).forEach(
        function(department) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                department.id;

            option.textContent =
                `${department.name} (${department.code})`;

            select.appendChild(
                option
            );
        }
    );
}


// =====================================================
// ADD PROGRAMME
// =====================================================

if (addProgrammeBtn) {

    addProgrammeBtn.addEventListener(
        "click",
        async function() {

            editingProgrammeId =
                null;

            if (programmeForm) {
                programmeForm.reset();
            }

            await loadProgrammeDepartments();

            const title =
                programmeModal?.querySelector(
                    "h2"
                );

            if (title) {
                title.textContent =
                    "Add Programme";
            }

            if (programmeModal) {
                programmeModal.classList.add(
                    "active"
                );
            }
        }
    );
}


// =====================================================
// CLOSE PROGRAMME MODAL
// =====================================================

if (
    closeProgrammeModal &&
    programmeModal
) {

    closeProgrammeModal.addEventListener(
        "click",
        function() {

            programmeModal.classList.remove(
                "active"
            );
        }
    );
}


if (programmeModal) {

    programmeModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                programmeModal
            ) {

                programmeModal.classList.remove(
                    "active"
                );
            }
        }
    );
}


// =====================================================
// SAVE PROGRAMME
// =====================================================

if (programmeForm) {

    programmeForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const name =
                document.getElementById(
                    "programmeName"
                )?.value.trim();

            const code =
                document.getElementById(
                    "programmeCode"
                )?.value.trim();

            const departmentId =
                document.getElementById(
                    "programmeDepartment"
                )?.value;

            const message =
                document.getElementById(
                    "programmeMessage"
                );

            if (
                !name ||
                !code ||
                !departmentId
            ) {

                if (message) {
                    message.textContent =
                        "Please complete all programme fields.";
                }

                return;
            }

            if (message) {
                message.textContent =
                    editingProgrammeId
                        ? "Updating programme..."
                        : "Creating programme...";
            }

            let result;

            if (editingProgrammeId) {

                result =
                    await supabase
                        .from("programmes")
                        .update({
                            name: name,
                            code: code,
                            department_id:
                                departmentId
                        })
                        .eq(
                            "id",
                            editingProgrammeId
                        )
                        .eq(
                            "university_id",
                            currentProfile.university_id
                        );

            } else {

                result =
                    await supabase
                        .from("programmes")
                        .insert({
                            university_id:
                                currentProfile.university_id,
                            department_id:
                                departmentId,
                            name:
                                name,
                            code:
                                code
                        });
            }

            if (result.error) {

                console.error(
                    "Programme save error:",
                    result.error
                );

                if (message) {
                    message.textContent =
                        result.error.message;
                }

                return;
            }

            if (message) {
                message.textContent =
                    editingProgrammeId
                        ? "Programme updated successfully."
                        : "Programme created successfully.";
            }

            editingProgrammeId =
                null;

            await loadProgrammes();

            setTimeout(
                function() {

                    if (programmeModal) {
                        programmeModal.classList.remove(
                            "active"
                        );
                    }

                    if (programmeForm) {
                        programmeForm.reset();
                    }

                    if (message) {
                        message.textContent =
                            "";
                    }

                },
                800
            );
        }
    );
}

// =====================================================
// PROGRAMME EDIT / DELETE
// =====================================================

if (programmesList) {

    programmesList.addEventListener(
        "click",
        async function(event) {

            const editButton =
                event.target.closest(
                    ".edit-programme-btn"
                );

            const deleteButton =
                event.target.closest(
                    ".delete-programme-btn"
                );


            // -------------------------------------------------
            // EDIT PROGRAMME
            // -------------------------------------------------

            if (editButton) {

                const programmeId =
                    editButton.dataset.programmeId;

                const {
                    data: programme,
                    error
                } = await supabase
                    .from("programmes")
                    .select(`
                        id,
                        name,
                        code,
                        department_id,
                        level,
                        duration_years
                    `)
                    .eq(
                        "id",
                        programmeId
                    )
                    .single();

                if (error) {

                    console.error(
                        "Error loading programme:",
                        error
                    );

                    alert(
                        "Unable to load programme."
                    );

                    return;
                }

                editingProgrammeId =
                    programme.id;

                await loadProgrammeDepartments();

                const nameInput =
                    document.getElementById(
                        "programmeName"
                    );

                const codeInput =
                    document.getElementById(
                        "programmeCode"
                    );

                const departmentSelect =
                    document.getElementById(
                        "programmeDepartment"
                    );

                const levelInput =
                    document.getElementById(
                        "programmeLevel"
                    );

                const durationInput =
                    document.getElementById(
                        "programmeDuration"
                    );

                if (nameInput) {
                    nameInput.value =
                        programme.name || "";
                }

                if (codeInput) {
                    codeInput.value =
                        programme.code || "";
                }

                if (departmentSelect) {
                    departmentSelect.value =
                        programme.department_id || "";
                }

                if (levelInput) {
                    levelInput.value =
                        programme.level || "";
                }

                if (durationInput) {
                    durationInput.value =
                        programme.duration_years || "";
                }

                const title =
                    programmeModal?.querySelector(
                        "h2"
                    );

                if (title) {
                    title.textContent =
                        "Edit Programme";
                }

                if (programmeModal) {
                    programmeModal.classList.add(
                        "active"
                    );
                }

                return;
            }


            // -------------------------------------------------
            // DELETE PROGRAMME
            // -------------------------------------------------

            if (deleteButton) {

                const programmeId =
                    deleteButton.dataset.programmeId;

                const confirmed =
                    confirm(
                        "Are you sure you want to delete this programme?"
                    );

                if (!confirmed) {
                    return;
                }

                deleteButton.disabled =
                    true;

                deleteButton.textContent =
                    "Deleting...";

                const {
                    error
                } = await supabase
                    .from("programmes")
                    .delete()
                    .eq(
                        "id",
                        programmeId
                    )
                    .eq(
                        "university_id",
                        currentProfile.university_id
                    );

                if (error) {

                    console.error(
                        "Programme deletion error:",
                        error
                    );

                    alert(
                        "Unable to delete programme:\n\n" +
                        error.message
                    );

                    deleteButton.disabled =
                        false;

                    deleteButton.textContent =
                        "Delete";

                    return;
                }

                await loadProgrammes();
                await loadAcademicStructure();
            }
        }
    );
}


// =====================================================
// LOAD UNITS
// =====================================================

async function loadUnits() {

    if (!unitsList) {
        return;
    }

    if (
        !currentProfile ||
        !currentProfile.university_id
    ) {
        return;
    }

    unitsList.innerHTML =
        `<p>Loading units...</p>`;


    const {
        data: units,
        error
    } = await supabase
        .from("units")
        .select(`
            id,
            unit_code,
            unit_name,
            credit_hours,
            semester_id,
            semesters (
                semester_number,
                academic_years (
                    year_number,
                    programmes (
                        name,
                        department_id,
                        departments (
                            name,
                            university_id
                        )
                    )
                )
            )
        `)
        .order(
            "unit_code",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Unit loading error:",
            error
        );

        unitsList.innerHTML =
            `<p>Unable to load units.</p>`;

        return;
    }


    const universityUnits =
        (units || []).filter(
            function(unit) {

                const universityId =
                    unit.semesters
                        ?.academic_years
                        ?.programmes
                        ?.departments
                        ?.university_id;

                return (
                    universityId ===
                    currentProfile.university_id
                );
            }
        );


    if (
        universityUnits.length === 0
    ) {

        unitsList.innerHTML =
            `<p>No units found.</p>`;

        return;
    }


    unitsList.innerHTML =
        universityUnits.map(
            function(unit) {

                const semester =
                    unit.semesters;

                const academicYear =
                    semester?.academic_years;

                const programme =
                    academicYear?.programmes;

                return `

                    <div
                        class="admin-list-item"
                    >

                        <div>

                            <strong>
                                ${unit.unit_code}
                                -
                                ${unit.unit_name}
                            </strong>

                            <p>
                                ${unit.credit_hours || 0}
                                Credit Hours
                            </p>

                            <p>
                                ${programme?.name || "Programme"}
                                •
                                Year
                                ${academicYear?.year_number || "N/A"}
                                •
                                Semester
                                ${semester?.semester_number || "N/A"}
                            </p>

                        </div>

                    </div>

                `;
            }
        )
        .join("");
}


// =====================================================
// LOAD ACADEMIC STRUCTURE
// =====================================================

async function loadAcademicStructure() {

    if (!academicStructureList) {
        return;
    }

    if (
        !currentProfile ||
        !currentProfile.university_id
    ) {
        return;
    }

    academicStructureList.innerHTML =
        `<p>Loading academic structure...</p>`;


    // -------------------------------------------------
    // LOAD PROGRAMMES
    // -------------------------------------------------
const {
    data: programmes,
    error: programmeError
} = await supabase
    .from("programmes")
    .select(`
        id,
        name,
        code,
        department_id,
        departments (
            name,
            university_id
        )
    `)
    .order(
        "name",
        {
            ascending: true
        }
    );

if (programmeError) {
    console.error(
        "Academic structure programme error:",
        programmeError
    );
    throw programmeError;
}

const universityProgrammes = (programmes || []).filter(
    programme =>
        programme.departments?.university_id ===
        currentProfile.university_id
);

    if (programmeError) {

        console.error(
            "Academic structure programme error:",
            programmeError
        );

        academicStructureList.innerHTML =
            `<p>Unable to load academic structure.</p>`;

        return;
    }


    if (
        !programmes ||
        programmes.length === 0
    ) {

        academicStructureList.innerHTML =
            `<p>No academic structure found.</p>`;

        return;
    }


    const programmeIds =
        programmes.map(
            function(programme) {
                return programme.id;
            }
        );


    // -------------------------------------------------
    // LOAD ACADEMIC YEARS
    // -------------------------------------------------

    const {
        data: academicYears,
        error: yearError
    } = await supabase
        .from("academic_years")
        .select(`
            id,
            programme_id,
            year_number
        `)
        .in(
            "programme_id",
            programmeIds
        )
        .order(
            "year_number",
            {
                ascending: true
            }
        );


    if (yearError) {

        console.error(
            "Academic year loading error:",
            yearError
        );

        academicStructureList.innerHTML =
            `<p>Unable to load academic years.</p>`;

        return;
    }


    const academicYearIds =
        (academicYears || []).map(
            function(year) {
                return year.id;
            }
        );


    // -------------------------------------------------
    // LOAD SEMESTERS
    // -------------------------------------------------

    let semesters = [];

    if (
        academicYearIds.length > 0
    ) {

        const {
            data,
            error
        } = await supabase
            .from("semesters")
            .select(`
                id,
                academic_year_id,
                semester_number
            `)
            .in(
                "academic_year_id",
                academicYearIds
            )
            .order(
                "semester_number",
                {
                    ascending: true
                }
            );

        if (error) {

            console.error(
                "Semester loading error:",
                error
            );

            academicStructureList.innerHTML =
                `<p>Unable to load semesters.</p>`;

            return;
        }

        semesters =
            data || [];
    }


    const semesterIds =
        semesters.map(
            function(semester) {
                return semester.id;
            }
        );


    // -------------------------------------------------
    // LOAD UNITS
    // -------------------------------------------------

    let units = [];

    if (
        semesterIds.length > 0
    ) {

        const {
            data,
            error
        } = await supabase
            .from("units")
            .select(`
                id,
                semester_id,
                unit_code,
                unit_name,
                credit_hours
            `)
            .in(
                "semester_id",
                semesterIds
            )
            .order(
                "unit_code",
                {
                    ascending: true
                }
            );

        if (error) {

            console.error(
                "Academic structure unit error:",
                error
            );

            academicStructureList.innerHTML =
                `<p>Unable to load units.</p>`;

            return;
        }

        units =
            data || [];
    }


    // -------------------------------------------------
    // BUILD STRUCTURE
    // -------------------------------------------------

    let html = "";


    programmes.forEach(
        function(programme) {

            const programmeYears =
                academicYears.filter(
                    function(year) {
                        return (
                            year.programme_id ===
                            programme.id
                        );
                    }
                );


            html += `

                <div
                    class="admin-card"
                    style="margin-bottom: 20px;"
                >

                    <h3>
                        ${programme.name}
                    </h3>

                    <p>
                        Code:
                        ${programme.code || "N/A"}
                    </p>

            `;


            if (
                programmeYears.length === 0
            ) {

                html += `
                    <p>
                        No academic years created yet.
                    </p>
                `;

            } else {

                programmeYears.forEach(
                    function(year) {

                        html += `

                            <div
                                style="
                                    margin-top: 15px;
                                    padding-left: 15px;
                                "
                            >

                                <strong>
                                    Year ${year.year_number}
                                </strong>

                        `;


                        const yearSemesters =
                            semesters.filter(
                                function(semester) {

                                    return (
                                        semester.academic_year_id ===
                                        year.id
                                    );
                                }
                            );


                        if (
                            yearSemesters.length === 0
                        ) {

                            html += `
                                <p>
                                    No semesters created yet.
                                </p>
                            `;

                        } else {

                            yearSemesters.forEach(
                                function(semester) {

                                    html += `

                                        <div
                                            style="
                                                margin-top: 10px;
                                                padding-left: 15px;
                                            "
                                        >

                                            <strong>
                                                Semester
                                                ${semester.semester_number}
                                            </strong>

                                    `;


                                    const semesterUnits =
                                        units.filter(
                                            function(unit) {

                                                return (
                                                    unit.semester_id ===
                                                    semester.id
                                                );
                                            }
                                        );


                                    if (
                                        semesterUnits.length === 0
                                    ) {

                                        html += `
                                            <p>
                                                No units created yet.
                                            </p>
                                        `;

                                    } else {

                                        html += `
                                            <ul
                                                style="
                                                    margin-top: 8px;
                                                    padding-left: 20px;
                                                "
                                            >
                                        `;


                                        semesterUnits.forEach(
                                            function(unit) {

                                                html += `
                                                    <li>
                                                        <strong>
                                                            ${unit.unit_code}
                                                        </strong>
                                                        -
                                                        ${unit.unit_name}
                                                        (${unit.credit_hours || 0}
                                                        Credits)
                                                    </li>
                                                `;
                                            }
                                        );


                                        html += `
                                            </ul>
                                        `;
                                    }


                                    html += `
                                        </div>
                                    `;
                                }
                            );
                        }


                        html += `
                            </div>
                        `;
                    }
                );
            }


            html += `
                </div>
            `;
        }
    );


    academicStructureList.innerHTML =
        html;
}


// =====================================================
// LOAD PROGRAMMES FOR ACADEMIC YEAR
// =====================================================

async function loadAcademicYearProgrammes() {

    const select =
        document.getElementById(
            "academicYearProgramme"
        );

    if (!select) {
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
            code
        `)
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .order(
            "name",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error loading academic year programmes:",
            error
        );

        return;
    }


    select.innerHTML = `
        <option value="">
            Select programme
        </option>
    `;


    (programmes || []).forEach(
        function(programme) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                programme.id;

            option.textContent =
                `${programme.name} (${programme.code})`;

            select.appendChild(
                option
            );
        }
    );
}


// =====================================================
// OPEN ACADEMIC YEAR MODAL
// =====================================================

if (manageAcademicYearBtn) {

    manageAcademicYearBtn.addEventListener(
        "click",
        async function() {

            if (academicYearForm) {
                academicYearForm.reset();
            }

            await loadAcademicYearProgrammes();

            if (academicYearModal) {
                academicYearModal.classList.add(
                    "active"
                );
            }
        }
    );
}


// =====================================================
// CLOSE ACADEMIC YEAR MODAL
// =====================================================

if (
    closeAcademicYearModal &&
    academicYearModal
) {

    closeAcademicYearModal.addEventListener(
        "click",
        function() {

            academicYearModal.classList.remove(
                "active"
            );
        }
    );
}


if (academicYearModal) {

    academicYearModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                academicYearModal
            ) {

                academicYearModal.classList.remove(
                    "active"
                );
            }
        }
    );
}


// =====================================================
// SAVE ACADEMIC YEAR
// =====================================================

if (academicYearForm) {

    academicYearForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const programmeId =
                document.getElementById(
                    "academicYearProgramme"
                )?.value;

            const yearNumber =
                document.getElementById(
                    "academicYearNumber"
                )?.value;

            const message =
                document.getElementById(
                    "academicYearMessage"
                );


            if (
                !programmeId ||
                !yearNumber
            ) {

                if (message) {
                    message.textContent =
                        "Please select a programme and enter the year.";
                }

                return;
            }


            if (message) {
                message.textContent =
                    "Saving academic year...";
            }


            const {
                error
            } = await supabase
                .from("academic_years")
                .insert({
                    programme_id:
                        programmeId,
                    year_number:
                        Number(yearNumber)
                });


            if (error) {

                console.error(
                    "Academic year save error:",
                    error
                );

                if (message) {
                    message.textContent =
                        error.message;
                }

                return;
            }


            if (message) {
                message.textContent =
                    "Academic year created successfully.";
            }


            await loadAcademicStructure();


            setTimeout(
                function() {

                    if (academicYearModal) {

                        academicYearModal.classList.remove(
                            "active"
                        );
                    }

                    if (academicYearForm) {
                        academicYearForm.reset();
                    }

                    if (message) {
                        message.textContent =
                            "";
                    }

                },
                800
            );
        }
    );
}

// =====================================================
// LOAD UNIT PROGRAMMES
// =====================================================

async function loadUnitProgrammes() {

    const select =
        document.getElementById(
            "unitProgramme"
        );

    if (!select) {
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
            code
        `)
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .order(
            "name",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(
            "Error loading unit programmes:",
            error
        );

        return;
    }

    select.innerHTML = `
        <option value="">
            Select programme
        </option>
    `;

    (programmes || []).forEach(
        function(programme) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                programme.id;

            option.textContent =
                `${programme.name} (${programme.code})`;

            select.appendChild(
                option
            );
        }
    );
}


// =====================================================
// LOAD UNIT ACADEMIC YEARS
// =====================================================

async function loadUnitAcademicYears(
    programmeId
) {

    const select =
        document.getElementById(
            "unitAcademicYear"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Select academic year
        </option>
    `;

    if (!programmeId) {
        return;
    }

    const {
        data: years,
        error
    } = await supabase
        .from("academic_years")
        .select(`
            id,
            year_number
        `)
        .eq(
            "programme_id",
            programmeId
        )
        .order(
            "year_number",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(
            "Error loading unit academic years:",
            error
        );

        return;
    }

    (years || []).forEach(
        function(year) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                year.id;

            option.textContent =
                `Year ${year.year_number}`;

            select.appendChild(
                option
            );
        }
    );
}


// =====================================================
// LOAD UNIT SEMESTERS
// =====================================================

async function loadUnitSemesters(
    academicYearId
) {

    const select =
        document.getElementById(
            "unitSemester"
        );

    if (!select) {
        return;
    }

    select.innerHTML = `
        <option value="">
            Select semester
        </option>
    `;

    if (!academicYearId) {
        return;
    }

    const {
        data: semesters,
        error
    } = await supabase
        .from("semesters")
        .select(`
            id,
            semester_number
        `)
        .eq(
            "academic_year_id",
            academicYearId
        )
        .order(
            "semester_number",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(
            "Error loading unit semesters:",
            error
        );

        return;
    }

    (semesters || []).forEach(
        function(semester) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                semester.id;

            option.textContent =
                `Semester ${semester.semester_number}`;

            select.appendChild(
                option
            );
        }
    );
}


// =====================================================
// UNIT PROGRAMME CHANGE
// =====================================================

const unitProgramme =
    document.getElementById(
        "unitProgramme"
    );

const unitAcademicYear =
    document.getElementById(
        "unitAcademicYear"
    );

const unitSemester =
    document.getElementById(
        "unitSemester"
    );


if (unitProgramme) {

    unitProgramme.addEventListener(
        "change",
        function() {

            if (unitAcademicYear) {
                unitAcademicYear.innerHTML = `
                    <option value="">
                        Select academic year
                    </option>
                `;
            }

            if (unitSemester) {
                unitSemester.innerHTML = `
                    <option value="">
                        Select semester
                    </option>
                `;
            }

            loadUnitAcademicYears(
                unitProgramme.value
            );
        }
    );
}


if (unitAcademicYear) {

    unitAcademicYear.addEventListener(
        "change",
        function() {

            if (unitSemester) {
                unitSemester.innerHTML = `
                    <option value="">
                        Select semester
                    </option>
                `;
            }

            loadUnitSemesters(
                unitAcademicYear.value
            );
        }
    );
}


// =====================================================
// OPEN UNIT MODAL
// =====================================================

if (addUnitBtn) {

    addUnitBtn.addEventListener(
        "click",
        async function() {

            if (unitForm) {
                unitForm.reset();
            }

            if (unitAcademicYear) {
                unitAcademicYear.innerHTML = `
                    <option value="">
                        Select academic year
                    </option>
                `;
            }

            if (unitSemester) {
                unitSemester.innerHTML = `
                    <option value="">
                        Select semester
                    </option>
                `;
            }

            await loadUnitProgrammes();

            if (unitModal) {
                unitModal.classList.add(
                    "active"
                );
            }
        }
    );
}


// =====================================================
// CLOSE UNIT MODAL
// =====================================================

if (
    closeUnitModal &&
    unitModal
) {

    closeUnitModal.addEventListener(
        "click",
        function() {

            unitModal.classList.remove(
                "active"
            );
        }
    );
}


if (unitModal) {

    unitModal.addEventListener(
        "click",
        function(event) {

            if (
                event.target ===
                unitModal
            ) {

                unitModal.classList.remove(
                    "active"
                );
            }
        }
    );
}


// =====================================================
// SAVE UNIT
// =====================================================

if (unitForm) {

    unitForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();

            const semesterId =
                document.getElementById(
                    "unitSemester"
                )?.value;

            const unitCode =
                document.getElementById(
                    "unitCode"
                )?.value.trim();

            const unitName =
                document.getElementById(
                    "unitName"
                )?.value.trim();

            const unitDescription =
                document.getElementById(
                    "unitDescription"
                )?.value.trim();

            const creditHours =
                document.getElementById(
                    "unitCreditHours"
                )?.value;

            const message =
                document.getElementById(
                    "unitMessage"
                );


            if (
                !semesterId ||
                !unitCode ||
                !unitName ||
                !creditHours
            ) {

                if (message) {
                    message.textContent =
                        "Please complete all required unit fields.";
                }

                return;
            }


            if (message) {
                message.textContent =
                    "Creating unit...";
            }


            const {
                error
            } = await supabase
                .from("units")
                .insert({
                    semester_id:
                        semesterId,

                    unit_code:
                        unitCode,

                    unit_name:
                        unitName,

                    unit_description:
                        unitDescription || null,

                    credit_hours:
                        Number(creditHours)
                });


            if (error) {

                console.error(
                    "Unit creation error:",
                    error
                );

                if (message) {
                    message.textContent =
                        error.message;
                }

                return;
            }


            if (message) {
                message.textContent =
                    "Unit created successfully.";
            }


            await loadUnits();
            await loadAcademicStructure();


            setTimeout(
                function() {

                    if (unitModal) {

                        unitModal.classList.remove(
                            "active"
                        );
                    }

                    if (unitForm) {
                        unitForm.reset();
                    }

                    if (unitAcademicYear) {
                        unitAcademicYear.innerHTML = `
                            <option value="">
                                Select academic year
                            </option>
                        `;
                    }

                    if (unitSemester) {
                        unitSemester.innerHTML = `
                            <option value="">
                                Select semester
                            </option>
                        `;
                    }

                    if (message) {
                        message.textContent =
                            "";
                    }

                },
                800
            );
        }
    );
}


// =====================================================
// LOAD STUDENT COUNT
// =====================================================

async function loadStudentCount() {

    if (
        !currentProfile ||
        !currentProfile.university_id
    ) {
        return;
    }

    const {
        count,
        error
    } = await supabase
        .from("profiles")
        .select(
            "id",
            {
                count: "exact",
                head: true
            }
        )
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .eq(
            "role",
            "student"
        );

    if (error) {

        console.error(
            "Error loading student count:",
            error
        );

        return;
    }

    if (adminStudentsCount) {

        adminStudentsCount.textContent =
            count || 0;
    }
}


// =====================================================
// LOAD STUDENTS
// =====================================================

async function loadStudents() {

    const list =
        document.getElementById(
            "studentsList"
        );

    if (!list) {
        return;
    }

    if (
        !currentProfile ||
        !currentProfile.university_id
    ) {
        return;
    }

    list.innerHTML =
        `<p>Loading students...</p>`;


    const {
        data: students,
        error
    } = await supabase
        .from("profiles")
        .select(`
            id,
            full_name,
            role,
            university_id
        `)
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .eq(
            "role",
            "student"
        )
        .order(
            "full_name",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Student loading error:",
            error
        );

        list.innerHTML =
            `<p>Unable to load students.</p>`;

        return;
    }


    if (
        !students ||
        students.length === 0
    ) {

        list.innerHTML =
            `<p>No students found.</p>`;

        return;
    }


    const studentIds =
        students.map(
            function(student) {
                return student.id;
            }
        );


    const {
        data: studentProgrammes,
        error: programmeError
    } = await supabase
        .from("student_programmes")
        .select(`
            student_id,
            admission_number,
            status,
            programmes (
                id,
                name,
                code,
                departments (
                    name
                )
            )
        `)
        .in(
            "student_id",
            studentIds
        );


    if (programmeError) {

        console.error(
            "Student programme loading error:",
            programmeError
        );
    }


    list.innerHTML = "";


    students.forEach(
        function(student) {

            const programmeRecord =
                (studentProgrammes || []).find(
                    function(record) {

                        return (
                            record.student_id ===
                            student.id
                        );
                    }
                );


            const programme =
                programmeRecord?.programmes;


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "admin-list-item";


            card.innerHTML = `

                <div>

                    <strong>
                        ${student.full_name || "Unnamed Student"}
                    </strong>

                    <p>
                        Admission:
                        ${programmeRecord?.admission_number || "N/A"}
                    </p>

                    <p>
                        Programme:
                        ${programme?.name || "Not assigned"}
                    </p>

                    <p>
                        Code:
                        ${programme?.code || "N/A"}
                    </p>

                    <p>
                        Department:
                        ${programme?.departments?.name || "N/A"}
                    </p>

                </div>

            `;


            list.appendChild(
                card
            );
        }
    );
}

// =====================================================
// LOAD APPLICATIONS
// =====================================================

async function loadApplications() {

    if (!applicationsList) {
        return;
    }

    if (
        !currentProfile ||
        !currentProfile.university_id
    ) {
        return;
    }

    applicationsList.innerHTML =
        `<p>Loading applications...</p>`;

    const {
        data: applications,
        error
    } = await supabase
        .from("university_applications")
        .select(`
            id,
            applicant_id,
            application_status,
            application_date,
            rejection_reason,
            admission_year,
            profiles!university_applications_applicant_id_fkey (
                full_name
            ),
            programmes (
                name,
                code,
                departments (
                    name
                )
            )
        `)
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .order(
            "application_date",
            {
                ascending: false
            }
        );

    if (error) {

        console.error(
            "Application loading error:",
            error
        );

        applicationsList.innerHTML =
            `<p>Unable to load applications.</p>`;

        return;
    }

    if (
        !applications ||
        applications.length === 0
    ) {

        applicationsList.innerHTML =
            `<p>No applications found.</p>`;

        return;
    }

    applicationsList.innerHTML = "";

    applications.forEach(
        function(application) {

            const applicantName =
                application.profiles?.full_name ||
                "Unknown Applicant";

            const programme =
                application.programmes;

            const status =
                application.application_status ||
                "pending";

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "admin-list-item";

            let actionButtons =
                "";

            if (
                status ===
                "pending"
            ) {

                actionButtons = `

                    <div
                        style="
                            margin-top: 15px;
                            display: flex;
                            gap: 10px;
                            flex-wrap: wrap;
                        "
                    >

                        <button
                            type="button"
                            class="admin-primary-button approve-application-btn"
                            data-application-id="${application.id}"
                        >
                            Approve
                        </button>

                        <button
                            type="button"
                            class="admin-danger-button reject-application-btn"
                            data-application-id="${application.id}"
                        >
                            Reject
                        </button>

                    </div>

                `;
            }

            card.innerHTML = `

                <div>

                    <strong>
                        ${applicantName}
                    </strong>

                    <p>
                        Programme:
                        ${programme?.name || "N/A"}
                    </p>

                    <p>
                        Code:
                        ${programme?.code || "N/A"}
                    </p>

                    <p>
                        Department:
                        ${programme?.departments?.name || "N/A"}
                    </p>

                    <p>
                        Admission Year:
                        ${application.admission_year || "N/A"}
                    </p>

                    <p>
                        Status:
                        <strong>
                            ${status}
                        </strong>
                    </p>

                    <p>
                        Applied:
                        ${
                            application.application_date
                                ? new Date(
                                    application.application_date
                                ).toLocaleDateString()
                                : "N/A"
                        }
                    </p>

                    ${
                        application.rejection_reason
                            ? `
                                <p>
                                    Rejection reason:
                                    ${application.rejection_reason}
                                </p>
                            `
                            : ""
                    }

                    ${actionButtons}

                </div>

            `;

            applicationsList.appendChild(
                card
            );
        }
    );
}


// =====================================================
// APPROVE / REJECT APPLICATIONS
// =====================================================

if (applicationsList) {

    applicationsList.addEventListener(
        "click",
        async function(event) {

            const approveButton =
                event.target.closest(
                    ".approve-application-btn"
                );

            const rejectButton =
                event.target.closest(
                    ".reject-application-btn"
                );

            // -------------------------------------------------
            // APPROVE APPLICATION
            // -------------------------------------------------

            if (approveButton) {

                const applicationId =
                    approveButton.dataset.applicationId;

                await approveApplication(
                    applicationId,
                    approveButton
                );

                return;
            }

            // -------------------------------------------------
            // REJECT APPLICATION
            // -------------------------------------------------

            if (rejectButton) {

                const applicationId =
                    rejectButton.dataset.applicationId;

                await rejectApplication(
                    applicationId,
                    rejectButton
                );
            }
        }
    );
}


// =====================================================
// APPROVE APPLICATION
// =====================================================

async function approveApplication(
    applicationId,
    button
) {

    if (!applicationId) {
        return;
    }

    const confirmed =
        confirm(
            "Are you sure you want to approve this application?"
        );

    if (!confirmed) {
        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Approving...";
    }

    const {
        data,
        error
    } = await supabase.rpc(
        "approve_university_application",
        {
            p_application_id:
                applicationId
        }
    );

    if (error) {

        console.error(
            "Application approval error:",
            error
        );

        alert(
            "Unable to approve application:\n\n" +
            error.message
        );

        if (button) {
            button.disabled = false;
            button.textContent = "Approve";
        }

        return;
    }

    const admissionNumber =
        data?.admission_number ||
        data?.[0]?.admission_number ||
        "";

    if (admissionNumber) {

        alert(
            "Application approved successfully.\n\n" +
            "Admission number: " +
            admissionNumber
        );

    } else {

        alert(
            "Application approved successfully."
        );
    }

    await loadApplications();
    await loadStudents();
    await loadStudentCount();
}


// =====================================================
// REJECT APPLICATION
// =====================================================

async function rejectApplication(
    applicationId,
    button
) {

    if (!applicationId) {
        return;
    }

    const reason =
        prompt(
            "Enter the reason for rejecting this application:"
        );

    if (
        reason === null
    ) {
        return;
    }

    const trimmedReason =
        reason.trim();

    if (!trimmedReason) {

        alert(
            "Please provide a rejection reason."
        );

        return;
    }

    if (button) {
        button.disabled = true;
        button.textContent = "Rejecting...";
    }

    const {
        error
    } = await supabase.rpc(
        "reject_university_application",
        {
            p_application_id:
                applicationId,

            p_rejection_reason:
                trimmedReason
        }
    );

    if (error) {

        console.error(
            "Application rejection error:",
            error
        );

        alert(
            "Unable to reject application:\n\n" +
            error.message
        );

        if (button) {
            button.disabled = false;
            button.textContent = "Reject";
        }

        return;
    }

    alert(
        "Application rejected successfully."
    );

    await loadApplications();
}

// =====================================================
// LOAD LECTURER COUNT
// =====================================================

async function loadLecturerCount() {

    if (
        !currentProfile ||
        !currentProfile.university_id
    ) {
        return;
    }


    const {
        count,
        error
    } = await supabase
        .from("profiles")
        .select(
            "id",
            {
                count: "exact",
                head: true
            }
        )
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .eq(
            "role",
            "lecturer"
        );


    if (error) {

        console.error(
            "Error loading lecturer count:",
            error
        );

        return;
    }


    if (adminLecturersCount) {

        adminLecturersCount.textContent =
            count || 0;
    }
}


// =====================================================
// LOGOUT
// =====================================================

if (adminLogoutBtn) {

    adminLogoutBtn.addEventListener(
        "click",
        async function() {

            const {
                error
            } = await supabase.auth.signOut();


            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                alert(
                    "Unable to log out."
                );

                return;
            }


            window.location.href =
                "login.html";
        }
    );
}


// =====================================================
// VIEW FEE STATEMENT
// =====================================================

async function viewFeeStatement(
    feeAccountId
) {

    console.log(
        "Loading fee statement:",
        feeAccountId
    );


    const {
        data: feeAccount,
        error: accountError
    } = await supabase
        .from("student_fee_accounts")
        .select(`
            id,
            student_id,
            amount_due,
            profiles (
                full_name
            ),
            fee_structures (
                amount,
                description,
                programmes (
                    name,
                    code
                ),
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
            feeAccountId
        )
        .single();


    if (accountError) {

        console.error(
            "Fee statement account error:",
            accountError
        );

        alert(
            "Unable to load the fee statement."
        );

        return;
    }


    const {
        data: payments,
        error: paymentsError
    } = await supabase
        .from("fee_payments")
        .select(`
            amount,
            payment_method,
            payment_reference,
            payment_date,
            receipt_number
        `)
        .eq(
            "fee_account_id",
            feeAccountId
        )
        .order(
            "payment_date",
            {
                ascending: true
            }
        );


    if (paymentsError) {

        console.error(
            "Fee statement payments error:",
            paymentsError
        );

        alert(
            "Unable to load payment history."
        );

        return;
    }


    const studentName =
        feeAccount.profiles?.full_name ||
        "Unknown Student";


    const programmeName =
        feeAccount
            .fee_structures
            ?.programmes
            ?.name ||
        "N/A";


    const programmeCode =
        feeAccount
            .fee_structures
            ?.programmes
            ?.code ||
        "";


    const academicYear =
        feeAccount
            .fee_structures
            ?.academic_years
            ?.year_number ||
        "N/A";


    const semesterNumber =
        feeAccount
            .fee_structures
            ?.semesters
            ?.semester_number;


    const semesterName =
        semesterNumber
            ? `Semester ${semesterNumber}`
            : "N/A";


    const amountDue =
        Number(
            feeAccount.amount_due
        ) || 0;


    let runningBalance =
        amountDue;


    let paymentRows =
        "";


    (payments || []).forEach(
        function(payment) {

            const amount =
                Number(
                    payment.amount
                ) || 0;


            runningBalance -=
                amount;


            const paymentDate =
                payment.payment_date
                    ? new Date(
                        payment.payment_date
                    ).toLocaleDateString()
                    : "N/A";


            paymentRows += `

                <tr>

                    <td>
                        ${paymentDate}
                    </td>

                    <td>
                        ${payment.payment_method || "N/A"}
                    </td>

                    <td>
                        ${payment.receipt_number || "N/A"}
                    </td>

                    <td>
                        KSh ${amount.toLocaleString()}
                    </td>

                    <td>
                        KSh ${runningBalance.toLocaleString()}
                    </td>

                </tr>

            `;
        }
    );


    const totalPaid =
        amountDue -
        runningBalance;


    const statementWindow =
        window.open(
            "",
            "_blank",
            "width=1000,height=800"
        );


    if (!statementWindow) {

        alert(
            "Please allow pop-ups to view the statement."
        );

        return;
    }


    statementWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

    <title>
        Fee Statement - ${studentName}
    </title>

    <style>

        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #222;
        }

        .statement {
            max-width: 900px;
            margin: auto;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #222;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        .header h1 {
            margin: 0;
            font-size: 28px;
        }

        .header p {
            margin: 6px 0;
            color: #555;
        }

        .student-info {
            margin-bottom: 25px;
        }

        .student-info strong {
            display: inline-block;
            width: 160px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 25px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }

        th {
            background: #f3f4f6;
        }

        .summary {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
        }

        .summary-box {
            border: 1px solid #ddd;
            padding: 20px;
            width: 30%;
            text-align: center;
        }

        .summary-box strong {
            display: block;
            margin-bottom: 8px;
        }

        .print-button {
            display: block;
            margin: 30px auto;
            padding: 12px 24px;
            background: #111827;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }

        @media print {

            .print-button {
                display: none;
            }

            body {
                margin: 0;
            }

        }

    </style>

</head>

<body>

    <div class="statement">

        <div class="header">

            <h1>
                ClassLink University
            </h1>

            <p>
                Student Fee Statement
            </p>

        </div>

        <div class="student-info">

            <p>
                <strong>
                    Student:
                </strong>

                ${studentName}
            </p>

            <p>
                <strong>
                    Programme:
                </strong>

                ${programmeName}
                ${
                    programmeCode
                        ? `(${programmeCode})`
                        : ""
                }
            </p>

            <p>
                <strong>
                    Academic Year:
                </strong>

                ${academicYear}
            </p>

            <p>
                <strong>
                    Semester:
                </strong>

                ${semesterName}
            </p>

            <p>
                <strong>
                    Fee Account:
                </strong>

                ${
                    feeAccount
                        .fee_structures
                        ?.description ||
                    "Fee Account"
                }
            </p>

        </div>

        <table>

            <thead>

                <tr>

                    <th>
                        Date
                    </th>

                    <th>
                        Payment Method
                    </th>

                    <th>
                        Receipt
                    </th>

                    <th>
                        Payment
                    </th>

                    <th>
                        Balance
                    </th>

                </tr>

            </thead>

            <tbody>

                <tr>

                    <td>
                        —
                    </td>

                    <td>
                        Fee Assessment
                    </td>

                    <td>
                        —
                    </td>

                    <td>
                        —
                    </td>

                    <td>
                        KSh ${amountDue.toLocaleString()}
                    </td>

                </tr>

                ${paymentRows}

            </tbody>

        </table>

        <div class="summary">

            <div class="summary-box">

                <strong>
                    Amount Due
                </strong>

                KSh ${amountDue.toLocaleString()}

            </div>

            <div class="summary-box">

                <strong>
                    Total Paid
                </strong>

                KSh ${totalPaid.toLocaleString()}

            </div>

            <div class="summary-box">

                <strong>
                    Balance
                </strong>

                KSh ${runningBalance.toLocaleString()}

            </div>

        </div>

        <button
            class="print-button"
            onclick="window.print()"
        >
            Print / Save as PDF
        </button>

    </div>

</body>

</html>

    `);


    statementWindow.document.close();
}


// =====================================================
// PAYMENT STUDENTS
// =====================================================

async function loadPaymentStudents() {

    const select =
        document.getElementById(
            "paymentStudent"
        );

    if (!select) {
        return;
    }


    const {
        data: accounts,
        error
    } = await supabase
        .from("student_fee_accounts")
        .select(`
            id,
            student_id,
            profiles (
                full_name,
                university_id
            )
        `);


    if (error) {

        console.error(
            "Payment student loading error:",
            error
        );

        return;
    }


    const universityAccounts =
        (accounts || []).filter(
            function(account) {

                return (
                    account.profiles?.university_id ===
                    currentProfile.university_id
                );
            }
        );


    select.innerHTML = `
        <option value="">
            Select student
        </option>
    `;


    universityAccounts.forEach(
        function(account) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                account.id;

            option.textContent =
                account.profiles?.full_name ||
                "Unknown Student";

            select.appendChild(
                option
            );
        }
    );
}


// =====================================================
// PAYMENT HISTORY
// =====================================================

async function loadPaymentHistory() {

    const list =
        document.getElementById(
            "paymentHistoryList"
        );

    if (!list) {
        return;
    }


    list.innerHTML =
        `<p>Loading payment history...</p>`;


    const {
        data: payments,
        error
    } = await supabase
        .from("fee_payments")
        .select(`
            id,
            student_id,
            amount,
            payment_method,
            payment_reference,
            payment_date,
            receipt_number,
            profiles (
                full_name,
                university_id
            )
        `)
        .order(
            "payment_date",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Payment history loading error:",
            error
        );

        list.innerHTML =
            `<p>Unable to load payment history.</p>`;

        return;
    }


    const universityPayments =
        (payments || []).filter(
            function(payment) {

                return (
                    payment.profiles?.university_id ===
                    currentProfile.university_id
                );
            }
        );


    if (
        universityPayments.length === 0
    ) {

        list.innerHTML =
            `<p>No payments recorded yet.</p>`;

        return;
    }


    list.innerHTML = "";


    universityPayments.forEach(
        function(payment) {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "admin-list-item";


            card.innerHTML = `

                <div>

                    <strong>
                        ${payment.profiles?.full_name || "Unknown Student"}
                    </strong>

                    <p>
                        Amount:
                        KSh ${Number(
                            payment.amount
                        ).toLocaleString()}
                    </p>

                    <p>
                        Method:
                        ${payment.payment_method || "N/A"}
                    </p>

                    <p>
                        Reference:
                        ${payment.payment_reference || "N/A"}
                    </p>

                    <p>
                        Receipt:
                        ${payment.receipt_number || "N/A"}
                    </p>

                    <p>
                        Date:
                        ${
                            payment.payment_date
                                ? new Date(
                                    payment.payment_date
                                ).toLocaleDateString()
                                : "N/A"
                        }
                    </p>

                </div>

                <div>

                    <button
                        type="button"
                        class="admin-secondary-button view-fee-receipt-btn"
                        data-payment-id="${payment.id}"
                    >
                        View Receipt
                    </button>

                </div>

            `;


            list.appendChild(
                card
            );
        }
    );
}


// =====================================================
// STUDENT FEE BALANCES
// =====================================================

async function loadStudentFeeBalances() {

    const list =
        document.getElementById(
            "studentFeeBalancesList"
        );

    if (!list) {
        return;
    }


    list.innerHTML =
        `<p>Loading fee balances...</p>`;


    const {
        data: accounts,
        error
    } = await supabase
        .from("student_fee_accounts")
        .select(`
            id,
            student_id,
            amount_due,
            profiles (
                full_name,
                university_id
            ),
            fee_structures (
                amount,
                description
            )
        `);


    if (error) {

        console.error(
            "Fee balance loading error:",
            error
        );

        list.innerHTML =
            `<p>Unable to load fee balances.</p>`;

        return;
    }


    const universityAccounts =
        (accounts || []).filter(
            function(account) {

                return (
                    account.profiles?.university_id ===
                    currentProfile.university_id
                );
            }
        );


    if (
        universityAccounts.length === 0
    ) {

        list.innerHTML =
            `<p>No student fee accounts found.</p>`;

        return;
    }


    const accountIds =
        universityAccounts.map(
            function(account) {
                return account.id;
            }
        );


    const {
        data: payments,
        error: paymentsError
    } = await supabase
        .from("fee_payments")
        .select(`
            fee_account_id,
            amount
        `)
        .in(
            "fee_account_id",
            accountIds
        );


    if (paymentsError) {

        console.error(
            "Fee balance payment error:",
            paymentsError
        );
    }


    list.innerHTML = "";


    universityAccounts.forEach(
        function(account) {

            const amountDue =
                Number(
                    account.amount_due
                ) ||
                Number(
                    account.fee_structures?.amount
                ) ||
                0;


            const totalPaid =
                (payments || [])
                    .filter(
                        function(payment) {

                            return (
                                payment.fee_account_id ===
                                account.id
                            );
                        }
                    )
                    .reduce(
                        function(total, payment) {

                            return (
                                total +
                                Number(
                                    payment.amount
                                )
                            );
                        },
                        0
                    );


            const balance =
                amountDue -
                totalPaid;


            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "admin-list-item";


            card.innerHTML = `

                <div>

                    <strong>
                        ${account.profiles?.full_name || "Unknown Student"}
                    </strong>

                    <p>
                        Amount Due:
                        KSh ${amountDue.toLocaleString()}
                    </p>

                    <p>
                        Paid:
                        KSh ${totalPaid.toLocaleString()}
                    </p>

                    <p>
                        Balance:
                        KSh ${balance.toLocaleString()}
                    </p>

                    <p>
                        Status:
                        <strong>
                            ${
                                balance <= 0
                                    ? "Paid"
                                    : "Balance Outstanding"
                            }
                        </strong>
                    </p>

                </div>

                <div>

                    <button
                        type="button"
                        class="admin-secondary-button view-fee-statement-btn"
                        data-fee-account-id="${account.id}"
                    >
                        View Statement
                    </button>

                </div>

            `;


            list.appendChild(
                card
            );
        }
    );
}


// =====================================================
// RECORD FEE PAYMENT
// =====================================================

async function recordFeePayment() {

    const feeAccountSelect =
        document.getElementById(
            "paymentStudent"
        );

    const amountInput =
        document.getElementById(
            "paymentAmount"
        );

    const methodInput =
        document.getElementById(
            "paymentMethod"
        );

    const referenceInput =
        document.getElementById(
            "paymentReference"
        );

    const message =
        document.getElementById(
            "paymentMessage"
        );


    const feeAccountId =
        feeAccountSelect?.value;

    const amount =
        Number(
            amountInput?.value
        );


    const paymentMethod =
        methodInput?.value.trim();


    const paymentReference =
        referenceInput?.value.trim();


    if (
        !feeAccountId ||
        !amount ||
        amount <= 0 ||
        !paymentMethod
    ) {

        if (message) {
            message.textContent =
                "Please complete all payment fields.";
        }

        return;
    }


    if (message) {
        message.textContent =
            "Recording payment...";
    }


    const {
        data: account,
        error: accountError
    } = await supabase
        .from("student_fee_accounts")
        .select(`
            id,
            student_id,
            profiles (
                university_id
            )
        `)
        .eq(
            "id",
            feeAccountId
        )
        .single();


    if (
        accountError ||
        !account
    ) {

        console.error(
            "Payment account error:",
            accountError
        );

        if (message) {
            message.textContent =
                "Unable to verify fee account.";
        }

        return;
    }


    if (
        account.profiles?.university_id !==
        currentProfile.university_id
    ) {

        if (message) {
            message.textContent =
                "This fee account does not belong to your university.";
        }

        return;
    }


    const {
        error
    } = await supabase
        .from("fee_payments")
        .insert({
            student_id:
                account.student_id,

            fee_account_id:
                feeAccountId,

            amount:
                amount,

            payment_method:
                paymentMethod,

            payment_reference:
                paymentReference ||
                null
        });


    if (error) {

        console.error(
            "Fee payment error:",
            error
        );

        if (message) {
            message.textContent =
                error.message ||
                "Unable to record payment.";
        }

        return;
    }


    if (message) {
        message.textContent =
            "Payment recorded successfully.";
    }


    if (amountInput) {
        amountInput.value = "";
    }

    if (methodInput) {
        methodInput.value = "";
    }

    if (referenceInput) {
        referenceInput.value = "";
    }


    await loadPaymentHistory();
    await loadStudentFeeBalances();
}


// =====================================================
// FINANCE BUTTON EVENTS
// =====================================================

const recordPaymentBtn =
    document.getElementById(
        "recordPaymentBtn"
    );


if (recordPaymentBtn) {

    recordPaymentBtn.addEventListener(
        "click",
        recordFeePayment
    );
}


const paymentHistoryList =
    document.getElementById(
        "paymentHistoryList"
    );


if (paymentHistoryList) {

    paymentHistoryList.addEventListener(
        "click",
        function(event) {

            const receiptButton =
                event.target.closest(
                    ".view-fee-receipt-btn"
                );

            if (!receiptButton) {
                return;
            }

            viewFeeReceipt(
                receiptButton.dataset.paymentId
            );
        }
    );
}


const studentFeeBalancesList =
    document.getElementById(
        "studentFeeBalancesList"
    );


if (studentFeeBalancesList) {

    studentFeeBalancesList.addEventListener(
        "click",
        function(event) {

            const statementButton =
                event.target.closest(
                    ".view-fee-statement-btn"
                );

            if (!statementButton) {
                return;
            }

            viewFeeStatement(
                statementButton.dataset.feeAccountId
            );
        }
    );
}


// =====================================================
// VIEW FEE RECEIPT
// =====================================================

async function viewFeeReceipt(
    paymentId
) {

    const {
        data: payment,
        error
    } = await supabase
        .from("fee_payments")
        .select(`
            id,
            amount,
            payment_method,
            payment_reference,
            payment_date,
            receipt_number,
            profiles (
                full_name,
                university_id
            )
        `)
        .eq(
            "id",
            paymentId
        )
        .single();


    if (error) {

        console.error(
            "Receipt loading error:",
            error
        );

        alert(
            "Unable to load receipt."
        );

        return;
    }


    if (
        payment.profiles?.university_id !==
        currentProfile.university_id
    ) {

        alert(
            "You are not authorized to view this receipt."
        );

        return;
    }


    const receiptWindow =
        window.open(
            "",
            "_blank",
            "width=800,height=700"
        );


    if (!receiptWindow) {

        alert(
            "Please allow pop-ups to view the receipt."
        );

        return;
    }


    receiptWindow.document.write(`

<!DOCTYPE html>

<html>

<head>

    <title>
        Fee Receipt - ${payment.receipt_number || ""}
    </title>

    <style>

        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #222;
        }

        .receipt {
            max-width: 650px;
            margin: auto;
            border: 1px solid #ddd;
            padding: 35px;
        }

        .header {
            text-align: center;
            border-bottom: 2px solid #222;
            padding-bottom: 20px;
            margin-bottom: 25px;
        }

        .header h1 {
            margin: 0;
        }

        .row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }

        .amount {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
            margin: 30px 0;
        }

        .print-button {
            display: block;
            margin: 30px auto 0;
            padding: 12px 24px;
            background: #111827;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        }

        @media print {

            .print-button {
                display: none;
            }

            body {
                margin: 0;
            }

            .receipt {
                border: none;
            }

        }

    </style>

</head>

<body>

    <div class="receipt">

        <div class="header">

            <h1>
                ClassLink University
            </h1>

            <p>
                Official Fee Receipt
            </p>

        </div>

        <div class="row">

            <strong>
                Receipt Number
            </strong>

            <span>
                ${payment.receipt_number || "N/A"}
            </span>

        </div>

        <div class="row">

            <strong>
                Student
            </strong>

            <span>
                ${payment.profiles?.full_name || "Unknown Student"}
            </span>

        </div>

        <div class="row">

            <strong>
                Payment Method
            </strong>

            <span>
                ${payment.payment_method || "N/A"}
            </span>

        </div>

        <div class="row">

            <strong>
                Reference
            </strong>

            <span>
                ${payment.payment_reference || "N/A"}
            </span>

        </div>

        <div class="row">

            <strong>
                Payment Date
            </strong>

            <span>
                ${
                    payment.payment_date
                        ? new Date(
                            payment.payment_date
                        ).toLocaleDateString()
                        : "N/A"
                }
            </span>

        </div>

        <div class="amount">

            KSh ${Number(
                payment.amount
            ).toLocaleString()}

        </div>

        <button
            class="print-button"
            onclick="window.print()"
        >
            Print / Save as PDF
        </button>

    </div>

</body>

</html>

    `);


    receiptWindow.document.close();
}

// =====================================================
// EXAMINATION PERIOD MANAGEMENT
// =====================================================

const manageExaminationsBtn =
    document.getElementById("manageExaminationsBtn");

const examinationPeriodModal =
    document.getElementById("examinationPeriodModal");

const closeExaminationPeriodModal =
    document.getElementById("closeExaminationPeriodModal");

const examinationPeriodForm =
    document.getElementById("examinationPeriodForm");

const examPeriodAcademicYear =
    document.getElementById("examPeriodAcademicYear");

const examPeriodSemester =
    document.getElementById("examPeriodSemester");

const examinationPeriodsList =
    document.getElementById("examinationPeriodsList");


// =====================================================
// OPEN EXAMINATION PERIOD MODAL
// =====================================================

if (manageExaminationsBtn) {
    manageExaminationsBtn.addEventListener(
        "click",
        async function () {

            if (examinationPeriodModal) {
                examinationPeriodModal.classList.add("active");
            }

            await loadExamPeriodAcademicYears();
        }
    );
}


// =====================================================
// CLOSE EXAMINATION PERIOD MODAL
// =====================================================

if (closeExaminationPeriodModal) {
    closeExaminationPeriodModal.addEventListener(
        "click",
        function () {

            if (examinationPeriodModal) {
                examinationPeriodModal.classList.remove("active");
            }

            if (examinationPeriodForm) {
                examinationPeriodForm.reset();
            }
        }
    );
}


// =====================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// =====================================================

if (examinationPeriodModal) {
    examinationPeriodModal.addEventListener(
        "click",
        function (event) {

            if (event.target === examinationPeriodModal) {
                examinationPeriodModal.classList.remove("active");

                if (examinationPeriodForm) {
                    examinationPeriodForm.reset();
                }
            }
        }
    );
}


// =====================================================
// LOAD ACADEMIC YEARS FOR EXAMINATION PERIOD
// =====================================================

async function loadExamPeriodAcademicYears() {

    if (!examPeriodAcademicYear) {
        return;
    }

    const {
        data,
        error
    } = await supabase
        .from("academic_years")
        .select(`
            id,
            year_number,
            programme_id,
            programmes (
                id,
                name,
                code,
                departments (
                    university_id
                )
            )
        `)
        .order(
            "year_number",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error loading examination academic years:",
            error
        );

        return;
    }


    const universityYears =
        (data || []).filter(
            function (year) {

                return (
                    year.programmes?.departments?.university_id ===
                    currentProfile.university_id
                );
            }
        );


    examPeriodAcademicYear.innerHTML = `
        <option value="">
            Select academic year
        </option>
    `;


    universityYears.forEach(
        function (year) {

            const option =
                document.createElement("option");

            option.value =
                year.id;

            option.textContent =
                `${year.programmes?.name || "Programme"} - Year ${year.year_number}`;

            examPeriodAcademicYear.appendChild(
                option
            );
        }
    );


    if (examPeriodSemester) {
        examPeriodSemester.innerHTML = `
            <option value="">
                Select semester
            </option>
        `;
    }
}


// =====================================================
// LOAD SEMESTERS FOR EXAMINATION PERIOD
// =====================================================

if (examPeriodAcademicYear) {

    examPeriodAcademicYear.addEventListener(
        "change",
        async function () {

            const academicYearId =
                examPeriodAcademicYear.value;

            if (!examPeriodSemester) {
                return;
            }

            examPeriodSemester.innerHTML = `
                <option value="">
                    Loading semesters...
                </option>
            `;


            if (!academicYearId) {

                examPeriodSemester.innerHTML = `
                    <option value="">
                        Select semester
                    </option>
                `;

                return;
            }


            const {
                data,
                error
            } = await supabase
                .from("semesters")
                .select(`
                    id,
                    semester_number
                `)
                .eq(
                    "academic_year_id",
                    academicYearId
                )
                .order(
                    "semester_number",
                    {
                        ascending: true
                    }
                );


            if (error) {

                console.error(
                    "Error loading exam semesters:",
                    error
                );

                examPeriodSemester.innerHTML = `
                    <option value="">
                        Unable to load semesters
                    </option>
                `;

                return;
            }


            examPeriodSemester.innerHTML = `
                <option value="">
                    Select semester
                </option>
            `;


            (data || []).forEach(
                function (semester) {

                    const option =
                        document.createElement("option");

                    option.value =
                        semester.id;

                    option.textContent =
                        `Semester ${semester.semester_number}`;

                    examPeriodSemester.appendChild(
                        option
                    );
                }
            );
        }
    );
}


// =====================================================
// SAVE EXAMINATION PERIOD
// =====================================================

if (examinationPeriodForm) {

    examinationPeriodForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const name =
                document
                    .getElementById("examPeriodName")
                    ?.value
                    .trim();

            const academicYearId =
                examPeriodAcademicYear?.value;

            const semesterId =
                examPeriodSemester?.value;

            const startDate =
                document
                    .getElementById("examPeriodStartDate")
                    ?.value;

            const endDate =
                document
                    .getElementById("examPeriodEndDate")
                    ?.value;

            const message =
                document.getElementById(
                    "examinationPeriodMessage"
                );


            if (
                !name ||
                !academicYearId ||
                !semesterId ||
                !startDate ||
                !endDate
            ) {

                if (message) {
                    message.textContent =
                        "Please complete all fields.";

                    message.className =
                        "form-message error";
                }

                return;
            }


            if (endDate < startDate) {

                if (message) {
                    message.textContent =
                        "End date cannot be before start date.";

                    message.className =
                        "form-message error";
                }

                return;
            }


            if (message) {
                message.textContent =
                    "Saving examination period...";

                message.className =
                    "form-message";
            }


            const {
                error
            } = await supabase
                .from("examination_periods")
                .insert({

                    university_id:
                        currentProfile.university_id,

                    academic_year_id:
                        academicYearId,

                    semester_id:
                        semesterId,

                    name:
                        name,

                    start_date:
                        startDate,

                    end_date:
                        endDate,

                    status:
                        "upcoming"
                });


            if (error) {

                console.error(
                    "Error saving examination period:",
                    error
                );

                if (message) {
                    message.textContent =
                        error.message ||
                        "Unable to save examination period.";

                    message.className =
                        "form-message error";
                }

                return;
            }


            if (message) {
                message.textContent =
                    "Examination period saved successfully.";

                message.className =
                    "form-message success";
            }


            await loadExaminationPeriods();


            setTimeout(
                function () {

                    if (examinationPeriodModal) {
                        examinationPeriodModal.classList.remove(
                            "active"
                        );
                    }

                    examinationPeriodForm.reset();

                    if (message) {
                        message.textContent = "";
                        message.className =
                            "form-message";
                    }

                },
                500
            );
        }
    );
}


// =====================================================
// LOAD EXAMINATION PERIODS
// =====================================================

async function loadExaminationPeriods() {

    if (!examinationPeriodsList) {
        return;
    }


    examinationPeriodsList.innerHTML =
        "<p>Loading examination periods...</p>";


    const {
        data,
        error
    } = await supabase
        .from("examination_periods")
        .select(`
            id,
            name,
            start_date,
            end_date,
            status,
            academic_years (
                year_number,
                programmes (
                    name,
                    code,
                    departments (
                        university_id
                    )
                )
            ),
            semesters (
                semester_number
            )
        `)
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .order(
            "start_date",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Error loading examination periods:",
            error
        );

        examinationPeriodsList.innerHTML =
            "<p>Unable to load examination periods.</p>";

        return;
    }


    if (!data || data.length === 0) {

        examinationPeriodsList.innerHTML =
            "<p>No examination periods created yet.</p>";

        return;
    }


    examinationPeriodsList.innerHTML = "";


    data.forEach(
        function (period) {

            const card =
                document.createElement("div");

            card.className =
                "admin-list-item";


            const start =
                new Date(
                    period.start_date
                ).toLocaleDateString();

            const end =
                new Date(
                    period.end_date
                ).toLocaleDateString();


            card.innerHTML = `

                <div>

                    <strong>
                        ${period.name}
                    </strong>

                    <p>
                        Academic Year:
                        Year ${
                            period.academic_years?.year_number ||
                            "N/A"
                        }
                    </p>

                    <p>
                        Semester:
                        ${
                            period.semesters?.semester_number
                                ? `Semester ${period.semesters.semester_number}`
                                : "N/A"
                        }
                    </p>

                    <p>
                        Dates:
                        ${start} - ${end}
                    </p>

                </div>

                <div>

                    <span class="admin-status-badge">
                        ${period.status}
                    </span>

                </div>

            `;


            examinationPeriodsList.appendChild(
                card
            );
        }
    );
}


// =====================================================
// EXAMINATION TIMETABLE
// =====================================================

const createExamTimetableBtn =
    document.getElementById(
        "createExamTimetableBtn"
    );

const examinationTimetableModal =
    document.getElementById(
        "examinationTimetableModal"
    );

const closeExaminationTimetableModal =
    document.getElementById(
        "closeExaminationTimetableModal"
    );

const examinationTimetableForm =
    document.getElementById(
        "examinationTimetableForm"
    );

const timetableExamPeriod =
    document.getElementById(
        "timetableExamPeriod"
    );

const timetableUnit =
    document.getElementById(
        "timetableUnit"
    );

const examinationTimetableList =
    document.getElementById(
        "examinationTimetableList"
    );


// =====================================================
// OPEN TIMETABLE MODAL
// =====================================================

if (createExamTimetableBtn) {

    createExamTimetableBtn.addEventListener(
        "click",
        async function () {

            if (examinationTimetableModal) {
                examinationTimetableModal.classList.add(
                    "active"
                );
            }

            await loadTimetableExamPeriods();
            await loadTimetableUnits();
        }
    );
}


// =====================================================
// CLOSE TIMETABLE MODAL
// =====================================================

if (closeExaminationTimetableModal) {

    closeExaminationTimetableModal.addEventListener(
        "click",
        function () {

            if (examinationTimetableModal) {
                examinationTimetableModal.classList.remove(
                    "active"
                );
            }

            if (examinationTimetableForm) {
                examinationTimetableForm.reset();
            }
        }
    );
}


// =====================================================
// CLOSE TIMETABLE MODAL OUTSIDE
// =====================================================

if (examinationTimetableModal) {

    examinationTimetableModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                examinationTimetableModal
            ) {

                examinationTimetableModal.classList.remove(
                    "active"
                );

                if (examinationTimetableForm) {
                    examinationTimetableForm.reset();
                }
            }
        }
    );
}


// =====================================================
// LOAD TIMETABLE EXAM PERIODS
// =====================================================

async function loadTimetableExamPeriods() {

    if (!timetableExamPeriod) {
        return;
    }


    const {
        data,
        error
    } = await supabase
        .from("examination_periods")
        .select(`
            id,
            name,
            start_date,
            end_date
        `)
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .order(
            "start_date",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Error loading timetable exam periods:",
            error
        );

        return;
    }


    timetableExamPeriod.innerHTML = `
        <option value="">
            Select examination period
        </option>
    `;


    (data || []).forEach(
        function (period) {

            const option =
                document.createElement("option");

            option.value =
                period.id;

            option.textContent =
                `${period.name} (${period.start_date} - ${period.end_date})`;

            timetableExamPeriod.appendChild(
                option
            );
        }
    );
}


// =====================================================
// LOAD TIMETABLE UNITS
// =====================================================

async function loadTimetableUnits() {

    if (!timetableUnit) {
        return;
    }


    const {
        data,
        error
    } = await supabase
        .from("units")
        .select(`
            id,
            unit_code,
            unit_name,
            semesters (
                academic_years (
                    programmes (
                        departments (
                            university_id
                        )
                    )
                )
            )
        `)
        .order(
            "unit_code",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error loading timetable units:",
            error
        );

        return;
    }


    const universityUnits =
        (data || []).filter(
            function (unit) {

                return (
                    unit.semesters
                        ?.academic_years
                        ?.programmes
                        ?.departments
                        ?.university_id ===
                    currentProfile.university_id
                );
            }
        );


    timetableUnit.innerHTML = `
        <option value="">
            Select unit
        </option>
    `;


    universityUnits.forEach(
        function (unit) {

            const option =
                document.createElement("option");

            option.value =
                unit.id;

            option.textContent =
                `${unit.unit_code} - ${unit.unit_name}`;

            timetableUnit.appendChild(
                option
            );
        }
    );
}


// =====================================================
// SAVE EXAMINATION TIMETABLE
// =====================================================

if (examinationTimetableForm) {

    examinationTimetableForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const periodId =
                timetableExamPeriod?.value;

            const unitId =
                timetableUnit?.value;

            const examDate =
                document.getElementById(
                    "timetableExamDate"
                )?.value;

            const startTime =
                document.getElementById(
                    "timetableStartTime"
                )?.value;

            const endTime =
                document.getElementById(
                    "timetableEndTime"
                )?.value;

            const venue =
                document.getElementById(
                    "timetableVenue"
                )?.value
                .trim();

            const message =
                document.getElementById(
                    "examinationTimetableMessage"
                );


            if (
                !periodId ||
                !unitId ||
                !examDate ||
                !startTime ||
                !endTime
            ) {

                if (message) {
                    message.textContent =
                        "Please complete all required fields.";

                    message.className =
                        "form-message error";
                }

                return;
            }


            if (endTime <= startTime) {

                if (message) {
                    message.textContent =
                        "End time must be after start time.";

                    message.className =
                        "form-message error";
                }

                return;
            }


            if (message) {
                message.textContent =
                    "Saving examination timetable...";

                message.className =
                    "form-message";
            }


            const {
                error
            } = await supabase
                .from("examination_timetables")
                .insert({

                    university_id:
                        currentProfile.university_id,

                    examination_period_id:
                        periodId,

                    unit_id:
                        unitId,

                    exam_date:
                        examDate,

                    start_time:
                        startTime,

                    end_time:
                        endTime,

                    venue:
                        venue || null
                });


            if (error) {

                console.error(
                    "Error saving examination timetable:",
                    error
                );

                if (message) {
                    message.textContent =
                        error.message ||
                        "Unable to save examination timetable.";

                    message.className =
                        "form-message error";
                }

                return;
            }


            if (message) {
                message.textContent =
                    "Examination timetable saved successfully.";

                message.className =
                    "form-message success";
            }


            await loadExaminationTimetable();


            setTimeout(
                function () {

                    if (examinationTimetableModal) {
                        examinationTimetableModal.classList.remove(
                            "active"
                        );
                    }

                    examinationTimetableForm.reset();

                    if (message) {
                        message.textContent = "";
                        message.className =
                            "form-message";
                    }

                },
                500
            );
        }
    );
}


// =====================================================
// LOAD EXAMINATION TIMETABLE
// =====================================================

async function loadExaminationTimetable() {

    if (!examinationTimetableList) {
        return;
    }


    examinationTimetableList.innerHTML =
        "<p>Loading examination timetable...</p>";


    const {
        data,
        error
    } = await supabase
        .from("examination_timetables")
        .select(`
            id,
            exam_date,
            start_time,
            end_time,
            venue,
            examination_periods (
                name,
                start_date,
                end_date
            ),
            units (
                unit_code,
                unit_name
            )
        `)
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .order(
            "exam_date",
            {
                ascending: true
            }
        )
        .order(
            "start_time",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error loading examination timetable:",
            error
        );

        examinationTimetableList.innerHTML =
            "<p>Unable to load examination timetable.</p>";

        return;
    }


    if (!data || data.length === 0) {

        examinationTimetableList.innerHTML =
            "<p>No examination timetable entries yet.</p>";

        return;
    }


    examinationTimetableList.innerHTML = "";


    data.forEach(
        function (entry) {

            const card =
                document.createElement("div");

            card.className =
                "admin-list-item";


            card.innerHTML = `

                <div>

                    <strong>
                        ${entry.units?.unit_code || "N/A"}
                        -
                        ${entry.units?.unit_name || "Unknown Unit"}
                    </strong>

                    <p>
                        Examination:
                        ${
                            entry.examination_periods?.name ||
                            "N/A"
                        }
                    </p>

                    <p>
                        Date:
                        ${entry.exam_date}
                    </p>

                    <p>
                        Time:
                        ${entry.start_time}
                        -
                        ${entry.end_time}
                    </p>

                    <p>
                        Venue:
                        ${entry.venue || "Not assigned"}
                    </p>

                </div>

            `;


            examinationTimetableList.appendChild(
                card
            );
        }
    );
}

// =====================================================
// ACADEMIC CALENDAR
// =====================================================

async function loadAcademicCalendar() {

    if (!academicCalendarList || !currentProfile) {
        return;
    }

    academicCalendarList.innerHTML =
        '<div class="admin-loading">Loading academic calendar...</div>';

    const {
        data: events,
        error
    } = await supabase
        .from("academic_calendar_events")
        .select(`
            id,
            title,
            description,
            event_type,
            start_date,
            end_date,
            academic_year_id,
            semester_id,
            academic_years (
                year_number
            ),
            semesters (
                semester_number
            )
        `)
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .order(
            "start_date",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(
            "Error loading academic calendar:",
            error
        );

        academicCalendarList.innerHTML =
            "<p>Unable to load academic calendar.</p>";

        return;
    }

    if (!events || events.length === 0) {

        academicCalendarList.innerHTML = `
            <div class="admin-empty-state">
                <p>No academic calendar events yet.</p>
            </div>
        `;

        return;
    }

    academicCalendarList.innerHTML = "";

    events.forEach(function (event) {

        const card =
            document.createElement("div");

        card.className =
            "admin-list-item";

        const academicYear =
            event.academic_years;

        const semester =
            event.semesters;

 card.innerHTML = `

    <div style="width:100%;">

        <div
            style="
                display:flex;
                justify-content:space-between;
                align-items:flex-start;
                gap:15px;
                flex-wrap:wrap;
            "
        >

            <div>

                <strong>
                    📅 ${event.title}
                </strong>

                <p style="margin-top:6px;">
                    ${event.description || ""}
                </p>

                <p style="margin-top:8px;">
                    <strong>Type:</strong>
                    ${event.event_type}
                </p>

                <p>
                    <strong>Dates:</strong>
                    ${event.start_date}
                    →
                    ${event.end_date}
                </p>

                ${
                    academicYear
                        ? `
                            <p>
                                <strong>Year:</strong>
                                ${academicYear.year_number}
                            </p>
                        `
                        : ""
                }

                ${
                    semester
                        ? `
                            <p>
                                <strong>Semester:</strong>
                                ${semester.semester_number}
                            </p>
                        `
                        : ""
                }

            </div>


            <div
                style="
                    display:flex;
                    gap:8px;
                    flex-wrap:wrap;
                "
            >

                <button
                    type="button"
                    class="admin-danger-button delete-academic-calendar-btn"
                    data-id="${event.id}"
                >
                    Delete
                </button>

            </div>

        </div>

    </div>

`;

        academicCalendarList.appendChild(card);
    });
}

// =====================================================
// DELETE ACADEMIC CALENDAR EVENT
// =====================================================

document.addEventListener(
    "click",
    async function (event) {

        const deleteButton =
            event.target.closest(
                ".delete-academic-calendar-btn"
            );

        if (!deleteButton) {
            return;
        }

        const eventId =
            deleteButton.dataset.id;

        if (!eventId) {
            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to delete this calendar event?"
            );

        if (!confirmed) {
            return;
        }


        deleteButton.disabled = true;

        deleteButton.textContent =
            "Deleting...";


        const {
            error
        } = await supabase
            .from("academic_calendar_events")
            .delete()
            .eq(
                "id",
                eventId
            )
            .eq(
                "university_id",
                currentProfile.university_id
            );


        if (error) {

            console.error(
                "Error deleting academic calendar event:",
                error
            );

            alert(
                error.message ||
                "Unable to delete calendar event."
            );

            deleteButton.disabled = false;

            deleteButton.textContent =
                "Delete";

            return;
        }


        await loadAcademicCalendar();

    }
);

// =====================================================
// OPEN ACADEMIC CALENDAR MODAL
// =====================================================

if (createAcademicCalendarEventBtn) {

    createAcademicCalendarEventBtn.addEventListener(
        "click",
        async function () {

            if (academicCalendarModal) {
                academicCalendarModal.classList.add("active");
            }

            if (academicCalendarForm) {
                academicCalendarForm.reset();
            }

            if (academicCalendarMessage) {
                academicCalendarMessage.textContent = "";
                academicCalendarMessage.className =
                    "form-message";
            }

            await loadCalendarAcademicYears();
        }
    );
}

// =====================================================
// LOAD ACADEMIC CALENDAR ACADEMIC YEARS
// =====================================================

async function loadCalendarAcademicYears() {

    if (!calendarEventAcademicYear) {
        return;
    }

    const {
        data,
        error
    } = await supabase
        .from("academic_years")
        .select(`
            id,
            year_number,
            programmes (
                departments (
                    university_id
                )
            )
        `)
        .order(
            "year_number",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(
            "Error loading calendar academic years:",
            error
        );

        return;
    }

    const universityYears =
        (data || []).filter(
            function (year) {

                return (
                    year.programmes
                        ?.departments
                        ?.university_id ===
                    currentProfile.university_id
                );
            }
        );

    calendarEventAcademicYear.innerHTML = `
        <option value="">
            Select academic year
        </option>
    `;

    universityYears.forEach(
        function (year) {

            const option =
                document.createElement("option");

            option.value =
                year.id;

            option.textContent =
                `Year ${year.year_number}`;

            calendarEventAcademicYear.appendChild(
                option
            );
        }
    );
}

// =====================================================
// LOAD CALENDAR SEMESTERS
// =====================================================

async function loadCalendarSemesters(academicYearId) {

    if (!calendarEventSemester) {
        return;
    }

    calendarEventSemester.innerHTML = `
        <option value="">
            Select semester
        </option>
    `;

    if (!academicYearId) {
        return;
    }

    const {
        data,
        error
    } = await supabase
        .from("semesters")
        .select(`
            id,
            semester_number,
            academic_year_id
        `)
        .eq(
            "academic_year_id",
            academicYearId
        )
        .order(
            "semester_number",
            {
                ascending: true
            }
        );

    if (error) {

        console.error(
            "Error loading calendar semesters:",
            error
        );

        return;
    }

    (data || []).forEach(
        function (semester) {

            const option =
                document.createElement("option");

            option.value =
                semester.id;

            option.textContent =
                `Semester ${semester.semester_number}`;

            calendarEventSemester.appendChild(
                option
            );
        }
    );
}

// =====================================================
// ACADEMIC YEAR CHANGE
// =====================================================

if (calendarEventAcademicYear) {

    calendarEventAcademicYear.addEventListener(
        "change",
        async function () {

            await loadCalendarSemesters(
                calendarEventAcademicYear.value
            );

        }
    );
}

// =====================================================
// SAVE ACADEMIC CALENDAR EVENT
// =====================================================

if (academicCalendarForm) {

    academicCalendarForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const title =
                calendarEventTitle?.value.trim();

            const description =
                calendarEventDescription?.value.trim();

            const eventType =
                calendarEventType?.value;

            const academicYearId =
                calendarEventAcademicYear?.value;

            const semesterId =
                calendarEventSemester?.value;

            const startDate =
                calendarEventStartDate?.value;

            const endDate =
                calendarEventEndDate?.value;


            if (
                !title ||
                !eventType ||
                !startDate ||
                !endDate
            ) {

                if (academicCalendarMessage) {

                    academicCalendarMessage.textContent =
                        "Please complete all required fields.";

                    academicCalendarMessage.className =
                        "form-message error";
                }

                return;
            }


            if (endDate < startDate) {

                if (academicCalendarMessage) {

                    academicCalendarMessage.textContent =
                        "End date must be after or equal to the start date.";

                    academicCalendarMessage.className =
                        "form-message error";
                }

                return;
            }


            if (academicCalendarMessage) {

                academicCalendarMessage.textContent =
                    "Saving academic calendar event...";

                academicCalendarMessage.className =
                    "form-message";
            }


            const {
                error
            } = await supabase
                .from("academic_calendar_events")
                .insert({

                    university_id:
                        currentProfile.university_id,

                    academic_year_id:
                        academicYearId || null,

                    semester_id:
                        semesterId || null,

                    title:
                        title,

                    description:
                        description || null,

                    event_type:
                        eventType,

                    start_date:
                        startDate,

                    end_date:
                        endDate
                });


            if (error) {

                console.error(
                    "Error saving academic calendar event:",
                    error
                );

                if (academicCalendarMessage) {

                    academicCalendarMessage.textContent =
                        error.message ||
                        "Unable to save academic calendar event.";

                    academicCalendarMessage.className =
                        "form-message error";
                }

                return;
            }


            if (academicCalendarMessage) {

                academicCalendarMessage.textContent =
                    "Academic calendar event saved successfully.";

                academicCalendarMessage.className =
                    "form-message success";
            }


            await loadAcademicCalendar();


            setTimeout(
                function () {

                    if (academicCalendarModal) {

                        academicCalendarModal.classList.remove(
                            "active"
                        );
                    }

                    if (academicCalendarForm) {

                        academicCalendarForm.reset();
                    }

                    if (academicCalendarMessage) {

                        academicCalendarMessage.textContent =
                            "";

                        academicCalendarMessage.className =
                            "form-message";
                    }

                },
                500
            );
        }
    );
}

// =====================================================
// LECTURER MANAGEMENT
// =====================================================

async function loadLecturerManagement() {

    const list =
        document.getElementById(
            "mainLecturersManagementList"
        );

    if (!list || !currentProfile) {
        return;
    }

    list.innerHTML =
        "<p>Loading lecturer assignments...</p>";


    const {
        data: lecturers,
        error: lecturerError
    } = await supabase
        .from("profiles")
        .select(`
            id,
            full_name,
            role,
            university_id
        `)
        .eq(
            "role",
            "lecturer"
        )
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .order(
            "full_name",
            {
                ascending: true
            }
        );


    if (lecturerError) {

        console.error(
            "Error loading lecturers:",
            lecturerError
        );

        list.innerHTML =
            "<p>Unable to load lecturers.</p>";

        return;
    }


    if (
        !lecturers ||
        lecturers.length === 0
    ) {

        list.innerHTML =
            "<p>No lecturers found.</p>";

        return;
    }


    list.innerHTML = "";


    for (
        const lecturer of lecturers
    ) {

        const {
            data: assignments,
            error: assignmentError
        } = await supabase
            .from("unit_lecturers")
            .select(`
                id,
                unit_id,
                semester_id,
                units (
                    unit_code,
                    unit_name
                ),
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
                "university_id",
                currentProfile.university_id
            )
            .eq(
                "lecturer_id",
                lecturer.id
            );


        if (assignmentError) {

            console.error(
                "Error loading lecturer assignments:",
                assignmentError
            );

            continue;
        }


        const card =
            document.createElement("div");

        card.className =
            "admin-list-item";


        let assignmentsHtml =
            "";


        if (
            assignments &&
            assignments.length > 0
        ) {

            assignmentsHtml =
                assignments
                    .map(
                        function (assignment) {

                            const unit =
                                assignment.units;

                            const semester =
                                assignment.semesters;

                            const programme =
                                semester
                                    ?.academic_years
                                    ?.programmes;

                            return `

                                <div
                                    style="
                                        margin-top:10px;
                                        padding:10px;
                                        background:#f8fafc;
                                        border-radius:8px;
                                    "
                                >

                                    <strong>
                                        ${
                                            unit?.unit_code ||
                                            "N/A"
                                        }
                                        -
                                        ${
                                            unit?.unit_name ||
                                            "Unknown Unit"
                                        }
                                    </strong>

                                    <p>
                                        ${
                                            programme?.name ||
                                            "Programme"
                                        }
                                        ·
                                        Year ${
                                            semester
                                                ?.academic_years
                                                ?.year_number ||
                                            "N/A"
                                        }
                                        ·
                                        Semester ${
                                            semester
                                                ?.semester_number ||
                                            "N/A"
                                        }
                                    </p>

                                </div>

                            `;
                        }
                    )
                    .join("");

        } else {

            assignmentsHtml = `
                <p>
                    No units assigned yet.
                </p>
            `;
        }


        card.innerHTML = `

            <div style="width:100%;">

                <div
                    style="
                        display:flex;
                        justify-content:space-between;
                        align-items:center;
                        gap:15px;
                        flex-wrap:wrap;
                    "
                >

                    <div>

                        <strong>
                            👨‍🏫
                            ${
                                lecturer.full_name ||
                                "Unnamed Lecturer"
                            }
                        </strong>

                        <p>
                            ${
                                assignments?.length ||
                                0
                            }
                            unit(s) assigned
                        </p>

                    </div>


                    <button
                        type="button"
                        class="admin-primary-button assign-lecturer-unit-btn"
                        data-lecturer-id="${lecturer.id}"
                    >
                        Assign Unit
                    </button>

                </div>


                <div
                    style="margin-top:15px;"
                >

                    ${assignmentsHtml}

                </div>

            </div>

        `;


        list.appendChild(
            card
        );
    }
}


// =====================================================
// LOAD ASSIGNMENT LECTURERS
// =====================================================

async function loadAssignmentLecturers() {

    const select =
        document.getElementById(
            "assignmentLecturer"
        );

    if (
        !select ||
        !currentProfile
    ) {
        return false;
    }


    const {
        data,
        error
    } = await supabase
        .from("profiles")
        .select(
            "id, full_name"
        )
        .eq(
            "role",
            "lecturer"
        )
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .order(
            "full_name",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error loading assignment lecturers:",
            error
        );

        return false;
    }


    select.innerHTML = `
        <option value="">
            Select lecturer
        </option>
    `;


    (data || []).forEach(
        function (lecturer) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                lecturer.id;

            option.textContent =
                lecturer.full_name ||
                "Unnamed Lecturer";

            select.appendChild(
                option
            );
        }
    );


    return true;
}


// =====================================================
// LOAD ASSIGNMENT UNITS
// =====================================================

async function loadAssignmentUnits() {

    const select =
        document.getElementById(
            "assignmentUnit"
        );

    if (
        !select ||
        !currentProfile
    ) {
        return false;
    }


    const {
        data,
        error
    } = await supabase
        .from("units")
        .select(`
            id,
            unit_code,
            unit_name,
            semesters (
                academic_years (
                    programmes (
                        departments (
                            university_id
                        )
                    )
                )
            )
        `)
        .order(
            "unit_code",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error loading assignment units:",
            error
        );

        return false;
    }


    const universityUnits =
        (data || []).filter(
            function (unit) {

                return (
                    unit.semesters
                        ?.academic_years
                        ?.programmes
                        ?.departments
                        ?.university_id ===
                    currentProfile.university_id
                );
            }
        );


    select.innerHTML = `
        <option value="">
            Select unit
        </option>
    `;


    universityUnits.forEach(
        function (unit) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                unit.id;

            option.textContent =
                `${unit.unit_code} - ${unit.unit_name}`;

            select.appendChild(
                option
            );
        }
    );


    return true;
}


// =====================================================
// LOAD ASSIGNMENT SEMESTERS
// =====================================================

async function loadAssignmentSemesters() {

    const select =
        document.getElementById(
            "assignmentSemester"
        );

    if (
        !select ||
        !currentProfile
    ) {
        return false;
    }


    const {
        data,
        error
    } = await supabase
        .from("semesters")
        .select(`
            id,
            semester_number,
            academic_year_id,
            academic_years (
                year_number,
                programmes (
                    departments (
                        university_id
                    )
                )
            )
        `);


    if (error) {

        console.error(
            "Error loading assignment semesters:",
            error
        );

        return false;
    }


    const universitySemesters =
        (data || [])
            .filter(
                function (semester) {

                    return (
                        semester.academic_years
                            ?.programmes
                            ?.departments
                            ?.university_id ===
                        currentProfile.university_id
                    );
                }
            )
            .sort(
                function (a, b) {

                    const yearA =
                        Number(
                            a.academic_years
                                ?.year_number
                        ) || 0;

                    const yearB =
                        Number(
                            b.academic_years
                                ?.year_number
                        ) || 0;

                    if (
                        yearA !== yearB
                    ) {
                        return yearA - yearB;
                    }

                    return (
                        Number(
                            a.semester_number
                        ) -
                        Number(
                            b.semester_number
                        )
                    );
                }
            );


    select.innerHTML = `
        <option value="">
            Select semester
        </option>
    `;


    universitySemesters.forEach(
        function (semester) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                semester.id;

            option.textContent =
                `Year ${
                    semester.academic_years
                        ?.year_number ||
                    "N/A"
                } - Semester ${
                    semester.semester_number
                }`;

            select.appendChild(
                option
            );
        }
    );


    return true;
}


// =====================================================
// OPEN ASSIGN LECTURER MODAL
// =====================================================

async function openUnitLecturerAssignmentModal(
    preselectedLecturerId = ""
) {

    const modal =
        document.getElementById(
            "unitLecturerAssignmentModal"
        );

    const form =
        document.getElementById(
            "unitLecturerAssignmentForm"
        );

    const message =
        document.getElementById(
            "unitLecturerAssignmentMessage"
        );

    const lecturerSelect =
        document.getElementById(
            "assignmentLecturer"
        );


    if (!modal) {
        return;
    }


    if (form) {
        form.reset();
    }


    if (message) {

        message.textContent =
            "";

        message.className =
            "form-message";
    }


    const results =
        await Promise.all([
            loadAssignmentLecturers(),
            loadAssignmentUnits(),
            loadAssignmentSemesters()
        ]);


    if (
        results.some(
            function (result) {
                return result === false;
            }
        )
    ) {

        if (message) {

            message.textContent =
                "Unable to load assignment options.";

            message.className =
                "form-message error";
        }
    }


    if (lecturerSelect) {

        lecturerSelect.value =
            preselectedLecturerId ||
            "";


        if (
            preselectedLecturerId &&
            lecturerSelect.value !==
                preselectedLecturerId
        ) {

            if (message) {

                message.textContent =
                    "The selected lecturer could not be found.";

                message.className =
                    "form-message error";
            }
        }
    }


    modal.classList.add(
        "active"
    );
}


// =====================================================
// CLOSE ASSIGN LECTURER MODAL
// =====================================================

function closeUnitLecturerAssignmentModal() {

    const modal =
        document.getElementById(
            "unitLecturerAssignmentModal"
        );

    const form =
        document.getElementById(
            "unitLecturerAssignmentForm"
        );

    const message =
        document.getElementById(
            "unitLecturerAssignmentMessage"
        );


    if (modal) {
        modal.classList.remove(
            "active"
        );
    }


    if (form) {
        form.reset();
    }


    if (message) {

        message.textContent =
            "";

        message.className =
            "form-message";
    }
}


// =====================================================
// ASSIGN LECTURER BUTTON
// =====================================================

const assignUnitLecturerBtn =
    document.getElementById(
        "assignUnitLecturerBtn"
    );


if (assignUnitLecturerBtn) {

    assignUnitLecturerBtn.addEventListener(
        "click",
        function () {

            openUnitLecturerAssignmentModal(
                ""
            );
        }
    );
}


// =====================================================
// CLOSE ASSIGNMENT MODAL BUTTON
// =====================================================

const closeUnitLecturerAssignmentModalBtn =
    document.getElementById(
        "closeUnitLecturerAssignmentModal"
    );


if (
    closeUnitLecturerAssignmentModalBtn
) {

    closeUnitLecturerAssignmentModalBtn
        .addEventListener(
            "click",
            closeUnitLecturerAssignmentModal
        );
}


// =====================================================
// CLICK OUTSIDE ASSIGNMENT MODAL
// =====================================================

const unitLecturerAssignmentModal =
    document.getElementById(
        "unitLecturerAssignmentModal"
    );


if (unitLecturerAssignmentModal) {

    unitLecturerAssignmentModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                unitLecturerAssignmentModal
            ) {

                closeUnitLecturerAssignmentModal();
            }
        }
    );
}


// =====================================================
// ESCAPE KEY CLOSES ASSIGNMENT MODAL
// =====================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            const modal =
                document.getElementById(
                    "unitLecturerAssignmentModal"
                );

            if (
                modal &&
                modal.classList.contains(
                    "active"
                )
            ) {

                closeUnitLecturerAssignmentModal();
            }
        }
    }
);


// =====================================================
// ASSIGN UNIT BUTTONS INSIDE LECTURER LIST
// =====================================================

const unitLecturerAssignmentsList =
    document.getElementById(
        "unitLecturerAssignmentsList"
    );


if (unitLecturerAssignmentsList) {

    unitLecturerAssignmentsList.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".assign-lecturer-unit-btn"
                );


            if (!button) {
                return;
            }


            const lecturerId =
                button.dataset.lecturerId ||
                "";


            openUnitLecturerAssignmentModal(
                lecturerId
            );
        }
    );
}


// =====================================================
// SAVE UNIT LECTURER ASSIGNMENT
// =====================================================

const unitLecturerAssignmentForm =
    document.getElementById(
        "unitLecturerAssignmentForm"
    );


if (unitLecturerAssignmentForm) {

    unitLecturerAssignmentForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const semesterId =
                document.getElementById(
                    "assignmentSemester"
                )?.value;

            const unitId =
                document.getElementById(
                    "assignmentUnit"
                )?.value;

            const lecturerId =
                document.getElementById(
                    "assignmentLecturer"
                )?.value;

            const message =
                document.getElementById(
                    "unitLecturerAssignmentMessage"
                );


            if (
                !semesterId ||
                !unitId ||
                !lecturerId
            ) {

                if (message) {

                    message.textContent =
                        "Please select a semester, unit and lecturer.";

                    message.className =
                        "form-message error";
                }

                return;
            }


            if (
                !currentProfile ||
                !currentProfile.university_id
            ) {

                if (message) {

                    message.textContent =
                        "Unable to determine your university.";

                    message.className =
                        "form-message error";
                }

                return;
            }


            if (message) {

                message.textContent =
                    "Checking assignment...";

                message.className =
                    "form-message";
            }


            const {
                data: existingAssignment,
                error: existingError
            } = await supabase
                .from("unit_lecturers")
                .select("id")
                .eq(
                    "university_id",
                    currentProfile.university_id
                )
                .eq(
                    "unit_id",
                    unitId
                )
                .eq(
                    "lecturer_id",
                    lecturerId
                )
                .eq(
                    "semester_id",
                    semesterId
                )
                .maybeSingle();


            if (existingError) {

                console.error(
                    "Assignment check error:",
                    existingError
                );

                if (message) {

                    message.textContent =
                        "Unable to check existing assignment.";

                    message.className =
                        "form-message error";
                }

                return;
            }


            if (existingAssignment) {

                if (message) {

                    message.textContent =
                        "This lecturer is already assigned to this unit for this semester.";

                    message.className =
                        "form-message error";
                }

                return;
            }


            if (message) {

                message.textContent =
                    "Assigning lecturer...";

                message.className =
                    "form-message";
            }


            const {
                error
            } = await supabase
                .from("unit_lecturers")
                .insert({

                    university_id:
                        currentProfile.university_id,

                    unit_id:
                        unitId,

                    lecturer_id:
                        lecturerId,

                    semester_id:
                        semesterId
                });


            if (error) {

                console.error(
                    "Lecturer assignment error:",
                    error
                );

                if (message) {

                    message.textContent =
                        error.message ||
                        "Unable to assign lecturer.";

                    message.className =
                        "form-message error";
                }

                return;
            }


            await loadLecturerManagement();


            closeUnitLecturerAssignmentModal();
        }
    );
}


// =====================================================
// SIDEBAR
// =====================================================

const dashboardMenuBtn =
    document.getElementById(
        "dashboardMenuBtn"
    );

const dashboardSidebar =
    document.getElementById(
        "dashboardSidebar"
    );

const dashboardSidebarClose =
    document.getElementById(
        "dashboardSidebarClose"
    );

const dashboardOverlay =
    document.getElementById(
        "dashboardOverlay"
    );


function openDashboardSidebar() {

    if (dashboardSidebar) {
        dashboardSidebar.classList.add(
            "active"
        );
    }

    if (dashboardOverlay) {
        dashboardOverlay.classList.add(
            "active"
        );
    }
}


function closeDashboardSidebar() {

    if (dashboardSidebar) {
        dashboardSidebar.classList.remove(
            "active"
        );
    }

    if (dashboardOverlay) {
        dashboardOverlay.classList.remove(
            "active"
        );
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


// =====================================================
// SIDEBAR NAVIGATION
// =====================================================

document.querySelectorAll(
    ".dashboard-sidebar a"
).forEach(
    function (link) {

        link.addEventListener(
            "click",
            closeDashboardSidebar
        );
    }
);


// =====================================================
// INITIALIZATION
// =====================================================

async function initializeAdminDashboard() {

    try {

        const user =
            await getCurrentUser();


        if (!user) {
            return;
        }


        await loadAdminProfile();


        if (!currentProfile) {
            return;
        }


        await loadUniversity();

        await loadDepartments();

        await loadProgrammes();

        await loadUnits();

        await loadStudentCount();

        await loadStudents();

        await loadApplications();

        await loadLecturerCount();

        await loadAcademicStructure();

        await loadStudentFeeBalances();

        await loadPaymentStudents();

        await loadPaymentHistory();

        await loadExaminationPeriods();

        await loadExaminationTimetable();

        await loadAcademicCalendar();

        await loadLecturerManagement();


        console.log(
            "University Admin Dashboard initialized successfully."
        );

    } catch (error) {

        console.error(
            "Admin dashboard initialization error:",
            error
        );

    }
}


initializeAdminDashboard();