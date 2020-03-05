
export const MS_PER_SECOND = exports.MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = exports.MS_PER_MINUTE = 60000;
export const MS_PER_HOUR = exports.MS_PER_HOUR = 3600000;
export const MS_PER_DAY = exports.MS_PER_DAY = 86400000;
export const MS_PER_WEEK = exports.MS_PER_WEEK = 86400 * 7;

export class Duration {
    private duration: number;

    constructor(duration: number) {
        this.duration = Math.abs(duration);
    }

    public get value(): number {
        return this.duration;
    }

    public get accurateMilliseconds(): number {
        return this.duration;
    }

    public get accurateSeconds(): number {
        return this.duration / MS_PER_SECOND;
    }

    public get accurateMinutes(): number {
        return this.duration / MS_PER_MINUTE;
    }

    public get accurateHours(): number {
        return this.duration / MS_PER_HOUR;
    }

    public get accurateDays(): number {
        return this.duration / MS_PER_DAY;
    }

    public get accurateMonths(): number {
        return this.duration / MS_PER_DAY / 30;
    }

    public get accurateYears(): number {
        return this.duration / MS_PER_DAY / 30 / 12;
    }

    public get milliseconds(): number {
        return Math.ceil(this.accurateMilliseconds);
    }

    public get seconds(): number {
        return Math.ceil(this.accurateSeconds);
    }

    public get minutes(): number {
        return Math.ceil(this.accurateMinutes);
    }

    public get hours(): number {
        return Math.ceil(this.accurateHours);
    }

    public get days(): number {
        return Math.ceil(this.accurateDays);
    }

    public get months(): number {
        return Math.ceil(this.accurateMonths);
    }

    public get years(): number {
        return Math.ceil(this.accurateYears);
    }
}

export class TimeSpan {
    private _begin: number;
    private _end: number;
    private _duration: Duration;

    constructor(begin: number, end: number) {
        this._begin = begin;
        this._end = end;
        this._duration = new Duration(end - begin);
    }

    public get begin(): number {
        return this._begin;
    }

    public get end(): number {
        return this._end;
    }

    public get duration(): Duration {
        return this._duration;
    }

    public include(timePoint): boolean {
        let tp = timePoint.value();
        return tp >= this._begin && tp < this._end;
    }

    public expand(timePoint): TimeSpan {
        let tp = timePoint.value();
        if (this._begin > tp) {
            this._begin = tp;
        }
        if (this._end < tp) {
            this._end = tp;
        }
        this._duration = new Duration(this._end - this._begin);
        return this;
    }
}

export type DateTime = {
    year: number;
    month: number;
    date: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    ms: number;
}

export class TimePoint {
    private timestamp: number;
    private now: Date;

    constructor(timestamp?: number) {
        this.timestamp = timestamp || Date.now();
        this.now = new Date(this.timestamp);
    }

    public get value(): number {
        return this.timestamp;
    }

    public get dateTime(): DateTime {
        const now = this.now;
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        let date = now.getDate();
        let day = now.getDay();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();
        let ms = now.getMilliseconds();
        return { year, month, date, day, hour, minute, second, ms };
    }

    public toString(fmt = 'year-month-date hour:minute:second'): string {
        let str = `${fmt}`;

        let pad = (val) => {
            if (val < 10) {
                return `0${val}`;
            }
            return val;
        };

        let dt = this.dateTime;
        dt.month = pad(dt.month);
        dt.date = pad(dt.date);
        dt.hour = pad(dt.hour);
        dt.minute = pad(dt.minute);
        dt.second = pad(dt.second);

        for (let key in dt) {
            str = str.replace(key, dt[key]);
        }

        return str;
    }

    public add(duration): TimePoint {
        return new TimePoint(this.value + duration.value);
    }

    public sub(duration): TimePoint {
        return new TimePoint(this.value - duration.value());
    };

    public from(beginPoint): TimeSpan {
        return new TimeSpan(beginPoint.value, this.value);
    };

    public to(endPoint): TimeSpan {
        return new TimeSpan(this.value, endPoint.value);
    }

