import { supabase } from "./app.js";

// =====================================================
// CLASSLINK SUPER ADMIN DASHBOARD
// =====================================================


// =====================================================
// GENERAL HTML ELEMENTS
// =====================================================

const adminName = document.getElementById("adminName");

const totalUniversities = document.getElementById("totalUniversities");
const totalStudents = document.getElementById("totalStudents");
const totalLecturers = document.getElementById("totalLecturers");
const totalAdmins = document.getElementById("totalAdmins");
const totalUsers = document.getElementById("totalUsers");
const totalSuperAdmins = document.getElementById("totalSuperAdmins");

const logoutButton = document.getElementById("logoutButton");

const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const navigationButtons = document.querySelectorAll(".nav-link");
const dashboardSections = document.querySelectorAll(".dashboard-section");


// =====================================================
// UNIVERSITY MANAGEMENT ELEMENTS
// =====================================================

const universityTable = document.getElementById("universityTable");

const addUniversityButton =
    document.getElementById("addUniversityButton");

const universitySearch =
    document.getElementById("universitySearch");

const universityCategoryFilter =
    document.getElementById("universityCategoryFilter");

const universityStatusFilter =
    document.getElementById("universityStatusFilter");

const universityTotal =
    document.getElementById("universityTotal");

const universityActive =
    document.getElementById("universityActive");

const universityInactive =
    document.getElementById("universityInactive");

const universitySuspended =
    document.getElementById("universitySuspended");

const previousUniversityPage =
    document.getElementById("previousUniversityPage");

const nextUniversityPage =
    document.getElementById("nextUniversityPage");

const universityPageInfo =
    document.getElementById("universityPageInfo");

const universityPageNumber =
    document.getElementById("universityPageNumber");


// =====================================================
// UNIVERSITY FORM ELEMENTS
// =====================================================

const universityModal =
    document.getElementById("universityModal");

const universityForm =
    document.getElementById("universityForm");

const universityModalTitle =
    document.getElementById("universityModalTitle");

const universityId =
    document.getElementById("universityId");

const universityName =
    document.getElementById("universityName");

const universityCode =
    document.getElementById("universityCode");

const universityCharterYear =
    document.getElementById("universityCharterYear");

const universityCategory =
    document.getElementById("universityCategory");

const universityCueStatus =
    document.getElementById("universityCueStatus");

const universityEmail =
    document.getElementById("universityEmail");

const universityPhone =
    document.getElementById("universityPhone");

const universityAddress =
    document.getElementById("universityAddress");

const universityPlatformStatus =
    document.getElementById("universityPlatformStatus");

const universityFormMessage =
    document.getElementById("universityFormMessage");

const saveUniversityButton =
    document.getElementById("saveUniversityButton");

const closeUniversityModal =
    document.getElementById("closeUniversityModal");

const cancelUniversityButton =
    document.getElementById("cancelUniversityButton");


// =====================================================
// UNIVERSITY DETAILS ELEMENTS
// =====================================================

const universityDetailsModal =
    document.getElementById("universityDetailsModal");

const universityDetailsContent =
    document.getElementById("universityDetailsContent");

const closeUniversityDetails =
    document.getElementById("closeUniversityDetails");

const closeUniversityDetailsButton =
    document.getElementById("closeUniversityDetailsButton");


// =====================================================
// UNIVERSITY DATA
// =====================================================

let allUniversities = [];

let currentUniversityPage = 1;

const universitiesPerPage = 10;


// =====================================================
// DISPLAY ERROR
// =====================================================

function showError(message) {

    console.error(message);

    if (!universityTable) return;

    universityTable.innerHTML = "";

    const row = document.createElement("tr");
    const cell = document.createElement("td");

    cell.colSpan = 6;
    cell.textContent = message;

    row.appendChild(cell);
    universityTable.appendChild(row);

}


// =====================================================
// AUTHENTICATION
// =====================================================

async function verifySuperAdmin() {

    try {

        const {
            data: { user },
            error
        } = await supabase.auth.getUser();

        if (error || !user) {

            window.location.replace("login.html");
            return null;

        }

        const {
            data: profile,
            error: profileError
        } = await supabase
            .from("profiles")
            .select("full_name, role, university_id")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {

            console.error(
                "Profile verification failed:",
                profileError
            );

            await supabase.auth.signOut();

            window.location.replace("login.html");
            return null;

        }

        if (profile.role !== "super_admin") {

            console.warn("Unauthorized dashboard access.");

            window.location.replace("login.html");
            return null;

        }

        if (adminName) {

            adminName.textContent =
                profile.full_name || "Super Admin";

        }

        console.log("Super Admin authenticated successfully.");

        return profile;

    } catch (error) {

        console.error("Authentication error:", error);

        window.location.replace("login.html");

        return null;

    }

}


// =====================================================
// COUNT DATABASE RECORDS
// =====================================================

async function getRecordCount(tableName, role = null) {

    try {

        let query = supabase
            .from(tableName)
            .select("*", {
                count: "exact",
                head: true
            });

        if (role !== null) {

            query = query.eq("role", role);

        }

        const { count, error } = await query;

        if (error) {

            console.error(
                "Count error for " + tableName + ":",
                error
            );

            return null;

        }

        return count ?? 0;

    } catch (error) {

        console.error("Unexpected count error:", error);

        return null;

    }

}


// =====================================================
// LOAD DASHBOARD STATISTICS
// =====================================================

async function loadStatistics() {

    console.log("Loading platform statistics...");

    const [
        universities,
        students,
        lecturers,
        admins,
        users,
        superAdmins
    ] = await Promise.all([

        getRecordCount("universities"),
        getRecordCount("profiles", "student"),
        getRecordCount("profiles", "lecturer"),
        getRecordCount("profiles", "university_admin"),
        getRecordCount("profiles"),
        getRecordCount("profiles", "super_admin")

    ]);

    if (totalUniversities) {
        totalUniversities.textContent =
            universities === null ? "Error" : universities;
    }

    if (totalStudents) {
        totalStudents.textContent =
            students === null ? "Error" : students;
    }

    if (totalLecturers) {
        totalLecturers.textContent =
            lecturers === null ? "Error" : lecturers;
    }

    if (totalAdmins) {
        totalAdmins.textContent =
            admins === null ? "Error" : admins;
    }

    if (totalUsers) {
        totalUsers.textContent =
            users === null ? "Error" : users;
    }

    if (totalSuperAdmins) {
        totalSuperAdmins.textContent =
            superAdmins === null ? "Error" : superAdmins;
    }

    console.log("Platform statistics loaded.");

}


// =====================================================
// LOAD ALL UNIVERSITIES
// =====================================================

async function loadUniversities() {

    if (!universityTable) return;

    universityTable.innerHTML = "";

    const loadingRow = document.createElement("tr");
    const loadingCell = document.createElement("td");

    loadingCell.colSpan = 6;
    loadingCell.textContent = "Loading universities...";

    loadingRow.appendChild(loadingCell);
    universityTable.appendChild(loadingRow);

    try {

        const {
            data,
            error
        } = await supabase
            .from("universities")
            .select(`
                id,
                name,
                code,
                email,
                phone,
                address,
                created_at,
                category,
                status,
                charter_year,
                platform_status
            `)
            .order("name", {
                ascending: true
            });

        if (error) {

            console.error("University loading error:", error);

            showError("Could not load universities.");

            return;

        }

        allUniversities = data || [];

        currentUniversityPage = 1;

        updateUniversityStatistics();

        renderUniversities();

        console.log(
            "Universities loaded:",
            allUniversities.length
        );

    } catch (error) {

        console.error(
            "Unexpected university loading error:",
            error
        );

        showError("An unexpected error occurred.");

    }

}


// =====================================================
// UNIVERSITY STATISTICS
// =====================================================

function updateUniversityStatistics() {

    const total = allUniversities.length;

    const active = allUniversities.filter(
        university =>
            university.platform_status === "active"
    ).length;

    const inactive = allUniversities.filter(
        university =>
            university.platform_status === "inactive"
    ).length;

    const suspended = allUniversities.filter(
        university =>
            university.platform_status === "suspended"
    ).length;

    if (universityTotal) {
        universityTotal.textContent = total;
    }

    if (universityActive) {
        universityActive.textContent = active;
    }

    if (universityInactive) {
        universityInactive.textContent = inactive;
    }

    if (universitySuspended) {
        universitySuspended.textContent = suspended;
    }

}


// =====================================================
// FILTER UNIVERSITIES
// =====================================================

