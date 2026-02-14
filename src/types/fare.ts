export type FareType = "ic_adult";

export type FareMaster = {
  odId: "yasu_osaka";
  fareType: FareType;
  directFare: number;
  stopover: {
    via: "kyoto";
    leg1Fare: number;
    leg2Fare: number;
  };
  updatedAt: string;
};

export type ComparisonResult = {
  directFare: number;
  stopoverTotalFare: number;
  diffYen: number;
  cheaper: "direct" | "stopover" | "equal";
};

