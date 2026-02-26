import Holidays from 'date-holidays';

/**
 * Represents a holiday with its details
 */
export interface Holiday {
  date: string;
  start: Date;
  end: Date;
  name: string;
  type: string;
  rule: string;
}

/**
 * Represents a supported country
 */
export interface Country {
  code: string;
  name: string;
}

/**
 * Holiday type categories for filtering
 */
export const HolidayType = {
  PUBLIC: 'public',
  BANK: 'bank',
  SCHOOL: 'school',
  OPTIONAL: 'optional',
  OBSERVANCE: 'observance',
  ALL: 'all'
} as const;

export type HolidayType = (typeof HolidayType)[keyof typeof HolidayType];



const SUPPORTED_COUNTRIES: Country[] = [
  { code: 'BO', name: 'Bolivia' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'MX', name: 'México' },
  { code: 'PA', name: 'Panamá' },
  { code: 'PE', name: 'Perú' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'DO', name: 'República Dominicana' },
];

/**
 * Service for managing holiday data
 * Implements input validation and error handling
 */
class HolidayService {
  private hd: Holidays;

  constructor() {
    this.hd = new Holidays();
  }

  /**
   * Returns list of supported countries
   */
  getSupportedCountries(): Country[] {
    return [...SUPPORTED_COUNTRIES];
  }

  /**
   * Validates if a country code is supported
   */
  private isValidCountryCode(countryCode: string): boolean {
    return SUPPORTED_COUNTRIES.some(country => country.code === countryCode);
  }

  /**
   * Validates if a year is within reasonable bounds
   */
  private isValidYear(year: number): boolean {
    const MIN_YEAR = 1900;
    const MAX_YEAR = 2100;
    return Number.isInteger(year) && year >= MIN_YEAR && year <= MAX_YEAR;
  }

  /**
   * Retrieves holidays for a specific country and year
   * @param countryCode - ISO 3166-1 alpha-2 country code
   * @param year - Year to retrieve holidays for
   * @returns Array of holidays, empty array if none found or validation fails
   */
  getHolidays(countryCode: string, year: number): Holiday[] {
    // Input validation
    if (!countryCode || typeof countryCode !== 'string') {
      console.warn('Invalid country code provided');
      return [];
    }

    if (!this.isValidCountryCode(countryCode)) {
      console.warn(`Country code "${countryCode}" is not supported`);
      return [];
    }

    if (!this.isValidYear(year)) {
      console.warn(`Invalid year "${year}" provided. Must be between 1900-2100`);
      return [];
    }

    try {
      this.hd.init(countryCode);
      const holidays = this.hd.getHolidays(year);

      if (!holidays || !Array.isArray(holidays)) {
        return [];
      }

      // Map and sanitize holiday data
      return holidays.map(h => ({
        date: String(h.date || ''),
        start: new Date(h.start),
        end: new Date(h.end),
        name: String(h.name || 'Unknown Holiday'),
        type: String(h.type || 'public'),
        rule: String(h.rule || '')
      }));
    } catch (error) {
      console.error('Error retrieving holidays:', error);
      return [];
    }
  }

  /**
   * Checks if a specific date is a holiday
   * @param date - Date to check
   * @param countryCode - ISO 3166-1 alpha-2 country code
   * @returns Holiday object if date is a holiday, false otherwise
   */
  isHoliday(date: Date, countryCode: string): boolean | Holiday {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.warn('Invalid date provided');
      return false;
    }

    if (!this.isValidCountryCode(countryCode)) {
      console.warn(`Country code "${countryCode}" is not supported`);
      return false;
    }

    try {
      this.hd.init(countryCode);
      const result = this.hd.isHoliday(date);

      if (result) {
        // Handle array result (multiple holidays on same day)
        if (Array.isArray(result)) {
          const h = result[0];
          return {
            date: String(h.date || ''),
            start: new Date(h.start),
            end: new Date(h.end),
            name: String(h.name || 'Unknown Holiday'),
            type: String(h.type || 'public'),
            rule: String(h.rule || '')
          };
        } else {
          // Handle single object result sin usar 'any'
          const h = result as unknown as {
            date?: string;
            start: string | number | Date;
            end: string | number | Date;
            name?: string;
            type?: string;
            rule?: string;
          };

          return {
            date: String(h.date || ''),
            start: new Date(h.start),
            end: new Date(h.end),
            name: String(h.name || 'Unknown Holiday'),
            type: String(h.type || 'public'),
            rule: String(h.rule || '')
          };
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking holiday:', error);
      return false;
    }
  }

  /**
   * Filters holidays by type
   * @param holidays - Array of holidays to filter
   * @param type - Type of holiday to filter by
   * @returns Filtered array of holidays
   */
  filterByType(holidays: Holiday[], type: HolidayType): Holiday[] {
    if (!Array.isArray(holidays)) {
      return [];
    }

    if (type === HolidayType.ALL) {
      return holidays;
    }

    return holidays.filter(holiday => holiday.type === type);
  }
}

export const holidayService = new HolidayService();