function getFilteredUniversities() {

    const searchTerm =
        universitySearch?.value.trim().toLowerCase() || "";

    const category =
        universityCategoryFilter?.value || "";

    const status =
        universityStatusFilter?.value || "";

    return allUniversities.filter(university => {

        const matchesSearch =
            !searchTerm ||
            (university.name || "").toLowerCase().includes(searchTerm) ||
            (university.code || "").toLowerCase().includes(searchTerm);

        const matchesCategory =
            !category ||
            university.category === category;

        const matchesStatus =
            !status ||
            university.platform_status === status;

        return (
            matchesSearch &&
            matchesCategory &&
            matchesStatus
        );

    });

}


// =====================================================
// CREATE TABLE CELL
// =====================================================

function createCell(value) {

    const cell = document.createElement("td");

    cell.textContent =
        value === null || value === undefined || value === ""
            ? "—"
            : String(value);

    return cell;

}


// =====================================================
// CREATE ACTION BUTTON
// =====================================================

function createActionButton(text, className, callback) {

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = text;
    button.className = className;

    button.addEventListener("click", callback);

    return button;

}


// =====================================================
// RENDER UNIVERSITY DIRECTORY
// =====================================================

function renderUniversities() {

    if (!universityTable) return;

    const filteredUniversities =
        getFilteredUniversities();

    const total = filteredUniversities.length;

    const totalPages = Math.max(
        1,
        Math.ceil(total / universitiesPerPage)
    );

    if (currentUniversityPage > totalPages) {
        currentUniversityPage = totalPages;
    }

    const startIndex =
        (currentUniversityPage - 1) * universitiesPerPage;

    const pageUniversities =
        filteredUniversities.slice(
            startIndex,
            startIndex + universitiesPerPage
        );

    universityTable.innerHTML = "";

    if (total === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;
        cell.textContent = "No universities found.";

        row.appendChild(cell);
        universityTable.appendChild(row);

    }

    pageUniversities.forEach(university => {

        const row = document.createElement("tr");

        row.appendChild(
            createCell(university.name)
        );

        row.appendChild(
            createCell(university.code)
        );

        row.appendChild(
            createCell(university.category)
        );

        row.appendChild(
            createCell(university.status)
        );


        // PLATFORM STATUS

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");

        const status =
            university.platform_status || "active";

        statusBadge.textContent =
            status.charAt(0).toUpperCase() + status.slice(1);

        statusBadge.className =
            "status-badge status-" + status;

        statusCell.appendChild(statusBadge);

        row.appendChild(statusCell);


        // ACTIONS

        const actionsCell = document.createElement("td");

        const actionsContainer =
            document.createElement("div");

        actionsContainer.className = "university-actions";


        const viewButton = createActionButton(
            "View",
            "action-button view-button",
            () => viewUniversity(university.id)
        );

        // OPEN UNIVERSITY ADMIN DASHBOARD

const openDashboardButton = createActionButton(
    "Open Dashboard",
    "action-button edit-button",
    () => {

        window.location.href =
            "university-admin-dashboard.html?university_id=" +
            encodeURIComponent(university.id);

    }
);

        const editButton = createActionButton(
            "Edit",
            "action-button edit-button",
            () => editUniversity(university.id)
        );

        const statusButton = createActionButton(
            status === "active" ? "Deactivate" : "Activate",
            "action-button status-button",
            () => toggleUniversityStatus(university.id)
        );

        const suspendButton = createActionButton(
            status === "suspended" ? "Unsuspend" : "Suspend",
            "action-button suspend-button",
            () => toggleUniversitySuspension(university.id)
        );

actionsContainer.appendChild(viewButton);
actionsContainer.appendChild(openDashboardButton);
actionsContainer.appendChild(editButton);
actionsContainer.appendChild(statusButton);
actionsContainer.appendChild(suspendButton);
        actionsCell.appendChild(actionsContainer);

        row.appendChild(actionsCell);

        universityTable.appendChild(row);

    });


    // PAGINATION INFORMATION

    if (universityPageInfo) {

        universityPageInfo.textContent =
            total === 0
                ? "Showing 0 universities"
                : `Showing ${startIndex + 1}–${Math.min(
                    startIndex + universitiesPerPage,
                    total
                )} of ${total} universities`;

    }

    if (universityPageNumber) {
        universityPageNumber.textContent =
            `${currentUniversityPage} / ${totalPages}`;
    }

    if (previousUniversityPage) {
        previousUniversityPage.disabled =
            currentUniversityPage <= 1;
    }

    if (nextUniversityPage) {
        nextUniversityPage.disabled =
            currentUniversityPage >= totalPages;
    }

}


// =====================================================
// SEARCH AND FILTER EVENTS
// =====================================================

if (universitySearch) {

    universitySearch.addEventListener("input", () => {

        currentUniversityPage = 1;

        renderUniversities();

    });

}

if (universityCategoryFilter) {

    universityCategoryFilter.addEventListener("change", () => {

        currentUniversityPage = 1;

        renderUniversities();

    });

}

if (universityStatusFilter) {

    universityStatusFilter.addEventListener("change", () => {

        currentUniversityPage = 1;

        renderUniversities();

    });

}


// =====================================================
// PAGINATION EVENTS
// =====================================================

if (previousUniversityPage) {

    previousUniversityPage.addEventListener("click", () => {

        if (currentUniversityPage > 1) {

            currentUniversityPage--;

            renderUniversities();

        }

    });

}

if (nextUniversityPage) {

    nextUniversityPage.addEventListener("click", () => {

        const totalPages = Math.ceil(
            getFilteredUniversities().length /
            universitiesPerPage
        );

        if (currentUniversityPage < totalPages) {

            currentUniversityPage++;

            renderUniversities();

        }

    });

}


// =====================================================
// OPEN UNIVERSITY FORM
// =====================================================

function openUniversityForm(university = null) {

    if (!universityModal || !universityForm) return;

    universityForm.reset();

    universityId.value = "";

    universityFormMessage.textContent = "";

    universityFormMessage.className = "form-message";

    if (university) {

        universityModalTitle.textContent =
            "Edit University";

        saveUniversityButton.textContent =
            "Update University";

        universityId.value = university.id;

        universityName.value =
            university.name || "";

        universityCode.value =
            university.code || "";

        universityCharterYear.value =
            university.charter_year || "";

        universityCategory.value =
            university.category || "";

        universityCueStatus.value =
            university.status || "";

        universityEmail.value =
            university.email || "";

        universityPhone.value =
            university.phone || "";

        universityAddress.value =
            university.address || "";

        universityPlatformStatus.value =
            university.platform_status || "active";

    } else {

        universityModalTitle.textContent =
            "Add University";

        saveUniversityButton.textContent =
            "Save University";

        universityPlatformStatus.value = "active";

    }

    universityModal.classList.add("show");

    universityModal.setAttribute("aria-hidden", "false");

    universityName.focus();

}


// =====================================================
// CLOSE UNIVERSITY FORM
// =====================================================

function closeUniversityForm() {

    if (!universityModal) return;

    universityModal.classList.remove("show");

    universityModal.setAttribute("aria-hidden", "true");

}


// =====================================================
// ADD UNIVERSITY BUTTON
// =====================================================

if (addUniversityButton) {

    addUniversityButton.addEventListener("click", () => {

        openUniversityForm();

    });

}


// =====================================================
// CLOSE FORM BUTTONS
// =====================================================

if (closeUniversityModal) {

    closeUniversityModal.addEventListener(
        "click",
        closeUniversityForm
    );

}

if (cancelUniversityButton) {

    cancelUniversityButton.addEventListener(
        "click",
        closeUniversityForm
    );

}


// =====================================================
// EDIT UNIVERSITY
// =====================================================

function editUniversity(id) {

    const university = allUniversities.find(
        item => item.id === id
    );

    if (!university) {

        alert("University could not be found.");

        return;

    }

    openUniversityForm(university);

}


// =====================================================
// SAVE UNIVERSITY
// =====================================================

