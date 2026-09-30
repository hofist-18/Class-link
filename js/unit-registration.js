import { supabase } from "./app.js";

// =====================================================
// UNIT REGISTRATION
// =====================================================

const registrationInfo =
    document.getElementById("registrationInfo");

const availableUnits =
    document.getElementById("availableUnits");

const registeredUnits =
    document.getElementById("registeredUnits");

const registerUnitsBtn =
    document.getElementById("registerUnitsBtn");

const registrationStatus =
    document.getElementById("registrationStatus");

let user = null;
let currentSemesterId = null;
let registeredUnitIds = [];


// =====================================================
// GET LOGGED-IN USER
// =====================================================

async function getCurrentUser() {

    const {
        data: { user: currentUser },
        error
    } = await supabase.auth.getUser();

    if (error || !currentUser) {

        console.error(error);

        registrationInfo.innerHTML = `
            <p>
                You must be logged in to register units.
            </p>
        `;

        return false;
    }

    user = currentUser;

    return true;
}


// =====================================================
// LOAD STUDENT PROGRAMME
// =====================================================

async function loadStudentRegistration() {

    const { data, error } = await supabase
        .from("student_programmes")
        .select(`
            id,
            programme_id,
            admission_number,
            admission_year,
            status,
            programmes (
                id,
                name,
                code
            )
        `)
        .eq("student_id", user.id)
        .single();

    if (error) {

        console.error(error);

        registrationInfo.innerHTML = `
            <p>
                Could not load your programme information.
            </p>
        `;

        return false;
    }

    registrationInfo.innerHTML = `
        <div class="modern-card">
            <h2>${data.programmes.name}</h2>

            <p>
                Programme Code:
                <strong>
                    ${data.programmes.code}
                </strong>
            </p>

            <p>
                Admission Number:
                <strong>
                    ${data.admission_number || "Not assigned"}
                </strong>
            </p>

            <p>
                Status:
                <strong>
                    ${data.status}
                </strong>
            </p>
        </div>
    `;

    return true;
}


// =====================================================
// LOAD CURRENT SEMESTER
// =====================================================

async function loadCurrentSemester() {

    const { data, error } = await supabase
        .from("student_semesters")
        .select(`
            id,
            semester_id,
            status,
            semesters (
                id,
                semester_number,
                academic_year_id,
                academic_years (
                    year_number,
                    programme_id
                )
            )
        `)
        .eq("student_id", user.id)
        .eq("status", "registered")
        .order("registered_at", {
            ascending: false
        })
        .limit(1)
        .single();

    if (error) {

        console.error(error);

        registrationInfo.innerHTML += `
            <p>
                No active semester registration found.
            </p>
        `;

        return false;
    }

    currentSemesterId =
        data.semester_id;

    registrationInfo.innerHTML += `
        <div class="modern-card">
            <h3>Current Registration</h3>

            <p>
                Year
                <strong>
                    ${data.semesters.academic_years.year_number}
                </strong>
            </p>

            <p>
                Semester
                <strong>
                    ${data.semesters.semester_number}
                </strong>
            </p>
        </div>
    `;

    return true;
}


// =====================================================
// LOAD REGISTERED UNITS FIRST
// =====================================================

async function loadRegisteredUnits() {

    if (!currentSemesterId) {
        return false;
    }

    const { data: units, error } = await supabase
        .from("student_units")
        .select(`
            id,
            unit_id,
            status,
            registered_at,
            units (
                unit_code,
                unit_name,
                credit_hours
            )
        `)
        .eq("student_id", user.id)
        .eq("semester_id", currentSemesterId)
        .order("registered_at");

    if (error) {

        console.error(error);

        registeredUnits.innerHTML = `
            <h2>My Registered Units</h2>
            <p>
                Could not load registered units.
            </p>
        `;

        return false;
    }

    registeredUnitIds =
        (units || []).map(function(item) {
            return item.unit_id;
        });


    if (!units || units.length === 0) {

        registeredUnits.innerHTML = `
            <h2>My Registered Units</h2>

            <p>
                You have not registered any units yet.
            </p>
        `;

        return true;
    }


    const totalCredits =
        units.reduce(function(total, item) {

            return total +
                (item.units?.credit_hours || 0);

        }, 0);


    registeredUnits.innerHTML = `
        <h2>My Registered Units</h2>

        <div class="modern-card">

            <h3>
                📚 Registered Units
            </h3>

            <p>
                Total Credit Hours:
                <strong>
                    ${totalCredits}
                </strong>
            </p>

        </div>

        <div id="registeredUnitsList"></div>
    `;


    const registeredUnitsList =
        document.getElementById(
            "registeredUnitsList"
        );


    units.forEach(function(item) {

        const card =
            document.createElement("div");

        card.className =
            "modern-card";

        card.innerHTML = `
            <div style="
                display:flex;
                justify-content:space-between;
                gap:15px;
                align-items:flex-start;
            ">

                <div>

                    <h3>
                        ${item.units.unit_code}
                    </h3>

                    <p>
                        ${item.units.unit_name}
                    </p>

                    <p>
                        Credit Hours:
                        <strong>
                            ${item.units.credit_hours || "N/A"}
                        </strong>
                    </p>

                </div>

                <strong
                    style="
                        color:#16a34a;
                        white-space:nowrap;
                    "
                >
                    ✅ Registered
                </strong>

            </div>
        `;

        registeredUnitsList.appendChild(card);

    });

    return true;
}


// =====================================================
// LOAD AVAILABLE UNITS
// =====================================================

