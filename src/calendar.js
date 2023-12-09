// Helper function to return an ordinal number
function ordinal(num) {
    switch (String(num)[String(num).length - 1]) {
        case "1":
            return num + "st";
        case "2":
            return num + "nd";
        case "3":
            return num + "rd";
        default:
            return num + "th";
    }
}

// Helper function to convert dates in the proleptic Gregorian calendar
// to numbered days, where 1 is 1 Jan 1, 2 is 2 Jan 1, and 0 is 31 Dec -1.
// Recall that in the proleptic Gregorian (which is what HTML input uses)
function greg_to_day(day, month, year, sign) {
    let m = Number(month)
    let y = Number(year) - 1;
    let d = (Number(sign) === 1) ?
        y * 365 + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) :
        -366 - 365 * y - Math.floor(y / 4) + Math.floor(y / 100) - Math.floor(y / 400);
    let md = ((m - 1) * 31) - 3 * (m > 2) - (m > 4) - (m > 6) - (m > 9) - (m > 11);
    let ld = (month > 2) && (Number(sign) === 1 ? (year % 400 === 0 | (year % 4 === 0 & year % 100 !== 0)) : (y % 400 === 0 | (y % 4 === 0 & y % 100 !== 0)));
    return d + md + ld + Number(day);
}