if (universityForm) {

    universityForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const name = universityName.value.trim();

        const code = universityCode.value.trim().toUpperCase();

        const charterYear =
            universityCharterYear.value.trim();

        const category =
            universityCategory.value || null;

        const cueStatus =
            universityCueStatus.value.trim() || null;

        const email =
            universityEmail.value.trim() || null;

        const phone =
            universityPhone.value.trim() || null;

        const address =
            universityAddress.value.trim() || null;

        const platformStatus =
            universityPlatformStatus.value;


        if (!name || !code) {

            universityFormMessage.textContent =
                "University name and code are required.";

            universityFormMessage.className =
                "form-message error";

            return;

        }


        if (!["active", "inactive", "suspended"].includes(platformStatus)) {

            universityFormMessage.textContent =
                "Please select a valid platform status.";

            universityFormMessage.className =
                "form-message error";

            return;

        }


        if (
            charterYear &&
            (
                Number(charterYear) < 1900 ||
                Number(charterYear) > 2100
            )
        ) {

            universityFormMessage.textContent =
                "Please enter a valid charter year.";

            universityFormMessage.className =
                "form-message error";

            return;

        }


        const record = {

            name,
            code,
            category,
            status: cueStatus,
            email,
            phone,
            address,
            charter_year: charterYear
                ? Number(charterYear)
                : null,
            platform_status: platformStatus

        };


        saveUniversityButton.disabled = true;

        saveUniversityButton.textContent = "Saving...";


        try {

            let result;

            if (universityId.value) {

                // UPDATE EXISTING UNIVERSITY

                result = await supabase
                    .from("universities")
                    .update(record)
                    .eq("id", universityId.value);

            } else {

                // ADD NEW UNIVERSITY

                result = await supabase
                    .from("universities")
                    .insert([record]);

            }


            if (result.error) {

                console.error(
                    "University save error:",
                    result.error
                );

                let message =
                    "Could not save university.";

                if (result.error.code === "23505") {

                    message =
                        "This university code is already in use.";

                } else if (result.error.code === "42501") {

                    message =
                        "Permission denied. Check your Super Admin access.";

                } else if (result.error.message) {

                    message = result.error.message;

                }

                universityFormMessage.textContent = message;

                universityFormMessage.className =
                    "form-message error";

                return;

            }


            universityFormMessage.textContent =
                "University saved successfully.";

            universityFormMessage.className =
                "form-message success";


            await loadUniversities();

            await loadStatistics();


            setTimeout(() => {

                closeUniversityForm();

            }, 700);


        } catch (error) {

            console.error("University save failed:", error);

            universityFormMessage.textContent =
                "An unexpected error occurred while saving.";

            universityFormMessage.className =
                "form-message error";

        } finally {

            saveUniversityButton.disabled = false;

            saveUniversityButton.textContent =
                universityId.value
                    ? "Update University"
                    : "Save University";

        }

    });

}


// =====================================================
// VIEW UNIVERSITY DETAILS
// =====================================================

function addDetailLine(container, label, value) {

    const wrapper = document.createElement("div");

    wrapper.className = "university-detail-row";

    const heading = document.createElement("strong");

    heading.textContent = label;

    const content = document.createElement("span");

    content.textContent =
        value === null || value === undefined || value === ""
            ? "Not provided"
            : String(value);

    wrapper.appendChild(heading);

    wrapper.appendChild(content);

    container.appendChild(wrapper);

}


function viewUniversity(id) {

    const university = allUniversities.find(
        item => item.id === id
    );

    if (!university) {

        alert("University could not be found.");

        return;

    }

    universityDetailsContent.innerHTML = "";

    addDetailLine(
        universityDetailsContent,
        "University Name",
        university.name
    );

    addDetailLine(
        universityDetailsContent,
        "University Code",
        university.code
    );

    addDetailLine(
        universityDetailsContent,
        "University ID",
        university.id
    );

    addDetailLine(
        universityDetailsContent,
        "Category",
        university.category
    );

    addDetailLine(
        universityDetailsContent,
        "CUE Recognition Status",
        university.status
    );

    addDetailLine(
        universityDetailsContent,
        "Platform Status",
        university.platform_status
    );

    addDetailLine(
        universityDetailsContent,
        "Charter Year",
        university.charter_year
    );

    addDetailLine(
        universityDetailsContent,
        "Email",
        university.email
    );

    addDetailLine(
        universityDetailsContent,
        "Phone",
        university.phone
    );

    addDetailLine(
        universityDetailsContent,
        "Address",
        university.address
    );

    addDetailLine(
        universityDetailsContent,
        "Date Registered",
        university.created_at
            ? new Date(university.created_at).toLocaleDateString()
            : null
    );


    universityDetailsModal.classList.add("show");

    universityDetailsModal.setAttribute(
        "aria-hidden",
        "false"
    );

}


// =====================================================
// CLOSE UNIVERSITY DETAILS
// =====================================================

function closeUniversityDetailsModal() {

    if (!universityDetailsModal) return;

    universityDetailsModal.classList.remove("show");

    universityDetailsModal.setAttribute(
        "aria-hidden",
        "true"
    );

}


if (closeUniversityDetails) {

    closeUniversityDetails.addEventListener(
        "click",
        closeUniversityDetailsModal
    );

}

if (closeUniversityDetailsButton) {

    closeUniversityDetailsButton.addEventListener(
        "click",
        closeUniversityDetailsModal
    );

}


// =====================================================
// CHANGE UNIVERSITY PLATFORM STATUS
// =====================================================
async function updateUniversityPlatformStatus(id, newStatus) {

    try {

        const { error } = await supabase
            .from("universities")
            .update({
                platform_status: newStatus
            })
            .eq("id", id);

        if (error) {

            console.error(
                "Platform status update error:",
                error
            );

            alert(
                "Could not update university status: " +
                error.message
            );

            return false;

        }

        // Refresh university directory
        await loadUniversities();

        // Refresh dashboard statistics
        await loadStatistics();

        console.log(
            "University platform status updated successfully."
        );

        return true;

    } catch (error) {

        console.error(
            "Unexpected platform status error:",
            error
        );

        alert("An unexpected error occurred.");

        return false;

    }

}

// =====================================================
// ACTIVATE / DEACTIVATE UNIVERSITY
// =====================================================

async function toggleUniversityStatus(id) {

    const university = allUniversities.find(
        item => item.id === id
    );

    if (!university) return;

    const currentStatus =
        university.platform_status || "active";

    if (currentStatus === "suspended") {

        alert(
            "This university is suspended. Unsuspend it before activating it."
        );

        return;

    }

    const newStatus =
        currentStatus === "active"
            ? "inactive"
            : "active";

    const confirmed = confirm(
        `Are you sure you want to ${newStatus === "active" ? "activate" : "deactivate"} ${university.name}?`
    );

    if (!confirmed) return;

    await updateUniversityPlatformStatus(
        id,
        newStatus
    );

}


// =====================================================
// SUSPEND / UNSUSPEND UNIVERSITY
// =====================================================

async function toggleUniversitySuspension(id) {

    const university = allUniversities.find(
        item => item.id === id
    );

    if (!university) return;

    const currentStatus =
        university.platform_status || "active";

    const newStatus =
        currentStatus === "suspended"
            ? "active"
            : "suspended";

    const confirmed = confirm(
        `Are you sure you want to ${newStatus === "suspended" ? "suspend" : "unsuspend"} ${university.name}?`
    );

    if (!confirmed) return;

    await updateUniversityPlatformStatus(
        id,
        newStatus
    );

}


// =====================================================
// SIDEBAR OPEN AND CLOSE
// =====================================================

function openSidebar() {

    if (!sidebar || !sidebarOverlay || !menuButton) return;

    sidebar.classList.add("open");

    sidebarOverlay.classList.add("show");

    menuButton.classList.add("active");

    menuButton.setAttribute("aria-expanded", "true");

}


function closeSidebar() {

    if (!sidebar || !sidebarOverlay || !menuButton) return;

    sidebar.classList.remove("open");

    sidebarOverlay.classList.remove("show");

    menuButton.classList.remove("active");

    menuButton.setAttribute("aria-expanded", "false");

}


function toggleSidebar() {

    if (!sidebar) return;

    if (sidebar.classList.contains("open")) {

        closeSidebar();

    } else {

        openSidebar();

    }

}


if (menuButton) {

    menuButton.addEventListener("click", toggleSidebar);

}


if (sidebarOverlay) {

    sidebarOverlay.addEventListener("click", closeSidebar);

}


document.addEventListener("keydown", function(event) {

    if (event.key === "Escape") {

        closeSidebar();

        closeUniversityForm();

        closeUniversityDetailsModal();

    }

});


// =====================================================
// SWITCH DASHBOARD SECTIONS
// =====================================================

