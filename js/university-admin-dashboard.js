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


// =====================================================
// BUTTONS
// =====================================================

const addDepartmentBtn =
    document.getElementById("addDepartmentBtn");

const addProgrammeBtn =
    document.getElementById("addProgrammeBtn");

const manageAcademicBtn =
    document.getElementById("manageAcademicBtn");

const addUnitBtn =
    document.getElementById("addUnitBtn");


// =====================================================
// DEPARTMENT MODAL
// =====================================================

const departmentModal =
    document.getElementById("departmentModal");

const closeDepartmentModal =
    document.getElementById("closeDepartmentModal");

const cancelDepartmentBtn =
    document.getElementById("cancelDepartmentBtn");

const departmentForm =
    document.getElementById("departmentForm");

const departmentName =
    document.getElementById("departmentName");

const departmentCode =
    document.getElementById("departmentCode");

const departmentFormMessage =
    document.getElementById("departmentFormMessage");

const departmentModalTitle =
    document.getElementById("departmentModalTitle");

const saveDepartmentBtn =
    document.getElementById("saveDepartmentBtn");


// =====================================================
// PROGRAMME MODAL
// =====================================================

const programmeModal =
    document.getElementById("programmeModal");

const closeProgrammeModal =
    document.getElementById("closeProgrammeModal");

const cancelProgrammeBtn =
    document.getElementById("cancelProgrammeBtn");

const programmeForm =
    document.getElementById("programmeForm");

const programmeName =
    document.getElementById("programmeName");

const programmeCode =
    document.getElementById("programmeCode");

const programmeLevel =
    document.getElementById("programmeLevel");

const programmeDuration =
    document.getElementById("programmeDuration");

const programmeDepartment =
    document.getElementById("programmeDepartment");

const programmeFormMessage =
    document.getElementById("programmeFormMessage");

const programmeModalTitle =
    document.getElementById("programmeModalTitle");

const saveProgrammeBtn =
    document.getElementById("saveProgrammeBtn");


// =====================================================
// ACADEMIC YEAR MODAL
// =====================================================

const academicYearModal =
    document.getElementById("academicYearModal");

const closeAcademicYearModal =
    document.getElementById("closeAcademicYearModal");

const cancelAcademicYearBtn =
    document.getElementById("cancelAcademicYearBtn");

const academicYearForm =
    document.getElementById("academicYearForm");

const academicYearProgramme =
    document.getElementById("academicYearProgramme");

const academicYearNumber =
    document.getElementById("academicYearNumber");

const academicYearFormMessage =
    document.getElementById("academicYearFormMessage");


// =====================================================
// UNIT MODAL
// =====================================================

const unitModal =
    document.getElementById("unitModal");

const closeUnitModal =
    document.getElementById("closeUnitModal");

const cancelUnitBtn =
    document.getElementById("cancelUnitBtn");

const unitForm =
    document.getElementById("unitForm");

const unitProgramme =
    document.getElementById("unitProgramme");

const unitAcademicYear =
    document.getElementById("unitAcademicYear");

const unitSemester =
    document.getElementById("unitSemester");

const unitCode =
    document.getElementById("unitCode");

const unitName =
    document.getElementById("unitName");

const unitDescription =
    document.getElementById("unitDescription");

const unitCredits =
    document.getElementById("unitCredits");

const unitFormMessage =
    document.getElementById("unitFormMessage");

const saveUnitBtn =
    document.getElementById("saveUnitBtn");


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
// LOAD ADMIN PROFILE
// =====================================================

