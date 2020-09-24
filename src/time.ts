/**
 * 常量：每秒钟的毫秒数
*/
export const MS_PER_SECOND = 1000;
/**
 * 常量：每分钟的毫秒数
*/
export const MS_PER_MINUTE = 60000;
/**
 * 常量：每小时的毫秒数
*/
export const MS_PER_HOUR = 3600000;
/**
 * 常量：每天的毫秒数
 */
export const MS_PER_DAY = 86400000;
/**
 * 常量：每周的毫秒数
*/
export const MS_PER_WEEK = 86400 * 7;

/**
 * 时间段，代表两个时间点之间的时长。
*/
export class Duration {
    private duration: number;

    /**
     * 构造器
     * @param {number} duration 时长的毫秒数
    */
    constructor(duration: number) {
        this.duration = Math.abs(duration);
    }

    /**
     * 获取毫秒数
    */
    public get value(): number {
        return this.duration;
    }

    /**
     * 获取精确的毫秒数，如：500.0毫秒。
    */
    public get accurateMilliseconds(): number {
        return this.duration;
    }

    /**
     * 获取精确的秒数，如：0.56秒。
    */
    public get accurateSeconds(): number {
        return this.duration / MS_PER_SECOND;
    }

    /**
     * 获取精确的分钟数，如：0.54分钟。
    */
    public get accurateMinutes(): number {
        return this.duration / MS_PER_MINUTE;
    }

    /**
     * 获取精确的小时数，如：0.547小时.
    */
    public get accurateHours(): number {
        return this.duration / MS_PER_HOUR;
    }

    /**
     * 获取精确的天数，如：0.32天。
    */
    public get accurateDays(): number {
        return this.duration / MS_PER_DAY;
    }

    /**
     * 获取精确的月数（每月假设都是30天），如：0.6个月。
    */
    public get accurateMonths(): number {
        return this.duration / MS_PER_DAY / 30;
    }

    /**
     * 获取精确的年数（每年假设是365.25天），如：1.7年。
    */
    public get accurateYears(): number {
        return this.duration / MS_PER_DAY / 365.25;
    }

    /**
     * 获取毫秒数，省略精确值的小数部分。
    */
    public get milliseconds(): number {
        return Math.ceil(this.accurateMilliseconds);
    }

    /**
     * 获取秒数，省略精确值的小数部分。
    */
    public get seconds(): number {
        return Math.ceil(this.accurateSeconds);
    }

    /**
     * 获取分钟数，省略精确值的小数部分。
    */
    public get minutes(): number {
        return Math.ceil(this.accurateMinutes);
    }

    /**
     * 获取小时数，省略精确值的小数部分。
    */
    public get hours(): number {
        return Math.ceil(this.accurateHours);
    }

    /**
     * 获取天数，省略精确值的小数部分。
    */
    public get days(): number {
        return Math.ceil(this.accurateDays);
    }

    /**
     * 获取月数，省略精确值的小数部分。
    */
    public get months(): number {
        return Math.ceil(this.accurateMonths);
    }

    /**
     * 获取年数，省略精确值的小数部分。
    */
    public get years(): number {
        return Math.ceil(this.accurateYears);
    }
}

/**
 * 时间区间，时间区间是由两个时间点构成的一段时间。
 * 时间区间（TimeSpan）与时间段（Duration）的区别是
 * 时间区间具有方向性（begin --> end），时间段没有方向性。
*/
export class TimeSpan {
    private _begin: number;
    private _end: number;
    private _duration: Duration;

    /**
     * 构造器
     * @param {number} begin 开始的时间戳
     * @param {number} end 结束时间戳
    */
    constructor(begin: number, end: number) {
        this._begin = begin;
        this._end = end;
        this._duration = new Duration(end - begin);
    }

    /**
     * 获取开始时间戳
    */
    public get begin(): number {
        return this._begin;
    }

    /**
     * 获取结束时间戳
    */
    public get end(): number {
        return this._end;
    }

    /**
     * 获取时间段
    */
    public get duration(): Duration {
        return this._duration;
    }

    /**
     * 检测此时间区间是否包含时间点timePoint。
     * @param {timePoint} timePoint 时间点
     * @returns {boolean} timePoint是否在此时间区间内
    */
    public include(timePoint: TimePoint): boolean {
        let tp = timePoint.value;
        return tp >= this._begin && tp < this._end;
    }