function showDashboardSection(sectionId) {

    const allowedSections = [
        "overview",
        "universities",
        "users",
        "academics",
        "system"
    ];

    if (!allowedSections.includes(sectionId)) {

        sectionId = "overview";

    }

    dashboardSections.forEach(section => {

        section.classList.remove("active");

        section.hidden = true;

    });

    navigationButtons.forEach(button => {

        button.classList.remove("active");

    });

    const selectedSection =
        document.getElementById(sectionId);

    if (!selectedSection) return;

    selectedSection.hidden = false;

    selectedSection.classList.add("active");

    const selectedButton = document.querySelector(
        `.nav-link[data-section="${sectionId}"]`
    );

    if (selectedButton) {

        selectedButton.classList.add("active");

    }

    history.replaceState(
        null,
        "",
        `#${sectionId}`
    );

    closeSidebar();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


navigationButtons.forEach(button => {

    button.addEventListener("click", function() {

        showDashboardSection(this.dataset.section);

    });

});


// =====================================================
// LOAD SECTION FROM URL
// =====================================================

const initialSection =
    window.location.hash.replace("#", "");

const allowedInitialSections = [
    "overview",
    "universities",
    "users",
    "academics",
    "system"
];

showDashboardSection(
    allowedInitialSections.includes(initialSection)
        ? initialSection
        : "overview"
);


// =====================================================
// LOGOUT
// =====================================================

if (logoutButton) {

    logoutButton.addEventListener("click", async function() {

        const confirmLogout = confirm(
            "Are you sure you want to log out?"
        );

        if (!confirmLogout) return;

        logoutButton.disabled = true;

        logoutButton.textContent = "Logging out...";

        const { error } = await supabase.auth.signOut();

        if (error) {

            console.error("Logout error:", error);

            alert(
                "Could not log out. Please try again."
            );

            logoutButton.disabled = false;

            logoutButton.innerHTML =
                "<span>↪</span><span>Logout</span>";

            return;

        }

        window.location.replace("login.html");

    });

}

// =====================================================
// CLASSLINK USER MANAGEMENT
// =====================================================

const userTable = document.getElementById("userTable");
const userSearch = document.getElementById("userSearch");
const userRoleFilter = document.getElementById("userRoleFilter");
const userUniversityFilter = document.getElementById("userUniversityFilter");

const userManagementTotal = document.getElementById("userManagementTotal");
const userManagementStudents = document.getElementById("userManagementStudents");
const userManagementLecturers = document.getElementById("userManagementLecturers");
const userManagementAdmins = document.getElementById("userManagementAdmins");
const userManagementSuperAdmins = document.getElementById("userManagementSuperAdmins");

let allPlatformUsers = [];
let currentUserPage = 1;
const usersPerPage = 10;


// Load users

async function loadPlatformUsers() {

    if (!userTable) return;

    userTable.innerHTML =
        `<tr><td colspan="6">Loading users...</td></tr>`;

    try {

        const { data, error } = await supabase
            .from("profiles")
            .select("id, full_name, role, university_id, created_at")
            .order("created_at", { ascending: false });

        if (error) throw error;

        const { data: universities, error: universityError } =
            await supabase
                .from("universities")
                .select("id, name")
                .order("name");

        if (universityError) throw universityError;

        const universityMap = new Map(
            (universities || []).map(item => [item.id, item.name])
        );

        allPlatformUsers = (data || []).map(user => ({
            ...user,
            university_name:
                universityMap.get(user.university_id) || "Not assigned"
        }));

        populateUserUniversityFilter(universities || []);

        updateUserStatistics();

        renderPlatformUsers();

    } catch (error) {

        console.error("User loading error:", error);

        userTable.innerHTML =
            `<tr><td colspan="6">Could not load users: ${error.message}</td></tr>`;

    }

}


// Populate university filter

function populateUserUniversityFilter(universities) {

    if (!userUniversityFilter) return;

    userUniversityFilter.innerHTML =
        `<option value="">All Universities</option>`;

    universities.forEach(university => {

        const option = document.createElement("option");

        option.value = university.id;
        option.textContent = university.name;

        userUniversityFilter.appendChild(option);

    });

}


// Update user statistics

function updateUserStatistics() {

    const countRole = role =>
        allPlatformUsers.filter(user => user.role === role).length;

    if (userManagementTotal)
        userManagementTotal.textContent = allPlatformUsers.length;

    if (userManagementStudents)
        userManagementStudents.textContent = countRole("student");

    if (userManagementLecturers)
        userManagementLecturers.textContent = countRole("lecturer");

    if (userManagementAdmins)
        userManagementAdmins.textContent = countRole("university_admin");

    if (userManagementSuperAdmins)
        userManagementSuperAdmins.textContent = countRole("super_admin");

}


// Filter users

function getFilteredPlatformUsers() {

    const search =
        userSearch?.value.trim().toLowerCase() || "";

    const role = userRoleFilter?.value || "";

    const university = userUniversityFilter?.value || "";

    return allPlatformUsers.filter(user => {

        const matchesSearch =
            !search ||
            (user.full_name || "").toLowerCase().includes(search) ||
            user.id.toLowerCase().includes(search);

        const matchesRole =
            !role || user.role === role;

        const matchesUniversity =
            !university || user.university_id === university;

        return matchesSearch && matchesRole && matchesUniversity;

    });

}


// Render users

function renderPlatformUsers() {

    if (!userTable) return;

    const filtered = getFilteredPlatformUsers();

    const totalPages = Math.max(
        1,
        Math.ceil(filtered.length / usersPerPage)
    );

    currentUserPage = Math.min(currentUserPage, totalPages);

    const start = (currentUserPage - 1) * usersPerPage;

    const pageUsers = filtered.slice(
        start,
        start + usersPerPage
    );

    userTable.innerHTML = "";

    if (!pageUsers.length) {

        userTable.innerHTML =
            `<tr><td colspan="6">No users found.</td></tr>`;

    }

    pageUsers.forEach(user => {

        const row = document.createElement("tr");

        const values = [
            user.full_name,
            user.id,
            user.role,
            user.university_name,
            user.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "—"
        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value || "—";

            row.appendChild(cell);

        });

        const actions = document.createElement("td");

        const editButton = createActionButton(
            "Edit",
            "action-button edit-button",
            () => editPlatformUser(user)
        );

        actions.appendChild(editButton);

        row.appendChild(actions);

        userTable.appendChild(row);

    });

    const pageInfo = document.getElementById("userPageInfo");

    const pageNumber = document.getElementById("userPageNumber");

    if (pageInfo) {
        pageInfo.textContent =
            `Showing ${filtered.length ? start + 1 : 0}–${Math.min(start + usersPerPage, filtered.length)} of ${filtered.length} users`;
    }

    if (pageNumber) {
        pageNumber.textContent =
            `${currentUserPage} / ${totalPages}`;
    }

    const previous = document.getElementById("previousUserPage");
    const next = document.getElementById("nextUserPage");

    if (previous) previous.disabled = currentUserPage <= 1;

    if (next) next.disabled = currentUserPage >= totalPages;

}


// Edit user
// =====================================================
// EDIT PLATFORM USER
// =====================================================

async function editPlatformUser(user) {

    const currentUser = await supabase.auth.getUser();

    if (currentUser.error) {
        alert("Could not verify your account.");
        return;
    }

    const currentUserId = currentUser.data.user?.id;

    const overlay = document.createElement("div");

    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.65);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
    `;

    const form = document.createElement("form");

    form.style.cssText = `
        background: white;
        color: #222;
        padding: 25px;
        border-radius: 12px;
        width: 100%;
        max-width: 480px;
    `;

    const heading = document.createElement("h2");
    heading.textContent = "Edit Platform User";
    form.appendChild(heading);

    // Full name

    const nameLabel = document.createElement("label");
    nameLabel.textContent = "Full Name";
    form.appendChild(nameLabel);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = user.full_name || "";
    nameInput.required = true;

    // Role

    const roleLabel = document.createElement("label");
    roleLabel.textContent = "User Role";

    const roleSelect = document.createElement("select");

    const roles = [
        "student",
        "lecturer",
        "university_admin",
        "super_admin"
    ];

    roles.forEach(role => {

        const option = document.createElement("option");

        option.value = role;
        option.textContent = role.replaceAll("_", " ");

        roleSelect.appendChild(option);

    });

    roleSelect.value = user.role;

    // University

    const universityLabel = document.createElement("label");
    universityLabel.textContent = "University";

    const universitySelect = document.createElement("select");

    const noUniversityOption = document.createElement("option");
    noUniversityOption.value = "";
    noUniversityOption.textContent = "No University";

    universitySelect.appendChild(noUniversityOption);

    const { data: universities, error: universityError } =
        await supabase
            .from("universities")
            .select("id, name")
            .order("name");

    if (universityError) {

        alert("Could not load universities: " + universityError.message);

        return;

    }

    (universities || []).forEach(university => {

        const option = document.createElement("option");

        option.value = university.id;
        option.textContent = university.name;

        universitySelect.appendChild(option);

    });

    universitySelect.value = user.university_id || "";

    [nameInput, roleSelect, universitySelect].forEach(input => {

        input.style.cssText = `
            display: block;
            width: 100%;
            box-sizing: border-box;
            padding: 11px;
            margin: 8px 0 18px;
            border: 1px solid #ccc;
            border-radius: 6px;
        `;

    });

    [nameLabel, nameInput, roleLabel, roleSelect,
     universityLabel, universitySelect].forEach(element => {

        form.appendChild(element);

    });

    const buttons = document.createElement("div");

    buttons.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 20px;
    `;

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.textContent = "Save Changes";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";

    cancelButton.addEventListener("click", () => overlay.remove());

    buttons.append(saveButton, cancelButton);

    form.appendChild(buttons);

    overlay.appendChild(form);

    document.body.appendChild(overlay);

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const newName = nameInput.value.trim();
        const newRole = roleSelect.value;
        const newUniversity = universitySelect.value || null;

        if (!newName) {

            alert("Full name is required.");
            return;

        }

        // Prevent changing your own Super Admin role

        if (
            user.id === currentUserId &&
            user.role === "super_admin" &&
            newRole !== "super_admin"
        ) {

            alert("You cannot remove your own Super Admin role.");

            roleSelect.value = "super_admin";

            return;

        }

        // Require deliberate confirmation for role changes

       // Protect Super Admin privileges

