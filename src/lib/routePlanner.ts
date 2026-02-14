import type {
  Direction,
  FareMaster,
  RouteOption,
  TimetableByDirection,
  TimetableEntry
} from "@/types/fare";

type ValidationResult = {
  isValid: true;
} | {
  isValid: false;
  reason: string;
};

type RouteSearchResult = {
  direct: RouteOption[];
  stopover: RouteOption[];
};

function parseHHMM(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) {
    return null;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour * 60 + minute;
}

function validateTimetableEntries(
  entries: TimetableEntry[],
  section: string
): ValidationResult {
  let lastDepartAt = -1;

  for (const entry of entries) {
    if (!entry.trainId) {
      return { isValid: false, reason: `${section}: trainId is required.` };
    }

    const depart = parseHHMM(entry.departAt);
    const arrive = parseHHMM(entry.arriveAt);

    if (depart === null || arrive === null) {
      return { isValid: false, reason: `${section}: time must be HH:mm format.` };
    }

    if (depart >= arrive) {
      return { isValid: false, reason: `${section}: departAt must be before arriveAt.` };
    }

    if (depart < lastDepartAt) {
      return { isValid: false, reason: `${section}: entries must be sorted by departAt.` };
    }

    lastDepartAt = depart;
  }

  return { isValid: true };
}

function validateDirectionTable(
  table: TimetableByDirection,
  direction: Direction
): ValidationResult {
  const directResult = validateTimetableEntries(table.direct, `${direction}.direct`);
  if (!directResult.isValid) {
    return directResult;
  }

  const leg1Result = validateTimetableEntries(table.leg1, `${direction}.leg1`);
  if (!leg1Result.isValid) {
    return leg1Result;
  }

  const leg2Result = validateTimetableEntries(table.leg2, `${direction}.leg2`);
  if (!leg2Result.isValid) {
    return leg2Result;
  }

  return { isValid: true };
}

export function validateTimetable(master: FareMaster): ValidationResult {
  if (!Number.isInteger(master.timetable.transferMin) || master.timetable.transferMin < 0) {
    return { isValid: false, reason: "transferMin must be a non-negative integer." };
  }

  const yasuResult = validateDirectionTable(
    master.timetable.weekday.yasu_to_osaka,
    "yasu_to_osaka"
  );
  if (!yasuResult.isValid) {
    return yasuResult;
  }

  const osakaResult = validateDirectionTable(
    master.timetable.weekday.osaka_to_yasu,
    "osaka_to_yasu"
  );
  if (!osakaResult.isValid) {
    return osakaResult;
  }

  return { isValid: true };
}

function makeDirectOption(entry: TimetableEntry): RouteOption {
  const departAtMin = parseHHMM(entry.departAt);
  const arriveAtMin = parseHHMM(entry.arriveAt);

  if (departAtMin === null || arriveAtMin === null) {
    throw new Error("Invalid timetable format.");
  }

  return {
    routeType: "direct",
    departAt: entry.departAt,
    arriveAt: entry.arriveAt,
    durationMin: arriveAtMin - departAtMin,
    legs: [entry]
  };
}

export function findNextRouteOptions(
  master: FareMaster,
  direction: Direction,
  departureTime: string,
  maxOptions = 3
): RouteSearchResult {
  const validation = validateTimetable(master);
  if (!validation.isValid) {
    throw new Error(validation.reason);
  }

  const departureTimeMin = parseHHMM(departureTime);
  if (departureTimeMin === null) {
    throw new Error("departureTime must be HH:mm format.");
  }

  const table = master.timetable.weekday[direction];
  const transferMin = master.timetable.transferMin;

  const direct = table.direct
    .filter((entry) => {
      const departAtMin = parseHHMM(entry.departAt);
      return departAtMin !== null && departAtMin >= departureTimeMin;
    })
    .slice(0, maxOptions)
    .map((entry) => makeDirectOption(entry));

  const stopover: RouteOption[] = [];

  for (const leg1 of table.leg1) {
    const leg1Depart = parseHHMM(leg1.departAt);
    const leg1Arrive = parseHHMM(leg1.arriveAt);
    if (leg1Depart === null || leg1Arrive === null || leg1Depart < departureTimeMin) {
      continue;
    }

    const minLeg2Depart = leg1Arrive + transferMin;
    const leg2 = table.leg2.find((entry) => {
      const leg2Depart = parseHHMM(entry.departAt);
      return leg2Depart !== null && leg2Depart >= minLeg2Depart;
    });

    if (!leg2) {
      continue;
    }

    const leg2Depart = parseHHMM(leg2.departAt);
    const leg2Arrive = parseHHMM(leg2.arriveAt);
    if (leg2Depart === null || leg2Arrive === null) {
      continue;
    }

    stopover.push({
      routeType: "stopover",
      departAt: leg1.departAt,
      arriveAt: leg2.arriveAt,
      durationMin: leg2Arrive - leg1Depart,
      legs: [leg1, leg2],
      transferWaitMin: leg2Depart - leg1Arrive
    });

    if (stopover.length >= maxOptions) {
      break;
    }
  }

  return { direct, stopover };
}
