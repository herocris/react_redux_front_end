// Only filters accepted by both map and graph endpoints. Dates are the
// validated YYYY-MM-DD strings; option IDs retain their original representation.
export interface AppliedAnalysisFilters {
    start_date: string;
    end_date: string;
    drugs: (string | number)[];
    weapons: (string | number)[];
    ammunitions: (string | number)[];
}
