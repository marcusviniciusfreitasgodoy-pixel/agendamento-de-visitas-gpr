// netlify/functions/save.ts
import { Handler } from "@netlify/functions";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const bucket = "drivers-license";

const supabase = createClient(supabaseUrl, supabaseKey);

export const handler: Handler = async (event) => {
  try {
    if (!event.body) {
      return { statusCode: 400, body: "No data received" };
    }

    const data = JSON.parse(event.body);

    // Upload da CNH
    let cnhUrl = null;

    if (data.driversLicense && data.driversLicense.includes("base64")) {
      const fileBuffer = Buffer.from(
        data.driversLicense.split("base64,")[1],
        "base64"
      );

      const fileName = `cnh-${Date.now()}.jpg`;

      const uploadResult = await supabase.storage
        .from(bucket)
        .upload(fileName, fileBuffer, {
          contentType: "image/jpeg",
        });

      if (uploadResult.error) {
        console.error(uploadResult.error);
      } else {
        const { data: publicUrl } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        cnhUrl = publicUrl.publicUrl;
      }
    }

    // Salvar no Supabase
    const payload = {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      family_monthly_income: data.familyMonthlyIncome,
      property_identifier: data.propertyIdentifier,
      property_of_interest: data.propertyOfInterest,
      payment_method: data.paymentMethod,
      has_proof_of_income: data.hasProofOfIncome,
      financing_amount: data.financingAmount,
      has_preapproved_credit: data.hasPreApprovedCredit,
      financial_institution: data.financialInstitution,
      tradein_property_value: data.tradeInPropertyValue,
      tradein_type: data.tradeInType,
      tradein_bedrooms: data.tradeInBedrooms,
      tradein_size: data.tradeInSize,
      tradein_neighborhood: data.tradeInNeighborhood,
      tradein_address: data.tradeInAddress,
      visit_date1: data.visitDate1,
      visit_time1: data.visitTime1,
      visit_date2: data.visitDate2,
      visit_time2: data.visitTime2,
      budget_min: data.budgetMin,
      budget_max: data.budgetMax,
      visit_detail: data.visitDetail,
      cnh_url: cnhUrl,
      score: data.scoreResult?.score ?? null,
      analysis: data.scoreResult?.analysis ?? null,
      recommendation: data.scoreResult?.recommendation ?? null,
      next_steps: data.scoreResult?.nextSteps ?? [],
    };

    const result = await supabase.from("visitas").insert(payload);

    if (result.error) {
      console.error(result.error);
      return { statusCode: 500, body: "Error saving" };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        id: result.data[0].id,
      }),
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server error" };
  }
};