async function loadAdminProfile() {

    const {
        data: profile,
        error
    } = await supabase
        .from("profiles")
        .select(`
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
        throw error;
    }

    if (
        profile.role !==
        "university_admin"
    ) {

        alert(
            "You do not have permission to access the University Admin Dashboard."
        );

        window.location.href =
            "login.html";

        return false;
    }

    if (!profile.university_id) {

        alert(
            "Your administrator account is not assigned to a university."
        );

        window.location.href =
            "login.html";

        return false;
    }

    currentProfile =
        profile;

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
        throw error;
    }

    universityInfo.innerHTML = `

        <div class="admin-university-details">

            <h3>
                ${university.name || "University"}
            </h3>

            <div class="admin-university-grid">

                <div>
                    <span>
                        University Code
                    </span>

                    <strong>
                        ${
                            university.code ||
                            "Not provided"
                        }
                    </strong>
                </div>

                <div>
                    <span>
                        Email
                    </span>

                    <strong>
                        ${
                            university.email ||
                            "Not provided"
                        }
                    </strong>
                </div>

                <div>
                    <span>
                        Phone
                    </span>

                    <strong>
                        ${
                            university.phone ||
                            "Not provided"
                        }
                    </strong>
                </div>

                <div>
                    <span>
                        Address
                    </span>

                    <strong>
                        ${
                            university.address ||
                            "Not provided"
                        }
                    </strong>
                </div>

            </div>

        </div>
    `;
}


// =====================================================
// LOAD DEPARTMENTS
// =====================================================

async function loadDepartments() {

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
            "name"
        );

    if (error) {
        throw error;
    }

    if (adminDepartmentsCount) {

        adminDepartmentsCount.textContent =
            departments.length;
    }

    if (!departments.length) {

        departmentsList.innerHTML = `
            <div class="admin-card">

                <div class="admin-loading">
                    No departments found.
                </div>

            </div>
        `;

        return;
    }

    departmentsList.innerHTML =
        departments.map(
            function(department) {

                return `

                    <div class="admin-card">

                        <h3>
                            ${department.name}
                        </h3>

                        <p>
                            Department Code:
                            <strong>
                                ${
                                    department.code ||
                                    "N/A"
                                }
                            </strong>
                        </p>

                        <div class="admin-card-actions">

                            <button
                                class="admin-secondary-button edit-department-btn"
                                data-department-id="${department.id}"
                                data-department-name="${department.name}"
                                data-department-code="${
                                    department.code || ""
                                }"
                            >
                                Edit Department
                            </button>

                            <button
                                class="admin-danger-button delete-department-btn"
                                data-department-id="${department.id}"
                                data-department-name="${department.name}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                `;
            }
        ).join("");
}


// =====================================================
// DEPARTMENT EVENTS
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

            if (editButton) {

                editingDepartmentId =
                    editButton.dataset.departmentId;

                departmentName.value =
                    editButton.dataset.departmentName;

                departmentCode.value =
                    editButton.dataset.departmentCode;

                departmentModalTitle.textContent =
                    "Edit Department";

                saveDepartmentBtn.textContent =
                    "Update Department";

                departmentFormMessage.textContent =
                    "";

                departmentModal.classList.add(
                    "active"
                );

                return;
            }

            if (deleteButton) {

                const departmentId =
                    deleteButton.dataset.departmentId;

                const departmentNameValue =
                    deleteButton.dataset.departmentName;

                const confirmed =
                    confirm(
                        `Are you sure you want to delete "${departmentNameValue}"?`
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
                        "Unable to delete department: " +
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
// ADD DEPARTMENT
// =====================================================

if (addDepartmentBtn) {

    addDepartmentBtn.addEventListener(
        "click",
        function() {

            editingDepartmentId =
                null;

            departmentForm.reset();

            departmentModalTitle.textContent =
                "Add Department";

            saveDepartmentBtn.textContent =
                "Save Department";

            departmentFormMessage.textContent =
                "";

            departmentModal.classList.add(
                "active"
            );
        }
    );
}


// =====================================================
// CLOSE DEPARTMENT MODAL
// =====================================================

function closeDepartmentModalWindow() {

    departmentModal.classList.remove(
        "active"
    );
}


if (closeDepartmentModal) {

    closeDepartmentModal.addEventListener(
        "click",
        closeDepartmentModalWindow
    );
}


if (cancelDepartmentBtn) {

    cancelDepartmentBtn.addEventListener(
        "click",
        closeDepartmentModalWindow
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

                closeDepartmentModalWindow();
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

            const name =
                departmentName.value.trim();

            const code =
                departmentCode.value.trim();

            if (!name) {

                departmentFormMessage.textContent =
                    "Please enter a department name.";

                return;
            }

            departmentFormMessage.textContent =
                "Saving department...";

            let error;

            if (editingDepartmentId) {

                const result =
                    await supabase
                        .from("departments")
                        .update({
                            name: name,
                            code: code || null
                        })
                        .eq(
                            "id",
                            editingDepartmentId
                        )
                        .eq(
                            "university_id",
                            currentProfile.university_id
                        );

                error =
                    result.error;

            } else {

                const result =
                    await supabase
                        .from("departments")
                        .insert({
                            university_id:
                                currentProfile.university_id,

                            name:
                                name,

                            code:
                                code || null
                        });

                error =
                    result.error;
            }

            if (error) {

                console.error(
                    "Department save error:",
                    error
                );

                departmentFormMessage.textContent =
                    error.message;

                return;
            }

            departmentFormMessage.textContent =
                editingDepartmentId
                    ? "Department updated successfully."
                    : "Department added successfully.";

            await loadDepartments();

            await loadProgrammeDepartments();

            setTimeout(
                closeDepartmentModalWindow,
                700
            );
        }
    );
}


// =====================================================
// LOAD PROGRAMMES
// =====================================================

async function loadProgrammes() {

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
                university_id
            )
        `)
        .order(
            "name"
        );

    if (error) {
        throw error;
    }

    const universityProgrammes =
        programmes.filter(
            function(programme) {

                return (
                    programme.departments
                        ?.university_id ===
                    currentProfile.university_id
                );
            }
        );

    if (adminProgrammesCount) {

        adminProgrammesCount.textContent =
            universityProgrammes.length;
    }

    if (!universityProgrammes.length) {

        programmesList.innerHTML = `
            <div class="admin-card">

                <div class="admin-loading">
                    No programmes found.
                </div>

            </div>
        `;

        return;
    }

    programmesList.innerHTML =
        universityProgrammes.map(
            function(programme) {

                return `

                    <div class="admin-card">

                        <h3>
                            ${programme.name}
                        </h3>

                        <p>
                            Code:
                            <strong>
                                ${
                                    programme.code ||
                                    "N/A"
                                }
                            </strong>
                        </p>

                        <p>
                            Department:
                            <strong>
                                ${
                                    programme.departments?.name ||
                                    "Not assigned"
                                }
                            </strong>
                        </p>

                        <p>
                            Level:
                            <strong>
                                ${
                                    programme.level ||
                                    "N/A"
                                }
                            </strong>
                        </p>

                        <p>
                            Duration:
                            <strong>
                                ${
                                    programme.duration_years ||
                                    "N/A"
                                }

                                ${
                                    programme.duration_years
                                        ? " years"
                                        : ""
                                }
                            </strong>
                        </p>

                        <div class="admin-card-actions">

                            <button
                                class="admin-secondary-button edit-programme-btn"

                                data-programme-id="${programme.id}"

                                data-programme-name="${programme.name}"

                                data-programme-code="${
                                    programme.code || ""
                                }"

                                data-programme-level="${
                                    programme.level || ""
                                }"

                                data-programme-duration="${
                                    programme.duration_years || ""
                                }"

                                data-programme-department="${
                                    programme.department_id
                                }"
                            >
                                Edit Programme
                            </button>

                            <button
                                class="admin-danger-button delete-programme-btn"

                                data-programme-id="${programme.id}"

                                data-programme-name="${programme.name}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                `;
            }
        ).join("");
}


