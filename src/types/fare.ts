export type FareType = "ic_adult";
export type Direction = "yasu_to_osaka" | "osaka_to_yasu";
export type TimeHHMM = string;

export type TimetableEntry = {
  trainId: string;
  departAt: TimeHHMM;
  arriveAt: TimeHHMM;
};

export type TimetableByDirection = {
  direct: TimetableEntry[];
  leg1: TimetableEntry[];
  leg2: TimetableEntry[];
};

export type FareMaster = {
  odId: "yasu_osaka";
  fareType: FareType;
  directFare: number;
  stopover: {
    via: "kyoto";
    leg1Fare: number;
    leg2Fare: number;
  };
  timetable: {
    timezone: "Asia/Tokyo";
    transferMin: number;
    weekday: {
      yasu_to_osaka: TimetableByDirection;
      osaka_to_yasu: TimetableByDirection;
    };
  };
  updatedAt: string;
};

export type ComparisonResult = {
  directFare: number;
  stopoverTotalFare: number;
  diffYen: number;
  cheaper: "direct" | "stopover" | "equal";
};

export type RouteOption = {
  routeType: "direct" | "stopover";
  departAt: TimeHHMM;
  arriveAt: TimeHHMM;
  durationMin: number;
  legs: TimetableEntry[];
  transferWaitMin?: number;
};