    /**
     * 将此时间区间扩展到指定的时间点timePoint处。
     * @returns {TimePoint} 目标时间点
     * @returns {TimeSpan} 扩展后的此时间区间对象
    */
    public expand(timePoint: TimePoint): TimeSpan {
        const tp = timePoint.value;
        this._begin = Math.min(this._end, this._begin, tp)
        this._end = Math.max(this._end, this._begin, tp)
        this._duration = new Duration(this._end - this._begin);
        return this;
    }
}

/**
 * 日期时间结构。此结构定义的日期时间对象与Date对象不同，
 * 此日期时间对象中所有的month是从1开始的。
*/
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

/**
 * 时间点。表示时钟上一个特定的瞬间时间点。
*/
export class TimePoint {
    private timestamp: number;
    private now: Date;

    /**
     * 构造器
     * @param {number} timestamp 时间戳，默认为创建此对象时的时间戳。
    */
    constructor(timestamp?: number) {
        this.timestamp = timestamp || Date.now();
        this.now = new Date(this.timestamp);
    }

    /**
     * 获取时间戳数值
    */
    public get value(): number {
        return this.timestamp;
    }

    /**
     * 获取日期时间结构
    */
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

    public get UTCTime(): DateTime {
        const now = this.now;
        let year = now.getUTCFullYear();
        let month = now.getUTCMonth() + 1;
        let date = now.getUTCDate();
        let day = now.getUTCDay();
        let hour = now.getUTCHours();
        let minute = now.getUTCMinutes();
        let second = now.getUTCSeconds();
        let ms = now.getUTCMilliseconds();
        return { year, month, date, day, hour, minute, second, ms };
    }

    /**
     * 转换成格式化字符串。格式字符串语法：
     * ```
     * month/year => 03/2010
     * hour:minute:second => 08:45:59
     * 
     * 完整语法如下：
     * year: 年份
     * month: 月份
     * date: 日期
     * hour: 小时
     * minute: 分钟
     * second: 秒
     * ms: 毫秒
     * ```
    */
    public toString(fmt = 'year-month-date hour:minute:second'): string {
        let str = `${fmt}`;

        const pad = (val, len) => {
            val = `${val}`;
            while (val.length < len) {
                val = `0${val}`;
            }
            return val;
        };

        let dt: any = this.dateTime;
        dt.month = pad(dt.month, 2);
        dt.date = pad(dt.date, 2);
        dt.hour = pad(dt.hour, 2);
        dt.minute = pad(dt.minute, 2);
        dt.second = pad(dt.second, 2);
        dt.ms = pad(dt.ms, 3);

        for (let key in dt) {
            str = str.replace(key, dt[key]);
        }

        return str;
    }

    /**
     * 加法，计算此时间点加上一段时间的时间点。
     * @param {Duration} duration 时间段
     * @returns {TimePoint} 结果时间点
    */
    public add(duration: Duration): TimePoint {
        return new TimePoint(this.value + duration.value);
    }

    /**
     * 减法，计算此时间点减去一段时间的时间点。
     * @param {Duration} duration 时间段
     * @returns {TimePoint} 结果时间点
    */
    public sub(duration: Duration): TimePoint {
        return new TimePoint(this.value - duration.value);
    };

    /**
     * 计算从某个特定时间点开始到当前时间点结束的的时间区间。
     * @param {TimePoint} timePoint 开始时间点
     * @returns {TimePoint} 时间区间
    */
    public from(beginPoint: TimePoint): TimeSpan {
        return new TimeSpan(beginPoint.value, this.value);
    };

    /**
     * 计算从当前时间点开始到某个特定时间点结束的的时间区间。
     * @param {TimePoint} timePoint 结束时间点
     * @returns {TimePoint} 时间区间
    */
    public to(endPoint: TimePoint): TimeSpan {
        return new TimeSpan(this.value, endPoint.value);
    }

    /**
     * 获取当前时间点所在的秒区间。
    */
    public get thisSecond(): TimeSpan {
        let beg = Math.floor(this.timestamp / MS_PER_SECOND) * MS_PER_SECOND;
        let end = Math.ceil(this.timestamp / MS_PER_SECOND) * MS_PER_SECOND;
        return new TimeSpan(beg, end);
    }

    /**
     * 获取当前时间点所在的分钟区间。
    */
    public get thisMinute(): TimeSpan {
        let beg = Math.floor(this.timestamp / MS_PER_MINUTE) * MS_PER_MINUTE;
        let end = Math.ceil(this.timestamp / MS_PER_MINUTE) * MS_PER_MINUTE;
        return new TimeSpan(beg, end);
    }