if (newRole === "super_admin" && user.role !== "super_admin") {

    alert("Promoting users to Super Admin is disabled in this interface.");

    roleSelect.value = user.role;

    return;

}

if (user.role === "super_admin" && newRole !== "super_admin") {

    alert("Changing another Super Admin's role is disabled.");

    roleSelect.value = "super_admin";

    return;

}

// Confirm other role changes

if (newRole !== user.role) {

    const confirmed = confirm(
        `Are you sure you want to change this user's role from ${user.role} to ${newRole}?`
    );

    if (!confirmed) return;

}

        // Require a university for ordinary university users

        if (
            ["student", "lecturer", "university_admin"].includes(newRole) &&
            !newUniversity
        ) {

            alert("Please assign this user to a university.");

            return;

        }

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        try {

            const { error } = await supabase
                .from("profiles")
                .update({
                    full_name: newName,
                    role: newRole,
                    university_id: newUniversity
                })
                .eq("id", user.id);

            if (error) throw error;

            alert("User updated successfully.");

            overlay.remove();

            await loadPlatformUsers();

            await logSystemActivity(
                "USER_UPDATED",
                `Updated profile for ${newName}.`,
                "profile",
                user.id
            );

        } catch (error) {

            alert("Could not update user: " + error.message);

            saveButton.disabled = false;
            saveButton.textContent = "Save Changes";

        }

    });

}

// User search and filters

[userSearch, userRoleFilter, userUniversityFilter].forEach(element => {

    if (!element) return;

    element.addEventListener("input", () => {

        currentUserPage = 1;

        renderPlatformUsers();

    });

    element.addEventListener("change", () => {

        currentUserPage = 1;

        renderPlatformUsers();

    });

});


document.getElementById("previousUserPage")?.addEventListener("click", () => {

    if (currentUserPage > 1) {

        currentUserPage--;

        renderPlatformUsers();

    }

});


document.getElementById("nextUserPage")?.addEventListener("click", () => {

    if (currentUserPage < Math.ceil(
        getFilteredPlatformUsers().length / usersPerPage
    )) {

        currentUserPage++;

        renderPlatformUsers();

    }

});


// =====================================================
// CLASSLINK SYSTEM MANAGEMENT
// =====================================================

const systemSettingsForm =
    document.getElementById("systemSettingsForm");

const platformNameInput =
    document.getElementById("platformNameInput");

const systemSettingsMessage =
    document.getElementById("systemSettingsMessage");


// Load a system setting

async function getSystemSetting(key) {

    const { data, error } = await supabase
        .from("system_settings")
        .select("setting_value")
        .eq("setting_key", key)
        .maybeSingle();

    if (error) {

        console.error("Setting loading error:", error);

        return null;

    }

    return data?.setting_value ?? null;

}


// Save a system setting

async function saveSystemSetting(key, value) {

    const { data: { user } } =
        await supabase.auth.getUser();

    if (!user) throw new Error("Authentication required.");

    const { error } = await supabase
        .from("system_settings")
        .upsert({
            setting_key: key,
            setting_value: value,
            updated_at: new Date().toISOString(),
            updated_by: user.id
        }, {
            onConflict: "setting_key"
        });

    if (error) throw error;

    await logSystemActivity(
        "SETTING_UPDATED",
        `Updated system setting: ${key}`,
        "system_setting",
        key
    );

}


// Record activity

async function logSystemActivity(
    action,
    description,
    targetType = null,
    targetId = null
) {

    const { data: { user } } =
        await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
        .from("system_activity_logs")
        .insert({
            actor_id: user.id,
            action,
            description,
            target_type: targetType,
            target_id: targetId
        });

    if (error) {

        console.error("Activity logging error:", error);

    }

}


// Load system settings

async function loadSystemSettings() {

    const [
        maintenance,
        registration,
        platform
    ] = await Promise.all([
        getSystemSetting("maintenance_mode"),
        getSystemSetting("registration"),
        getSystemSetting("platform_name")
    ]);

    const maintenanceEnabled =
        maintenance?.enabled === true;

    const registrationEnabled =
        registration?.enabled !== false;

    const maintenanceStatus =
        document.getElementById("maintenanceModeStatus");

    const registrationStatus =
        document.getElementById("registrationStatus");

    const maintenanceButton =
        document.getElementById("toggleMaintenanceButton");

    const registrationButton =
        document.getElementById("toggleRegistrationButton");

    if (maintenanceStatus) {
        maintenanceStatus.textContent =
            maintenanceEnabled ? "Enabled" : "Disabled";
    }

    if (registrationStatus) {
        registrationStatus.textContent =
            registrationEnabled ? "Enabled" : "Disabled";
    }

    if (maintenanceButton) {
        maintenanceButton.textContent =
            maintenanceEnabled
                ? "Disable Maintenance"
                : "Enable Maintenance";
    }

    if (registrationButton) {
        registrationButton.textContent =
            registrationEnabled
                ? "Disable Registrations"
                : "Enable Registrations";
    }

    if (platformNameInput && platform?.value) {
        platformNameInput.value = platform.value;
    }

    const platformStatus =
        document.getElementById("systemPlatformStatus");

    if (platformStatus) {
        platformStatus.textContent =
            maintenanceEnabled ? "Maintenance Mode" : "Operational";
    }

}


// Maintenance mode control

document.getElementById("toggleMaintenanceButton")?.addEventListener(
    "click",
    async () => {

        const current =
            await getSystemSetting("maintenance_mode");

        const enabled = current?.enabled === true;

        const next = !enabled;

        if (!confirm(
            `Are you sure you want to ${next ? "enable" : "disable"} maintenance mode?`
        )) return;

        try {

            await saveSystemSetting(
                "maintenance_mode",
                { enabled: next }
            );

            await loadSystemSettings();

            alert("Maintenance setting updated.");

        } catch (error) {

            alert("Could not update maintenance mode: " + error.message);

        }

    }
);


// Registration control

document.getElementById("toggleRegistrationButton")?.addEventListener(
    "click",
    async () => {

        const current =
            await getSystemSetting("registration");

        const enabled = current?.enabled !== false;

        const next = !enabled;

        if (!confirm(
            `Are you sure you want to ${next ? "enable" : "disable"} new registrations?`
        )) return;

        try {

            await saveSystemSetting(
                "registration",
                { enabled: next }
            );

            await loadSystemSettings();

            alert("Registration setting updated.");

        } catch (error) {

            alert("Could not update registrations: " + error.message);

        }

    }
);


// Save platform name

if (systemSettingsForm) {

    systemSettingsForm.addEventListener("submit", async event => {

        event.preventDefault();

        const name = platformNameInput.value.trim();

        if (!name) {

            systemSettingsMessage.textContent =
                "Platform name is required.";

            return;

        }

        try {

            await saveSystemSetting(
                "platform_name",
                { value: name }
            );

            systemSettingsMessage.textContent =
                "Settings saved successfully.";

        } catch (error) {

            systemSettingsMessage.textContent =
                "Could not save settings: " + error.message;

        }

    });

}

// Load activity logs

