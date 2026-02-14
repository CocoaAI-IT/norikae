import type { ComparisonResult, FareMaster } from "@/types/fare";

type ValidationResult = {
  isValid: true;
} | {
  isValid: false;
  reason: string;
};

export function validateFareMaster(master: FareMaster): ValidationResult {
  const values = [
    master.directFare,
    master.stopover.leg1Fare,
    master.stopover.leg2Fare
  ];

  const hasInvalidFare = values.some((fare) => !Number.isInteger(fare) || fare < 0);
  if (hasInvalidFare) {
    return { isValid: false, reason: "Fare must be a non-negative integer." };
  }

  const date = new Date(master.updatedAt);
  if (Number.isNaN(date.getTime())) {
    return { isValid: false, reason: "updatedAt must be a valid ISO date string." };
  }

  return { isValid: true };
}

export function compareFare(master: FareMaster): ComparisonResult {
  const validation = validateFareMaster(master);
  if (!validation.isValid) {
    throw new Error(validation.reason);
  }

  const stopoverTotalFare = master.stopover.leg1Fare + master.stopover.leg2Fare;
  const diff = Math.abs(master.directFare - stopoverTotalFare);

  if (master.directFare === stopoverTotalFare) {
    return {
      directFare: master.directFare,
      stopoverTotalFare,
      diffYen: 0,
      cheaper: "equal"
    };
  }

  return {
    directFare: master.directFare,
    stopoverTotalFare,
    diffYen: diff,
    cheaper: master.directFare < stopoverTotalFare ? "direct" : "stopover"
  };
}