async function loadAvailableUnits() {

    if (!currentSemesterId) {
        return;
    }


    const { data: units, error } = await supabase
        .from("units")
        .select(`
            id,
            unit_code,
            unit_name,
            unit_description,
            credit_hours
        `)
        .eq("semester_id", currentSemesterId)
        .order("unit_code");


    if (error) {

        console.error(error);

        availableUnits.innerHTML = `
            <h2>Available Units</h2>

            <p>
                Could not load units.
            </p>
        `;

        return;
    }


    if (!units || units.length === 0) {

        availableUnits.innerHTML = `
            <h2>Available Units</h2>

            <p>
                No units are available for this semester.
            </p>
        `;

        return;
    }


    availableUnits.innerHTML = `
        <h2>Available Units</h2>

        <p>
            Select the units you want to register.
        </p>

        <div id="unitSelectionList"></div>

        <div
            id="selectedCredits"
            class="modern-card"
            style="margin-top:20px;"
        >
            <strong>
                Selected Credit Hours:
            </strong>

            <span id="selectedCreditsValue">
                0
            </span>
        </div>
    `;


    const unitSelectionList =
        document.getElementById(
            "unitSelectionList"
        );


    units.forEach(function(unit) {

        const alreadyRegistered =
            registeredUnitIds.includes(unit.id);


        const unitCard =
            document.createElement("div");

        unitCard.className =
            "modern-card";


        unitCard.innerHTML = `
            <label
                style="
                    display:flex;
                    gap:15px;
                    align-items:flex-start;
                    cursor:${alreadyRegistered
                        ? "default"
                        : "pointer"};
                "
            >

                <input
                    type="checkbox"
                    class="unit-checkbox"
                    value="${unit.id}"
                    data-credit-hours="${unit.credit_hours || 0}"
                    ${alreadyRegistered ? "disabled" : ""}
                    style="margin-top:5px;"
                >

                <div style="flex:1;">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        gap:10px;
                        align-items:flex-start;
                    ">

                        <div>

                            <strong>
                                ${unit.unit_code}
                            </strong>

                            <h3>
                                ${unit.unit_name}
                            </h3>

                        </div>

                        ${
                            alreadyRegistered
                                ? `
                                    <strong
                                        style="
                                            color:#16a34a;
                                            white-space:nowrap;
                                        "
                                    >
                                        ✅ Registered
                                    </strong>
                                `
                                : `
                                    <strong>
                                        ${unit.credit_hours || 0}
                                        Credits
                                    </strong>
                                `
                        }

                    </div>

                    <p>
                        ${unit.unit_description || ""}
                    </p>

                </div>

            </label>
        `;


        unitSelectionList.appendChild(
            unitCard
        );

    });


    // Update selected credit hours

    const checkboxes =
        document.querySelectorAll(
            ".unit-checkbox:not(:disabled)"
        );

    const selectedCreditsValue =
        document.getElementById(
            "selectedCreditsValue"
        );


    checkboxes.forEach(function(checkbox) {

        checkbox.addEventListener(
            "change",
            function() {

                let totalCredits = 0;

                document
                    .querySelectorAll(
                        ".unit-checkbox:checked"
                    )
                    .forEach(function(selected) {

                        totalCredits +=
                            Number(
                                selected.dataset
                                    .creditHours
                            );

                    });


                selectedCreditsValue.textContent =
                    totalCredits;

            }
        );

    });

}


// =====================================================
// REGISTER SELECTED UNITS
// =====================================================

if (registerUnitsBtn) {

    registerUnitsBtn.addEventListener(
        "click",
        async function() {

            if (!currentSemesterId) {

                registrationStatus.textContent =
                    "No active semester found.";

                return;
            }


            const selectedUnits =
                Array.from(
                    document.querySelectorAll(
                        ".unit-checkbox:checked"
                    )
                ).map(function(checkbox) {

                    return checkbox.value;

                });


            if (selectedUnits.length === 0) {

                registrationStatus.textContent =
                    "Please select at least one unit.";

                return;
            }


            registerUnitsBtn.disabled = true;

            registerUnitsBtn.textContent =
                "Registering...";

            registrationStatus.textContent =
                "";


            const rows =
                selectedUnits.map(function(unitId) {

                    return {

                        student_id:
                            user.id,

                        unit_id:
                            unitId,

                        semester_id:
                            currentSemesterId,

                        status:
                            "registered"

                    };

                });


            const { error } =
                await supabase
                    .from("student_units")
                    .upsert(
                        rows,
                        {
                            onConflict:
                                "student_id,unit_id,semester_id"
                        }
                    );


            if (error) {

                console.error(error);

                registrationStatus.textContent =
                    "Could not register units.";

            } else {

                registrationStatus.textContent =
                    "✅ Units registered successfully.";

                await loadRegisteredUnits();

                await loadAvailableUnits();

            }


            registerUnitsBtn.disabled = false;

            registerUnitsBtn.textContent =
                "Register Selected Units";

        }
    );

}


// =====================================================
// START
// =====================================================

async function initialiseRegistration() {

    const loggedIn =
        await getCurrentUser();

    if (!loggedIn) {
        return;
    }


    const programmeLoaded =
        await loadStudentRegistration();

    if (!programmeLoaded) {
        return;
    }


    const semesterLoaded =
        await loadCurrentSemester();

    if (!semesterLoaded) {
        return;
    }


    await loadRegisteredUnits();

    await loadAvailableUnits();

}


initialiseRegistration();