    /**
     * 获取当前时间点所在的小时区间。
    */
    public get thisHour(): TimeSpan {
        let beg = Math.floor(this.timestamp / MS_PER_HOUR) * MS_PER_HOUR;
        let end = Math.ceil(this.timestamp / MS_PER_HOUR) * MS_PER_HOUR;
        return new TimeSpan(beg, end);
    }

    /**
     * 获取当前时间点所在的日期区间。
    */
    public get thisDay(): TimeSpan {
        let beg = Math.floor(this.timestamp / MS_PER_DAY) * MS_PER_DAY;
        let end = Math.ceil(this.timestamp / MS_PER_DAY) * MS_PER_DAY;
        return new TimeSpan(beg, end);
    }

    /**
     * 获取当前时间点所在的周时间区间。
    */
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

    /**
     * 获取当前所在时间点的月时间区间。
    */
    public get thisMonth(): TimeSpan {
        let now = this.now;
        let year = now.getFullYear();
        let month = now.getMonth();

        let begin = Date.UTC(year, month);

        month = month + 1;
        if (month >= 12) {
            year += 1;
            month = 0;
        }

        let end = Date.UTC(year, month);

        return new TimeSpan(begin, end);
    }

    /**
     * 获取当前时间点所在的年时间区间。
    */
    public get thisYear(): TimeSpan {
        let year = this.now.getFullYear();

        let beg = Date.UTC(year, 0);
        let end = Date.UTC(year + 1, 0);

        return new TimeSpan(beg, end);
    }

    /**
     * 获取当前时刻的时间点。
    */
    public static now(): TimePoint {
        return new TimePoint();
    }

    /**
     * 获取dateTime结构所描述的UTC时间点。
    */
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

    /**
     * 解析时间字符串，相当于Date.parse()。
    */
    public static parse(str, defaultTimeZone = 'GMT +8'): TimePoint {
        if (str.indexOf('GMT') < 0) {
            str = `${str} ${defaultTimeZone}`;
        }
        let value = Date.parse(str);
        return new TimePoint(value);
    }
}

/**
 * 创建一个时间段对象
 * @param {number} ms 时间段的毫秒数
 * @returns {Duration} 时间段对象
*/
export const duration = function (ms: number): Duration {
    return new Duration(ms);
}

/**
 * 创建一个时间区间对象。
 * @param {number|TimePoint} beginTimeStamp 开始时刻
 * @param {number|TimePoint} endTimeStamp 结束时刻
 * @returns {TimeSpan} 时间区间对象
*/
export const span = function (begin: number|TimePoint, end: number|TimePoint): TimeSpan {
    let b : any = begin;
    let e : any = end;
    if(begin instanceof TimePoint) {
        b = begin.value;
    }
    if(end instanceof TimePoint) {
        e = end.value;
    }

    return new TimeSpan(b, e);
}

/**
 * 创建一个时间点对象。
 * @param {number} timestamp 时间戳
 * @returns {TimePoint} 时间点对象
*/
export const point = function (timestamp: number): TimePoint {
    return new TimePoint(timestamp);
}

/**
 * 获取现在时刻的时间点对象。
*/
export const now = function (): TimePoint {
    return TimePoint.now();
}

/**
 * 获取dateTime结构所描述的UTC时间点。
*/
export const utc = function (dateTime: DateTime): TimePoint {
    return TimePoint.utc(dateTime);
}

/**
 * 解析时间字符串，相当于Date.parse()。
*/
export const parse = function (str, defaultTimeZone = 'GMT +8'): TimePoint {
    return TimePoint.parse(str, defaultTimeZone);
}

/**
 * 计算时间点timePoint加上时间段duration的时间点。
 * @param {TimePoint} timePoint 时间点对象
 * @param {Duration} duration 时间段对象
 * @returns {TimePoint} 结果时间点对象
*/
export const add = function (timePoint: TimePoint, duration: Duration): TimePoint {
    return timePoint.add(duration);
}

/**
 * 计算时间点timePoint减去时间段duration的时间点。
 * @param {TimePoint} timePoint 时间点对象
 * @param {Duration} duration 时间段对象
 * @returns {TimePoint} 结果时间点对象
*/
export const sub = function (timePoint: TimePoint, duration: Duration): TimePoint {
    return timePoint.sub(duration);
}
