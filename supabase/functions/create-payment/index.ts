import "@supabase/functions-js/edge-runtime.d.ts";
import { createSupabaseContext } from "@supabase/server";

console.log("ClassLink create-payment function started");

// --------------------------------------------------
// CORS headers
// --------------------------------------------------

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};

export default {
  fetch: async (req: Request) => {

    // --------------------------------------------------
    // 1. Handle browser CORS preflight
    // --------------------------------------------------

    if (req.method === "OPTIONS") {
      return new Response("ok", {
        status: 200,
        headers: corsHeaders,
      });
    }

    // --------------------------------------------------
    // 2. Authenticate the student
    // --------------------------------------------------

    const {
      data: ctx,
      error: authError,
    } = await createSupabaseContext(req, {
      auth: "user",
    });

    if (authError) {
      console.error(
        "AUTH ERROR:",
        authError
      );

      return Response.json(
        {
          success: false,
          error: authError.message,
          code: authError.code,
        },
        {
          status: authError.status,
          headers: corsHeaders,
        }
      );
    }

    try {

      // --------------------------------------------------
      // 3. Only allow POST
      // --------------------------------------------------

      if (req.method !== "POST") {
        return Response.json(
          {
            success: false,
            error: "Method not allowed",
          },
          {
            status: 405,
            headers: corsHeaders,
          }
        );
      }

      // --------------------------------------------------
      // 4. Get authenticated student
      // --------------------------------------------------

      const userId =
        ctx.userClaims?.id;

      if (!userId) {
        return Response.json(
          {
            success: false,
            error:
              "Could not identify the logged-in student.",
          },
          {
            status: 401,
            headers: corsHeaders,
          }
        );
      }

      console.log(
        "Authenticated student:",
        userId
      );

      // --------------------------------------------------
      // 5. Read request body
      // --------------------------------------------------

      const body =
        await req.json();

      const amount =
        Number(body.amount);

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        return Response.json(
          {
            success: false,
            error:
              "Please enter a valid payment amount.",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // --------------------------------------------------
      // 6. Get student's university
      // --------------------------------------------------

      const {
        data: profile,
        error: profileError,
      } = await ctx.supabase
        .from("profiles")
        .select("university_id")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error(
          "Profile error:",
          profileError
        );

        throw new Error(
          "Could not load your profile."
        );
      }

      if (!profile?.university_id) {
        return Response.json(
          {
            success: false,
            error:
              "Your university could not be identified.",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      const universityId =
        profile.university_id;

      // --------------------------------------------------
      // 7. Get student's latest fee account
      // --------------------------------------------------

      const {
        data: feeAccount,
        error: feeAccountError,
      } = await ctx.supabase
        .from("student_fee_accounts")
        .select(
          "id, amount_due"
        )
        .eq(
          "student_id",
          userId
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(1)
        .maybeSingle();

      if (feeAccountError) {
        console.error(
          "Fee account error:",
          feeAccountError
        );

        throw new Error(
          "Could not load your fee account."
        );
      }

      if (!feeAccount) {
        return Response.json(
          {
            success: false,
            error:
              "No fee account was found.",
          },
          {
            status: 404,
            headers: corsHeaders,
          }
        );
      }

      // --------------------------------------------------
      // 8. Calculate outstanding balance
      // --------------------------------------------------

      const {
        data: payments,
        error: paymentsError,
      } = await ctx.supabase
        .from("fee_payments")
        .select("amount")
        .eq(
          "student_id",
          userId
        )
        .eq(
          "fee_account_id",
          feeAccount.id
        );

      if (paymentsError) {
        console.error(
          "Payments error:",
          paymentsError
        );

        throw new Error(
          "Could not calculate your fee balance."
        );
      }

      const totalPaid =
        (payments ?? []).reduce(
          (
            total: number,
            payment: {
              amount:
                | number
                | string
                | null;
            }
          ) =>
            total +
            Number(
              payment.amount || 0
            ),
          0
        );

      const totalFees =
        Number(
          feeAccount.amount_due || 0
        );

      const balance =
        Math.max(
          totalFees -
            totalPaid,
          0
        );

      console.log(
        "Payment balance:",
        balance
      );

      // --------------------------------------------------
      // 9. Prevent overpayment
      // --------------------------------------------------

      if (amount > balance) {
        return Response.json(
          {
            success: false,
            error:
              "The amount cannot be greater than your outstanding balance of KSh " +
              balance.toLocaleString(
                "en-KE"
              ),
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      if (balance <= 0) {
        return Response.json(
          {
            success: false,
            error:
              "You do not have an outstanding fee balance.",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // --------------------------------------------------
      // 10. Get university payment settings
      // --------------------------------------------------

      const {
        data: paymentSettings,
        error:
          paymentSettingsError,
      } = await ctx.supabase
        .from(
          "university_payment_settings"
        )
        .select(
          `
            provider,
            merchant_identifier,
            service_identifier,
            enabled
          `
        )
        .eq(
          "university_id",
          universityId
        )
        .eq(
          "enabled",
          true
        )
        .limit(1)
        .maybeSingle();

      if (
        paymentSettingsError
      ) {
        console.error(
          "Payment settings error:",
          paymentSettingsError
        );

        throw new Error(
          "Could not load the university payment settings."
        );
      }

      if (!paymentSettings) {
        return Response.json(
          {
            success: false,
            error:
              "Online payments are not currently enabled for your university.",
          },
          {
            status: 400,
            headers: corsHeaders,
          }
        );
      }

      // --------------------------------------------------
      // 11. Generate transaction reference
      // --------------------------------------------------

      const transactionReference =
        "CLFEE-" +
        Date.now() +
        "-" +
        crypto
          .randomUUID()
          .substring(
            0,
            8
          )
          .toUpperCase();

      // --------------------------------------------------
      // 12. Create pending transaction
      // --------------------------------------------------

      const {
        data: transaction,
        error:
          transactionError,
      } = await ctx.supabase
        .from(
          "fee_payment_transactions"
        )
        .insert({
          student_id:
            userId,

          university_id:
            universityId,

          fee_account_id:
            feeAccount.id,

          amount:
            amount,

          transaction_reference:
            transactionReference,

          payment_provider:
            paymentSettings.provider,

          status:
            "pending",
        })
        .select()
        .single();

      if (transactionError) {
        console.error(
          "Transaction creation error:",
          transactionError
        );

        throw new Error(
          "Could not create the payment transaction."
        );
      }

      console.log(
        "ClassLink payment transaction created:",
        transaction.id
      );

      // --------------------------------------------------
      // 13. Return successful response
      // --------------------------------------------------

      return Response.json(
        {
          success: true,

          transaction: {
            id:
              transaction.id,

            reference:
              transactionReference,

            amount:
              amount,

            status:
              "pending",
          },

          paymentProvider:
            paymentSettings.provider,

          message:
            "Payment request created successfully.",
        },
        {
          status: 200,
          headers: corsHeaders,
        }
      );

    } catch (error) {

      console.error(
        "create-payment error:",
        error
      );

      return Response.json(
        {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
        },
        {
          status: 500,
          headers: corsHeaders,
        }
      );
    }
  },
};