// =====================================================
// LOAD PROGRAMME DEPARTMENTS
// =====================================================

async function loadProgrammeDepartments() {

    if (!programmeDepartment) {
        return;
    }

    const {
        data: departments,
        error
    } = await supabase
        .from("departments")
        .select(`
            id,
            name
        `)
        .eq(
            "university_id",
            currentProfile.university_id
        )
        .order(
            "name"
        );

    if (error) {

        console.error(
            "Department loading error:",
            error
        );

        programmeDepartment.innerHTML = `
            <option value="">
                Unable to load departments
            </option>
        `;

        return;
    }

    programmeDepartment.innerHTML = `
        <option value="">
            Select department
        </option>
    `;

    departments.forEach(
        function(department) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                department.id;

            option.textContent =
                department.name;

            programmeDepartment.appendChild(
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

            programmeForm.reset();

            programmeModalTitle.textContent =
                "Add Programme";

            saveProgrammeBtn.textContent =
                "Save Programme";

            programmeFormMessage.textContent =
                "";

            await loadProgrammeDepartments();

            programmeModal.classList.add(
                "active"
            );
        }
    );
}


// =====================================================
// CLOSE PROGRAMME MODAL
// =====================================================

function closeProgrammeModalWindow() {

    programmeModal.classList.remove(
        "active"
    );
}


if (closeProgrammeModal) {

    closeProgrammeModal.addEventListener(
        "click",
        closeProgrammeModalWindow
    );
}