    public get thisSecond(): TimeSpan {
        let beg = Math.floor(this.timestamp / MS_PER_SECOND) * MS_PER_SECOND;
        let end = Math.ceil(this.timestamp / MS_PER_SECOND) * MS_PER_SECOND;
        return new TimeSpan(beg, end);
    }

    public get thisMinute(): TimeSpan {
        let beg = Math.floor(this.timestamp / MS_PER_MINUTE) * MS_PER_MINUTE;
        let end = Math.ceil(this.timestamp / MS_PER_MINUTE) * MS_PER_MINUTE;
        return new TimeSpan(beg, end);
    }

    public get thisHour(): TimeSpan {
        let beg = Math.floor(this.timestamp / MS_PER_HOUR) * MS_PER_HOUR;
        let end = Math.ceil(this.timestamp / MS_PER_HOUR) * MS_PER_HOUR;
        return new TimeSpan(beg, end);
    }

    public get thisDay(): TimeSpan {
        let beg = Math.floor(this.timestamp / MS_PER_DAY) * MS_PER_DAY;
        let end = Math.ceil(this.timestamp / MS_PER_DAY) * MS_PER_DAY;
        return new TimeSpan(beg, end);
    }

    public get thisWeek(): TimeSpan {
        let dt = this.dateTime;

        let offset =
            dt.day * MS_PER_DAY +
            dt.hour * MS_PER_HOUR +
            dt.minute * MS_PER_MINUTE +
            dt.second * MS_PER_SECOND +
            dt.ms;

        let beg = this.timestamp - offset;
        let end = beg + MS_PER_WEEK;
        return new TimeSpan(beg, end);
    }

    public get thisMonth(): TimeSpan {
        let now = this.now;
        let year = now.getFullYear();
        let month = now.getMonth();

        let beg = Date.UTC(year, month);

        month = month + 1;
        if (month >= 12) {
            year += 1;
            month = 0;
        }

        let end = Date.UTC(year, month);

        return new TimeSpan(beg, end);
    }

    public get thisYear(): TimeSpan {
        let year = this.now.getFullYear();

        let beg = Date.UTC(year, 0);
        let end = Date.UTC(year + 1, 0);

        return new TimeSpan(beg, end);
    }

    public static now(): TimePoint {
        return new TimePoint();
    }

    public static utc(dateTime: DateTime): TimePoint {
        if (!dateTime) {
            return new TimePoint(Date.now());
        }

        let { year, month, date, hour, minute, second, ms } = dateTime;

        year = year || 0;
        month = (!!month) ? month - 1 : 1;
        date = date || 1;
        hour = hour || 0;
        minute = minute || 0;
        second = second || 0;
        ms = ms || 0;

        let value = Date.UTC(year, month, date, hour, minute, second, ms);

        return new TimePoint(value);
    }

    public static parse(str, defaultTimeZone = 'GMT +8'): TimePoint {
        if (str.indexOf('GMT') < 0) {
            str = `${str} ${defaultTimeZone}`;
        }
        let value = Date.parse(str);
        return new TimePoint(value);
    }
}

export const duration = function (ms: number): Duration {
    return new Duration(ms);
}

export const span = function (beginTimeStamp: number, endTimeStamp: number): TimeSpan {
    return new TimeSpan(beginTimeStamp, endTimeStamp);
}

export const between = function (beginTimePoint: TimePoint, endTimePoint: TimePoint): TimeSpan {
    return new TimeSpan(beginTimePoint.value, endTimePoint.value);
}

export const point = function (timestamp: number): TimePoint {
    return new TimePoint(timestamp);
}

export const now = function (): TimePoint {
    return TimePoint.now();
}

export const utc = function (dateTime: DateTime): TimePoint {
    return TimePoint.utc(dateTime);
}

export const parse = function (str, defaultTimeZone = 'GMT +8'): TimePoint {
    return TimePoint.parse(str, defaultTimeZone);
}

export const add = function (timePoint: TimePoint, duration: Duration): TimePoint {
    return timePoint.add(duration);
}

export const sub = function (timePoint: TimePoint, duration: Duration): TimePoint {
    return timePoint.sub(duration);
}
