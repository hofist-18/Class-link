import { supabase } from "./app.js";


// =====================================================
// CLASSLINK UNIVERSITY ADMIN DASHBOARD
// MAIN DOM ELEMENTS
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
// MAIN BUTTONS
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
// GLOBAL STATE
// =====================================================

let currentUser = null;

let currentProfile = null;

let currentUniversity = null;

let currentUniversityName = "University";

let editingDepartmentId = null;

let editingProgrammeId = null;


// =====================================================
// HELPER FUNCTIONS
// =====================================================

function escapeAdminHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showAdminMessage(element, message, type = "error") {

    if (!element) return;

    element.textContent = message;

    element.className =
        `admin-form-message ${type}`;

    element.style.display = "block";
}


function clearAdminMessage(element) {

    if (!element) return;

    element.textContent = "";

    element.style.display = "none";
}


function showAdminModal(modal) {

    if (!modal) return;

    modal.classList.add("active");

    modal.style.display = "flex";
}


function hideAdminModal(modal) {

    if (!modal) return;

    modal.classList.remove("active");

    modal.style.display = "none";
}


// =====================================================
// GET CURRENT AUTHENTICATED USER
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

        window.location.href = "login.html";

        return null;
    }

    currentUser = user;

    return user;
}
// =====================================================
// LOAD ADMIN PROFILE
// =====================================================

async function loadAdminProfile() {

    if (!currentUser) return null;

    const {
        data: profile,
        error
    } = await supabase
        .from("profiles")
        .select(`
            id,
            full_name,
            role,
            university_id,
            profile_photo_url
        `)
        .eq("id", currentUser.id)
        .single();

    if (error) {
        throw error;
    }

    if (!profile) {
        throw new Error("Administrator profile not found.");
    }

    // =================================================
    // SUPER ADMIN UNIVERSITY VIEWING MODE
    // =================================================

    if (profile.role === "super_admin") {

        const params = new URLSearchParams(
            window.location.search
        );

        const selectedUniversityId =
            params.get("university_id");

        if (!selectedUniversityId) {

            window.location.replace(
                "super-admin-dashboard.html"
            );

            return null;
        }

        const {
            data: university,
            error: universityError
        } = await supabase
            .from("universities")
            .select("id, name")
            .eq("id", selectedUniversityId)
            .single();

        if (universityError || !university) {

            console.error(
                "Could not load selected university:",
                universityError
            );

            window.location.replace(
                "super-admin-dashboard.html"
            );

            return null;
        }

        // Keep the real Super Admin role.
        // Only change the dashboard viewing context.

        currentProfile = {
            ...profile,
            university_id: university.id,
            university_name: university.name,
            viewing_as_super_admin: true
        };

        // DISPLAY SELECTED UNIVERSITY

        if (adminName) {

            adminName.textContent =
                "Super Admin — " + university.name;

        }

        // CREATE RETURN BUTTON

        let returnButton = document.getElementById(
            "returnToSuperAdminButton"
        );

        if (!returnButton) {

            returnButton = document.createElement("button");

            returnButton.id =
                "returnToSuperAdminButton";

            returnButton.textContent =
                "← Return to Super Admin Dashboard";

            returnButton.className =
                "secondary-button";

            returnButton.style.marginBottom =
                "15px";

            returnButton.addEventListener("click", () => {

                window.location.href =
                    "super-admin-dashboard.html";

            });

            if (adminName?.parentElement) {

                adminName.parentElement.appendChild(
                    returnButton
                );

            }

        }

        return currentProfile;
    }

    // =================================================
    // NORMAL UNIVERSITY ADMIN ACCESS
    // =================================================

    if (profile.role !== "university_admin") {

        window.location.replace("login.html");

        return null;
    }

    currentProfile = profile;

    if (adminName) {

        adminName.textContent =
            profile.full_name || "Administrator";

    }

    return profile;

}
// =====================================================
// LOAD UNIVERSITY INFORMATION
// =====================================================

