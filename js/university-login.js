// =====================================================
// CLASSLINK UNIVERSITY LOGIN PAGE
// =====================================================

import { supabase } from "./app.js";


// =====================================================
// PAGE ELEMENTS
// =====================================================

const universitySelect =
    document.getElementById("loginUniversity");

const universityName =
    document.getElementById("selectedUniversityName");


// =====================================================
// GET SELECTED UNIVERSITY
// =====================================================

async function loadSelectedUniversity() {

    if (!universitySelect) {
        return;
    }

    const params =
        new URLSearchParams(
            window.location.search
        );

    const universityId =
        params.get("university");


    if (!universityId) {

        universityName.textContent =
            "No university selected";

        return;

    }


    // Wait until app.js loads the university options.

    let attempts = 0;

    while (
        !universitySelect.value &&
        attempts < 50
    ) {

        await new Promise(
            resolve => setTimeout(resolve, 100)
        );

        attempts++;

    }


    if (
        universitySelect.value !== universityId
    ) {

        universityName.textContent =
            "University not found";

        return;

    }


    // Retrieve university information.

    const {
        data,
        error
    } = await supabase

        .from("universities")

        .select("id, name")

        .eq("id", universityId)

        .single();


    if (error || !data) {

        console.error(
            "University details error:",
            error
        );

        universityName.textContent =
            "Could not load university";

        return;

    }


    universityName.textContent =
        data.name;

}


// =====================================================
// INITIALIZE
// =====================================================

loadSelectedUniversity();