async function loadSystemActivityLogs() {

    const table =
        document.getElementById("systemActivityTable");

    if (!table) return;

    table.innerHTML =
        `<tr><td colspan="4">Loading activity logs...</td></tr>`;

    const { data, error } = await supabase
        .from("system_activity_logs")
        .select("id, action, description, actor_id, created_at")
        .order("created_at", { ascending: false })
        .limit(100);

    if (error) {

        console.error("Activity log loading error:", error);

        table.innerHTML =
            `<tr><td colspan="4">Could not load activity logs.</td></tr>`;

        return;
    }

    table.innerHTML = "";

    if (!data || data.length === 0) {

        table.innerHTML =
            `<tr><td colspan="4">No activity recorded yet.</td></tr>`;

        return;
    }

    // Get unique administrator IDs

    const actorIds = [
        ...new Set(
            data
                .map(log => log.actor_id)
                .filter(Boolean)
        )
    ];

    // Load administrator names

    let actorNames = {};

    if (actorIds.length > 0) {

        const { data: profiles, error: profileError } =
            await supabase
                .from("profiles")
                .select("id, full_name")
                .in("id", actorIds);

        if (profileError) {

            console.error(
                "Could not load activity log actor names:",
                profileError
            );

        } else {

            (profiles || []).forEach(profile => {

                actorNames[profile.id] =
                    profile.full_name || "Unknown User";

            });

        }
    }

    // Display activity logs

    data.forEach(log => {

        const row = document.createElement("tr");

        const actorName =
            actorNames[log.actor_id] ||
            (log.actor_id ? "Unknown User" : "System");

        [
            log.action,
            log.description,
            actorName,
            new Date(log.created_at).toLocaleString()
        ].forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value || "—";

            row.appendChild(cell);

        });

        table.appendChild(row);

    });

}

document.getElementById("refreshActivityLogsButton")?.addEventListener(
    "click",
    loadSystemActivityLogs
);


// =====================================================
// CLASSLINK ACADEMIC MANAGEMENT
// =====================================================

const academicUniversityFilter =
    document.getElementById("academicUniversityFilter");

const academicTableBody =
    document.getElementById("academicTableBody");

const academicTableHead =
    document.getElementById("academicTableHead");

const academicTableTitle =
    document.getElementById("academicTableTitle");

const addAcademicRecordButton =
    document.getElementById("addAcademicRecordButton");


let selectedAcademicTable = "";

const academicTables = {

    faculties: {
        title: "Faculties",
        columns: ["id", "name", "code"],
        fields: ["name", "code"],
        universityField: "university_id"
    },

    departments: {
        title: "Departments",
        columns: ["id", "name", "code", "faculty_id"],
        fields: ["name", "code", "faculty_id"],
        universityField: "university_id"
    },

    programmes: {
        title: "Programmes",
        columns: ["id", "name", "code", "level", "duration_years", "department_id"],
        fields: ["name", "code", "level", "duration_years", "department_id"],
        universityField: null
    },

    academic_years: {
        title: "Academic Years",
        columns: ["id", "year_number", "programme_id"],
        fields: ["year_number", "programme_id"],
        universityField: null
    },

    semesters: {
        title: "Semesters",
        columns: ["id", "semester_number", "academic_year_id"],
        fields: ["semester_number", "academic_year_id"],
        universityField: null
    },

    units: {
        title: "Units",
        columns: ["id", "unit_code", "unit_name", "credit_hours", "semester_id"],
        fields: ["unit_code", "unit_name", "credit_hours", "semester_id"],
        universityField: null
    }

};


// Load universities into academic selector

async function loadAcademicUniversities() {

    if (!academicUniversityFilter) return;

    const { data, error } = await supabase
        .from("universities")
        .select("id, name")
        .order("name");

    if (error) {

        console.error(error);

        return;

    }

    academicUniversityFilter.innerHTML =
        `<option value="">Select University</option>`;

    (data || []).forEach(university => {

        const option = document.createElement("option");

        option.value = university.id;
        option.textContent = university.name;

        academicUniversityFilter.appendChild(option);

    });

}


// Load academic records
async function loadAcademicRecords() {

    const universityId = academicUniversityFilter?.value;

    if (!universityId || !selectedAcademicTable) {

        if (academicTableBody) {
            academicTableBody.innerHTML =
                `<tr><td>Select a university and category.</td></tr>`;
        }

        if (addAcademicRecordButton) {
            addAcademicRecordButton.disabled = true;
        }

        return;

    }

    try {

        const config = academicTables[selectedAcademicTable];

        let parentIds = [];

        // FACULTIES AND DEPARTMENTS

        if (
            selectedAcademicTable === "faculties" ||
            selectedAcademicTable === "departments"
        ) {

            parentIds = [universityId];

        }

        // PROGRAMMES

        else if (selectedAcademicTable === "programmes") {

            const { data, error } = await supabase
                .from("departments")
                .select("id")
                .eq("university_id", universityId);

            if (error) throw error;

            parentIds = (data || []).map(item => item.id);

        }

        // ACADEMIC YEARS

        else if (selectedAcademicTable === "academic_years") {

            const { data: departments, error: departmentError } =
                await supabase
                    .from("departments")
                    .select("id")
                    .eq("university_id", universityId);

            if (departmentError) throw departmentError;

            const departmentIds =
                (departments || []).map(item => item.id);

            if (departmentIds.length) {

                const { data, error } = await supabase
                    .from("programmes")
                    .select("id")
                    .in("department_id", departmentIds);

                if (error) throw error;

                parentIds = (data || []).map(item => item.id);

            }

        }

        // SEMESTERS

        else if (selectedAcademicTable === "semesters") {

            const { data: departments, error: departmentError } =
                await supabase
                    .from("departments")
                    .select("id")
                    .eq("university_id", universityId);

            if (departmentError) throw departmentError;

            const departmentIds =
                (departments || []).map(item => item.id);

            if (departmentIds.length) {

                const { data: programmes, error: programmeError } =
                    await supabase
                        .from("programmes")
                        .select("id")
                        .in("department_id", departmentIds);

                if (programmeError) throw programmeError;

                const programmeIds =
                    (programmes || []).map(item => item.id);

                if (programmeIds.length) {

                    const { data, error } = await supabase
                        .from("academic_years")
                        .select("id")
                        .in("programme_id", programmeIds);

                    if (error) throw error;

                    parentIds = (data || []).map(item => item.id);

                }

            }

        }

        // UNITS

        else if (selectedAcademicTable === "units") {

            const { data: departments, error: departmentError } =
                await supabase
                    .from("departments")
                    .select("id")
                    .eq("university_id", universityId);

            if (departmentError) throw departmentError;

            const departmentIds =
                (departments || []).map(item => item.id);

            if (departmentIds.length) {

                const { data: programmes, error: programmeError } =
                    await supabase
                        .from("programmes")
                        .select("id")
                        .in("department_id", departmentIds);

                if (programmeError) throw programmeError;

                const programmeIds =
                    (programmes || []).map(item => item.id);

                if (programmeIds.length) {

                    const { data: years, error: yearError } =
                        await supabase
                            .from("academic_years")
                            .select("id")
                            .in("programme_id", programmeIds);

                    if (yearError) throw yearError;

                    const yearIds =
                        (years || []).map(item => item.id);

                    if (yearIds.length) {

                        const { data: semesters, error: semesterError } =
                            await supabase
                                .from("semesters")
                                .select("id")
                                .in("academic_year_id", yearIds);

                        if (semesterError) throw semesterError;

                        parentIds =
                            (semesters || []).map(item => item.id);

                    }

                }

            }

        }

        let query = supabase
            .from(selectedAcademicTable)
            .select(config.columns.join(","));

        if (config.universityField) {

            query = query.eq(
                config.universityField,
                universityId
            );

        } else {

            if (!parentIds.length) {

                renderAcademicRecords([]);

                await updateAcademicCounts();

                addAcademicRecordButton.disabled = false;

                return;

            }

            const parentField = {
                programmes: "department_id",
                academic_years: "programme_id",
                semesters: "academic_year_id",
                units: "semester_id"
            }[selectedAcademicTable];

            query = query.in(parentField, parentIds);

        }

        const { data, error } = await query.order(
            "created_at",
            { ascending: false }
        );

        if (error) throw error;

        renderAcademicRecords(data || []);

        await updateAcademicCounts();

        addAcademicRecordButton.disabled = false;

    } catch (error) {

        console.error("Academic loading error:", error);

        academicTableBody.innerHTML =
            `<tr><td colspan="8">Could not load records: ${error.message}</td></tr>`;

    }

}

// Render academic records
// Render academic records

