// =====================================================
// CLASSLINK UNIVERSITY SEARCH ENGINE
// =====================================================

import { supabase } from "./app.js";


// =====================================================
// HTML ELEMENTS
// =====================================================

const universitySearch =
    document.getElementById("universitySearch");

const universityResults =
    document.getElementById("universityResults");

const universitySearchStatus =
    document.getElementById("universitySearchStatus");

const clearUniversitySearch =
    document.getElementById("clearUniversitySearch");


// =====================================================
// STOP IF NOT ON HOMEPAGE
// =====================================================

if (
    universitySearch &&
    universityResults &&
    universitySearchStatus
) {

    initializeUniversitySearch();

}


// =====================================================
// INITIALIZE SEARCH
// =====================================================

async function initializeUniversitySearch() {

    universitySearchStatus.textContent =
        "Loading universities...";

    universityResults.innerHTML = "";


    try {

        // =============================================
        // FETCH UNIVERSITIES FROM SUPABASE
        // =============================================

        const {
            data,
            error
        } = await supabase

            .from("universities")

            .select(
                "id, name, category, status"
            )

            .order(
                "name",
                {
                    ascending: true
                }
            )

            .limit(1000);


        // =============================================
        // HANDLE ERRORS
        // =============================================

        if (error) {

            console.error(
                "University search error:",
                error
            );

            universitySearchStatus.textContent =
                "Unable to load universities. Please refresh the page.";

            return;

        }


        // =============================================
        // CHECK RESULTS
        // =============================================

        if (
            !data ||
            data.length === 0
        ) {

            universitySearchStatus.textContent =
                "No universities are currently available.";

            return;

        }


        // =============================================
        // STORE UNIVERSITIES
        // =============================================

        const universities = data;


        console.log(
            "University directory loaded:",
            universities.length
        );


        // =============================================
        // DISPLAY INITIAL RESULTS
        // =============================================

        displayUniversities(
            universities
        );


        universitySearchStatus.textContent =
            universities.length +
            " universities available";


        // =============================================
        // SEARCH FUNCTION
        // =============================================

        universitySearch.addEventListener(
            "input",
            function() {

                const searchTerm =
                    universitySearch.value
                        .trim()
                        .toLowerCase();


                const filteredUniversities =
                    universities.filter(
                        function(university) {

                            return university.name
                                .toLowerCase()
                                .includes(searchTerm);

                        }
                    );


                displayUniversities(
                    filteredUniversities
                );


                if (searchTerm === "") {

                    universitySearchStatus.textContent =
                        universities.length +
                        " universities available";

                } else {

                    universitySearchStatus.textContent =
                        filteredUniversities.length +
                        " matching universities found";

                }

            }
        );


        // =============================================
        // CLEAR SEARCH
        // =============================================

        if (clearUniversitySearch) {

            clearUniversitySearch.addEventListener(
                "click",
                function() {

                    universitySearch.value = "";

                    universitySearch.focus();

                    displayUniversities(
                        universities
                    );

                    universitySearchStatus.textContent =
                        universities.length +
                        " universities available";

                }
            );

        }


    } catch (error) {

        console.error(
            "Unexpected university search error:",
            error
        );

        universitySearchStatus.textContent =
            "Something went wrong while loading universities.";

    }

}



// =====================================================
// DISPLAY UNIVERSITY CARDS
// =====================================================

function displayUniversities(universities) {

    universityResults.innerHTML = "";


    // =============================================
    // NO RESULTS
    // =============================================

    if (
        !universities ||
        universities.length === 0
    ) {

        universityResults.innerHTML = `

            <div class="university-empty-state">

                <div>
                    🔎
                </div>

                <h3>
                    No university found
                </h3>

                <p>
                    Try searching using another name.
                </p>

            </div>

        `;

        return;

    }


    // =============================================
    // DISPLAY UNIVERSITY CARDS
    // =============================================

    universities.forEach(
        function(university) {

            const card =
                document.createElement("div");


            card.className =
                "university-card";


            // UNIVERSITY ICON

            const icon =
                document.createElement("div");

            icon.className =
                "university-card-icon";

            icon.textContent =
                "🎓";


            // UNIVERSITY DETAILS

            const details =
                document.createElement("div");

            details.className =
                "university-card-details";


            const name =
                document.createElement("h3");

            name.textContent =
                university.name;


            const category =
                document.createElement("p");

            category.textContent =
                university.category ||
                "University / Institution";


            const status =
                document.createElement("span");

            status.className =
                "university-status";

            status.textContent =
                university.status ||
                "Status not specified";


            details.appendChild(name);

            details.appendChild(category);

            details.appendChild(status);


            // SELECT BUTTON

            const button =
                document.createElement("a");

            button.className =
                "university-select-button";

            button.textContent =
                "Select University →";


            button.href =
                "university-login.html?university=" +
                encodeURIComponent(
                    university.id
                );


            // BUILD CARD

            card.appendChild(icon);

            card.appendChild(details);

            card.appendChild(button);


            universityResults.appendChild(card);

        }
    );

}