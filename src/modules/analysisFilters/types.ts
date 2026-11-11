// Only filters accepted by both map and graph endpoints. Dates are the
// validated YYYY-MM-DD strings; option IDs are numeric.
export interface AppliedAnalysisFilters {
    start_date: string;
    end_date: string;
    drugs: number[];
    weapons: number[];
    ammunitions: number[];
}