export default class Calendar {
    constructor(start_year=1, start_month=1, start_day=1, start_sign=1, year_len=365, year_zero=false, leap_days=1, leap_freqs=[4,100,400],
        months=['January','February','March','April','May','June','July','August','September','October','November','December'],
        month_lens = [31,28,31,30,31,30,31,31,30,31,30,31], month_leaps = [0,1,0,0,0,0,0,0,0,0,0,0], month_cycle_leap_freqs=[4,100,400],
        weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'])
    {
        this.start_year = start_year;
        this.start_month = start_month;
        this.start_day = start_day;
        this.start_sign = start_sign;
        this.year_zero = year_zero;
        this.year_len = year_len;
        this.leap_days = leap_days;
        this.leap_freqs = leap_freqs;
        this.months = months;
        this.month_lens = month_lens;
        this.month_leaps = month_leaps;
        this.month_cycle_leap_freqs = month_cycle_leap_freqs;
        this.weekdays = weekdays;
    }

    calc_start_date() {
        this.start_date = greg_to_day(this.start_day, this.start_month, this.start_year, this.start_sign);
    }

    calc_real_year_len() {
        this.real_year_len = this.leap_freqs.reduce( (prev, cur, ind) => { return(prev - (ind % 2) * (this.leap_days / cur) + (1 - ind % 2) * (this.leap_days / cur)); }, this.year_len);
    }    
    
    calc_periods(leap_freqs, year_len, leap_days) {
        let periods = [[1, Number(year_len)]];
        let index = 0; let pys = 1; let pds = Number(year_len);
        while (index < leap_freqs.length) {
            pds = pds * leap_freqs[index] / pys + (index % 2 === 1 ? -1*leap_days : 1*leap_days );
            pys = Number(leap_freqs[index]);
            periods.push([pys,pds]);
            ++index;
        }
        return periods;
    }

    calc_stats() {
        this.calc_start_date();
        this.calc_real_year_len();
        this.month_cycle_len = this.month_lens.reduce( (prev, cur) => prev + Number(cur), 0);
        this.month_cycle_leaps = this.month_leaps.reduce( (prev, cur) => prev + Number(cur), 0);
        this.month_cycles_are_years = (this.leap_freqs.every( (val, ind) => val === this.month_cycle_leap_freqs[ind]) && this.month_cycle_len === this.year_len && this.month_cycle_leaps === this.leap_days);
        this.year_periods = this.calc_periods(this.leap_freqs, this.year_len, this.leap_days);
        if (this.month_cycles_are_years) this.month_cycle_periods = this.year_periods;
        else this.month_cycle_periods = this.calc_periods(this.month_cycle_leap_freqs, this.month_cycle_len, this.month_cycle_leaps);
    }

    is_leap_cycle(num, periods, have_zero) {
        if (num < 0) num = -1*(!have_zero) - num;
        if (num === 0) return (1 - periods.length % 2);
        let ind = periods.length - 1;
        while (ind > 0) {
            if (num % periods[ind][0] === 0) return (ind % 2); --ind;
        }
        return false;
    }

    // A function to find year or month cycle num using the same logic
    get_cycle_num(days_since, periods, common_length, leap_days, have_zero) {
        let sign = days_since >= 0 ? 1 : -1; // Whether in the positive or non-positive years
        let days_to_go = (sign === 1) ? days_since : -days_since - 1; // 0 for first day of positive, last of non-pos, 1 for days before and after that...

        let years_since = 1; // By default, year is at least one.
        // This will be added to for each subtractable period from days-left
        if (sign === -1) { // If before start date, account for the last non-positive year.
            days_to_go -= (1 - periods.length % 2) * leap_days + common_length; // 1 - periods.length % 2 indicates whether year before 1 is leap year
            if (days_to_go < 0) return [(have_zero ? 0 : -1), -1*days_to_go]; // If we are in that year, just got a negative days_left - just give up the answer then.
        }
        
        // Now days are arranged evenly in either way; can remove periods for negative years as for positive years
        let ind = periods.length - 1; let p; let m;// ind is index; p is the number of periods removed
        p = Math.floor(days_to_go / periods[ind][1]); // remove some number of the longest periods first
        days_to_go -= periods[ind][1] * p;
        years_since += periods[ind][0] * p;
        --ind;
        while (ind >= 0) { // Continue to the shortest period - but never remove, say, four 100-year terms of days after 
            // failing to remove a 400-year term; causes weird edge case.
            m = periods[ind + 1][0] / periods[ind][0];
            p = Math.floor(days_to_go / periods[ind][1]);
            if (p === m) --p;
            days_to_go -= periods[ind][1] * p;
            years_since += periods[ind][0] * p;
            --ind;
        }
        
        // After this, I have the number of full cycles elapsed in given number of days since start 
        let new_year = (sign === 1) ? years_since : (have_zero ? -years_since : -years_since - 1);
        let day_in_year = (sign === 1) ? days_to_go + 1 : (common_length + this.is_leap_cycle(years_since, periods, 0) * leap_days - days_to_go);
        return [new_year, day_in_year];
    }

    convert_date(day,month,year,sign) {
        // Convert day, month, and year to simply day, where 1 is 1 Jan 1
        let total_day = greg_to_day(day, month, year, sign)
        // Find day in new calendar - days_since will be 0 for the first day of the calendar.
        let days_since = total_day - this.start_date;

        // Find year and day in year
        let new_year, day_in_year;
        [new_year, day_in_year] = this.get_cycle_num(days_since, this.year_periods, this.year_len, this.leap_days, this.year_zero);

        // Find month cycle, day in month cycle, and month
        let month_cycle, day_in_month_cycle;
        if (this.month_cycles_are_years) {
            month_cycle = new_year;
            day_in_month_cycle = day_in_year;
        } else {
            [month_cycle, day_in_month_cycle] = this.get_cycle_num(days_since, this.month_cycle_periods, this.month_cycle_len, this.month_cycle_leaps, this.year_zero);
        }
        // is one more than the number of years that have elapsed before - unless we are before the start date and
        
        let new_month = 0; // New_month is the index of the month in the list of months
        let in_leap = this.is_leap_cycle(month_cycle, this.month_cycle_periods, this.have_zero);
        
        while (day_in_month_cycle > (Number(this.month_lens[new_month]) + in_leap * Number(this.month_leaps[new_month]))) {
            day_in_month_cycle -= (Number(this.month_lens[new_month]) + in_leap * Number(this.month_leaps[new_month]));
            ++new_month;
            // // console.log(`day_in_month_cycle: ${day_in_month_cycle}, new_month: ${new_month}`);
        }
        // Added bonus:  day_in_month_cycle is now the ordinal of the day in the month

        // Find weekday - weeks are simple.  They'd be simpler if JavaScript could take the modulus of negative numbers.
        let weekday = days_since >= 0 ? this.weekdays[days_since % this.weekdays.length] : this.weekdays[this.weekdays.length - 1 - ( -1* (days_since + 1) % this.weekdays.length)];

        return (weekday + ", " + ordinal(day_in_month_cycle) + " of " + this.months[new_month] + ", " 
            + ordinal(day_in_year) + " day of the year " + new_year);
    }

    toString() {
        return ( 'Calendar starting on ' + this.start_date + ' with months' + 
            this.months.map( (v, i) => ( ' ' + v + ' of ' + this.month_lens[i] + (this.month_leaps[i] > 0 ? ('/' + (this.month_lens[i] + this.month_leaps[i])) : '') + ' days') ) +
            'leap years ' + this.leap_freqs.map( (v) => 'every ' + v + 'years, except ') + 'never, and' +
            ' weekdays ' + this.weekdays + '.'
        );
    }
}