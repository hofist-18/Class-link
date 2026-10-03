import {
    supabase
} from "./app.js";


const resultContainer =
    document.getElementById(
        "verificationResult"
    );


async function verifyExamCard() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const cardNumber =
        params.get("card");


    if (!cardNumber) {

        resultContainer.innerHTML = `

            <div class="modern-card">

                <h3>
                    🔍 Enter Examination Card Number
                </h3>

                <p>
                    No examination card number
                    was provided.
                </p>

            </div>

        `;

        return;
    }


    resultContainer.innerHTML = `

        <p class="empty-state">
            Verifying examination card...
        </p>

    `;


    const {
        data,
        error
    } = await supabase.rpc(
        "verify_exam_card",
        {
            p_card_number:
                cardNumber
        }
    );


    if (error) {

        console.error(error);

        resultContainer.innerHTML = `

            <div class="modern-card">

                <h3>
                    ❌ Verification Failed
                </h3>

                <p>
                    We could not verify this
                    examination card.
                </p>

            </div>

        `;

        return;
    }


    if (!data || data.length === 0) {

        resultContainer.innerHTML = `

            <div class="modern-card">

                <h3>
                    ❌ Invalid Examination Card
                </h3>

                <p>
                    No examination card was found
                    with this number.
                </p>

            </div>

        `;

        return;
    }


    const card =
        data[0];


    const isActive =
        card.status === "active";


    resultContainer.innerHTML = `

        <div
            class="modern-card"
            style="
                border-top: 5px solid
                ${isActive ? "#16a34a" : "#dc2626"};
            "
        >

            <div
                style="
                    text-align: center;
                    margin-bottom: 20px;
                "
            >

                <div
                    style="
                        font-size: 45px;
                    "
                >
                    ${isActive ? "✅" : "❌"}
                </div>

                <h2>
                    ${
                        isActive
                            ? "VALID EXAMINATION CARD"
                            : "CANCELLED EXAMINATION CARD"
                    }
                </h2>

                <p>
                    Examination card verification result
                </p>

            </div>


            <div>

                <p>
                    <strong>
                        Card Number:
                    </strong>

                    ${card.card_number}
                </p>


                <p>
                    <strong>
                        Student:
                    </strong>

                    ${card.student_name}
                </p>


                <p>
                    <strong>
                        Admission Number:
                    </strong>

                    ${card.admission_number}
                </p>


                <p>
                    <strong>
                        Programme:
                    </strong>

                    ${card.programme_name}
                </p>


                <p>
                    <strong>
                        Academic Year:
                    </strong>

                    ${card.academic_year}
                </p>


                <p>
                    <strong>
                        Semester:
                    </strong>

                    ${card.semester_number}
                </p>


                <p>
                    <strong>
                        Status:
                    </strong>

                    ${card.status}
                </p>

            </div>


            <div
                style="
                    margin-top: 20px;
                    padding: 12px;
                    background: #f1f5f9;
                    text-align: center;
                "
            >

                ${
                    isActive
                        ? "This examination card is valid."
                        : "This examination card has been cancelled."
                }

            </div>

        </div>

    `;
}


verifyExamCard();