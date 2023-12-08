class Calendar {
    constructor(start_year=1, start_month=1, start_day=1, year_len=1, leap_freqs=[], month_count=12,
        months=['January','February','March','April','May','June','July','August','September','October','November','December'],
        month_lens = [31,28,31,30,31,30,31,31,30,31,30,31], month_leaps = [0,1,0,0,0,0,0,0,0,0,0,0],
        week_len=7, weekdays=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'])
    {
        this.start_year = start_year;
        this.start_month = start_month;
        this.start_day = start_day;
        this.year_len = year_len;
        this.leap_freqs = leap_freqs;
        this.month_count = month_count;
        this.months = months;
        this.month_lens = month_lens;
        this.month_leaps = month_leaps;
        this.week_len = week_len;
        this.weekdays = weekdays;

        this.start_date = (this.start_year - 1) * 365 + Math.floor((this.start_year - 1) / 4) - Math.floor((this.start_year - 1) / 100) + Math.floor((this.start_year - 1) / 400)
            + ((this.start_month - 1) * 31) - 3 * (this.start_month > 2) - (this.start_month > 4) - (this.start_month > 6) - (this.start_month > 9) - (this.start_month > 11)
            + start_day;

    }

    calc_start_date() {
        this.start_date = (this.start_year - 1) * 365 + Math.floor((this.start_year - 1) / 4) - Math.floor((this.start_year - 1) / 100) + Math.floor((this.start_year - 1) / 400)
            + ((this.start_month - 1) * 31) - 3 * (this.start_month > 2) - (this.start_month > 4) - (this.start_month > 6) - (this.start_month > 9) - (this.start_month > 11)
            + start_day;
    }

    calc_real_year_len() {
        this.leap_days = this.month_leaps.reduce( (prev, cur) => prev + cur, 0);
        this.leap_year_len = this.year_len + this.leap_days;
        this.real_year_len = this.leap_freqs.reduce( (prev, cur, ind) => { prev + (ind % 2) * (this.leap_days / cur) - (1 - ind % 2) * (this.leap_days / cur) }, this.year_len);
        // this.leap_freqs.every( (val, ind) => { if (ind % 2) this.real_year_len += (1/val); else this.real_year_len -= (1/val) } );
        this.periods = this.leap_freqs.map( (val, ind, arr) => { period = this.year_len * val;
            while (ind >= 0) {
                if (ind % 2) {
                    period += this.leap_days * val / arr[ind];
                } else {
                    period -= this.leap_days * val / arr[ind];
                }
                --ind;
            } return period; } );
    }

    is_leap_year(year) {
        this.leap_freqs.every( (val, ind) => {
            if (year % val != 0) {
                return (ind % 2);
            }
        } )
        return (this.leap_freqs.length % 2);
    }

    convert_date(day,month,year) {
        // Convert day, month, and year to simply day, where 1 is 1 Jan 1
        total_day = (year - 1) * 365 + Math.floor((year - 1) / 4) - Math.floor((year - 1) / 100) + Math.floor((year - 1) / 400)
        + ((month - 1) * 31) - 3 * (month > 2) - (month > 4) - (month > 6) - (month > 9) - (month > 11)
        + day;
        // Convert to day where 1 is the start date of the new calendar
        days_since = total_day - this.start_date
        day_num = days_since + 1;
        // Find year by leaping through largest periods first
        new_year = 1; ind = this.periods.length - 1; let p;
        while (ind >= 0) {
            p = Math.floor((day_num - 1) / this.periods[ind]); // Keep day_num > 0 - do not remove all days
            day_num -= this.periods[ind] * p;
            new_year += this.leap_freqs[ind] * p;
            --ind;
        } // and adding those last few years.  
        new_year += Math.floor((day_num - 1)/ this.year_len);
        day_num -= new_year * this.year_len;
        
        // With year calculated, find month
        new_month = 1;
        leap_now = this.is_leap_year(new_year);
        while (day_num > this.month_lens[new_month] + leap_now * this.month_leaps[new_month]) {
            day_num -= (this.month_lens[new_month] + leap_now * this.month_leaps[new_month]);
            ++new_month;
        }
        return (this.weekdays[days_since % this.week_len] + ", " + new_year + " " + this.months[this.new_month - 1] + " " + day_in_year);
    }
}