function renderAcademicRecords(records) {

    const config = academicTables[selectedAcademicTable];

    academicTableTitle.textContent = config.title;

    academicTableHead.innerHTML = "";

    const headerRow = document.createElement("tr");

    config.columns.forEach(column => {

        const th = document.createElement("th");

        th.textContent = column.replaceAll("_", " ");

        headerRow.appendChild(th);

    });

    const actionHeader = document.createElement("th");

    actionHeader.textContent = "Actions";

    headerRow.appendChild(actionHeader);

    academicTableHead.appendChild(headerRow);

    academicTableBody.innerHTML = "";

    if (!records.length) {

        academicTableBody.innerHTML =
            `<tr><td colspan="${config.columns.length + 1}">No records found.</td></tr>`;

        return;

    }

    records.forEach(record => {

        const row = document.createElement("tr");

        config.columns.forEach(column => {

            const cell = document.createElement("td");

            cell.textContent = record[column] ?? "—";

            row.appendChild(cell);

        });

        const actionCell = document.createElement("td");

        // Edit button

        const editButton = createActionButton(
            "Edit",
            "action-button",
            () => editAcademicRecord(record)
        );

        // Delete button

        const deleteButton = createActionButton(
            "Delete",
            "action-button suspend-button",
            () => deleteAcademicRecord(record.id)
        );

        actionCell.append(editButton, deleteButton);

        row.appendChild(actionCell);

        academicTableBody.appendChild(row);

    });

}

// Update academic counts
async function updateAcademicCounts() {

    const universityId = academicUniversityFilter?.value;

    const countElements = {
        faculties: "academicFacultyCount",
        departments: "academicDepartmentCount",
        programmes: "academicProgrammeCount",
        academic_years: "academicYearCount",
        semesters: "academicSemesterCount",
        units: "academicUnitCount"
    };

    // Reset counts when no university is selected

    if (!universityId) {

        Object.values(countElements).forEach(elementId => {

            const element = document.getElementById(elementId);

            if (element) element.textContent = "0";

        });

        return;

    }

    try {

        // Helper function for updating a count

        const updateCount = (table, elementId, column, ids = null) => {

            const element = document.getElementById(elementId);

            if (!element) return Promise.resolve();

            if (ids !== null && ids.length === 0) {

                element.textContent = "0";

                return Promise.resolve();

            }

            let query = supabase
                .from(table)
                .select("id", { count: "exact", head: true });

            if (column) {

                query = query.in(column, ids);

            }

            return query.then(({ count, error }) => {

                if (error) throw error;

                element.textContent = count ?? 0;

            });

        };


        // 1. Faculties and departments

        const [
            { data: faculties, error: facultyError },
            { data: departments, error: departmentError }
        ] = await Promise.all([

            supabase
                .from("faculties")
                .select("id")
                .eq("university_id", universityId),

            supabase
                .from("departments")
                .select("id")
                .eq("university_id", universityId)

        ]);

        if (facultyError) throw facultyError;

        if (departmentError) throw departmentError;


        const facultyIds = (faculties || []).map(item => item.id);

        const departmentIds = (departments || []).map(item => item.id);


        // 2. Programmes belonging to this university's departments

        let programmeIds = [];

        if (departmentIds.length > 0) {

            const { data, error } = await supabase
                .from("programmes")
                .select("id")
                .in("department_id", departmentIds);

            if (error) throw error;

            programmeIds = (data || []).map(item => item.id);

        }


        // 3. Academic years belonging to those programmes

        let academicYearIds = [];

        if (programmeIds.length > 0) {

            const { data, error } = await supabase
                .from("academic_years")
                .select("id")
                .in("programme_id", programmeIds);

            if (error) throw error;

            academicYearIds = (data || []).map(item => item.id);

        }


        // 4. Semesters belonging to those academic years

        let semesterIds = [];

        if (academicYearIds.length > 0) {

            const { data, error } = await supabase
                .from("semesters")
                .select("id")
                .in("academic_year_id", academicYearIds);

            if (error) throw error;

            semesterIds = (data || []).map(item => item.id);

        }


        // 5. Update all six university-specific counts

        await Promise.all([

            updateCount(
                "faculties",
                countElements.faculties,
                "university_id",
                [universityId]
            ),

            updateCount(
                "departments",
                countElements.departments,
                "university_id",
                [universityId]
            ),

            updateCount(
                "programmes",
                countElements.programmes,
                "department_id",
                departmentIds
            ),

            updateCount(
                "academic_years",
                countElements.academic_years,
                "programme_id",
                programmeIds
            ),

            updateCount(
                "semesters",
                countElements.semesters,
                "academic_year_id",
                academicYearIds
            ),

            updateCount(
                "units",
                countElements.units,
                "semester_id",
                semesterIds
            )

        ]);

    } catch (error) {

        console.error(
            "Academic statistics error:",
            error
        );

        alert(
            "Could not update academic statistics: " +
            error.message
        );

    }

}

// Select academic category

document.querySelectorAll(".academic-tab-button").forEach(button => {

    button.addEventListener("click", async () => {

        selectedAcademicTable = button.dataset.academicTab;

        try {

            await loadAcademicRecords();

        } catch (error) {

            console.error(error);

            alert("Could not load academic records: " + error.message);

        }

    });

});


academicUniversityFilter?.addEventListener("change", async () => {

    if (selectedAcademicTable) {

        await loadAcademicRecords();

    }

    await updateAcademicCounts();

});


// Add academic record
// =====================================================
// ADD ACADEMIC RECORD - DROPDOWN FORM
// =====================================================

async function getAcademicParentOptions(table) {

    const universityId = academicUniversityFilter.value;

    let parentIds = [];
    let parentTable = "";
    let labelColumn = "";

    if (table === "departments") {

        parentTable = "faculties";
        labelColumn = "name";

        const { data, error } = await supabase
            .from("faculties")
            .select("id")
            .eq("university_id", universityId);

        if (error) throw error;

        parentIds = (data || []).map(item => item.id);

    }

    else if (table === "programmes") {

        parentTable = "departments";
        labelColumn = "name";

        const { data, error } = await supabase
            .from("departments")
            .select("id")
            .eq("university_id", universityId);

        if (error) throw error;

        parentIds = (data || []).map(item => item.id);

    }

    else if (table === "academic_years") {

        parentTable = "programmes";

        const { data: departments, error: departmentError } =
            await supabase
                .from("departments")
                .select("id")
                .eq("university_id", universityId);

        if (departmentError) throw departmentError;

        const departmentIds = (departments || []).map(item => item.id);

        if (!departmentIds.length) return [];

        const { data, error } = await supabase
            .from("programmes")
            .select("id, name")
            .in("department_id", departmentIds);

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            label: item.name
        }));

    }

    else if (table === "semesters") {

        parentTable = "academic_years";

        const { data: departments, error: departmentError } =
            await supabase
                .from("departments")
                .select("id")
                .eq("university_id", universityId);

        if (departmentError) throw departmentError;

        const departmentIds = (departments || []).map(item => item.id);

        if (!departmentIds.length) return [];

        const { data: programmes, error: programmeError } =
            await supabase
                .from("programmes")
                .select("id")
                .in("department_id", departmentIds);

        if (programmeError) throw programmeError;

        const programmeIds = (programmes || []).map(item => item.id);

        if (!programmeIds.length) return [];

        const { data, error } = await supabase
            .from("academic_years")
            .select("id, year_number")
            .in("programme_id", programmeIds);

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            label: `Year ${item.year_number}`
        }));

    }

    else if (table === "units") {

        parentTable = "semesters";

        const { data: departments, error: departmentError } =
            await supabase
                .from("departments")
                .select("id")
                .eq("university_id", universityId);

        if (departmentError) throw departmentError;

        const departmentIds = (departments || []).map(item => item.id);

        if (!departmentIds.length) return [];

        const { data: programmes, error: programmeError } =
            await supabase
                .from("programmes")
                .select("id")
                .in("department_id", departmentIds);

        if (programmeError) throw programmeError;

        const programmeIds = (programmes || []).map(item => item.id);

        if (!programmeIds.length) return [];

        const { data: years, error: yearError } =
            await supabase
                .from("academic_years")
                .select("id")
                .in("programme_id", programmeIds);

        if (yearError) throw yearError;

        const yearIds = (years || []).map(item => item.id);

        if (!yearIds.length) return [];

        const { data, error } = await supabase
            .from("semesters")
            .select("id, semester_number")
            .in("academic_year_id", yearIds);

        if (error) throw error;

        return (data || []).map(item => ({
            id: item.id,
            label: `Semester ${item.semester_number}`
        }));

    }

    if (!parentIds.length) return [];

    const { data, error } = await supabase
        .from(parentTable)
        .select(`id, ${labelColumn}`)
        .in("id", parentIds);

    if (error) throw error;

    return (data || []).map(item => ({
        id: item.id,
        label: item[labelColumn]
    }));

}