if (cancelProgrammeBtn) {

    cancelProgrammeBtn.addEventListener(
        "click",
        closeProgrammeModalWindow
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

                closeProgrammeModalWindow();
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
                programmeName.value.trim();

            const code =
                programmeCode.value.trim();

            const level =
                programmeLevel.value;

            const duration =
                Number(
                    programmeDuration.value
                );

            const departmentId =
                programmeDepartment.value;

            if (
                !name ||
                !level ||
                !duration ||
                !departmentId
            ) {

                programmeFormMessage.textContent =
                    "Please complete all required fields.";

                return;
            }

            programmeFormMessage.textContent =
                "Saving programme...";

            let error;

            if (editingProgrammeId) {

                const result =
                    await supabase
                        .from("programmes")
                        .update({
                            department_id:
                                departmentId,

                            name:
                                name,

                            code:
                                code || null,

                            level:
                                level,

                            duration_years:
                                duration
                        })
                        .eq(
                            "id",
                            editingProgrammeId
                        );

                error =
                    result.error;

            } else {

                const result =
                    await supabase
                        .from("programmes")
                        .insert({
                            department_id:
                                departmentId,

                            name:
                                name,

                            code:
                                code || null,

                            level:
                                level,

                            duration_years:
                                duration
                        });

                error =
                    result.error;
            }

            if (error) {

                console.error(
                    "Programme save error:",
                    error
                );

                programmeFormMessage.textContent =
                    error.message;

                return;
            }

            programmeFormMessage.textContent =
                editingProgrammeId
                    ? "Programme updated successfully."
                    : "Programme added successfully.";

            await loadProgrammes();

            setTimeout(
                closeProgrammeModalWindow,
                700
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

            if (editButton) {

                editingProgrammeId =
                    editButton.dataset.programmeId;

                programmeName.value =
                    editButton.dataset.programmeName;

                programmeCode.value =
                    editButton.dataset.programmeCode;

                programmeLevel.value =
                    editButton.dataset.programmeLevel;

                programmeDuration.value =
                    editButton.dataset.programmeDuration;

                await loadProgrammeDepartments();

                programmeDepartment.value =
                    editButton.dataset.programmeDepartment;

                programmeModalTitle.textContent =
                    "Edit Programme";

                saveProgrammeBtn.textContent =
                    "Update Programme";

                programmeFormMessage.textContent =
                    "";

                programmeModal.classList.add(
                    "active"
                );

                return;
            }

            if (deleteButton) {

                const programmeId =
                    deleteButton.dataset.programmeId;

                const programmeNameValue =
                    deleteButton.dataset.programmeName;

                const confirmed =
                    confirm(
                        `Are you sure you want to delete "${programmeNameValue}"?`
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
                    );

                if (error) {

                    console.error(
                        "Programme deletion error:",
                        error
                    );

                    alert(
                        "Unable to delete programme: " +
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
            "unit_code"
        );

    if (error) {
        throw error;
    }

    const universityUnits =
        (units || []).filter(
            function(unit) {

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

    if (!universityUnits.length) {

        unitsList.innerHTML = `
            <div class="admin-loading">
                No units found.
            </div>
        `;

        return;
    }

    unitsList.innerHTML = `

        <div class="admin-unit-list">

            ${
                universityUnits.map(
                    function(unit) {

                        return `

                            <div class="admin-unit-row">

                                <div>

                                    <strong>
                                        ${unit.unit_code}
                                    </strong>

                                    <span>
                                        ${unit.unit_name}
                                    </span>

                                </div>

                                <div>

                                    ${
                                        unit.credit_hours ||
                                        0
                                    }

                                    Credits

                                </div>

                            </div>

                        `;
                    }
                ).join("")
            }

        </div>
    `;
}


// =====================================================
// LOAD ACADEMIC STRUCTURE
// =====================================================

async function loadAcademicStructure() {

    academicStructureList.innerHTML = `
        <div class="admin-loading">
            Loading academic structure...
        </div>
    `;

    const {
        data: programmes,
        error
    } = await supabase
        .from("programmes")
        .select(`
            id,
            name,
            department_id,

            departments (
                university_id
            )
        `)
        .order(
            "name"
        );

    if (error) {

        console.error(
            "Academic structure programme error:",
            error
        );

        academicStructureList.innerHTML = `
            <div class="admin-loading">
                Unable to load academic structure.
            </div>
        `;

        return;
    }

    const universityProgrammes =
        programmes.filter(
            function(programme) {

                return (
                    programme.departments
                        ?.university_id ===
                    currentProfile.university_id
                );
            }
        );

    if (!universityProgrammes.length) {

        academicStructureList.innerHTML = `
            <div class="admin-loading">
                No programmes found.
            </div>
        `;

        return;
    }

    const programmeIds =
        universityProgrammes.map(
            function(programme) {

                return programme.id;
            }
        );

    const {
        data: academicYears,
        error: yearsError
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
            "year_number"
        );

    if (yearsError) {

        console.error(
            "Academic years loading error:",
            yearsError
        );

        academicStructureList.innerHTML = `
            <div class="admin-loading">
                Unable to load academic years.
            </div>
        `;

        return;
    }

    const academicYearIds =
        academicYears.map(
            function(year) {

                return year.id;
            }
        );

    let semesters = [];

    if (academicYearIds.length) {

        const {
            data: semesterData,
            error: semesterError
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
                "semester_number"
            );

        if (semesterError) {

            console.error(
                "Semester loading error:",
                semesterError
            );

            return;
        }

        semesters =
            semesterData || [];
    }

    const semesterIds =
        semesters.map(
            function(semester) {

                return semester.id;
            }
        );

    let units = [];

    if (semesterIds.length) {

        const {
            data: unitData,
            error: unitError
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
                "unit_code"
            );

        if (unitError) {

            console.error(
                "Academic structure unit error:",
                unitError
            );

            return;
        }

        units =
            unitData || [];
    }

    academicStructureList.innerHTML =
        universityProgrammes.map(
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

                return `

                    <div class="admin-card">

                        <h3>
                            ${programme.name}
                        </h3>

                        ${
                            programmeYears.length
                                ? `

                                    <div class="academic-years-list">

                                        ${
                                            programmeYears.map(
                                                function(year) {

                                                    const yearSemesters =
                                                        semesters.filter(
                                                            function(semester) {

                                                                return (
                                                                    semester.academic_year_id ===
                                                                    year.id
                                                                );
                                                            }
                                                        );

                                                    return `

                                                        <div class="academic-year-item">

                                                            <strong>
                                                                Year ${year.year_number}
                                                            </strong>

                                                            <div class="academic-semesters-list">

                                                                ${
                                                                    yearSemesters.length
                                                                        ? yearSemesters.map(
                                                                            function(semester) {

                                                                                const semesterUnits =
                                                                                    units.filter(
                                                                                        function(unit) {

                                                                                            return (
                                                                                                unit.semester_id ===
                                                                                                semester.id
                                                                                            );
                                                                                        }
                                                                                    );

                                                                                return `

                                                                                    <div class="academic-semester-item">

                                                                                        <strong>
                                                                                            Semester ${semester.semester_number}
                                                                                        </strong>

                                                                                        ${
                                                                                            semesterUnits.length
                                                                                                ? `

                                                                                                    <div class="academic-units-list">

                                                                                                        ${
                                                                                                            semesterUnits.map(
                                                                                                                function(unit) {

                                                                                                                    return `

                                                                                                                        <div class="academic-unit-item">

                                                                                                                            <div>

                                                                                                                                <strong>
                                                                                                                                    ${unit.unit_code}
                                                                                                                                </strong>

                                                                                                                                <span>
                                                                                                                                    ${unit.unit_name}
                                                                                                                                </span>

                                                                                                                            </div>

                                                                                                                            <span>
                                                                                                                                ${
                                                                                                                                    unit.credit_hours ||
                                                                                                                                    0
                                                                                                                                }

                                                                                                                                Credits
                                                                                                                            </span>

                                                                                                                        </div>

                                                                                                                    `;
                                                                                                                }
                                                                                                            ).join("")
                                                                                                        }

                                                                                                    </div>

                                                                                                `
                                                                                                : `

                                                                                                    <p>
                                                                                                        No units registered for this semester.
                                                                                                    </p>

                                                                                                `
                                                                                        }

                                                                                    </div>

                                                                                `;
                                                                            }
                                                                        ).join("")
                                                                        : `

                                                                            <p>
                                                                                No semesters found.
                                                                            </p>

                                                                        `
                                                                }

                                                            </div>

                                                        </div>

                                                    `;
                                                }
                                            ).join("")
                                        }

                                    </div>

                                `
                                : `

                                    <p>
                                        No academic years added yet.
                                    </p>

                                `
                        }

                    </div>

                `;
            }
        ).join("");
}


// =====================================================
// LOAD ACADEMIC YEAR PROGRAMMES
// =====================================================

async function loadAcademicYearProgrammes() {

    const {
        data: programmes,
        error
    } = await supabase
        .from("programmes")
        .select(`
            id,
            name,

            departments (
                university_id
            )
        `)
        .order(
            "name"
        );

    if (error) {

        console.error(
            "Academic programme loading error:",
            error
        );

        academicYearProgramme.innerHTML = `
            <option value="">
                Unable to load programmes
            </option>
        `;

        return;
    }

    const universityProgrammes =
        programmes.filter(
            function(programme) {

                return (
                    programme.departments
                        ?.university_id ===
                    currentProfile.university_id
                );
            }
        );

    academicYearProgramme.innerHTML = `
        <option value="">
            Select programme
        </option>
    `;

    universityProgrammes.forEach(
        function(programme) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                programme.id;

            option.textContent =
                programme.name;

            academicYearProgramme.appendChild(
                option
            );
        }
    );
}


// =====================================================
// MANAGE ACADEMIC YEAR
// =====================================================

if (manageAcademicBtn) {

    manageAcademicBtn.addEventListener(
        "click",
        async function() {

            academicYearForm.reset();

            academicYearFormMessage.textContent =
                "";

            await loadAcademicYearProgrammes();

            academicYearModal.classList.add(
                "active"
            );
        }
    );
}


// =====================================================
// CLOSE ACADEMIC YEAR MODAL
// =====================================================

function closeAcademicYearModalWindow() {

    academicYearModal.classList.remove(
        "active"
    );
}


if (closeAcademicYearModal) {

    closeAcademicYearModal.addEventListener(
        "click",
        closeAcademicYearModalWindow
    );
}


if (cancelAcademicYearBtn) {

    cancelAcademicYearBtn.addEventListener(
        "click",
        closeAcademicYearModalWindow
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

                closeAcademicYearModalWindow();
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
                academicYearProgramme.value;

            const yearNumber =
                Number(
                    academicYearNumber.value
                );

            if (
                !programmeId ||
                !yearNumber
            ) {

                academicYearFormMessage.textContent =
                    "Please select a programme and enter a year.";

                return;
            }

            academicYearFormMessage.textContent =
                "Saving academic year...";

            const {
                error
            } = await supabase
                .from("academic_years")
                .insert({
                    programme_id:
                        programmeId,

                    year_number:
                        yearNumber
                });

            if (error) {

                console.error(
                    "Academic year creation error:",
                    error
                );

                academicYearFormMessage.textContent =
                    error.message;

                return;
            }

            academicYearFormMessage.textContent =
                "Academic year added successfully.";

            await loadAcademicStructure();

            setTimeout(
                closeAcademicYearModalWindow,
                700
            );
        }
    );
}


// =====================================================
// LOAD UNIT PROGRAMMES
// =====================================================

async function loadUnitProgrammes() {

    unitProgramme.innerHTML = `
        <option value="">
            Select programme
        </option>
    `;

    unitAcademicYear.innerHTML = `
        <option value="">
            Select academic year
        </option>
    `;

    unitSemester.innerHTML = `
        <option value="">
            Select semester
        </option>
    `;

    unitAcademicYear.disabled =
        true;

    unitSemester.disabled =
        true;

    const {
        data: programmes,
        error
    } = await supabase
        .from("programmes")
        .select(`
            id,
            name,

            departments (
                university_id
            )
        `)
        .order(
            "name"
        );

    if (error) {

        console.error(
            "Unit programme loading error:",
            error
        );

        return;
    }

    const universityProgrammes =
        programmes.filter(
            function(programme) {

                return (
                    programme.departments
                        ?.university_id ===
                    currentProfile.university_id
                );
            }
        );

    universityProgrammes.forEach(
        function(programme) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                programme.id;

            option.textContent =
                programme.name;

            unitProgramme.appendChild(
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

    unitAcademicYear.innerHTML = `
        <option value="">
            Select academic year
        </option>
    `;

    unitSemester.innerHTML = `
        <option value="">
            Select semester
        </option>
    `;

    unitAcademicYear.disabled =
        true;

    unitSemester.disabled =
        true;

    if (!programmeId) {
        return;
    }

    const {
        data: academicYears,
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
            "year_number"
        );

    if (error) {

        console.error(
            "Academic year loading error:",
            error
        );

        return;
    }

    academicYears.forEach(
        function(year) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                year.id;

            option.textContent =
                `Year ${year.year_number}`;

            unitAcademicYear.appendChild(
                option
            );
        }
    );

    unitAcademicYear.disabled =
        false;
}


// =====================================================
// LOAD UNIT SEMESTERS
// =====================================================

async function loadUnitSemesters(
    academicYearId
) {

    unitSemester.innerHTML = `
        <option value="">
            Select semester
        </option>
    `;

    unitSemester.disabled =
        true;

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
            "semester_number"
        );

    if (error) {

        console.error(
            "Semester loading error:",
            error
        );

        return;
    }

    semesters.forEach(
        function(semester) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                semester.id;

            option.textContent =
                `Semester ${semester.semester_number}`;

            unitSemester.appendChild(
                option
            );
        }
    );

    unitSemester.disabled =
        false;
}


// =====================================================
// UNIT PROGRAMME CHANGE
// =====================================================

if (unitProgramme) {

    unitProgramme.addEventListener(
        "change",
        async function() {

            await loadUnitAcademicYears(
                unitProgramme.value
            );
        }
    );
}


// =====================================================
// UNIT YEAR CHANGE
// =====================================================

if (unitAcademicYear) {

    unitAcademicYear.addEventListener(
        "change",
        async function() {

            await loadUnitSemesters(
                unitAcademicYear.value
            );
        }
    );
}


// =====================================================
// ADD UNIT
// =====================================================

if (addUnitBtn) {

    addUnitBtn.addEventListener(
        "click",
        async function() {

            unitForm.reset();

            unitFormMessage.textContent =
                "";

            await loadUnitProgrammes();

            unitModal.classList.add(
                "active"
            );
        }
    );
}


// =====================================================
// CLOSE UNIT MODAL
// =====================================================

function closeUnitModalWindow() {

    unitModal.classList.remove(
        "active"
    );
}


if (closeUnitModal) {

    closeUnitModal.addEventListener(
        "click",
        closeUnitModalWindow
    );
}


if (cancelUnitBtn) {

    cancelUnitBtn.addEventListener(
        "click",
        closeUnitModalWindow
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

                closeUnitModalWindow();
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
                unitSemester.value;

            const code =
                unitCode.value
                    .trim()
                    .toUpperCase();

            const name =
                unitName.value.trim();

            const description =
                unitDescription.value.trim();

            const credits =
                Number(
                    unitCredits.value
                );

            if (
                !semesterId ||
                !code ||
                !name ||
                !credits
            ) {

                unitFormMessage.textContent =
                    "Please complete all required fields.";

                return;
            }

            unitFormMessage.textContent =
                "Saving unit...";

            const {
                error
            } = await supabase
                .from("units")
                .insert({
                    semester_id:
                        semesterId,

                    unit_code:
                        code,

                    unit_name:
                        name,

                    unit_description:
                        description ||
                        null,

                    credit_hours:
                        credits
                });

            if (error) {

                console.error(
                    "Unit creation error:",
                    error
                );

                unitFormMessage.textContent =
                    error.message;

                return;
            }

            unitFormMessage.textContent =
                "Unit added successfully.";

            await loadUnits();

            await loadAcademicStructure();

            setTimeout(
                closeUnitModalWindow,
                700
            );
        }
    );
}


// =====================================================
// LOAD STUDENT COUNT
// =====================================================

async function loadStudentCount() {

    const {
        count,
        error
    } = await supabase
        .from("profiles")
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
            "university_id",
            currentProfile.university_id
        )
        .eq(
            "role",
            "student"
        );

    if (error) {
        throw error;
    }

    adminStudentsCount.textContent =
        count || 0;
}