async function loadUniversity() {

    if (!currentProfile?.university_id) {
        throw new Error(
            "Your administrator account is not linked to a university."
        );
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
        .eq("id", currentProfile.university_id)
        .single();

    if (error) {
        throw error;
    }

    currentUniversity = university;

    currentUniversityName =
        university.name || "University";

    if (universityInfo) {

        universityInfo.innerHTML = `
            <h3>${escapeAdminHtml(university.name)}</h3>
            <p>Code: ${escapeAdminHtml(university.code || "N/A")}</p>
            <p>${escapeAdminHtml(university.email || "")}</p>
            <p>${escapeAdminHtml(university.phone || "")}</p>
            <p>${escapeAdminHtml(university.address || "")}</p>
        `;
    }

    return university;
}


// =====================================================
// GET CURRENT UNIVERSITY NAME
// =====================================================

function getCurrentUniversityName() {

    return currentUniversityName;
}

// =====================================================
// PART 2: DEPARTMENT MANAGEMENT
// =====================================================


// LOAD DEPARTMENTS
async function loadDepartments() {

    if (!currentProfile?.university_id) return;

    const {
        data: departments,
        error
    } = await supabase
        .from("departments")
        .select("id, name, code, university_id, created_at")
        .eq("university_id", currentProfile.university_id)
        .order("name");

    if (error) {
        console.error("Error loading departments:", error);

        if (departmentsList) {
            departmentsList.innerHTML =
                "<p>Could not load departments.</p>";
        }

        return;
    }

    if (adminDepartmentsCount) {
        adminDepartmentsCount.textContent =
            departments.length;
    }

    if (!departmentsList) return;

    if (!departments.length) {
        departmentsList.innerHTML =
            "<p>No departments have been added yet.</p>";
    } else {

        departmentsList.innerHTML = departments.map(department => `

            <div class="admin-record-card">

                <div class="admin-record-info">

                    <h3>
                        ${escapeAdminHtml(department.name)}
                    </h3>

                    <p>
                        Department Code:
                        ${escapeAdminHtml(department.code || "N/A")}
                    </p>

                </div>

                <div class="admin-record-actions">

                    <button
                        type="button"
                        class="admin-edit-btn"
                        data-edit-department="${department.id}">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="admin-delete-btn"
                        data-delete-department="${department.id}">
                        Delete
                    </button>

                </div>

            </div>

        `).join("");
    }

    await loadDepartmentDropdowns(departments);

}


// LOAD DEPARTMENTS INTO PROGRAMME DROPDOWN
async function loadDepartmentDropdowns(departments = null) {

    if (!departments) {

        const {
            data,
            error
        } = await supabase
            .from("departments")
            .select("id, name, code")
            .eq("university_id", currentProfile.university_id)
            .order("name");

        if (error) {
            console.error(error);
            return;
        }

        departments = data || [];
    }

    if (!programmeDepartment) return;

    const previousValue = programmeDepartment.value;

    programmeDepartment.innerHTML = `
        <option value="">Select Department</option>

        ${departments.map(department => `

            <option value="${department.id}">
                ${escapeAdminHtml(department.name)}
            </option>

        `).join("")}
    `;

    if (departments.some(d => d.id === previousValue)) {
        programmeDepartment.value = previousValue;
    }

}


// OPEN DEPARTMENT MODAL
function openDepartmentModal(department = null) {

    if (!departmentForm) return;

    departmentForm.reset();

    clearAdminMessage(departmentFormMessage);

    editingDepartmentId = department?.id || null;

    if (departmentModalTitle) {

        departmentModalTitle.textContent =
            department ? "Edit Department" : "Add Department";

    }

    if (departmentName) {
        departmentName.value = department?.name || "";
    }

    if (departmentCode) {
        departmentCode.value = department?.code || "";
    }

    if (saveDepartmentBtn) {
        saveDepartmentBtn.textContent =
            department ? "Update Department" : "Save Department";
    }

    showAdminModal(departmentModal);

}


// CLOSE DEPARTMENT MODAL
function closeDepartmentForm() {

    hideAdminModal(departmentModal);

    editingDepartmentId = null;

    if (departmentForm) {
        departmentForm.reset();
    }

    clearAdminMessage(departmentFormMessage);

}


// ADD DEPARTMENT BUTTON
addDepartmentBtn?.addEventListener("click", function () {

    openDepartmentModal();

});


// CLOSE DEPARTMENT BUTTONS
closeDepartmentModal?.addEventListener(
    "click",
    closeDepartmentForm
);

cancelDepartmentBtn?.addEventListener(
    "click",
    closeDepartmentForm
);


// SAVE OR UPDATE DEPARTMENT
departmentForm?.addEventListener("submit", async function (event) {

    event.preventDefault();

    clearAdminMessage(departmentFormMessage);

    const name = departmentName?.value.trim();

    const code = departmentCode?.value.trim();

    if (!name) {

        showAdminMessage(
            departmentFormMessage,
            "Please enter the department name."
        );

        return;
    }

    if (!currentProfile?.university_id) return;

    if (saveDepartmentBtn) {
        saveDepartmentBtn.disabled = true;
        saveDepartmentBtn.textContent = "Saving...";
    }

    try {

        const departmentData = {
            name,
            code: code || null,
            university_id: currentProfile.university_id
        };

        let result;

        if (editingDepartmentId) {

            result = await supabase
                .from("departments")
                .update({
                    name,
                    code: code || null
                })
                .eq("id", editingDepartmentId)
                .eq("university_id", currentProfile.university_id);

        } else {

            result = await supabase
                .from("departments")
                .insert([departmentData]);

        }

        if (result.error) {
            throw result.error;
        }

        showAdminMessage(
            departmentFormMessage,
            editingDepartmentId
                ? "Department updated successfully."
                : "Department added successfully.",
            "success"
        );

        await loadDepartments();

        setTimeout(closeDepartmentForm, 800);

    } catch (error) {

        console.error("Department save error:", error);

        showAdminMessage(
            departmentFormMessage,
            error.message || "Could not save department."
        );

    } finally {

        if (saveDepartmentBtn) {
            saveDepartmentBtn.disabled = false;
            saveDepartmentBtn.textContent = "Save Department";
        }

    }

});


// DEPARTMENT EDIT AND DELETE BUTTONS
departmentsList?.addEventListener("click", async function (event) {

    const editButton = event.target.closest(
        "[data-edit-department]"
    );

    const deleteButton = event.target.closest(
        "[data-delete-department]"
    );

    if (editButton) {

        const departmentId =
            editButton.dataset.editDepartment;

        const {
            data,
            error
        } = await supabase
            .from("departments")
            .select("id, name, code")
            .eq("id", departmentId)
            .eq("university_id", currentProfile.university_id)
            .single();

        if (error) {
            alert("Could not retrieve department.");
            console.error(error);
            return;
        }

        openDepartmentModal(data);

    }

    if (deleteButton) {

        const departmentId =
            deleteButton.dataset.deleteDepartment;

        const confirmed = confirm(
            "Are you sure you want to delete this department? " +
            "Programmes linked to it may prevent deletion."
        );

        if (!confirmed) return;

        const {
            error
        } = await supabase
            .from("departments")
            .delete()
            .eq("id", departmentId)
            .eq("university_id", currentProfile.university_id);

        if (error) {

            alert(
                "Could not delete department. " +
                "Check whether programmes are still linked to it."
            );

            console.error(error);

            return;
        }

        alert("Department deleted successfully.");

        await loadDepartments();

        await loadProgrammes();

    }

});


// =====================================================
// PART 2: PROGRAMME MANAGEMENT
// =====================================================


// LOAD PROGRAMMES
async function loadProgrammes() {

    if (!currentProfile?.university_id) return;

    const {
        data: departments,
        error: departmentError
    } = await supabase
        .from("departments")
        .select("id, name")
        .eq("university_id", currentProfile.university_id);

    if (departmentError) {
        console.error(departmentError);
        return;
    }

    const departmentIds =
        (departments || []).map(d => d.id);

    if (!departmentIds.length) {

        if (programmesList) {
            programmesList.innerHTML =
                "<p>Add a department before creating programmes.</p>";
        }

        if (adminProgrammesCount) {
            adminProgrammesCount.textContent = "0";
        }

        return;
    }

    const {
        data: programmes,
        error
    } = await supabase
        .from("programmes")
        .select(`
            id,
            department_id,
            name,
            code,
            level,
            duration_years
        `)
        .in("department_id", departmentIds)
        .order("name");

    if (error) {

        console.error("Error loading programmes:", error);

        if (programmesList) {
            programmesList.innerHTML =
                "<p>Could not load programmes.</p>";
        }

        return;
    }

    if (adminProgrammesCount) {
        adminProgrammesCount.textContent =
            programmes.length;
    }

    const departmentMap = new Map(
        departments.map(d => [d.id, d.name])
    );

    if (!programmesList) return;

    if (!programmes.length) {

        programmesList.innerHTML =
            "<p>No programmes have been added yet.</p>";

    } else {

        programmesList.innerHTML = programmes.map(programme => `

            <div class="admin-record-card">

                <div class="admin-record-info">

                    <h3>
                        ${escapeAdminHtml(programme.name)}
                    </h3>

                    <p>
                        Code:
                        ${escapeAdminHtml(programme.code || "N/A")}
                    </p>

                    <p>
                        Department:
                        ${escapeAdminHtml(
                            departmentMap.get(programme.department_id) || "N/A"
                        )}
                    </p>

                    <p>
                        Level:
                        ${escapeAdminHtml(programme.level || "N/A")}
                    </p>

                    <p>
                        Duration:
                        ${programme.duration_years
                            ? programme.duration_years + " years"
                            : "N/A"}
                    </p>

                </div>

                <div class="admin-record-actions">

                    <button
                        type="button"
                        class="admin-edit-btn"
                        data-edit-programme="${programme.id}">
                        Edit
                    </button>

                    <button
                        type="button"
                        class="admin-delete-btn"
                        data-delete-programme="${programme.id}">
                        Delete
                    </button>

                </div>

            </div>

        `).join("");

    }

}


// OPEN PROGRAMME MODAL
async function openProgrammeModal(programme = null) {

    if (!programmeForm) return;

    programmeForm.reset();

    clearAdminMessage(programmeFormMessage);

    editingProgrammeId = programme?.id || null;

    await loadDepartmentDropdowns();

    if (programmeModalTitle) {

        programmeModalTitle.textContent =
            programme ? "Edit Programme" : "Add Programme";

    }

    if (programmeName) {
        programmeName.value = programme?.name || "";
    }

    if (programmeCode) {
        programmeCode.value = programme?.code || "";
    }

    if (programmeLevel) {
        programmeLevel.value = programme?.level || "";
    }

    if (programmeDuration) {
        programmeDuration.value =
            programme?.duration_years || "";
    }

    if (programmeDepartment) {
        programmeDepartment.value =
            programme?.department_id || "";
    }

    if (saveProgrammeBtn) {
        saveProgrammeBtn.textContent =
            programme ? "Update Programme" : "Save Programme";
    }

    showAdminModal(programmeModal);

}


// CLOSE PROGRAMME MODAL
function closeProgrammeForm() {

    hideAdminModal(programmeModal);

    editingProgrammeId = null;

    if (programmeForm) {
        programmeForm.reset();
    }

    clearAdminMessage(programmeFormMessage);

}


// ADD PROGRAMME BUTTON
addProgrammeBtn?.addEventListener("click", function () {

    openProgrammeModal();

});


// CLOSE PROGRAMME BUTTONS
closeProgrammeModal?.addEventListener(
    "click",
    closeProgrammeForm
);

cancelProgrammeBtn?.addEventListener(
    "click",
    closeProgrammeForm
);


// SAVE OR UPDATE PROGRAMME
programmeForm?.addEventListener("submit", async function (event) {

    event.preventDefault();

    clearAdminMessage(programmeFormMessage);

    const name = programmeName?.value.trim();

    const code = programmeCode?.value.trim();

    const departmentId = programmeDepartment?.value;

    const level = programmeLevel?.value || null;

    const duration = Number(programmeDuration?.value);

    if (!name || !departmentId) {

        showAdminMessage(
            programmeFormMessage,
            "Programme name and department are required."
        );

        return;
    }

    if (
        programmeDuration?.value &&
        (!Number.isInteger(duration) || duration < 1)
    ) {

        showAdminMessage(
            programmeFormMessage,
            "Enter a valid programme duration."
        );

        return;
    }

    if (saveProgrammeBtn) {
        saveProgrammeBtn.disabled = true;
        saveProgrammeBtn.textContent = "Saving...";
    }

    try {

        // Verify department belongs to this university.
        const {
            data: department,
            error: departmentError
        } = await supabase
            .from("departments")
            .select("id")
            .eq("id", departmentId)
            .eq("university_id", currentProfile.university_id)
            .single();

        if (departmentError || !department) {
            throw new Error(
                "The selected department does not belong to this university."
            );
        }

        const programmeData = {
            department_id: departmentId,
            name,
            code: code || null,
            level,
            duration_years:
                programmeDuration?.value ? duration : null
        };

        let result;

        if (editingProgrammeId) {

            // Confirm programme belongs to this university.
            const {
                data: existing,
                error: existingError
            } = await supabase
                .from("programmes")
                .select(`
                    id,
                    departments!inner(university_id)
                `)
                .eq("id", editingProgrammeId)
                .eq(
                    "departments.university_id",
                    currentProfile.university_id
                )
                .single();

            if (existingError || !existing) {
                throw new Error(
                    "Programme not found in this university."
                );
            }

            result = await supabase
                .from("programmes")
                .update(programmeData)
                .eq("id", editingProgrammeId);

        } else {

            result = await supabase
                .from("programmes")
                .insert([programmeData]);

        }

        if (result.error) {
            throw result.error;
        }

        showAdminMessage(
            programmeFormMessage,
            editingProgrammeId
                ? "Programme updated successfully."
                : "Programme created successfully.",
            "success"
        );

        await loadProgrammes();

        setTimeout(closeProgrammeForm, 800);

    } catch (error) {

        console.error("Programme save error:", error);

        showAdminMessage(
            programmeFormMessage,
            error.message || "Could not save programme."
        );

    } finally {

        if (saveProgrammeBtn) {
            saveProgrammeBtn.disabled = false;
            saveProgrammeBtn.textContent = "Save Programme";
        }

    }

});


// PROGRAMME EDIT AND DELETE BUTTONS
programmesList?.addEventListener("click", async function (event) {

    const editButton = event.target.closest(
        "[data-edit-programme]"
    );

    const deleteButton = event.target.closest(
        "[data-delete-programme]"
    );

    if (editButton) {

        const programmeId =
            editButton.dataset.editProgramme;

        const {
            data,
            error
        } = await supabase
            .from("programmes")
            .select(`
                id,
                department_id,
                name,
                code,
                level,
                duration_years,
                departments!inner(university_id)
            `)
            .eq("id", programmeId)
            .eq(
                "departments.university_id",
                currentProfile.university_id
            )
            .single();

        if (error) {
            console.error(error);
            alert("Could not retrieve programme.");
            return;
        }

        openProgrammeModal(data);

    }

    if (deleteButton) {

        const programmeId =
            deleteButton.dataset.deleteProgramme;

        const confirmed = confirm(
            "Are you sure you want to delete this programme? " +
            "Academic years or student records may prevent deletion."
        );

        if (!confirmed) return;

        const {
            data: programme,
            error: checkError
        } = await supabase
            .from("programmes")
            .select(`
                id,
                departments!inner(university_id)
            `)
            .eq("id", programmeId)
            .eq(
                "departments.university_id",
                currentProfile.university_id
            )
            .single();

        if (checkError || !programme) {
            alert("Programme not found.");
            return;
        }

        const {
            error
        } = await supabase
            .from("programmes")
            .delete()
            .eq("id", programmeId);

        if (error) {

            console.error(error);

            alert(
                "Could not delete programme. " +
                "Check whether academic years or student records are linked to it."
            );

            return;
        }

        alert("Programme deleted successfully.");

        await loadProgrammes();

    }

});

// =====================================================
// PART 3: ACADEMIC STRUCTURE MANAGEMENT
// =====================================================


// LOAD ACADEMIC STRUCTURE
async function loadAcademicStructure() {

    if (!currentProfile?.university_id) return;

    if (academicStructureList) {
        academicStructureList.innerHTML =
            "<p>Loading academic structure...</p>";
    }

    try {

        // 1. Load university departments
        const {
            data: departments,
            error: departmentError
        } = await supabase
            .from("departments")
            .select("id, name, code")
            .eq("university_id", currentProfile.university_id);

        if (departmentError) throw departmentError;

        const departmentIds =
            (departments || []).map(d => d.id);

        if (!departmentIds.length) {

            academicStructureList.innerHTML =
                "<p>No academic structure available. Add departments first.</p>";

            return;
        }

        // 2. Load programmes belonging to those departments
        const {
            data: programmes,
            error: programmeError
        } = await supabase
            .from("programmes")
            .select("id, department_id, name, code, level, duration_years")
            .in("department_id", departmentIds);

        if (programmeError) throw programmeError;

        const programmeIds =
            (programmes || []).map(p => p.id);

        if (!programmeIds.length) {

            academicStructureList.innerHTML =
                "<p>No programmes have been created yet.</p>";

            return;
        }

        // 3. Load academic years
        const {
            data: academicYears,
            error: yearError
        } = await supabase
            .from("academic_years")
            .select("id, programme_id, year_number")
            .in("programme_id", programmeIds);

        if (yearError) throw yearError;

        const academicYearIds =
            (academicYears || []).map(y => y.id);

        // 4. Load semesters separately
        let semesters = [];

        if (academicYearIds.length) {

            const {
                data,
                error
            } = await supabase
                .from("semesters")
                .select("id, academic_year_id, semester_number")
                .in("academic_year_id", academicYearIds);

            if (error) throw error;

            semesters = data || [];
        }

        const semesterIds =
            semesters.map(s => s.id);

        // 5. Load units separately
        let units = [];

        if (semesterIds.length) {

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
                .in("semester_id", semesterIds);

            if (error) throw error;

            units = data || [];
        }

        // Create lookup maps
        const departmentMap = new Map(
            departments.map(d => [d.id, d])
        );

        const programmeMap = new Map(
            programmes.map(p => [p.id, p])
        );

        const yearMap = new Map(
            academicYears.map(y => [y.id, y])
        );

        const semesterMap = new Map(
            semesters.map(s => [s.id, s])
        );

        const unitsBySemester = new Map();

        units.forEach(unit => {

            if (!unitsBySemester.has(unit.semester_id)) {
                unitsBySemester.set(unit.semester_id, []);
            }

            unitsBySemester.get(unit.semester_id).push(unit);

        });

        const semestersByYear = new Map();

        semesters.forEach(semester => {

            if (!semestersByYear.has(semester.academic_year_id)) {
                semestersByYear.set(semester.academic_year_id, []);
            }

            semestersByYear.get(semester.academic_year_id).push(semester);

        });

        const yearsByProgramme = new Map();

        academicYears.forEach(year => {

            if (!yearsByProgramme.has(year.programme_id)) {
                yearsByProgramme.set(year.programme_id, []);
            }

            yearsByProgramme.get(year.programme_id).push(year);

        });

        // Render academic structure
        if (!academicStructureList) return;

        academicStructureList.innerHTML = programmes.map(programme => {

            const department =
                departmentMap.get(programme.department_id);

            const years =
                yearsByProgramme.get(programme.id) || [];

            return `

                <div class="admin-record-card academic-programme-card">

                    <h3>
                        ${escapeAdminHtml(programme.name)}
                    </h3>

                    <p>
                        Department:
                        ${escapeAdminHtml(department?.name || "N/A")}
                    </p>

                    <p>
                        Programme Code:
                        ${escapeAdminHtml(programme.code || "N/A")}
                    </p>

                    <div class="academic-years-container">

                        ${years.map(year => {

                            const yearSemesters =
                                semestersByYear.get(year.id) || [];

                            return `

                                <div class="academic-year-item">

                                    <h4>
                                        Year ${year.year_number}
                                    </h4>

                                    ${yearSemesters.map(semester => {

                                        const semesterUnits =
                                            unitsBySemester.get(semester.id) || [];

                                        return `

                                            <div class="academic-semester-item">

                                                <h5>
                                                    Semester ${semester.semester_number}
                                                </h5>

                                                ${
                                                    semesterUnits.length
                                                    ? `
                                                        <ul>
                                                            ${semesterUnits.map(unit => `
                                                                <li>
                                                                    <strong>
                                                                        ${escapeAdminHtml(unit.unit_code)}
                                                                    </strong>
                                                                    -
                                                                    ${escapeAdminHtml(unit.unit_name)}
                                                                    (${unit.credit_hours || 0} Credits)
                                                                </li>
                                                            `).join("")}
                                                        </ul>
                                                    `
                                                    : "<p>No units added.</p>"
                                                }

                                            </div>

                                        `;

                                    }).join("")}

                                </div>

                            `;

                        }).join("")}

                    </div>

                </div>

            `;

        }).join("");

    } catch (error) {

        console.error(
            "Error loading academic structure:",
            error
        );

        if (academicStructureList) {
            academicStructureList.innerHTML =
                "<p>Could not load academic structure. Check the console for details.</p>";
        }

    }

}


// =====================================================
// LOAD PROGRAMMES INTO ACADEMIC YEAR DROPDOWN
// =====================================================

async function loadAcademicYearProgrammes() {

    if (!academicYearProgramme) return;

    const {
        data: departments,
        error: departmentError
    } = await supabase
        .from("departments")
        .select("id")
        .eq("university_id", currentProfile.university_id);

    if (departmentError) {
        console.error(departmentError);
        return;
    }

    const departmentIds =
        (departments || []).map(d => d.id);

    if (!departmentIds.length) {

        academicYearProgramme.innerHTML =
            '<option value="">No departments available</option>';

        return;
    }

    const {
        data: programmes,
        error
    } = await supabase
        .from("programmes")
        .select("id, name, department_id")
        .in("department_id", departmentIds)
        .order("name");

    if (error) {
        console.error(error);
        return;
    }

    academicYearProgramme.innerHTML = `

        <option value="">Select Programme</option>

        ${(programmes || []).map(programme => `

            <option value="${programme.id}">
                ${escapeAdminHtml(programme.name)}
            </option>

        `).join("")}

    `;

}


// =====================================================
// OPEN ACADEMIC YEAR MODAL
// =====================================================

async function openAcademicYearModal() {

    if (!academicYearForm) return;

    academicYearForm.reset();

    clearAdminMessage(academicYearFormMessage);

    await loadAcademicYearProgrammes();

    showAdminModal(academicYearModal);

}


// CLOSE ACADEMIC YEAR MODAL
function closeAcademicYearForm() {

    hideAdminModal(academicYearModal);

    academicYearForm?.reset();

    clearAdminMessage(academicYearFormMessage);

}


// ACADEMIC YEAR BUTTON
manageAcademicBtn?.addEventListener("click", function () {

    openAcademicYearModal();

});


// CLOSE ACADEMIC YEAR BUTTONS
closeAcademicYearModal?.addEventListener(
    "click",
    closeAcademicYearForm
);

cancelAcademicYearBtn?.addEventListener(
    "click",
    closeAcademicYearForm
);


// =====================================================
// SAVE ACADEMIC YEAR
// =====================================================

academicYearForm?.addEventListener("submit", async function (event) {

    event.preventDefault();

    clearAdminMessage(academicYearFormMessage);

    const programmeId =
        academicYearProgramme?.value;

    const yearNumber =
        Number(academicYearNumber?.value);

    if (!programmeId || !Number.isInteger(yearNumber) || yearNumber < 1) {

        showAdminMessage(
            academicYearFormMessage,
            "Select a programme and enter a valid academic year."
        );

        return;
    }

    try {

        const {
            error: duplicateError,
            data: existing
        } = await supabase
            .from("academic_years")
            .select("id")
            .eq("programme_id", programmeId)
            .eq("year_number", yearNumber);

        if (duplicateError) throw duplicateError;

        if (existing?.length) {

            showAdminMessage(
                academicYearFormMessage,
                "This academic year already exists for the selected programme."
            );

            return;
        }

        const {
            error
        } = await supabase
            .from("academic_years")
            .insert([{
                programme_id: programmeId,
                year_number: yearNumber
            }]);

        if (error) throw error;

        showAdminMessage(
            academicYearFormMessage,
            "Academic year added successfully.",
            "success"
        );

        await loadAcademicStructure();

        setTimeout(closeAcademicYearForm, 800);

    } catch (error) {

        console.error("Academic year error:", error);

        showAdminMessage(
            academicYearFormMessage,
            error.message || "Could not save academic year."
        );

    }

});


// =====================================================
// LOAD PROGRAMMES INTO UNIT DROPDOWN
// =====================================================

async function loadUnitProgrammes() {

    if (!unitProgramme) return;

    const {
        data: departments,
        error: departmentError
    } = await supabase
        .from("departments")
        .select("id")
        .eq("university_id", currentProfile.university_id);

    if (departmentError) throw departmentError;

    const departmentIds =
        (departments || []).map(d => d.id);

    if (!departmentIds.length) {

        unitProgramme.innerHTML =
            '<option value="">No programmes available</option>';

        return;
    }

    const {
        data: programmes,
        error
    } = await supabase
        .from("programmes")
        .select("id, name")
        .in("department_id", departmentIds)
        .order("name");

    if (error) throw error;

    unitProgramme.innerHTML = `

        <option value="">Select Programme</option>

        ${(programmes || []).map(programme => `

            <option value="${programme.id}">
                ${escapeAdminHtml(programme.name)}
            </option>

        `).join("")}

    `;

}


// =====================================================
// LOAD ACADEMIC YEARS FOR SELECTED PROGRAMME
// =====================================================

async function loadUnitAcademicYears() {

    if (!unitAcademicYear) return;

    const programmeId = unitProgramme?.value;

    unitAcademicYear.innerHTML =
        '<option value="">Select Academic Year</option>';

    if (!programmeId) return;

    const {
        data: years,
        error
    } = await supabase
        .from("academic_years")
        .select("id, year_number")
        .eq("programme_id", programmeId)
        .order("year_number");

    if (error) {
        console.error(error);
        return;
    }

    unitAcademicYear.innerHTML +=
        (years || []).map(year => `

            <option value="${year.id}">
                Year ${year.year_number}
            </option>

        `).join("");

}


// =====================================================
// LOAD SEMESTERS FOR SELECTED ACADEMIC YEAR
// =====================================================

async function loadUnitSemesters() {

    if (!unitSemester) return;

    const academicYearId =
        unitAcademicYear?.value;

    unitSemester.innerHTML =
        '<option value="">Select Semester</option>';

    if (!academicYearId) return;

    const {
        data: semesters,
        error
    } = await supabase
        .from("semesters")
        .select("id, semester_number")
        .eq("academic_year_id", academicYearId)
        .order("semester_number");

    if (error) {
        console.error(error);
        return;
    }

    unitSemester.innerHTML +=
        (semesters || []).map(semester => `

            <option value="${semester.id}">
                Semester ${semester.semester_number}
            </option>

        `).join("");

}


// =====================================================
// UNIT DROPDOWN CHANGE EVENTS
// =====================================================

unitProgramme?.addEventListener("change", async function () {

    await loadUnitAcademicYears();

    if (unitSemester) {
        unitSemester.innerHTML =
            '<option value="">Select Semester</option>';
    }

});


unitAcademicYear?.addEventListener("change", async function () {

    await loadUnitSemesters();

});


// =====================================================
// OPEN UNIT MODAL
// =====================================================

async function openUnitModal() {

    if (!unitForm) return;

    unitForm.reset();

    clearAdminMessage(unitFormMessage);

    try {

        await loadUnitProgrammes();

        if (unitAcademicYear) {
            unitAcademicYear.innerHTML =
                '<option value="">Select Academic Year</option>';
        }

        if (unitSemester) {
            unitSemester.innerHTML =
                '<option value="">Select Semester</option>';
        }

        showAdminModal(unitModal);

    } catch (error) {

        console.error(error);

        alert("Could not load programmes.");

    }

}


// CLOSE UNIT MODAL
function closeUnitForm() {

    hideAdminModal(unitModal);

    unitForm?.reset();

    clearAdminMessage(unitFormMessage);

}


// UNIT BUTTON
addUnitBtn?.addEventListener("click", function () {

    openUnitModal();

});


// CLOSE UNIT BUTTONS
closeUnitModal?.addEventListener(
    "click",
    closeUnitForm
);

cancelUnitBtn?.addEventListener(
    "click",
    closeUnitForm
);


// =====================================================
// SAVE UNIT
// =====================================================

unitForm?.addEventListener("submit", async function (event) {

    event.preventDefault();

    clearAdminMessage(unitFormMessage);

    const semesterId = unitSemester?.value;

    const code = unitCode?.value.trim();

    const name = unitName?.value.trim();

    const description =
        unitDescription?.value.trim();

    const credits = Number(unitCredits?.value);

    if (!semesterId || !code || !name) {

        showAdminMessage(
            unitFormMessage,
            "Semester, unit code and unit name are required."
        );

        return;
    }

    if (
        !Number.isInteger(credits) ||
        credits < 1
    ) {

        showAdminMessage(
            unitFormMessage,
            "Enter a valid number of credit hours."
        );

        return;
    }

    try {

        // Check whether unit code already exists in this semester.
        const {
            data: existing,
            error: checkError
        } = await supabase
            .from("units")
            .select("id")
            .eq("semester_id", semesterId)
            .eq("unit_code", code);

        if (checkError) throw checkError;

        if (existing?.length) {

            showAdminMessage(
                unitFormMessage,
                "This unit code already exists in the selected semester."
            );

            return;
        }

        const {
            error
        } = await supabase
            .from("units")
            .insert([{
                semester_id: semesterId,
                unit_code: code,
                unit_name: name,
                unit_description: description || null,
                credit_hours: credits
            }]);

        if (error) throw error;

        showAdminMessage(
            unitFormMessage,
            "Unit added successfully.",
            "success"
        );

        await loadUnits();

        await loadAcademicStructure();

        setTimeout(closeUnitForm, 800);

    } catch (error) {

        console.error("Unit save error:", error);

        showAdminMessage(
            unitFormMessage,
            error.message || "Could not save unit."
        );

    }

});


// =====================================================
// LOAD UNITS
// =====================================================

async function loadUnits() {

    if (!currentProfile?.university_id) return;

    if (unitsList) {
        unitsList.innerHTML =
            "<p>Loading units...</p>";
    }

    try {

        // 1. Get departments
        const {
            data: departments,
            error: departmentError
        } = await supabase
            .from("departments")
            .select("id")
            .eq("university_id", currentProfile.university_id);

        if (departmentError) throw departmentError;

        const departmentIds =
            (departments || []).map(d => d.id);

        if (!departmentIds.length) {

            if (unitsList) {
                unitsList.innerHTML =
                    "<p>No units available.</p>";
            }

            return;
        }

        // 2. Get programmes
        const {
            data: programmes,
            error: programmeError
        } = await supabase
            .from("programmes")
            .select("id, name, department_id")
            .in("department_id", departmentIds);

        if (programmeError) throw programmeError;

        const programmeIds =
            (programmes || []).map(p => p.id);

        if (!programmeIds.length) {

            if (unitsList) {
                unitsList.innerHTML =
                    "<p>No programmes available.</p>";
            }

            return;
        }

        // 3. Get academic years
        const {
            data: years,
            error: yearError
        } = await supabase
            .from("academic_years")
            .select("id, programme_id, year_number")
            .in("programme_id", programmeIds);

        if (yearError) throw yearError;

        const yearIds =
            (years || []).map(y => y.id);

        if (!yearIds.length) {

            if (unitsList) {
                unitsList.innerHTML =
                    "<p>No academic years available.</p>";
            }

            return;
        }

        // 4. Get semesters
        const {
            data: semesters,
            error: semesterError
        } = await supabase
            .from("semesters")
            .select("id, academic_year_id, semester_number")
            .in("academic_year_id", yearIds);

        if (semesterError) throw semesterError;

        const semesterIds =
            (semesters || []).map(s => s.id);

        if (!semesterIds.length) {

            if (unitsList) {
                unitsList.innerHTML =
                    "<p>No semesters available.</p>";
            }

            return;
        }

        // 5. Get units
        const {
            data: units,
            error: unitError
        } = await supabase
            .from("units")
            .select(`
                id,
                semester_id,
                unit_code,
                unit_name,
                unit_description,
                credit_hours
            `)
            .in("semester_id", semesterIds)
            .order("unit_code");

        if (unitError) throw unitError;

        // Maps
        const yearMap = new Map(
            years.map(y => [y.id, y])
        );

        const semesterMap = new Map(
            semesters.map(s => [s.id, s])
        );

        const programmeMap = new Map(
            programmes.map(p => [p.id, p])
        );

        const rows = units || [];

        if (!unitsList) return;

        if (!rows.length) {

            unitsList.innerHTML =
                "<p>No units have been added yet.</p>";

            return;
        }

        unitsList.innerHTML = rows.map(unit => {

            const semester =
                semesterMap.get(unit.semester_id);

            const year =
                yearMap.get(semester?.academic_year_id);

            const programme =
                programmeMap.get(year?.programme_id);

            return `

                <div class="admin-record-card">

                    <div class="admin-record-info">

                        <h3>
                            ${escapeAdminHtml(unit.unit_name)}
                        </h3>

                        <p>
                            Unit Code:
                            ${escapeAdminHtml(unit.unit_code)}
                        </p>

                        <p>
                            Programme:
                            ${escapeAdminHtml(programme?.name || "N/A")}
                        </p>

                        <p>
                            Year:
                            ${year?.year_number || "N/A"}
                        </p>

                        <p>
                            Semester:
                            ${semester?.semester_number || "N/A"}
                        </p>

                        <p>
                            Credit Hours:
                            ${unit.credit_hours || 0}
                        </p>

                        <p>
                            ${escapeAdminHtml(unit.unit_description || "")}
                        </p>

                    </div>

                </div>

            `;

        }).join("");

    } catch (error) {

        console.error("Error loading units:", error);

        if (unitsList) {
            unitsList.innerHTML =
                "<p>Could not load units. Check the console.</p>";
        }

    }

}

// ============================================================
// PART 4: ADMISSIONS, STUDENT MANAGEMENT AND LECTURER MANAGEMENT
// ============================================================


// ------------------------------------------------------------
// 1. ADMISSIONS MANAGEMENT
// ------------------------------------------------------------

async function loadApplications() {
    if (!applicationsList || !currentProfile?.university_id) return;

    applicationsList.innerHTML = `
        <p class="loading-message">Loading applications...</p>
    `;

    try {
        const universityId = currentProfile.university_id;

        // Get applications belonging to this university
        const { data: applications, error } = await supabase
            .from("university_applications")
            .select(`
                id,
                applicant_id,
                programme_id,
                admission_year,
                application_status,
                application_date,
                rejection_reason
            `)
            .eq("university_id", universityId)
            .order("application_date", { ascending: false });

        if (error) throw error;

        if (!applications || applications.length === 0) {
            applicationsList.innerHTML = `
                <div class="empty-state">
                    <h3>No applications yet</h3>
                    <p>University applications will appear here.</p>
                </div>
            `;
            return;
        }

        const applicantIds = [
            ...new Set(applications.map(item => item.applicant_id))
        ];

        const programmeIds = [
            ...new Set(applications.map(item => item.programme_id))
        ];

        // Get applicant profiles separately
        let profiles = [];

        if (applicantIds.length > 0) {
            const { data, error: profileError } = await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", applicantIds);

            if (profileError) throw profileError;
            profiles = data || [];
        }

        // Get programmes separately
        let programmes = [];

        if (programmeIds.length > 0) {
            const { data, error: programmeError } = await supabase
                .from("programmes")
                .select("id, name, code")
                .in("id", programmeIds);

            if (programmeError) throw programmeError;
            programmes = data || [];
        }

        const profileMap = new Map(
            profiles.map(profile => [profile.id, profile])
        );

        const programmeMap = new Map(
            programmes.map(programme => [programme.id, programme])
        );

        applicationsList.innerHTML = applications.map(application => {
            const applicant = profileMap.get(application.applicant_id);
            const programme = programmeMap.get(application.programme_id);

            const applicantName = applicant?.full_name || "Unknown applicant";
            const programmeName = programme?.name || "Unknown programme";
            const status = application.application_status || "Pending";

            const statusClass = status.toLowerCase().replace(/\s+/g, "-");

            return `
                <div class="admin-list-card">
                    <div class="admin-list-card-info">
                        <h3>${escapeAdminHtml(applicantName)}</h3>

                        <p>
                            <strong>Programme:</strong>
                            ${escapeAdminHtml(programmeName)}
                        </p>

                        <p>
                            <strong>Admission year:</strong>
                            ${escapeAdminHtml(application.admission_year ?? "Not specified")}
                        </p>

                        <p>
                            <strong>Date applied:</strong>
                            ${application.application_date
                                ? new Date(application.application_date).toLocaleDateString()
                                : "Not available"}
                        </p>

                        <span class="status-badge ${escapeAdminHtml(statusClass)}">
                            ${escapeAdminHtml(status)}
                        </span>
                    </div>

                    <div class="admin-list-card-actions">
                        <button
                            class="admin-action-btn approve-application-btn"
                            data-id="${application.id}">
                            Approve
                        </button>

                        <button
                            class="admin-action-btn reject-application-btn"
                            data-id="${application.id}">
                            Reject
                        </button>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Error loading applications:", error);

        applicationsList.innerHTML = `
            <p class="error-message">
                Could not load applications: ${escapeAdminHtml(error.message)}
            </p>
        `;
    }
}


// Approve or reject an application
if (applicationsList) {
    applicationsList.addEventListener("click", async (event) => {
        const approveButton = event.target.closest(".approve-application-btn");
        const rejectButton = event.target.closest(".reject-application-btn");

        if (!approveButton && !rejectButton) return;

        const button = approveButton || rejectButton;
        const applicationId = button.dataset.id;

        if (!applicationId) return;

        const newStatus = approveButton ? "Approved" : "Rejected";

        if (rejectButton) {
            const confirmed = confirm(
                "Are you sure you want to reject this application?"
            );

            if (!confirmed) return;
        }

        try {
            button.disabled = true;
            button.textContent = "Processing...";

            const updateData = {
                application_status: newStatus,
                reviewed_at: new Date().toISOString(),
                reviewed_by: currentUser.id
            };

            if (rejectButton) {
                updateData.rejection_reason = "Application rejected by university administration.";
            }

            const { error } = await supabase
                .from("university_applications")
                .update(updateData)
                .eq("id", applicationId)
                .eq("university_id", currentProfile.university_id);

            if (error) throw error;

            alert(`Application ${newStatus.toLowerCase()} successfully.`);

            await loadApplications();

        } catch (error) {
            console.error("Application update error:", error);
            alert("Could not update application: " + error.message);

            button.disabled = false;
            button.textContent = approveButton ? "Approve" : "Reject";
        }
    });
}


// ------------------------------------------------------------
// 2. STUDENT MANAGEMENT
// ------------------------------------------------------------

const studentsList = document.getElementById("studentsList");

async function loadStudents() {
    if (!studentsList || !currentProfile?.university_id) return;

    studentsList.innerHTML = `
        <p class="loading-message">Loading students...</p>
    `;

    try {
        const { data: students, error } = await supabase
            .from("profiles")
            .select("id, full_name, role, created_at")
            .eq("university_id", currentProfile.university_id)
            .eq("role", "student")
            .order("created_at", { ascending: false });

        if (error) throw error;

        if (!students || students.length === 0) {
            studentsList.innerHTML = `
                <div class="empty-state">
                    <h3>No students found</h3>
                    <p>Registered students will appear here.</p>
                </div>
            `;
            return;
        }

        // Get student programme records separately
        const studentIds = students.map(student => student.id);

        const { data: studentProgrammes, error: programmeError } = await supabase
            .from("student_programmes")
            .select("student_id, programme_id, admission_number, admission_year, status")
            .in("student_id", studentIds);

        if (programmeError) throw programmeError;

        const programmeIds = [
            ...new Set((studentProgrammes || []).map(item => item.programme_id))
        ];

        let programmes = [];

        if (programmeIds.length > 0) {
            const { data, error: programmesError } = await supabase
                .from("programmes")
                .select("id, name, code")
                .in("id", programmeIds);

            if (programmesError) throw programmesError;
            programmes = data || [];
        }

        const programmeMap = new Map(
            programmes.map(programme => [programme.id, programme])
        );

        const studentProgrammeMap = new Map();

        (studentProgrammes || []).forEach(record => {
            if (!studentProgrammeMap.has(record.student_id)) {
                studentProgrammeMap.set(record.student_id, record);
            }
        });

        studentsList.innerHTML = students.map(student => {
            const record = studentProgrammeMap.get(student.id);
            const programme = record
                ? programmeMap.get(record.programme_id)
                : null;

            return `
                <div class="admin-list-card">
                    <div class="admin-list-card-info">
                        <h3>${escapeAdminHtml(student.full_name || "Unnamed student")}</h3>

                        <p>
                            <strong>Admission number:</strong>
                            ${escapeAdminHtml(record?.admission_number || "Not assigned")}
                        </p>

                        <p>
                            <strong>Programme:</strong>
                            ${escapeAdminHtml(programme?.name || "Not assigned")}
                        </p>

                        <p>
                            <strong>Admission year:</strong>
                            ${escapeAdminHtml(record?.admission_year ?? "Not available")}
                        </p>

                        <p>
                            <strong>Status:</strong>
                            ${escapeAdminHtml(record?.status || "Registered")}
                        </p>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Error loading students:", error);

        studentsList.innerHTML = `
            <p class="error-message">
                Could not load students: ${escapeAdminHtml(error.message)}
            </p>
        `;
    }
}


// ------------------------------------------------------------
// 3. LECTURER MANAGEMENT
// ------------------------------------------------------------

const lecturersList = document.getElementById("mainLecturersManagementList");

async function loadLecturerManagement() {
    if (!lecturersList || !currentProfile?.university_id) return;

    lecturersList.innerHTML = `
        <p class="loading-message">Loading lecturers...</p>
    `;

    try {
        const { data: lecturers, error } = await supabase
            .from("profiles")
            .select("id, full_name, role, created_at")
            .eq("university_id", currentProfile.university_id)
            .eq("role", "lecturer")
            .order("created_at", { ascending: false });

        if (error) throw error;

        if (!lecturers || lecturers.length === 0) {
            lecturersList.innerHTML = `
                <div class="empty-state">
                    <h3>No lecturers found</h3>
                    <p>Registered lecturers will appear here.</p>
                </div>
            `;
            return;
        }

        const lecturerIds = lecturers.map(lecturer => lecturer.id);

        // Get lecturer unit assignments separately
        const { data: assignments, error: assignmentError } = await supabase
            .from("unit_lecturers")
            .select("id, lecturer_id, unit_id, semester_id")
            .eq("university_id", currentProfile.university_id)
            .in("lecturer_id", lecturerIds);

        if (assignmentError) throw assignmentError;

        const unitIds = [
            ...new Set((assignments || []).map(item => item.unit_id))
        ];

        let units = [];

        if (unitIds.length > 0) {
            const { data, error: unitError } = await supabase
                .from("units")
                .select("id, unit_code, unit_name")
                .in("id", unitIds);

            if (unitError) throw unitError;
            units = data || [];
        }

        const unitMap = new Map(
            units.map(unit => [unit.id, unit])
        );

        const assignmentMap = new Map();

        (assignments || []).forEach(assignment => {
            if (!assignmentMap.has(assignment.lecturer_id)) {
                assignmentMap.set(assignment.lecturer_id, []);
            }

            assignmentMap.get(assignment.lecturer_id).push(assignment);
        });

        lecturersList.innerHTML = lecturers.map(lecturer => {
            const lecturerAssignments =
                assignmentMap.get(lecturer.id) || [];

            const assignedUnits = lecturerAssignments
                .map(assignment => unitMap.get(assignment.unit_id))
                .filter(Boolean);

            return `
                <div class="admin-list-card">
                    <div class="admin-list-card-info">
                        <h3>${escapeAdminHtml(lecturer.full_name || "Unnamed lecturer")}</h3>

                        <p>
                            <strong>Role:</strong> Lecturer
                        </p>

                        <p>
                            <strong>Units assigned:</strong>
                            ${assignedUnits.length}
                        </p>

                        <div class="lecturer-unit-list">
                            ${
                                assignedUnits.length
                                    ? assignedUnits.map(unit => `
                                        <span class="unit-tag">
                                            ${escapeAdminHtml(unit.unit_code)}
                                            - ${escapeAdminHtml(unit.unit_name)}
                                        </span>
                                    `).join("")
                                    : "<span>No units assigned</span>"
                            }
                        </div>
                    </div>

                    <div class="admin-list-card-actions">
                        <button
                            class="admin-action-btn assign-unit-btn"
                            data-lecturer-id="${lecturer.id}"
                            data-lecturer-name="${escapeAdminHtml(lecturer.full_name || "")}">
                            Assign Unit
                        </button>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Error loading lecturer management:", error);

        lecturersList.innerHTML = `
            <p class="error-message">
                Could not load lecturers: ${escapeAdminHtml(error.message)}
            </p>
        `;
    }
}

// ============================================================
// PART 5: UNIT LECTURER ASSIGNMENTS
// ============================================================

const assignUnitLecturerBtn = document.getElementById("assignUnitLecturerBtn");
const unitLecturerAssignmentModal = document.getElementById("unitLecturerAssignmentModal");
const closeUnitLecturerAssignmentModal = document.getElementById("closeUnitLecturerAssignmentModal");
const unitLecturerAssignmentForm = document.getElementById("unitLecturerAssignmentForm");

const assignmentLecturer = document.getElementById("assignmentLecturer");
const assignmentUnit = document.getElementById("assignmentUnit");
const assignmentSemester = document.getElementById("assignmentSemester");

const unitLecturerAssignmentsList = document.getElementById("unitLecturerAssignmentsList");


// ------------------------------------------------------------
// 1. LOAD LECTURERS INTO THE ASSIGNMENT FORM
// ------------------------------------------------------------

async function loadAssignmentLecturers() {
    if (!assignmentLecturer) return;

    const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("university_id", currentProfile.university_id)
        .eq("role", "lecturer")
        .order("full_name", { ascending: true });

    if (error) {
        console.error("Assignment lecturers error:", error);
        alert("Could not load lecturers: " + error.message);
        return;
    }

    assignmentLecturer.innerHTML = `
        <option value="">Select lecturer</option>
    `;

    (data || []).forEach(lecturer => {
        const option = document.createElement("option");
        option.value = lecturer.id;
        option.textContent = lecturer.full_name || "Unnamed lecturer";
        assignmentLecturer.appendChild(option);
    });
}


// ------------------------------------------------------------
// 2. LOAD UNIVERSITY UNITS INTO THE FORM
// ------------------------------------------------------------

async function loadAssignmentUnits() {
    if (!assignmentUnit) return;

    try {
        // Get university departments
        const { data: departments, error: departmentError } = await supabase
            .from("departments")
            .select("id")
            .eq("university_id", currentProfile.university_id);

        if (departmentError) throw departmentError;

        const departmentIds = (departments || []).map(item => item.id);

        if (departmentIds.length === 0) {
            assignmentUnit.innerHTML = `<option value="">No units available</option>`;
            return;
        }

        // Get programmes belonging to those departments
        const { data: programmes, error: programmeError } = await supabase
            .from("programmes")
            .select("id")
            .in("department_id", departmentIds);

        if (programmeError) throw programmeError;

        const programmeIds = (programmes || []).map(item => item.id);

        if (programmeIds.length === 0) {
            assignmentUnit.innerHTML = `<option value="">No units available</option>`;
            return;
        }

        // Get academic years
        const { data: years, error: yearError } = await supabase
            .from("academic_years")
            .select("id")
            .in("programme_id", programmeIds);

        if (yearError) throw yearError;

        const yearIds = (years || []).map(item => item.id);

        if (yearIds.length === 0) {
            assignmentUnit.innerHTML = `<option value="">No units available</option>`;
            return;
        }

        // Get semesters
        const { data: semesters, error: semesterError } = await supabase
            .from("semesters")
            .select("id, semester_number")
            .in("academic_year_id", yearIds);

        if (semesterError) throw semesterError;

        const semesterIds = (semesters || []).map(item => item.id);

        if (semesterIds.length === 0) {
            assignmentUnit.innerHTML = `<option value="">No units available</option>`;
            return;
        }

        // Get units
        const { data: units, error: unitError } = await supabase
            .from("units")
            .select("id, unit_code, unit_name, semester_id")
            .in("semester_id", semesterIds)
            .order("unit_code", { ascending: true });

        if (unitError) throw unitError;

        assignmentUnit.innerHTML = `
            <option value="">Select unit</option>
        `;

        (units || []).forEach(unit => {
            const option = document.createElement("option");

            option.value = unit.id;
            option.dataset.semesterId = unit.semester_id;

            option.textContent =
                `${unit.unit_code} - ${unit.unit_name}`;

            assignmentUnit.appendChild(option);
        });

    } catch (error) {
        console.error("Assignment units error:", error);
        alert("Could not load units: " + error.message);
    }
}


// ------------------------------------------------------------
// 3. LOAD THE SEMESTER BELONGING TO THE SELECTED UNIT
// ------------------------------------------------------------

async function loadAssignmentSemesters(unitId) {
    if (!assignmentSemester) return;

    assignmentSemester.innerHTML = `
        <option value="">Select semester</option>
    `;

    if (!unitId) return;

    try {
        const { data: unit, error: unitError } = await supabase
            .from("units")
            .select("id, semester_id")
            .eq("id", unitId)
            .maybeSingle();

        if (unitError) throw unitError;
        if (!unit) throw new Error("Selected unit was not found.");

        const { data: semester, error: semesterError } = await supabase
            .from("semesters")
            .select("id, semester_number, academic_year_id")
            .eq("id", unit.semester_id)
            .maybeSingle();

        if (semesterError) throw semesterError;
        if (!semester) throw new Error("Semester was not found.");

        const { data: year, error: yearError } = await supabase
            .from("academic_years")
            .select("id, programme_id")
            .eq("id", semester.academic_year_id)
            .maybeSingle();

        if (yearError) throw yearError;
        if (!year) throw new Error("Academic year was not found.");

        const { data: programme, error: programmeError } = await supabase
            .from("programmes")
            .select("id, department_id")
            .eq("id", year.programme_id)
            .maybeSingle();

        if (programmeError) throw programmeError;
        if (!programme) throw new Error("Programme was not found.");

        const { data: department, error: departmentError } = await supabase
            .from("departments")
            .select("id, university_id")
            .eq("id", programme.department_id)
            .maybeSingle();

        if (departmentError) throw departmentError;

        if (!department ||
            department.university_id !== currentProfile.university_id) {
            throw new Error("This unit does not belong to your university.");
        }

        const option = document.createElement("option");
        option.value = semester.id;
        option.textContent = `Semester ${semester.semester_number}`;

        assignmentSemester.appendChild(option);
        assignmentSemester.value = semester.id;

    } catch (error) {
        console.error("Assignment semester error:", error);
        alert(error.message);
    }
}


// ------------------------------------------------------------
// 4. OPEN AND CLOSE ASSIGNMENT MODAL
// ------------------------------------------------------------

async function openUnitLecturerAssignmentModal(preselectedLecturerId = null) {
    if (!unitLecturerAssignmentModal) return;

    await loadAssignmentLecturers();
    await loadAssignmentUnits();

    if (assignmentSemester) {
        assignmentSemester.innerHTML = `
            <option value="">Select semester</option>
        `;
    }

    if (assignmentLecturer && preselectedLecturerId) {
        assignmentLecturer.value = preselectedLecturerId;
    }

    unitLecturerAssignmentModal.classList.add("active");
}


function closeUnitLecturerAssignmentFormModal() {
    if (unitLecturerAssignmentModal) {
        unitLecturerAssignmentModal.classList.remove("active");
    }

    if (unitLecturerAssignmentForm) {
        unitLecturerAssignmentForm.reset();
    }

    if (assignmentSemester) {
        assignmentSemester.innerHTML = `
            <option value="">Select semester</option>
        `;
    }
}


if (assignUnitLecturerBtn) {
    assignUnitLecturerBtn.addEventListener("click", () => {
        openUnitLecturerAssignmentModal();
    });
}

if (closeUnitLecturerAssignmentModal) {
    closeUnitLecturerAssignmentModal.addEventListener(
        "click",
        closeUnitLecturerAssignmentFormModal
    );
}

if (unitLecturerAssignmentModal) {
    unitLecturerAssignmentModal.addEventListener("click", event => {
        if (event.target === unitLecturerAssignmentModal) {
            closeUnitLecturerAssignmentFormModal();
        }
    });
}

if (assignmentUnit) {
    assignmentUnit.addEventListener("change", async () => {
        await loadAssignmentSemesters(assignmentUnit.value);
    });
}


// ------------------------------------------------------------
// 5. ASSIGN BUTTON INSIDE EACH LECTURER CARD
// ------------------------------------------------------------

// Uses lecturersList created in Part 4.
// Do not declare mainLecturersManagementList again.

if (lecturersList) {
    lecturersList.addEventListener("click", event => {
        const button = event.target.closest(".assign-unit-btn");

        if (!button) return;

        const lecturerId = button.dataset.lecturerId;

        openUnitLecturerAssignmentModal(lecturerId);
    });
}


// ------------------------------------------------------------
// 6. SAVE UNIT LECTURER ASSIGNMENT
// ------------------------------------------------------------

if (unitLecturerAssignmentForm) {
    unitLecturerAssignmentForm.addEventListener("submit", async event => {
        event.preventDefault();

        const lecturerId = assignmentLecturer?.value;
        const unitId = assignmentUnit?.value;
        const semesterId = assignmentSemester?.value;

        if (!lecturerId || !unitId || !semesterId) {
            alert("Please select a lecturer, unit and semester.");
            return;
        }

        try {
            const saveButton = unitLecturerAssignmentForm.querySelector(
                'button[type="submit"]'
            );

            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent = "Saving...";
            }

            // Verify lecturer belongs to this university
            const { data: lecturer, error: lecturerError } = await supabase
                .from("profiles")
                .select("id, university_id, role")
                .eq("id", lecturerId)
                .maybeSingle();

            if (lecturerError) throw lecturerError;

            if (!lecturer ||
                lecturer.university_id !== currentProfile.university_id ||
                lecturer.role !== "lecturer") {
                throw new Error("Invalid lecturer selected.");
            }

            // Verify unit and semester match
            const { data: unit, error: unitError } = await supabase
                .from("units")
                .select("id, semester_id")
                .eq("id", unitId)
                .maybeSingle();

            if (unitError) throw unitError;

            if (!unit || unit.semester_id !== semesterId) {
                throw new Error("The selected semester does not belong to this unit.");
            }

            // Verify the unit's programme belongs to this university
            const { data: semester, error: semesterError } = await supabase
                .from("semesters")
                .select("id, academic_year_id")
                .eq("id", semesterId)
                .maybeSingle();

            if (semesterError) throw semesterError;
            if (!semester) throw new Error("Invalid semester.");

            const { data: year, error: yearError } = await supabase
                .from("academic_years")
                .select("id, programme_id")
                .eq("id", semester.academic_year_id)
                .maybeSingle();

            if (yearError) throw yearError;
            if (!year) throw new Error("Academic year not found.");

            const { data: programme, error: programmeError } = await supabase
                .from("programmes")
                .select("id, department_id")
                .eq("id", year.programme_id)
                .maybeSingle();

            if (programmeError) throw programmeError;
            if (!programme) throw new Error("Programme not found.");

            const { data: department, error: departmentError } = await supabase
                .from("departments")
                .select("id, university_id")
                .eq("id", programme.department_id)
                .maybeSingle();

            if (departmentError) throw departmentError;

            if (!department ||
                department.university_id !== currentProfile.university_id) {
                throw new Error("The selected unit does not belong to your university.");
            }

            // Check whether assignment already exists
            const { data: existing, error: existingError } = await supabase
                .from("unit_lecturers")
                .select("id")
                .eq("university_id", currentProfile.university_id)
                .eq("lecturer_id", lecturerId)
                .eq("unit_id", unitId)
                .eq("semester_id", semesterId)
                .maybeSingle();

            if (existingError) throw existingError;

            if (existing) {
                throw new Error("This lecturer is already assigned to this unit for this semester.");
            }

            // Save assignment
            const { error: insertError } = await supabase
                .from("unit_lecturers")
                .insert({
                    university_id: currentProfile.university_id,
                    lecturer_id: lecturerId,
                    unit_id: unitId,
                    semester_id: semesterId
                });

            if (insertError) throw insertError;

            alert("Lecturer assigned to unit successfully!");

            closeUnitLecturerAssignmentFormModal();

            await loadLecturerManagement();
            await loadUnitLecturerAssignments();

        } catch (error) {
            console.error("Save lecturer assignment error:", error);
            alert("Could not assign lecturer: " + error.message);

        } finally {
            const saveButton = unitLecturerAssignmentForm.querySelector(
                'button[type="submit"]'
            );

            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = "Save Assignment";
            }
        }
    });
}


// ------------------------------------------------------------
// 7. DISPLAY ALL UNIT LECTURER ASSIGNMENTS
// ------------------------------------------------------------

async function loadUnitLecturerAssignments() {
    if (!unitLecturerAssignmentsList) return;

    unitLecturerAssignmentsList.innerHTML = `
        <p class="loading-message">Loading assignments...</p>
    `;

    try {
        const { data: assignments, error } = await supabase
            .from("unit_lecturers")
            .select("id, lecturer_id, unit_id, semester_id, created_at")
            .eq("university_id", currentProfile.university_id)
            .order("created_at", { ascending: false });

        if (error) throw error;

        if (!assignments || assignments.length === 0) {
            unitLecturerAssignmentsList.innerHTML = `
                <div class="empty-state">
                    <p>No lecturer assignments found.</p>
                </div>
            `;
            return;
        }

        const lecturerIds = [...new Set(assignments.map(a => a.lecturer_id))];
        const unitIds = [...new Set(assignments.map(a => a.unit_id))];
        const semesterIds = [...new Set(assignments.map(a => a.semester_id))];

        const [lecturersResult, unitsResult, semestersResult] = await Promise.all([
            supabase.from("profiles")
                .select("id, full_name")
                .in("id", lecturerIds),

            supabase.from("units")
                .select("id, unit_code, unit_name")
                .in("id", unitIds),

            supabase.from("semesters")
                .select("id, semester_number")
                .in("id", semesterIds)
        ]);

        if (lecturersResult.error) throw lecturersResult.error;
        if (unitsResult.error) throw unitsResult.error;
        if (semestersResult.error) throw semestersResult.error;

        const lecturerMap = new Map(
            (lecturersResult.data || []).map(item => [item.id, item])
        );

        const unitMap = new Map(
            (unitsResult.data || []).map(item => [item.id, item])
        );

        const semesterMap = new Map(
            (semestersResult.data || []).map(item => [item.id, item])
        );

        unitLecturerAssignmentsList.innerHTML = assignments.map(assignment => {
            const lecturer = lecturerMap.get(assignment.lecturer_id);
            const unit = unitMap.get(assignment.unit_id);
            const semester = semesterMap.get(assignment.semester_id);

            return `
                <div class="admin-list-card">
                    <div class="admin-list-card-info">
                        <h3>${escapeAdminHtml(lecturer?.full_name || "Unknown lecturer")}</h3>

                        <p>
                            <strong>Unit:</strong>
                            ${escapeAdminHtml(unit?.unit_code || "")}
                            - ${escapeAdminHtml(unit?.unit_name || "Unknown unit")}
                        </p>

                        <p>
                            <strong>Semester:</strong>
                            ${escapeAdminHtml(semester?.semester_number ?? "N/A")}
                        </p>

                        <p>
                            <strong>Assigned:</strong>
                            ${assignment.created_at
                                ? new Date(assignment.created_at).toLocaleDateString()
                                : "N/A"}
                        </p>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Load unit lecturer assignments error:", error);

        unitLecturerAssignmentsList.innerHTML = `
            <p class="error-message">
                Could not load assignments: ${escapeAdminHtml(error.message)}
            </p>
        `;
    }
}

// ============================================================
// PART 6: UNIVERSITY FINANCE MANAGEMENT
// ============================================================

const studentFeeBalancesList = document.getElementById("studentFeeBalancesList");
const paymentStudent = document.getElementById("paymentStudent");
const paymentAmount = document.getElementById("paymentAmount");
const paymentMethod = document.getElementById("paymentMethod");
const paymentReference = document.getElementById("paymentReference");
const recordPaymentBtn = document.getElementById("recordPaymentBtn");
const paymentMessage = document.getElementById("paymentMessage");
const feePaymentHistoryList = document.getElementById("feePaymentHistoryList");


// ------------------------------------------------------------
// 1. LOAD STUDENT FEE ACCOUNTS
// ------------------------------------------------------------

async function getUniversityFeeAccounts() {
    const { data: students, error: studentError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("university_id", currentProfile.university_id)
        .eq("role", "student");

    if (studentError) throw studentError;

    const studentIds = (students || []).map(student => student.id);

    if (studentIds.length === 0) return [];

    const { data: accounts, error: accountError } = await supabase
        .from("student_fee_accounts")
        .select("id, student_id, fee_structure_id, amount_due, created_at")
        .in("student_id", studentIds);

    if (accountError) throw accountError;

    const studentMap = new Map(
        (students || []).map(student => [student.id, student])
    );

    return (accounts || []).map(account => ({
        ...account,
        student: studentMap.get(account.student_id)
    }));
}


// ------------------------------------------------------------
// 2. CALCULATE PAYMENTS FOR FEE ACCOUNTS
// ------------------------------------------------------------

async function getPaymentsForAccounts(accounts) {
    const accountIds = accounts.map(account => account.id);

    if (accountIds.length === 0) return new Map();

    const { data: payments, error } = await supabase
        .from("fee_payments")
        .select("id, fee_account_id, amount")
        .in("fee_account_id", accountIds);

    if (error) throw error;

    const paymentTotals = new Map();

    (payments || []).forEach(payment => {
        const accountId = payment.fee_account_id;

        paymentTotals.set(
            accountId,
            (paymentTotals.get(accountId) || 0) + Number(payment.amount || 0)
        );
    });

    return paymentTotals;
}


// ------------------------------------------------------------
// 3. LOAD PAYMENT STUDENTS
// ------------------------------------------------------------

async function loadPaymentStudents() {
    if (!paymentStudent) return;

    try {
        const accounts = await getUniversityFeeAccounts();

        paymentStudent.innerHTML = `
            <option value="">Select student</option>
        `;

        accounts.forEach(account => {
            const option = document.createElement("option");

            // Use the fee account ID so payments go to the correct account.
            option.value = account.id;

            option.textContent =
                `${account.student?.full_name || "Unknown student"} — Account`;

            paymentStudent.appendChild(option);
        });

    } catch (error) {
        console.error("Payment student loading error:", error);
        paymentStudent.innerHTML = `
            <option value="">Unable to load students</option>
        `;
    }
}


// ------------------------------------------------------------
// 4. LOAD STUDENT FEE BALANCES
// ------------------------------------------------------------

async function loadStudentFeeBalances() {
    if (!studentFeeBalancesList) return;

    studentFeeBalancesList.innerHTML = `
        <p class="loading-message">Loading fee balances...</p>
    `;

    try {
        const accounts = await getUniversityFeeAccounts();

        if (accounts.length === 0) {
            studentFeeBalancesList.innerHTML = `
                <div class="empty-state">
                    <h3>No fee accounts found</h3>
                    <p>Student fee accounts will appear here.</p>
                </div>
            `;
            return;
        }

        const paymentTotals = await getPaymentsForAccounts(accounts);

        studentFeeBalancesList.innerHTML = accounts.map(account => {
            const amountDue = Number(account.amount_due || 0);
            const amountPaid = paymentTotals.get(account.id) || 0;
            const balance = amountDue - amountPaid;

            let status = "Paid";

            if (balance > 0) {
                status = amountPaid > 0 ? "Partially Paid" : "Unpaid";
            } else if (balance < 0) {
                status = "Credit";
            }

            return `
                <div class="admin-list-card">
                    <div class="admin-list-card-info">
                        <h3>
                            ${escapeAdminHtml(account.student?.full_name || "Unknown student")}
                        </h3>

                        <p>
                            <strong>Amount due:</strong>
                            KES ${amountDue.toLocaleString()}
                        </p>

                        <p>
                            <strong>Amount paid:</strong>
                            KES ${amountPaid.toLocaleString()}
                        </p>

                        <p>
                            <strong>Balance:</strong>
                            KES ${balance.toLocaleString()}
                        </p>

                        <span class="status-badge">
                            ${status}
                        </span>
                    </div>

                    <div class="admin-list-card-actions">
                        <button
                            type="button"
                            class="admin-action-btn view-fee-statement-btn"
                            data-account-id="${account.id}">
                            View Statement
                        </button>
                    </div>
                </div>
            `;
        }).join("");

    } catch (error) {
        console.error("Fee balance error:", error);

        studentFeeBalancesList.innerHTML = `
            <p class="error-message">
                Could not load fee balances:
                ${escapeAdminHtml(error.message)}
            </p>
        `;
    }
}


// ------------------------------------------------------------
// 5. RECORD STUDENT FEE PAYMENT
// ------------------------------------------------------------

if (recordPaymentBtn) {
    recordPaymentBtn.addEventListener("click", async () => {
        const accountId = paymentStudent?.value;
        const amount = Number(paymentAmount?.value);
        const method = paymentMethod?.value;
        const reference = paymentReference?.value?.trim();

        if (!accountId || !Number.isFinite(amount) || amount <= 0) {
            showAdminMessage(
                paymentMessage,
                "Please select a student and enter a valid amount.",
                "error"
            );
            return;
        }

        try {
            recordPaymentBtn.disabled = true;
            recordPaymentBtn.textContent = "Recording...";

            showAdminMessage(
                paymentMessage,
                "Recording payment...",
                ""
            );

            // Confirm that the account belongs to a student
            // at the current university.
            const accounts = await getUniversityFeeAccounts();

            const account = accounts.find(item => item.id === accountId);

            if (!account) {
                throw new Error("The selected fee account was not found.");
            }

            const { error } = await supabase
                .from("fee_payments")
                .insert({
                    fee_account_id: account.id,
                    student_id: account.student_id,
                    amount: amount,
                    payment_method: method || null,
                    payment_reference: reference || null,
                    payment_date: new Date().toISOString()
                });

            if (error) throw error;

            showAdminMessage(
                paymentMessage,
                "Payment recorded successfully!",
                "success"
            );

            if (paymentAmount) paymentAmount.value = "";
            if (paymentReference) paymentReference.value = "";

            await loadStudentFeeBalances();
            await loadPaymentHistory();
            await loadPaymentStudents();

        } catch (error) {
            console.error("Record payment error:", error);

            showAdminMessage(
                paymentMessage,
                error.message,
                "error"
            );

        } finally {
            recordPaymentBtn.disabled = false;
            recordPaymentBtn.textContent = "Record Payment";
        }
    });
}


// ------------------------------------------------------------
// 6. LOAD PAYMENT HISTORY
// ------------------------------------------------------------

async function loadPaymentHistory() {
    if (!feePaymentHistoryList) return;

    feePaymentHistoryList.innerHTML = `
        <p class="loading-message">Loading payment history...</p>
    `;

    try {
        const accounts = await getUniversityFeeAccounts();

        const studentMap = new Map(
            accounts.map(account => [
                account.student_id,
                account.student?.full_name || "Unknown student"
            ])
        );

        const accountIds = accounts.map(account => account.id);

        if (accountIds.length === 0) {
            feePaymentHistoryList.innerHTML = `
                <div class="empty-state">
                    <p>No payments have been recorded.</p>
                </div>
            `;
            return;
        }

        const { data: payments, error } = await supabase
            .from("fee_payments")
            .select(`
                id,
                student_id,
                fee_account_id,
                amount,
                payment_method,
                payment_reference,
                payment_date,
                created_at
            `)
            .in("fee_account_id", accountIds)
            .order("created_at", { ascending: false });

        if (error) throw error;

        if (!payments || payments.length === 0) {
            feePaymentHistoryList.innerHTML = `
                <div class="empty-state">
                    <p>No payments have been recorded.</p>
                </div>
            `;
            return;
        }

        feePaymentHistoryList.innerHTML = payments.map(payment => `
            <div class="admin-list-card">
                <div class="admin-list-card-info">
                    <h3>
                        ${escapeAdminHtml(
                            studentMap.get(payment.student_id) || "Unknown student"
                        )}
                    </h3>

                    <p>
                        <strong>Amount:</strong>
                        KES ${Number(payment.amount || 0).toLocaleString()}
                    </p>

                    <p>
                        <strong>Method:</strong>
                        ${escapeAdminHtml(payment.payment_method || "Not specified")}
                    </p>

                    <p>
                        <strong>Reference:</strong>
                        ${escapeAdminHtml(payment.payment_reference || "Not provided")}
                    </p>

                    <p>
                        <strong>Date:</strong>
                        ${payment.payment_date
                            ? new Date(payment.payment_date).toLocaleString()
                            : "Not available"}
                    </p>
                </div>
            </div>
        `).join("");

    } catch (error) {
        console.error("Payment history error:", error);

        feePaymentHistoryList.innerHTML = `
            <p class="error-message">
                Could not load payment history:
                ${escapeAdminHtml(error.message)}
            </p>
        `;
    }
}


// ------------------------------------------------------------
// 7. VIEW STUDENT FEE STATEMENT
// ------------------------------------------------------------

async function viewFeeStatement(accountId) {
    try {
        const accounts = await getUniversityFeeAccounts();

        const account = accounts.find(item => item.id === accountId);

        if (!account) {
            throw new Error("Fee account not found.");
        }

        const { data: payments, error } = await supabase
            .from("fee_payments")
            .select(`
                amount,
                payment_method,
                payment_reference,
                payment_date
            `)
            .eq("fee_account_id", accountId)
            .order("payment_date", { ascending: true });

        if (error) throw error;

        const totalDue = Number(account.amount_due || 0);
        const totalPaid = (payments || []).reduce(
            (sum, payment) => sum + Number(payment.amount || 0),
            0
        );

        const balance = totalDue - totalPaid;

        const rows = (payments || []).map(payment => `
            <tr>
                <td>
                    ${payment.payment_date
                        ? new Date(payment.payment_date).toLocaleDateString()
                        : "N/A"}
                </td>
                <td>${escapeAdminHtml(payment.payment_reference || "-")}</td>
                <td>${escapeAdminHtml(payment.payment_method || "-")}</td>
                <td>KES ${Number(payment.amount || 0).toLocaleString()}</td>
            </tr>
        `).join("");

        const statementWindow = window.open("", "_blank");

        if (!statementWindow) {
            throw new Error("Please allow pop-ups to view the statement.");
        }

        const universityName = await getCurrentUniversityName();

        statementWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Fee Statement</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 40px;
                        color: #222;
                    }

                    h1, .heading {
                        text-align: center;
                    }

                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 25px;
                    }

                    th, td {
                        padding: 12px;
                        border: 1px solid #ddd;
                        text-align: left;
                    }

                    th {
                        background: #f0f3f0;
                    }

                    .summary {
                        margin-top: 25px;
                        padding: 20px;
                        background: #f5f7f5;
                    }

                    button {
                        padding: 10px 20px;
                        cursor: pointer;
                    }

                    @media print {
                        button { display: none; }
                    }
                </style>
            </head>

            <body>
                <div class="heading">
                    <h1>${escapeAdminHtml(universityName)}</h1>
                    <h2>STUDENT FEE STATEMENT</h2>
                </div>

                <p><strong>Student:</strong>
                    ${escapeAdminHtml(account.student?.full_name || "Student")}
                </p>

                <p><strong>Date:</strong>
                    ${new Date().toLocaleDateString()}
                </p>

                <div class="summary">
                    <p>Total fees due: KES ${totalDue.toLocaleString()}</p>
                    <p>Total paid: KES ${totalPaid.toLocaleString()}</p>
                    <p><strong>Outstanding balance: KES ${balance.toLocaleString()}</strong></p>
                </div>

                <h3>Payment History</h3>

                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Reference</th>
                            <th>Method</th>
                            <th>Amount</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows || "<tr><td colspan='4'>No payments recorded.</td></tr>"}
                    </tbody>
                </table>

                <br>
                <button onclick="window.print()">Print Statement</button>
            </body>
            </html>
        `);

        statementWindow.document.close();

    } catch (error) {
        console.error("Fee statement error:", error);
        alert("Could not generate statement: " + error.message);
    }
}


// ------------------------------------------------------------
// 8. CONNECT VIEW STATEMENT BUTTONS
// ------------------------------------------------------------

if (studentFeeBalancesList) {
    studentFeeBalancesList.addEventListener("click", event => {
        const button = event.target.closest(".view-fee-statement-btn");

        if (!button) return;

        viewFeeStatement(button.dataset.accountId);
    });
}

// =====================================================
// PART 7: EXAMINATION PERIODS AND TIMETABLE MANAGEMENT
// =====================================================

// -------------------------------
// EXAMINATION PERIOD ELEMENTS
// -------------------------------

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


// -------------------------------
// TIMETABLE ELEMENTS
// -------------------------------

const createExamTimetableBtn =
    document.getElementById("createExamTimetableBtn");

const examinationTimetableModal =
    document.getElementById("examinationTimetableModal");

const closeExaminationTimetableModal =
    document.getElementById("closeExaminationTimetableModal");

const examinationTimetableForm =
    document.getElementById("examinationTimetableForm");

const timetableExamPeriod =
    document.getElementById("timetableExamPeriod");

const timetableUnit =
    document.getElementById("timetableUnit");

const examinationTimetableList =
    document.getElementById("examinationTimetableList");


// =====================================================
// LOAD ACADEMIC YEARS FOR EXAMINATION PERIODS
// =====================================================

async function loadExamPeriodAcademicYears() {

    if (!examPeriodAcademicYear || !currentProfile) return;

    examPeriodAcademicYear.innerHTML =
        `<option value="">Loading academic years...</option>`;

    const { data: departments, error: departmentError } =
        await supabase
            .from("departments")
            .select("id")
            .eq("university_id", currentProfile.university_id);

    if (departmentError) {
        console.error(departmentError);
        examPeriodAcademicYear.innerHTML =
            `<option value="">Unable to load academic years</option>`;
        return;
    }

    const departmentIds =
        (departments || []).map(item => item.id);

    if (!departmentIds.length) {
        examPeriodAcademicYear.innerHTML =
            `<option value="">No departments found</option>`;
        return;
    }

    const { data: programmes, error: programmeError } =
        await supabase
            .from("programmes")
            .select("id, name, department_id")
            .in("department_id", departmentIds);

    if (programmeError) {
        console.error(programmeError);
        examPeriodAcademicYear.innerHTML =
            `<option value="">Unable to load programmes</option>`;
        return;
    }

    const programmeIds =
        (programmes || []).map(item => item.id);

    if (!programmeIds.length) {
        examPeriodAcademicYear.innerHTML =
            `<option value="">No programmes found</option>`;
        return;
    }

    const { data: years, error: yearError } =
        await supabase
            .from("academic_years")
            .select("id, programme_id, year_number")
            .in("programme_id", programmeIds)
            .order("year_number");

    if (yearError) {
        console.error(yearError);
        examPeriodAcademicYear.innerHTML =
            `<option value="">Unable to load academic years</option>`;
        return;
    }

    const programmeMap = {};

    (programmes || []).forEach(programme => {
        programmeMap[programme.id] = programme;
    });

    examPeriodAcademicYear.innerHTML =
        `<option value="">Select academic year</option>`;

    (years || []).forEach(year => {

        const programme = programmeMap[year.programme_id];

        const option = document.createElement("option");

        option.value = year.id;

        option.textContent =
            `${programme?.name || "Programme"} - Year ${year.year_number}`;

        examPeriodAcademicYear.appendChild(option);
    });

    if (examPeriodSemester) {
        examPeriodSemester.innerHTML =
            `<option value="">Select semester</option>`;
    }
}


// =====================================================
// LOAD SEMESTERS WHEN ACADEMIC YEAR IS SELECTED
// =====================================================

if (examPeriodAcademicYear) {

    examPeriodAcademicYear.addEventListener("change", async () => {

        const academicYearId = examPeriodAcademicYear.value;

        if (!examPeriodSemester) return;

        examPeriodSemester.innerHTML =
            `<option value="">Loading semesters...</option>`;

        if (!academicYearId) {
            examPeriodSemester.innerHTML =
                `<option value="">Select semester</option>`;
            return;
        }

        const { data, error } = await supabase
            .from("semesters")
            .select("id, semester_number")
            .eq("academic_year_id", academicYearId)
            .order("semester_number");

        if (error) {
            console.error(error);

            examPeriodSemester.innerHTML =
                `<option value="">Unable to load semesters</option>`;

            return;
        }

        examPeriodSemester.innerHTML =
            `<option value="">Select semester</option>`;

        (data || []).forEach(semester => {

            const option = document.createElement("option");

            option.value = semester.id;

            option.textContent =
                `Semester ${semester.semester_number}`;

            examPeriodSemester.appendChild(option);
        });
    });
}


// =====================================================
// OPEN AND CLOSE EXAMINATION PERIOD MODAL
// =====================================================

if (manageExaminationsBtn) {

    manageExaminationsBtn.addEventListener("click", async () => {

        examinationPeriodForm?.reset();

        examinationPeriodModal?.classList.add("active");

        await loadExamPeriodAcademicYears();
    });
}


function closeExaminationPeriodModalWindow() {

    examinationPeriodModal?.classList.remove("active");

    examinationPeriodForm?.reset();
}


if (closeExaminationPeriodModal) {

    closeExaminationPeriodModal.addEventListener(
        "click",
        closeExaminationPeriodModalWindow
    );
}


if (examinationPeriodModal) {

    examinationPeriodModal.addEventListener("click", event => {

        if (event.target === examinationPeriodModal) {
            closeExaminationPeriodModalWindow();
        }
    });
}


// =====================================================
// CREATE EXAMINATION PERIOD
// =====================================================

if (examinationPeriodForm) {

    examinationPeriodForm.addEventListener("submit", async event => {

        event.preventDefault();

        const name =
            document.getElementById("examPeriodName")?.value.trim();

        const academicYearId =
            examPeriodAcademicYear?.value;

        const semesterId =
            examPeriodSemester?.value;

        const startDate =
            document.getElementById("examPeriodStartDate")?.value;

        const endDate =
            document.getElementById("examPeriodEndDate")?.value;

        const message =
            document.getElementById("examinationPeriodMessage");


        if (
            !name ||
            !academicYearId ||
            !semesterId ||
            !startDate ||
            !endDate
        ) {

            if (message) {
                message.textContent = "Please complete all fields.";
                message.className = "form-message error";
            }

            return;
        }


        if (endDate < startDate) {

            if (message) {
                message.textContent =
                    "End date cannot be before start date.";

                message.className = "form-message error";
            }

            return;
        }


        if (message) {
            message.textContent = "Saving examination period...";
            message.className = "form-message";
        }


        // Verify academic year belongs to this university

        const { data: academicYear, error: yearError } =
            await supabase
                .from("academic_years")
                .select("id, programme_id")
                .eq("id", academicYearId)
                .maybeSingle();


        if (yearError || !academicYear) {

            if (message) {
                message.textContent = "Invalid academic year.";
                message.className = "form-message error";
            }

            return;
        }


        const { data: programme, error: programmeError } =
            await supabase
                .from("programmes")
                .select("id, department_id")
                .eq("id", academicYear.programme_id)
                .maybeSingle();


        if (programmeError || !programme) {

            if (message) {
                message.textContent = "Programme could not be verified.";
                message.className = "form-message error";
            }

            return;
        }


        const { data: department, error: departmentError } =
            await supabase
                .from("departments")
                .select("id, university_id")
                .eq("id", programme.department_id)
                .maybeSingle();


        if (
            departmentError ||
            !department ||
            department.university_id !== currentProfile.university_id
        ) {

            if (message) {
                message.textContent =
                    "This academic year does not belong to your university.";

                message.className = "form-message error";
            }

            return;
        }


        const { data: semester, error: semesterError } =
            await supabase
                .from("semesters")
                .select("id")
                .eq("id", semesterId)
                .eq("academic_year_id", academicYearId)
                .maybeSingle();


        if (semesterError || !semester) {

            if (message) {
                message.textContent = "Invalid semester selected.";
                message.className = "form-message error";
            }

            return;
        }


        const { error } = await supabase
            .from("examination_periods")
            .insert({

                university_id: currentProfile.university_id,

                academic_year_id: academicYearId,

                semester_id: semesterId,

                name: name,

                start_date: startDate,

                end_date: endDate,

                status: "upcoming"

            });


        if (error) {

            console.error(error);

            if (message) {
                message.textContent = error.message;
                message.className = "form-message error";
            }

            return;
        }


        if (message) {
            message.textContent =
                "Examination period created successfully.";

            message.className = "form-message success";
        }


        await loadExaminationPeriods();

        setTimeout(closeExaminationPeriodModalWindow, 700);

    });
}


// =====================================================
// LOAD EXAMINATION PERIODS
// =====================================================

async function loadExaminationPeriods() {

    if (!examinationPeriodsList || !currentProfile) return;

    examinationPeriodsList.innerHTML =
        `<div class="admin-loading">Loading examination periods...</div>`;


    const { data: periods, error } = await supabase
        .from("examination_periods")
        .select(`
            id,
            name,
            academic_year_id,
            semester_id,
            start_date,
            end_date,
            status
        `)
        .eq("university_id", currentProfile.university_id)
        .order("start_date", { ascending: true });


    if (error) {

        console.error(error);

        examinationPeriodsList.innerHTML =
            `<div class="admin-loading">Unable to load examination periods: ${escapeAdminHtml(error.message)}</div>`;

        return;
    }


    if (!periods?.length) {

        examinationPeriodsList.innerHTML =
            `<div class="admin-loading">No examination periods found.</div>`;

        return;
    }


    const yearIds =
        [...new Set(periods.map(item => item.academic_year_id).filter(Boolean))];

    const semesterIds =
        [...new Set(periods.map(item => item.semester_id).filter(Boolean))];


    let years = [];
    let semesters = [];


    if (yearIds.length) {

        const result = await supabase
            .from("academic_years")
            .select("id, year_number")
            .in("id", yearIds);

        if (!result.error) {
            years = result.data || [];
        }
    }


    if (semesterIds.length) {

        const result = await supabase
            .from("semesters")
            .select("id, semester_number")
            .in("id", semesterIds);

        if (!result.error) {
            semesters = result.data || [];
        }
    }


    const yearMap = {};
    const semesterMap = {};

    years.forEach(item => {
        yearMap[item.id] = item;
    });

    semesters.forEach(item => {
        semesterMap[item.id] = item;
    });


    examinationPeriodsList.innerHTML = periods.map(period => `

        <div class="admin-card">

            <div class="admin-section-heading">

                <div>

                    <h3>${escapeAdminHtml(period.name)}</h3>

                    <p>
                        Year ${yearMap[period.academic_year_id]?.year_number || "N/A"}
                        ·
                        Semester ${semesterMap[period.semester_id]?.semester_number || "N/A"}
                    </p>

                    <p>
                        ${escapeAdminHtml(period.start_date)}
                        →
                        ${escapeAdminHtml(period.end_date)}
                    </p>

                </div>

                <strong>
                    ${escapeAdminHtml(period.status || "upcoming")}
                </strong>

            </div>

            <div class="admin-card-actions">

                <button
                    type="button"
                    class="admin-secondary-button view-exam-timetable-btn"
                    data-period-id="${period.id}"
                >
                    View Timetable
                </button>

            </div>

        </div>

    `).join("");
}


// =====================================================
// LOAD EXAMINATION PERIODS FOR TIMETABLE FORM
// =====================================================

async function loadTimetableExamPeriods() {

    if (!timetableExamPeriod || !currentProfile) return;

    const { data, error } = await supabase
        .from("examination_periods")
        .select("id, name, start_date, end_date")
        .eq("university_id", currentProfile.university_id)
        .order("start_date");


    if (error) {

        console.error(error);

        timetableExamPeriod.innerHTML =
            `<option value="">Unable to load examination periods</option>`;

        return;
    }


    timetableExamPeriod.innerHTML =
        `<option value="">Select examination period</option>`;


    (data || []).forEach(period => {

        const option = document.createElement("option");

        option.value = period.id;

        option.textContent =
            `${period.name} (${period.start_date} - ${period.end_date})`;

        timetableExamPeriod.appendChild(option);
    });
}


// =====================================================
// LOAD UNIVERSITY UNITS FOR TIMETABLE FORM
// =====================================================

async function loadTimetableUnits() {

    if (!timetableUnit || !currentProfile) return;


    const { data: departments, error: departmentError } =
        await supabase
            .from("departments")
            .select("id")
            .eq("university_id", currentProfile.university_id);


    if (departmentError) {

        console.error(departmentError);

        timetableUnit.innerHTML =
            `<option value="">Unable to load units</option>`;

        return;
    }


    const departmentIds =
        (departments || []).map(item => item.id);


    if (!departmentIds.length) {

        timetableUnit.innerHTML =
            `<option value="">No units found</option>`;

        return;
    }


    const { data: programmes, error: programmeError } =
        await supabase
            .from("programmes")
            .select("id, department_id")
            .in("department_id", departmentIds);


    if (programmeError) {

        console.error(programmeError);

        timetableUnit.innerHTML =
            `<option value="">Unable to load programmes</option>`;

        return;
    }


    const programmeIds =
        (programmes || []).map(item => item.id);


    if (!programmeIds.length) {

        timetableUnit.innerHTML =
            `<option value="">No units found</option>`;

        return;
    }


    const { data: years, error: yearError } =
        await supabase
            .from("academic_years")
            .select("id")
            .in("programme_id", programmeIds);


    if (yearError) {

        console.error(yearError);

        timetableUnit.innerHTML =
            `<option value="">Unable to load academic years</option>`;

        return;
    }


    const yearIds =
        (years || []).map(item => item.id);


    if (!yearIds.length) {

        timetableUnit.innerHTML =
            `<option value="">No units found</option>`;

        return;
    }


    const { data: semesters, error: semesterError } =
        await supabase
            .from("semesters")
            .select("id")
            .in("academic_year_id", yearIds);


    if (semesterError) {

        console.error(semesterError);

        timetableUnit.innerHTML =
            `<option value="">Unable to load semesters</option>`;

        return;
    }


    const semesterIds =
        (semesters || []).map(item => item.id);


    if (!semesterIds.length) {

        timetableUnit.innerHTML =
            `<option value="">No units found</option>`;

        return;
    }


    const { data: units, error: unitError } =
        await supabase
            .from("units")
            .select("id, unit_code, unit_name, semester_id")
            .in("semester_id", semesterIds)
            .order("unit_code");


    if (unitError) {

        console.error(unitError);

        timetableUnit.innerHTML =
            `<option value="">Unable to load units</option>`;

        return;
    }


    timetableUnit.innerHTML =
        `<option value="">Select unit</option>`;


    (units || []).forEach(unit => {

        const option = document.createElement("option");

        option.value = unit.id;

        option.textContent =
            `${unit.unit_code} - ${unit.unit_name}`;

        timetableUnit.appendChild(option);
    });
}


// =====================================================
// OPEN AND CLOSE TIMETABLE MODAL
// =====================================================

if (createExamTimetableBtn) {

    createExamTimetableBtn.addEventListener("click", async () => {

        examinationTimetableForm?.reset();

        examinationTimetableModal?.classList.add("active");

        await loadTimetableExamPeriods();

        await loadTimetableUnits();

    });
}


function closeExaminationTimetableModalWindow() {

    examinationTimetableModal?.classList.remove("active");

    examinationTimetableForm?.reset();
}


if (closeExaminationTimetableModal) {

    closeExaminationTimetableModal.addEventListener(
        "click",
        closeExaminationTimetableModalWindow
    );
}


if (examinationTimetableModal) {

    examinationTimetableModal.addEventListener("click", event => {

        if (event.target === examinationTimetableModal) {
            closeExaminationTimetableModalWindow();
        }
    });
}


// =====================================================
// SAVE MANUAL EXAMINATION TIMETABLE
// =====================================================

if (examinationTimetableForm) {

    examinationTimetableForm.addEventListener("submit", async event => {

        event.preventDefault();

        const periodId = timetableExamPeriod?.value;

        const unitId = timetableUnit?.value;

        const examDate =
            document.getElementById("timetableExamDate")?.value;

        const startTime =
            document.getElementById("timetableStartTime")?.value;

        const endTime =
            document.getElementById("timetableEndTime")?.value;

        const venue =
            document.getElementById("timetableVenue")?.value.trim();

        const message =
            document.getElementById("examinationTimetableMessage");


        if (!periodId || !unitId || !examDate || !startTime || !endTime) {

            if (message) {
                message.textContent = "Please complete all required fields.";
                message.className = "form-message error";
            }

            return;
        }


        if (endTime <= startTime) {

            if (message) {
                message.textContent =
                    "End time must be after start time.";

                message.className = "form-message error";
            }

            return;
        }


        if (message) {
            message.textContent = "Saving examination timetable...";
            message.className = "form-message";
        }


        // Verify selected examination period belongs to university

        const { data: period, error: periodError } =
            await supabase
                .from("examination_periods")
                .select("id, start_date, end_date")
                .eq("id", periodId)
                .eq("university_id", currentProfile.university_id)
                .maybeSingle();


        if (periodError || !period) {

            if (message) {
                message.textContent = "Invalid examination period.";
                message.className = "form-message error";
            }

            return;
        }


        if (examDate < period.start_date || examDate > period.end_date) {

            if (message) {
                message.textContent =
                    "The examination date must fall within the examination period.";

                message.className = "form-message error";
            }

            return;
        }


        const { error } = await supabase
            .from("examination_timetables")
            .insert({

                university_id: currentProfile.university_id,

                examination_period_id: periodId,

                unit_id: unitId,

                exam_date: examDate,

                start_time: startTime,

                end_time: endTime,

                venue: venue || null

            });


        if (error) {

            console.error(error);

            if (message) {
                message.textContent = error.message;
                message.className = "form-message error";
            }

            return;
        }


        if (message) {
            message.textContent =
                "Examination timetable saved successfully.";

            message.className = "form-message success";
        }


        await loadExaminationTimetable(periodId);

        setTimeout(closeExaminationTimetableModalWindow, 700);

    });
}


// =====================================================
// LOAD EXAMINATION TIMETABLE
// =====================================================

async function loadExaminationTimetable(periodId = null) {

    if (!examinationTimetableList || !currentProfile) return;

    examinationTimetableList.innerHTML =
        `<div class="admin-loading">Loading examination timetable...</div>`;


    let query = supabase
        .from("examination_timetables")
        .select(`
            id,
            examination_period_id,
            unit_id,
            exam_date,
            start_time,
            end_time,
            venue
        `)
        .eq("university_id", currentProfile.university_id)
        .order("exam_date")
        .order("start_time");


    if (periodId) {
        query = query.eq("examination_period_id", periodId);
    }


    const { data: timetable, error } = await query;


    if (error) {

        console.error(error);

        examinationTimetableList.innerHTML =
            `<div class="admin-loading">Unable to load timetable: ${escapeAdminHtml(error.message)}</div>`;

        return;
    }


    if (!timetable?.length) {

        examinationTimetableList.innerHTML =
            `<div class="admin-loading">No examination timetable entries found.</div>`;

        return;
    }


    const unitIds =
        [...new Set(timetable.map(item => item.unit_id).filter(Boolean))];

    const periodIds =
        [...new Set(timetable.map(item => item.examination_period_id).filter(Boolean))];


    let units = [];
    let periods = [];


    if (unitIds.length) {

        const result = await supabase
            .from("units")
            .select("id, unit_code, unit_name")
            .in("id", unitIds);

        if (!result.error) {
            units = result.data || [];
        }
    }


    if (periodIds.length) {

        const result = await supabase
            .from("examination_periods")
            .select("id, name")
            .in("id", periodIds)
            .eq("university_id", currentProfile.university_id);

        if (!result.error) {
            periods = result.data || [];
        }
    }


    const unitMap = {};
    const periodMap = {};


    units.forEach(unit => {
        unitMap[unit.id] = unit;
    });

    periods.forEach(period => {
        periodMap[period.id] = period;
    });


    examinationTimetableList.innerHTML = timetable.map(entry => {

        const unit = unitMap[entry.unit_id];

        const period = periodMap[entry.examination_period_id];

        const formattedDate = entry.exam_date
            ? new Date(entry.exam_date + "T00:00:00").toLocaleDateString()
            : "Not available";

        const formattedStart = entry.start_time
            ? entry.start_time.substring(0, 5)
            : "N/A";

        const formattedEnd = entry.end_time
            ? entry.end_time.substring(0, 5)
            : "N/A";


        return `

            <div class="admin-card">

                <div class="admin-section-heading">

                    <div>

                        <h3>
                            ${escapeAdminHtml(unit?.unit_code || "Unknown Unit")}
                        </h3>

                        <p>
                            ${escapeAdminHtml(unit?.unit_name || "")}
                        </p>

                    </div>

                    <strong>
                        ${escapeAdminHtml(period?.name || "Examination")}
                    </strong>

                </div>


                <div class="admin-grid">

                    <div>
                        <strong>Date</strong>
                        <p>${escapeAdminHtml(formattedDate)}</p>
                    </div>

                    <div>
                        <strong>Time</strong>
                        <p>
                            ${escapeAdminHtml(formattedStart)}
                            -
                            ${escapeAdminHtml(formattedEnd)}
                        </p>
                    </div>

                    <div>
                        <strong>Venue</strong>
                        <p>${escapeAdminHtml(entry.venue || "Not assigned")}</p>
                    </div>

                </div>

            </div>

        `;

    }).join("");
}


// =====================================================
// VIEW TIMETABLE FOR A SELECTED EXAMINATION PERIOD
// =====================================================

if (examinationPeriodsList) {

    examinationPeriodsList.addEventListener("click", async event => {

        const button =
            event.target.closest(".view-exam-timetable-btn");

        if (!button) return;

        const periodId = button.dataset.periodId;

        await loadExaminationTimetable(periodId);

        examinationTimetableList?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });
}

// =====================================================
// PART 8: ACADEMIC CALENDAR MANAGEMENT
// =====================================================

const academicCalendarList =
    document.getElementById("academicCalendarList");

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


// =====================================================
// LOAD ACADEMIC YEARS FOR CALENDAR
// =====================================================

async function loadCalendarAcademicYears() {

    if (!calendarEventAcademicYear || !currentProfile) return;

    calendarEventAcademicYear.innerHTML =
        `<option value="">Loading academic years...</option>`;

    const { data: departments, error: departmentError } =
        await supabase
            .from("departments")
            .select("id")
            .eq("university_id", currentProfile.university_id);

    if (departmentError) {

        console.error(departmentError);

        calendarEventAcademicYear.innerHTML =
            `<option value="">Unable to load departments</option>`;

        return;
    }

    const departmentIds =
        (departments || []).map(item => item.id);

    if (!departmentIds.length) {

        calendarEventAcademicYear.innerHTML =
            `<option value="">No departments found</option>`;

        return;
    }

    const { data: programmes, error: programmeError } =
        await supabase
            .from("programmes")
            .select("id, name, department_id")
            .in("department_id", departmentIds);

    if (programmeError) {

        console.error(programmeError);

        calendarEventAcademicYear.innerHTML =
            `<option value="">Unable to load programmes</option>`;

        return;
    }

    const programmeIds =
        (programmes || []).map(item => item.id);

    if (!programmeIds.length) {

        calendarEventAcademicYear.innerHTML =
            `<option value="">No programmes found</option>`;

        return;
    }

    const { data: years, error: yearError } =
        await supabase
            .from("academic_years")
            .select("id, programme_id, year_number")
            .in("programme_id", programmeIds)
            .order("year_number");

    if (yearError) {

        console.error(yearError);

        calendarEventAcademicYear.innerHTML =
            `<option value="">Unable to load academic years</option>`;

        return;
    }

    const programmeMap = {};

    (programmes || []).forEach(programme => {
        programmeMap[programme.id] = programme;
    });

    calendarEventAcademicYear.innerHTML =
        `<option value="">Select academic year (optional)</option>`;

    (years || []).forEach(year => {

        const programme = programmeMap[year.programme_id];

        const option = document.createElement("option");

        option.value = year.id;

        option.textContent =
            `${programme?.name || "Programme"} - Year ${year.year_number}`;

        calendarEventAcademicYear.appendChild(option);
    });

    if (calendarEventSemester) {

        calendarEventSemester.innerHTML =
            `<option value="">Select semester (optional)</option>`;

    }
}


// =====================================================
// LOAD SEMESTERS WHEN ACADEMIC YEAR CHANGES
// =====================================================

if (calendarEventAcademicYear) {

    calendarEventAcademicYear.addEventListener("change", async () => {

        if (!calendarEventSemester) return;

        const academicYearId = calendarEventAcademicYear.value;

        calendarEventSemester.innerHTML =
            `<option value="">Loading semesters...</option>`;

        if (!academicYearId) {

            calendarEventSemester.innerHTML =
                `<option value="">Select semester (optional)</option>`;

            return;
        }

        const { data, error } = await supabase
            .from("semesters")
            .select("id, semester_number")
            .eq("academic_year_id", academicYearId)
            .order("semester_number");

        if (error) {

            console.error(error);

            calendarEventSemester.innerHTML =
                `<option value="">Unable to load semesters</option>`;

            return;
        }

        calendarEventSemester.innerHTML =
            `<option value="">Select semester (optional)</option>`;

        (data || []).forEach(semester => {

            const option = document.createElement("option");

            option.value = semester.id;

            option.textContent =
                `Semester ${semester.semester_number}`;

            calendarEventSemester.appendChild(option);
        });

    });
}


// =====================================================
// OPEN CALENDAR EVENT MODAL
// =====================================================

if (createAcademicCalendarEventBtn) {

    createAcademicCalendarEventBtn.addEventListener("click", async () => {

        academicCalendarForm?.reset();

        if (academicCalendarMessage) {

            academicCalendarMessage.textContent = "";

            academicCalendarMessage.className = "form-message";

        }

        academicCalendarModal?.classList.add("active");

        await loadCalendarAcademicYears();

    });
}


// =====================================================
// CLOSE CALENDAR EVENT MODAL
// =====================================================

function closeAcademicCalendarModalWindow() {

    academicCalendarModal?.classList.remove("active");

    academicCalendarForm?.reset();

}


if (closeAcademicCalendarModal) {

    closeAcademicCalendarModal.addEventListener(
        "click",
        closeAcademicCalendarModalWindow
    );

}


if (academicCalendarModal) {

    academicCalendarModal.addEventListener("click", event => {

        if (event.target === academicCalendarModal) {

            closeAcademicCalendarModalWindow();

        }

    });

}


// =====================================================
// CREATE ACADEMIC CALENDAR EVENT
// =====================================================

if (academicCalendarForm) {

    academicCalendarForm.addEventListener("submit", async event => {

        event.preventDefault();

        const title = calendarEventTitle?.value.trim();

        const description =
            calendarEventDescription?.value.trim();

        const eventType = calendarEventType?.value;

        const academicYearId =
            calendarEventAcademicYear?.value;

        const semesterId =
            calendarEventSemester?.value;

        const startDate =
            calendarEventStartDate?.value;

        const endDate =
            calendarEventEndDate?.value;


        if (!title || !eventType || !startDate || !endDate) {

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
                    "End date cannot be before start date.";

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


        // Verify academic year belongs to this university

        if (academicYearId) {

            const { data: year, error: yearError } =
                await supabase
                    .from("academic_years")
                    .select("id, programme_id")
                    .eq("id", academicYearId)
                    .maybeSingle();

            if (yearError || !year) {

                academicCalendarMessage.textContent =
                    "Invalid academic year.";

                academicCalendarMessage.className =
                    "form-message error";

                return;
            }


            const { data: programme, error: programmeError } =
                await supabase
                    .from("programmes")
                    .select("id, department_id")
                    .eq("id", year.programme_id)
                    .maybeSingle();

            if (programmeError || !programme) {

                academicCalendarMessage.textContent =
                    "Unable to verify programme.";

                academicCalendarMessage.className =
                    "form-message error";

                return;
            }


            const { data: department, error: departmentError } =
                await supabase
                    .from("departments")
                    .select("id, university_id")
                    .eq("id", programme.department_id)
                    .maybeSingle();

            if (
                departmentError ||
                !department ||
                department.university_id !== currentProfile.university_id
            ) {

                academicCalendarMessage.textContent =
                    "The selected academic year does not belong to your university.";

                academicCalendarMessage.className =
                    "form-message error";

                return;
            }

        }


        // Verify semester belongs to selected academic year

        if (semesterId) {

            if (!academicYearId) {

                academicCalendarMessage.textContent =
                    "Select an academic year before selecting a semester.";

                academicCalendarMessage.className =
                    "form-message error";

                return;
            }

            const { data: semester, error: semesterError } =
                await supabase
                    .from("semesters")
                    .select("id")
                    .eq("id", semesterId)
                    .eq("academic_year_id", academicYearId)
                    .maybeSingle();

            if (semesterError || !semester) {

                academicCalendarMessage.textContent =
                    "Invalid semester selected.";

                academicCalendarMessage.className =
                    "form-message error";

                return;
            }

        }


        const { error } = await supabase
            .from("academic_calendar_events")
            .insert({

                university_id: currentProfile.university_id,

                academic_year_id: academicYearId || null,

                semester_id: semesterId || null,

                title: title,

                description: description || null,

                event_type: eventType,

                start_date: startDate,

                end_date: endDate

            });


        if (error) {

            console.error("Academic calendar error:", error);

            academicCalendarMessage.textContent =
                error.message;

            academicCalendarMessage.className =
                "form-message error";

            return;
        }


        academicCalendarMessage.textContent =
            "Academic calendar event created successfully.";

        academicCalendarMessage.className =
            "form-message success";


        await loadAcademicCalendar();

        setTimeout(closeAcademicCalendarModalWindow, 700);

    });

}


// =====================================================
// LOAD ACADEMIC CALENDAR EVENTS
// =====================================================

async function loadAcademicCalendar() {

    if (!academicCalendarList || !currentProfile) return;

    academicCalendarList.innerHTML =
        `<div class="admin-loading">Loading academic calendar...</div>`;


    const { data: events, error } = await supabase
        .from("academic_calendar_events")
        .select(`
            id,
            title,
            description,
            event_type,
            start_date,
            end_date,
            academic_year_id,
            semester_id
        `)
        .eq("university_id", currentProfile.university_id)
        .order("start_date", { ascending: true });


    if (error) {

        console.error("Academic calendar loading error:", error);

        academicCalendarList.innerHTML =
            `<div class="admin-loading">
                Unable to load academic calendar.
                <br><br>
                ${escapeAdminHtml(error.message)}
            </div>`;

        return;
    }


    if (!events?.length) {

        academicCalendarList.innerHTML =
            `<div class="admin-empty-state">
                <p>No academic calendar events have been created.</p>
            </div>`;

        return;
    }


    const yearIds =
        [...new Set(events.map(item => item.academic_year_id).filter(Boolean))];

    const semesterIds =
        [...new Set(events.map(item => item.semester_id).filter(Boolean))];


    let years = [];

    let semesters = [];


    if (yearIds.length) {

        const result = await supabase
            .from("academic_years")
            .select("id, year_number")
            .in("id", yearIds);

        if (!result.error) {
            years = result.data || [];
        }

    }


    if (semesterIds.length) {

        const result = await supabase
            .from("semesters")
            .select("id, semester_number")
            .in("id", semesterIds);

        if (!result.error) {
            semesters = result.data || [];
        }

    }


    const yearMap = {};

    const semesterMap = {};


    years.forEach(year => {
        yearMap[year.id] = year;
    });

    semesters.forEach(semester => {
        semesterMap[semester.id] = semester;
    });


    academicCalendarList.innerHTML = events.map(item => {

        const start = item.start_date
            ? new Date(item.start_date + "T00:00:00").toLocaleDateString()
            : "N/A";

        const end = item.end_date
            ? new Date(item.end_date + "T00:00:00").toLocaleDateString()
            : "N/A";


        return `

            <div class="admin-card">

                <div class="admin-section-heading">

                    <div>

                        <h3>📅 ${escapeAdminHtml(item.title)}</h3>

                        <p>
                            ${escapeAdminHtml(item.event_type || "Academic event")}
                        </p>

                    </div>

                    <button
                        type="button"
                        class="admin-danger-button delete-academic-calendar-btn"
                        data-id="${item.id}"
                    >
                        Delete
                    </button>

                </div>


                <p>
                    <strong>Start:</strong>
                    ${escapeAdminHtml(start)}
                </p>

                <p>
                    <strong>End:</strong>
                    ${escapeAdminHtml(end)}
                </p>

                <p>
                    <strong>Academic year:</strong>
                    ${yearMap[item.academic_year_id]?.year_number || "General event"}
                </p>

                ${
                    item.semester_id
                        ? `<p><strong>Semester:</strong> ${semesterMap[item.semester_id]?.semester_number || "N/A"}</p>`
                        : ""
                }

                ${
                    item.description
                        ? `<p>${escapeAdminHtml(item.description)}</p>`
                        : ""
                }

            </div>

        `;

    }).join("");

}


// =====================================================
// DELETE ACADEMIC CALENDAR EVENT
// =====================================================

if (academicCalendarList) {

    academicCalendarList.addEventListener("click", async event => {

        const button =
            event.target.closest(".delete-academic-calendar-btn");

        if (!button || !currentProfile) return;


        const eventId = button.dataset.id;

        if (!eventId) return;


        const confirmed = confirm(
            "Are you sure you want to delete this academic calendar event?"
        );

        if (!confirmed) return;


        button.disabled = true;

        button.textContent = "Deleting...";


        const { error } = await supabase
            .from("academic_calendar_events")
            .delete()
            .eq("id", eventId)
            .eq("university_id", currentProfile.university_id);


        if (error) {

            console.error(error);

            alert(error.message);

            button.disabled = false;

            button.textContent = "Delete";

            return;
        }


        await loadAcademicCalendar();

    });

}

// =====================================================
// PART 9 — DASHBOARD OVERVIEW AND ANALYTICS
// =====================================================

const overviewActiveStudents = document.getElementById("overviewActiveStudents");
const overviewTotalCollected = document.getElementById("overviewTotalCollected");
const overviewOutstandingFees = document.getElementById("overviewOutstandingFees");
const monthlyCollectionChart = document.getElementById("monthlyCollectionChart");
const overviewRecentPayments = document.getElementById("overviewRecentPayments");
const overviewRecentApplications = document.getElementById("overviewRecentApplications");

function formatAdminCurrency(amount) {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0
    }).format(Number(amount) || 0);
}

function escapeOverviewText(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


// -----------------------------------------------------
// LOAD OVERVIEW STATISTICS
// -----------------------------------------------------

async function loadDashboardOverviewWidgets() {

    if (!currentProfile?.university_id) return;

    const universityId = currentProfile.university_id;

    try {

        // ACTIVE STUDENTS

        const { count: studentCount, error: studentError } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("university_id", universityId)
            .eq("role", "student");

        if (studentError) throw studentError;

        if (overviewActiveStudents) {
            overviewActiveStudents.textContent = studentCount ?? 0;
        }

// STUDENT FEE ACCOUNTS
// Only retrieve accounts belonging to the selected university.

const accounts = await getUniversityFeeAccounts();

const accountList = accounts || [];

const accountIds = accountList.map(account => account.id);
        // PAYMENTS

        let payments = [];

        if (accountIds.length) {

            const { data: paymentData, error: paymentError } = await supabase
                .from("fee_payments")
                .select("id, fee_account_id, student_id, amount, payment_method, payment_reference, payment_date, receipt_number")
                .in("fee_account_id", accountIds)
                .order("payment_date", { ascending: false });

            if (paymentError) throw paymentError;

            payments = paymentData || [];
        }


        // CALCULATE COLLECTIONS AND BALANCES

        const totalCollected = payments.reduce(
            (total, payment) => total + Number(payment.amount || 0),
            0
        );

        const totalFeesDue = accountList.reduce(
            (total, account) => total + Number(account.amount_due || 0),
            0
        );

        const outstandingBalance = Math.max(0, totalFeesDue - totalCollected);

        if (overviewTotalCollected) {
            overviewTotalCollected.textContent =
                formatAdminCurrency(totalCollected);
        }

        if (overviewOutstandingFees) {
            overviewOutstandingFees.textContent =
                formatAdminCurrency(outstandingBalance);
        }


        // MONTHLY COLLECTION CHART

        loadMonthlyCollectionChart(payments);


        // RECENT PAYMENTS

        await loadOverviewRecentPayments(payments);


        // RECENT APPLICATIONS

        await loadOverviewRecentApplications(universityId);

    } catch (error) {

        console.error("Dashboard overview error:", error);

        if (overviewActiveStudents) {
            overviewActiveStudents.textContent = "—";
        }

        if (overviewTotalCollected) {
            overviewTotalCollected.textContent = "Unavailable";
        }

        if (overviewOutstandingFees) {
            overviewOutstandingFees.textContent = "Unavailable";
        }

        if (monthlyCollectionChart) {
            monthlyCollectionChart.innerHTML =
                `<p class="muted-text">Unable to load collection statistics.</p>`;
        }
    }
}


// -----------------------------------------------------
// MONTHLY COLLECTION CHART
// -----------------------------------------------------

function loadMonthlyCollectionChart(payments) {

    if (!monthlyCollectionChart) return;

    const months = [];

    for (let i = 5; i >= 0; i--) {

        const date = new Date();

        date.setDate(1);
        date.setMonth(date.getMonth() - i);

        months.push({
            year: date.getFullYear(),
            month: date.getMonth(),
            label: date.toLocaleDateString("en-KE", {
                month: "short"
            }),
            total: 0
        });
    }

    payments.forEach(payment => {

        if (!payment.payment_date) return;

        const paymentDate = new Date(payment.payment_date);

        const matchingMonth = months.find(item =>
            item.year === paymentDate.getFullYear() &&
            item.month === paymentDate.getMonth()
        );

        if (matchingMonth) {
            matchingMonth.total += Number(payment.amount || 0);
        }
    });

    const highest = Math.max(
        ...months.map(month => month.total),
        1
    );

    monthlyCollectionChart.innerHTML = `
        <div class="monthly-chart-bars">

            ${months.map(month => {

                const height = Math.max(
                    4,
                    (month.total / highest) * 100
                );

                return `
                    <div class="monthly-chart-column">

                        <strong>
                            ${formatAdminCurrency(month.total)}
                        </strong>

                        <div class="monthly-chart-track">
                            <div
                                class="monthly-chart-fill"
                                style="height:${height}%"
                            ></div>
                        </div>

                        <span>${escapeOverviewText(month.label)}</span>

                    </div>
                `;

            }).join("")}

        </div>
    `;
}


// -----------------------------------------------------
// RECENT PAYMENTS
// -----------------------------------------------------

async function loadOverviewRecentPayments(payments) {

    if (!overviewRecentPayments) return;

    const recentPayments = payments.slice(0, 5);

    if (!recentPayments.length) {

        overviewRecentPayments.innerHTML =
            `<p class="muted-text">No payments have been recorded yet.</p>`;

        return;
    }

    const studentIds = [
        ...new Set(recentPayments.map(payment => payment.student_id).filter(Boolean))
    ];

    let studentNames = new Map();

    if (studentIds.length) {

        const { data: students, error } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", studentIds);

        if (error) throw error;

        studentNames = new Map(
            (students || []).map(student => [
                student.id,
                student.full_name
            ])
        );
    }

    overviewRecentPayments.innerHTML = recentPayments.map(payment => {

        const studentName =
            studentNames.get(payment.student_id) || "Student";

        return `
            <div class="overview-activity">

                <div>
                    <strong>${escapeOverviewText(studentName)}</strong>

                    <small>
                        ${payment.payment_date
                            ? new Date(payment.payment_date).toLocaleDateString("en-KE")
                            : "Date unavailable"}
                    </small>
                </div>

                <b>${formatAdminCurrency(payment.amount)}</b>

            </div>
        `;

    }).join("");
}


// -----------------------------------------------------
// LATEST APPLICATIONS
// -----------------------------------------------------

async function loadOverviewRecentApplications(universityId) {

    if (!overviewRecentApplications) return;

    const { data, error } = await supabase
        .from("university_applications")
        .select("id, applicant_id, application_status, application_date")
        .eq("university_id", universityId)
        .order("application_date", { ascending: false })
        .limit(5);

    if (error) throw error;

    if (!data?.length) {

        overviewRecentApplications.innerHTML =
            `<p class="muted-text">No recent applications.</p>`;

        return;
    }

    const applicantIds = [
        ...new Set(data.map(application => application.applicant_id).filter(Boolean))
    ];

    let applicantNames = new Map();

    if (applicantIds.length) {

        const { data: applicants, error: applicantError } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", applicantIds);

        if (applicantError) throw applicantError;

        applicantNames = new Map(
            (applicants || []).map(applicant => [
                applicant.id,
                applicant.full_name
            ])
        );
    }

    overviewRecentApplications.innerHTML = data.map(application => {

        const applicantName =
            applicantNames.get(application.applicant_id) || "Applicant";

        return `
            <div class="overview-activity">

                <div>
                    <strong>${escapeOverviewText(applicantName)}</strong>

                    <small>
                        ${application.application_date
                            ? new Date(application.application_date).toLocaleDateString("en-KE")
                            : "Date unavailable"}
                    </small>
                </div>

                <b>${escapeOverviewText(application.application_status || "Pending")}</b>

            </div>
        `;

    }).join("");
}

// ==========================================
// PART 10: INITIALIZE UNIVERSITY ADMIN DASHBOARD
// ==========================================

async function runAdminModule(moduleName, moduleFunction) {
    try {
        await moduleFunction();
        console.log(`${moduleName} loaded successfully.`);
    } catch (error) {
        console.error(`Error loading ${moduleName}:`, error);
    }
}

async function initialiseAdminDashboard() {
    try {
        console.log("Initializing University Admin Dashboard...");

        // 1. Authenticate user
        const user = await getCurrentUser();

        if (!user) {
            return;
        }

        // 2. Verify university administrator
        const isAdmin = await loadAdminProfile();

        if (!isAdmin) {
            return;
        }

        // 3. Load university information
        await loadUniversity();
        await getCurrentUniversityName();

        // 4. Load university departments and programmes
        await runAdminModule("Departments", loadDepartments);
        await runAdminModule("Programmes", loadProgrammes);

        // 5. Load academic structure and units
        await runAdminModule("Academic Structure", loadAcademicStructure);
        await runAdminModule("Units", loadUnits);

        // 6. Load students and admissions
        await runAdminModule("Students", loadStudents);
        await runAdminModule("Applications", loadApplications);

        // 7. Load lecturers
        await runAdminModule("Lecturer Management", loadLecturerManagement);
        await runAdminModule("Unit Lecturer Assignments", loadUnitLecturerAssignments);

        // 8. Load finance information
        await runAdminModule("Fee Balances", loadStudentFeeBalances);
        await runAdminModule("Payment Students", loadPaymentStudents);
        await runAdminModule("Payment History", loadPaymentHistory);

        // 9. Load examinations
        await runAdminModule("Examination Periods", loadExaminationPeriods);
        await runAdminModule("Examination Timetable", loadExaminationTimetable);

        // 10. Load academic calendar
        await runAdminModule("Academic Calendar", loadAcademicCalendar);

        // 11. Load dashboard statistics and overview widgets
        await runAdminModule("Dashboard Overview", loadDashboardOverviewWidgets);

        console.log("University Admin Dashboard initialized successfully.");

    } catch (error) {
        console.error("Dashboard initialization failed:", error);
    }
}

// Start dashboard after the page has loaded
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialiseAdminDashboard);
} else {
    initialiseAdminDashboard();
}

// =====================================================
// UNIVERSITY ADMIN SIDEBAR NAVIGATION
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const sidebarLinks = document.querySelectorAll(
        ".sidebar-link[data-view]"
    );

    const adminViews = document.querySelectorAll(
        ".admin-dashboard-view"
    );

    function openAdminView(viewId) {

        const target = document.getElementById(viewId);

        if (!target) {
            console.error("Dashboard section not found:", viewId);
            return;
        }

        // Hide all dashboard sections
        adminViews.forEach(view => {
            view.style.display = "none";
        });

        // Show selected section
        target.style.display = "block";

        // Update active sidebar link
        sidebarLinks.forEach(link => {

            link.classList.remove("active");

            if (link.dataset.view === viewId) {
                link.classList.add("active");
            }

        });

        // Close mobile sidebar if open
        document.getElementById("dashboardSidebar")
            ?.classList.remove("active");

        document.getElementById("dashboardOverlay")
            ?.classList.remove("active");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        history.replaceState(null, "", "#" + viewId);
    }

    // Handle sidebar clicks
    sidebarLinks.forEach(link => {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            openAdminView(this.dataset.view);

        });

    });

    // Open section from URL hash, or Dashboard by default
    const requestedView = window.location.hash.substring(1);

    if (
        requestedView &&
        document.getElementById(requestedView)
    ) {
        openAdminView(requestedView);
    } else {
        openAdminView("dashboardSection");
    }

});

// =====================================================
// UNIVERSITY ADMIN SIDEBAR TOGGLE
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const menuButton = document.querySelector(".dashboard-menu-btn");
    const sidebar = document.getElementById("dashboardSidebar");
    const overlay = document.getElementById("dashboardOverlay");

    if (!menuButton || !sidebar) {
        console.error("Sidebar button or sidebar not found.");
        return;
    }

    // OPEN AND CLOSE SIDEBAR
    menuButton.addEventListener("click", function () {

        sidebar.classList.toggle("active");

        if (overlay) {
            overlay.classList.toggle("active");
        }

    });

    // CLOSE SIDEBAR WHEN OVERLAY IS CLICKED
    if (overlay) {
        overlay.addEventListener("click", function () {

            sidebar.classList.remove("active");
            overlay.classList.remove("active");

        });
    }

    // CLOSE SIDEBAR WHEN A MENU ITEM IS CLICKED
    document.querySelectorAll(".sidebar-link").forEach(link => {

        link.addEventListener("click", function () {

            sidebar.classList.remove("active");

            if (overlay) {
                overlay.classList.remove("active");
            }

        });

    });

});