async function openAcademicRecordForm() {

    const config = academicTables[selectedAcademicTable];

    if (!config || !academicUniversityFilter.value) return;

    let parentField = null;

    const parentFields = {
        departments: "faculty_id",
        programmes: "department_id",
        academic_years: "programme_id",
        semesters: "academic_year_id",
        units: "semester_id"
    };

    parentField = parentFields[selectedAcademicTable] || null;

    let parentOptions = [];

    try {

        if (parentField) {

            parentOptions = await getAcademicParentOptions(
                selectedAcademicTable
            );

            if (!parentOptions.length) {

                alert(
                    "You must create the required parent records first."
                );

                return;

            }

        }

    } catch (error) {

        alert("Could not load dropdown options: " + error.message);
        return;

    }

    const overlay = document.createElement("div");

    overlay.id = "academicRecordModal";

    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.65);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
    `;

    const form = document.createElement("form");

    form.style.cssText = `
        background: white;
        color: #222;
        padding: 25px;
        border-radius: 12px;
        width: 100%;
        max-width: 480px;
        max-height: 85vh;
        overflow-y: auto;
    `;

    const heading = document.createElement("h2");
    heading.textContent = `Add ${config.title}`;
    form.appendChild(heading);

    for (const field of config.fields) {

        const label = document.createElement("label");

        label.textContent = field.replaceAll("_", " ");
        label.style.cssText = `
            display: block;
            margin-top: 15px;
            text-transform: capitalize;
        `;

        form.appendChild(label);

        let input;

        if (field === parentField) {

            input = document.createElement("select");

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = "Select an option";
            input.appendChild(placeholder);

            parentOptions.forEach(option => {

                const optionElement = document.createElement("option");

                optionElement.value = option.id;
                optionElement.textContent = option.label;

                input.appendChild(optionElement);

            });

        } else {

            input = document.createElement("input");

            input.type = [
                "duration_years",
                "year_number",
                "semester_number",
                "credit_hours"
            ].includes(field) ? "number" : "text";

            if (input.type === "number") {
                input.min = "1";
            }

        }

        input.name = field;
        input.required = true;

        input.style.cssText = `
            display: block;
            width: 100%;
            box-sizing: border-box;
            padding: 11px;
            margin-top: 6px;
            border: 1px solid #ccc;
            border-radius: 6px;
        `;

        form.appendChild(input);

    }

    const buttons = document.createElement("div");

    buttons.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 25px;
    `;

    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.textContent = "Save Record";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";

    cancelButton.addEventListener("click", () => overlay.remove());

    buttons.append(saveButton, cancelButton);
    form.appendChild(buttons);

    overlay.appendChild(form);
    document.body.appendChild(overlay);

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const record = {};

        for (const field of config.fields) {

            const input = form.elements[field];

            let value = input.value.trim();

            if (!value) {
                alert(`Please enter ${field.replaceAll("_", " ")}.`);
                return;
            }

            if (input.type === "number") {

                value = Number(value);

                if (!Number.isFinite(value) || value <= 0) {
                    alert("Please enter a valid positive number.");
                    return;
                }

            }

            record[field] = value;

        }

        if (config.universityField) {

            record[config.universityField] =
                academicUniversityFilter.value;

        }

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        try {

            const { error } = await supabase
                .from(selectedAcademicTable)
                .insert(record);

            if (error) throw error;

            alert("Academic record added successfully.");

            overlay.remove();

            await loadAcademicRecords();
            await updateAcademicCounts();

        } catch (error) {

            alert("Could not add record: " + error.message);

            saveButton.disabled = false;
            saveButton.textContent = "Save Record";

        }

    });

}


// Open academic creation form

addAcademicRecordButton?.addEventListener("click", () => {

    openAcademicRecordForm();

});

// =====================================================
// EDIT ACADEMIC RECORD
// =====================================================

async function editAcademicRecord(record) {

    const config = academicTables[selectedAcademicTable];

    if (!config) return;

    const parentFields = {
        departments: "faculty_id",
        programmes: "department_id",
        academic_years: "programme_id",
        semesters: "academic_year_id",
        units: "semester_id"
    };

    const parentField = parentFields[selectedAcademicTable] || null;

    let parentOptions = [];

    try {

        if (parentField) {

            parentOptions = await getAcademicParentOptions(
                selectedAcademicTable
            );

            if (!parentOptions.length) {

                alert("No valid parent records were found.");

                return;

            }

        }

    } catch (error) {

        alert("Could not load editing options: " + error.message);

        return;

    }

    const overlay = document.createElement("div");

    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.65);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        padding: 20px;
    `;

    const form = document.createElement("form");

    form.style.cssText = `
        background: white;
        color: #222;
        padding: 25px;
        border-radius: 12px;
        width: 100%;
        max-width: 480px;
        max-height: 85vh;
        overflow-y: auto;
    `;

    const heading = document.createElement("h2");

    heading.textContent = `Edit ${config.title}`;

    form.appendChild(heading);

    for (const field of config.fields) {

        const label = document.createElement("label");

        label.textContent = field.replaceAll("_", " ");

        label.style.cssText = `
            display: block;
            margin-top: 15px;
            text-transform: capitalize;
        `;

        form.appendChild(label);

        let input;

        if (field === parentField) {

            input = document.createElement("select");

            const placeholder = document.createElement("option");

            placeholder.value = "";
            placeholder.textContent = "Select an option";

            input.appendChild(placeholder);

            parentOptions.forEach(option => {

                const optionElement = document.createElement("option");

                optionElement.value = option.id;
                optionElement.textContent = option.label;

                input.appendChild(optionElement);

            });

        } else {

            input = document.createElement("input");

            input.type = [
                "duration_years",
                "year_number",
                "semester_number",
                "credit_hours"
            ].includes(field) ? "number" : "text";

            if (input.type === "number") {
                input.min = "1";
            }

        }

        input.name = field;
        input.required = true;

        input.value = record[field] ?? "";

        input.style.cssText = `
            display: block;
            width: 100%;
            box-sizing: border-box;
            padding: 11px;
            margin-top: 6px;
            border: 1px solid #ccc;
            border-radius: 6px;
        `;

        form.appendChild(input);

    }

    const buttons = document.createElement("div");

    buttons.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 25px;
    `;

    const saveButton = document.createElement("button");

    saveButton.type = "submit";
    saveButton.textContent = "Save Changes";

    const cancelButton = document.createElement("button");

    cancelButton.type = "button";
    cancelButton.textContent = "Cancel";

    cancelButton.addEventListener("click", () => {
        overlay.remove();
    });

    buttons.append(saveButton, cancelButton);

    form.appendChild(buttons);

    overlay.appendChild(form);

    document.body.appendChild(overlay);

    form.addEventListener("submit", async event => {

        event.preventDefault();

        const updatedRecord = {};

        for (const field of config.fields) {

            const input = form.elements[field];

            let value = input.value.trim();

            if (!value) {

                alert(`${field.replaceAll("_", " ")} is required.`);

                return;

            }

            if (input.type === "number") {

                value = Number(value);

                if (!Number.isFinite(value) || value <= 0) {

                    alert("Please enter a valid positive number.");

                    return;

                }

            }

            updatedRecord[field] = value;

        }

        saveButton.disabled = true;
        saveButton.textContent = "Saving...";

        try {

            const { error } = await supabase
                .from(selectedAcademicTable)
                .update(updatedRecord)
                .eq("id", record.id);

            if (error) throw error;

            alert("Academic record updated successfully.");

            overlay.remove();

            await loadAcademicRecords();

            await updateAcademicCounts();

        } catch (error) {

            alert("Could not update record: " + error.message);

            saveButton.disabled = false;
            saveButton.textContent = "Save Changes";

        }

    });

}

// Delete academic record

async function deleteAcademicRecord(id) {

    if (!confirm("Are you sure you want to delete this academic record?")) {
        return;
    }

    const { error } = await supabase
        .from(selectedAcademicTable)
        .delete()
        .eq("id", id);

    if (error) {

        alert("Could not delete record: " + error.message);

        return;

    }

    alert("Record deleted successfully.");

    await loadAcademicRecords();

}


// =====================================================
// LOAD ALL MANAGEMENT MODULES
// =====================================================

async function loadManagementModules() {

    await Promise.all([

        loadPlatformUsers(),

        loadAcademicUniversities(),

        loadSystemSettings(),

        loadSystemActivityLogs()

    ]);

}


// =====================================================
// INITIALIZE DASHBOARD
// =====================================================
async function initializeDashboard() {

    console.log(
        "Initializing ClassLink Super Admin Dashboard..."
    );

    const profile = await verifySuperAdmin();

    if (!profile) return;

    await Promise.all([

        loadStatistics(),

        loadUniversities(),

        loadManagementModules()

    ]);

    console.log(
        "ClassLink Super Admin Dashboard is ready."
    );

}

// =====================================================
// START DASHBOARD
// =====================================================

initializeDashboard();