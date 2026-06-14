/**
 * Clinical Interpretation Engine
 * Auto-generates clinical interpretation text and recommendations
 * based on mirLung Dx score, risk category, and patient context.
 */

export interface InterpretationInput {
  mirlungScore: number;
  riskCategory: "LOW RISK" | "HIGH RISK";
  noduleSizeMm?: number;
  patientAge?: number;
  smokingStatus?: string;
  familyHistory?: boolean;
}

export interface ClinicalInterpretation {
  summary: string;
  interpretation: string;
  recommendations: string[];
  followUpInterval: string;
  additionalTests: string[];
  riskFactors: string[];
}

/**
 * Generate a complete clinical interpretation from mirLung Dx results.
 */
export function generateInterpretation(
  input: InterpretationInput
): ClinicalInterpretation {
  const { mirlungScore, riskCategory, noduleSizeMm, patientAge, smokingStatus, familyHistory } = input;
  const isHigh = riskCategory === "HIGH RISK";

  // --- Summary ---
  const summary = isHigh
    ? `mirLung Dx\u2122 integrated risk score of ${mirlungScore.toFixed(2)}% indicates HIGH RISK for lung malignancy.`
    : `mirLung Dx\u2122 integrated risk score of ${mirlungScore.toFixed(2)}% indicates LOW RISK for lung malignancy.`;

  // --- Interpretation ---
  const interpretation = isHigh
    ? "The mirLung Dx\u2122 result indicates a high probability of molecular expression patterns associated with lung malignancy. Correlation with histopathological findings and/or PET imaging, together with comprehensive clinical evaluation, is recommended for confirmatory assessment. This result should be interpreted in conjunction with clinical and radiological findings and is not intended to replace histopathological diagnosis."
    : "The mirLung Dx\u2122 result indicates a low probability of molecular expression patterns associated with lung malignancy. Continued surveillance as per clinical guidelines is recommended. This result should be interpreted in conjunction with clinical and radiological findings and is not intended to replace histopathological diagnosis.";

  // --- Recommendations based on risk + nodule size ---
  const recommendations: string[] = [];

  if (isHigh) {
    if (noduleSizeMm && noduleSizeMm > 8) {
      recommendations.push(
        "Histopathological correlation and/or PET scan is strongly recommended."
      );
      recommendations.push(
        "Consider tissue biopsy for definitive diagnosis."
      );
    } else if (noduleSizeMm && noduleSizeMm >= 6) {
      recommendations.push(
        "Shorter interval (e.g., 3 months) for LDCT surveillance as per nodule guidelines."
      );
      recommendations.push(
        "mirLung Dx\u2122 repeat testing (e.g., every 6 months) to monitor biological changes."
      );
    } else {
      recommendations.push(
        "Interval LDCT surveillance as per nodule guidelines."
      );
      recommendations.push(
        "mirLung Dx\u2122 repeat testing (e.g., every 6 months) to monitor biological changes."
      );
    }
  } else {
    if (noduleSizeMm && noduleSizeMm > 8) {
      recommendations.push(
        "Interval LDCT surveillance as per nodule guidelines."
      );
      recommendations.push(
        "mirLung Dx\u2122 repeat testing (e.g., every 6 months) to monitor biological changes."
      );
    } else if (noduleSizeMm && noduleSizeMm >= 6) {
      recommendations.push(
        "Longer LDCT surveillance as per nodule guidelines."
      );
      recommendations.push(
        "mirLung Dx\u2122 repeat testing (e.g., every 6 months) to monitor biological changes."
      );
    } else {
      recommendations.push(
        "mirLung Dx\u2122 to be repeated periodically (e.g., annually) to monitor biological changes."
      );
      recommendations.push(
        "Continue routine clinical follow-up."
      );
    }
  }

  // --- Follow-up interval ---
  let followUpInterval: string;
  if (isHigh && noduleSizeMm && noduleSizeMm > 8) {
    followUpInterval = "Immediate further investigation recommended";
  } else if (isHigh) {
    followUpInterval = "3-6 months";
  } else if (noduleSizeMm && noduleSizeMm > 6) {
    followUpInterval = "6 months";
  } else {
    followUpInterval = "12 months";
  }

  // --- Additional tests ---
  const additionalTests: string[] = [];
  if (isHigh) {
    additionalTests.push("PET/CT scan");
    if (noduleSizeMm && noduleSizeMm > 8) {
      additionalTests.push("CT-guided biopsy or bronchoscopy");
    }
    additionalTests.push("Pulmonary function tests");
  } else {
    additionalTests.push("Follow-up LDCT");
    additionalTests.push("mirLung Dx\u2122 repeat testing");
  }

  // --- Risk factors ---
  const riskFactors: string[] = [];
  if (mirlungScore >= 50) {
    riskFactors.push(`Elevated mirLung Dx\u2122 score (${mirlungScore.toFixed(2)}%)`);
  }
  if (patientAge && patientAge >= 55) {
    riskFactors.push(`Age ${patientAge} (elevated risk age group)`);
  }
  if (smokingStatus && smokingStatus.toLowerCase() !== "never" && smokingStatus.toLowerCase() !== "non-smoker") {
    riskFactors.push(`Smoking history: ${smokingStatus}`);
  }
  if (familyHistory) {
    riskFactors.push("Family history of lung cancer");
  }
  if (noduleSizeMm && noduleSizeMm > 8) {
    riskFactors.push(`Nodule size: ${noduleSizeMm}mm (>8mm)`);
  }

  return {
    summary,
    interpretation,
    recommendations,
    followUpInterval,
    additionalTests,
    riskFactors,
  };
}

/**
 * Get a short risk label with context.
 */
export function getRiskLabel(score: number): {
  label: string;
  description: string;
  color: "red" | "amber" | "green";
} {
  if (score >= 65) {
    return {
      label: "HIGH RISK",
      description: "High probability of molecular patterns associated with lung malignancy",
      color: "red",
    };
  }
  if (score >= 50) {
    return {
      label: "HIGH RISK",
      description: "Elevated probability requiring further clinical evaluation",
      color: "red",
    };
  }
  if (score >= 35) {
    return {
      label: "LOW RISK",
      description: "Moderate-low probability, continued surveillance recommended",
      color: "amber",
    };
  }
  return {
    label: "LOW RISK",
    description: "Low probability of molecular patterns associated with lung malignancy",
    color: "green",
  };
}