// =====================================================
// LOAD STUDENTS
// =====================================================

async function loadStudents() {

    const studentsList =
        document.getElementById(
            "studentsList"
        );

    if (!studentsList) {
        return;
    }

    studentsList.innerHTML = `
        <div class="admin-loading">
            Loading students...
        </div>
    `;

    const {
        data: students,
        error: studentsError
    } = await supabase
        .from("profiles")
        .select(`
            id,
            full_name
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
            "full_name"
        );

    if (studentsError) {

        console.error(
            "Student loading error:",
            studentsError
        );

        studentsList.innerHTML = `
            <div class="admin-loading">
                Unable to load students.
            </div>
        `;

        return;
    }

    if (!students.length) {

        studentsList.innerHTML = `
            <div class="admin-loading">
                No students found.
            </div>
        `;

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
            programme_id,
            admission_number,
            admission_year,
            status,

            programmes (
                id,
                name,

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

        studentsList.innerHTML = `
            <div class="admin-loading">
                Unable to load student academic information.
            </div>
        `;

        return;
    }

    studentsList.innerHTML =
        students.map(
            function(student) {

                const registration =
                    (
                        studentProgrammes ||
                        []
                    ).find(
                        function(item) {

                            return (
                                item.student_id ===
                                student.id
                            );
                        }
                    );

                const programme =
                    registration?.programmes;

                return `

                    <div class="admin-card">

                        <div class="admin-section-heading">

                            <div>

                                <h3>
                                    ${
                                        student.full_name ||
                                        "Unnamed Student"
                                    }
                                </h3>

                                <p>
                                    ${
                                        registration?.admission_number ||
                                        "Admission number not assigned"
                                    }
                                </p>

                            </div>

                        </div>

                        <div class="admin-grid">

                            <div>

                                <strong>
                                    Programme
                                </strong>

                                <p>
                                    ${
                                        programme?.name ||
                                        "Not assigned"
                                    }
                                </p>

                            </div>

                            <div>

                                <strong>
                                    Department
                                </strong>

                                <p>
                                    ${
                                        programme?.departments?.name ||
                                        "Not assigned"
                                    }
                                </p>

                            </div>

                            <div>

                                <strong>
                                    Admission Year
                                </strong>

                                <p>
                                    ${
                                        registration?.admission_year ||
                                        "Not provided"
                                    }
                                </p>

                            </div>

                            <div>

                                <strong>
                                    Status
                                </strong>

                                <p>
                                    ${
                                        registration?.status ||
                                        "Not registered"
                                    }
                                </p>

                            </div>

                        </div>

                    </div>

                `;
            }
        ).join("");
}


// =====================================================
// LOAD APPLICATIONS
// =====================================================

async function loadApplications() {

    if (!applicationsList) {
        return;
    }

    applicationsList.innerHTML = `
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
            applicant_id,
            programme_id,
            admission_year,
            application_status,
            application_date,
            rejection_reason,
            reviewed_at,

            profiles!university_applications_applicant_id_fkey (
                full_name
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
            "university_id",
            currentProfile.university_id
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

        applicationsList.innerHTML = `
            <div class="admin-loading">

                Unable to load applications.

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

        applicationsList.innerHTML = `
            <div class="admin-loading">
                No applications found.
            </div>
        `;

        return;
    }

    applicationsList.innerHTML =
        applications.map(
            function(application) {

                const studentName =
                    application.profiles?.full_name ||
                    "Unknown Applicant";

                const programme =
                    application.programmes;

                const department =
                    programme?.departments;

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

                        <div class="admin-section-heading">

                            <div>

                                <h3>
                                    ${studentName}
                                </h3>

                                <p>
                                    ${
                                        programme?.name ||
                                        "Programme not found"
                                    }
                                </p>

                            </div>

                            <div
                                class="${statusClass}"
                            >
                                ${status}
                            </div>

                        </div>

                        <div class="admin-grid">

                            <div>

                                <strong>
                                    Programme Code
                                </strong>

                                <p>
                                    ${
                                        programme?.code ||
                                        "Not available"
                                    }
                                </p>

                            </div>

                            <div>

                                <strong>
                                    Department
                                </strong>

                                <p>
                                    ${
                                        department?.name ||
                                        "Not available"
                                    }
                                </p>

                            </div>

                            <div>

                                <strong>
                                    Admission Year
                                </strong>

                                <p>
                                    ${
                                        application.admission_year
                                    }
                                </p>

                            </div>

                            <div>

                                <strong>
                                    Application Date
                                </strong>

                                <p>
                                    ${
                                        application.application_date
                                            ? new Date(
                                                application.application_date
                                            ).toLocaleDateString()
                                            : "Not available"
                                    }
                                </p>

                            </div>

                        </div>


                        ${
                            status === "rejected" &&
                            application.rejection_reason

                                ? `

                                    <div
                                        class="admin-form-message"
                                    >

                                        <strong>
                                            Rejection Reason
                                        </strong>

                                        <p>
                                            ${
                                                application.rejection_reason
                                            }
                                        </p>

                                    </div>

                                `
                                : ""
                        }


                        ${
                            status === "pending"

                                ? `

                                    <div class="admin-card-actions">

                                        <button
                                            class="admin-primary-button approve-application-btn"

                                            data-application-id="${application.id}"
                                        >
                                            ✓ Approve Application
                                        </button>

                                        <button
                                            class="admin-danger-button reject-application-btn"

                                            data-application-id="${application.id}"
                                        >
                                            ✕ Reject Application
                                        </button>

                                    </div>

                                `
                                : ""
                        }


                    </div>

                `;
            }
        ).join("");


    // =================================================
    // APPROVE BUTTONS
    // =================================================

    const approveButtons =
        applicationsList.querySelectorAll(
            ".approve-application-btn"
        );

    approveButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                async function() {

                    const applicationId =
                        button.dataset.applicationId;

                    await approveApplication(
                        applicationId,
                        button
                    );
                }
            );
        }
    );


    // =================================================
    // REJECT BUTTONS
    // =================================================

    const rejectButtons =
        applicationsList.querySelectorAll(
            ".reject-application-btn"
        );

    rejectButtons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                async function() {

                    const applicationId =
                        button.dataset.applicationId;

                    await rejectApplication(
                        applicationId,
                        button
                    );
                }
            );
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

    const confirmed =
        confirm(
            "Are you sure you want to approve this application?"
        );

    if (!confirmed) {
        return;
    }

    button.disabled =
        true;

    button.textContent =
        "Approving...";

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

        button.disabled =
            false;

        button.textContent =
            "✓ Approve Application";

        return;
    }

    console.log(
        "Application approved:",
        data
    );

    alert(
        "Application approved successfully.\n\n" +
        "Admission Number: " +
        data.admission_number
    );

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

    const reason =
        prompt(
            "Enter the reason for rejecting this application:"
        );


    // User cancelled

    if (reason === null) {
        return;
    }


    // Reason is required

    const trimmedReason =
        reason.trim();

    if (!trimmedReason) {

        alert(
            "A rejection reason is required."
        );

        return;
    }


    button.disabled =
        true;

    button.textContent =
        "Rejecting...";


    // =================================================
    // CALL SECURE DATABASE FUNCTION
    // =================================================

    const {
        data,
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

        button.disabled =
            false;

        button.textContent =
            "✕ Reject Application";

        return;
    }


    console.log(
        "Application rejected:",
        data
    );


    alert(
        "Application rejected successfully."
    );


    await loadApplications();
}


// =====================================================
// LOAD LECTURER COUNT
// =====================================================

async function loadLecturerCount() {

    const {
        count,
        error
    } = await supabase
        .from("profiles")
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
            "university_id",
            currentProfile.university_id
        )
        .eq(
            "role",
            "lecturer"
        );

    if (error) {
        throw error;
    }

    adminLecturersCount.textContent =
        count || 0;
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
            } =
                await supabase.auth.signOut();

            if (error) {

                console.error(
                    "Logout error:",
                    error
                );

                return;
            }

            window.location.href =
                "login.html";
        }
    );
}


// =====================================================
// INITIALISE ADMIN DASHBOARD
// =====================================================

async function initialiseAdminDashboard() {

    try {

        const user =
            await getCurrentUser();

        if (!user) {
            return;
        }

        const isAdmin =
            await loadAdminProfile();

        if (!isAdmin) {
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

    } catch (error) {

        console.error(
            "Admin dashboard error:",
            error
        );

        if (universityInfo) {

            universityInfo.innerHTML = `
                <p>
                    Unable to load university information.
                </p>
            `;
        }
    }
}


// =====================================================
// START DASHBOARD
// =====================================================

initialiseAdminDashboard();