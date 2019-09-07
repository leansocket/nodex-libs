
const MS_PER_SECOND = exports.MS_PER_SECOND = 1000;
const MS_PER_MINUTE = exports.MS_PER_MINUTE = 60000;
const MS_PER_HOUR = exports.MS_PER_HOUR = 3600000;
const MS_PER_DAY = exports.MS_PER_DAY = 86400000;
const MS_PER_WEEK = exports.MS_PER_WEEK = 86400 * 7;

let Duration = exports.Duration = function(duration) {
    duration = Math.abs(duration);
    
    this.prototype.value = function() {
        return duration;
    };

    this.prototype.accurateMilliseconds = function() {
        return duration;
    };

    this.prototype.accurateSeconds = function() {
        return duration / MS_PER_SECOND;
    };

    this.prototype.accurateMinutes = function() {
        return duration / MS_PER_MINUTE;
    };

    this.prototype.accurateHours = function() {
        return duration / MS_PER_HOUR;
    };

    this.prototype.accurateDays = function() {
        return duration / MS_PER_DAY;
    };

    this.prototype.accurateMonths = function() {
        return duration / MS_PER_DAY / 30;
    };

    this.prototype.accurateYears = function() {
        return duration / MS_PER_DAY / 30 / 12;
    };

    this.prototype.milliseconds = function() {
        return Math.ceil(this.accurateMilliseconds());
    };

    this.prototype.seconds = function() {
        return Math.ceil(this.accurateSeconds());
    };

    this.prototype.minutes = function() {
        return Math.ceil(this.accurateMinutes());
    };

    this.prototype.hours = function() {
        return Math.ceil(this.accurateHours());
    };

    this.prototype.days = function() {
        return Math.ceil(this.accurateDays());
    };

    this.prototype.months = function() {
        return Math.ceil(this.accurateMonths());
    };

    this.prototype.years = function() {
        return Math.ceil(this.accurateYears());
    };
};

let TimeSpan = exports.TimeSpan = function(begin, end) {
    let duration = new Duration(end - begin);

    this.prototype.begin = function(){
        return begin;
    };

    this.prototype.end = function() {
        return end;
    };

    this.prototype.duration = function() {
        return duration;
    };

    this.prototype.include = function(timePoint) {
        let tp = timePoint.value();
        return tp >= begin && tp < end;
    };

    this.prototype.expand = function(timePoint) {
        let tp = timePoint.value();
        if(begin > tp) {
            begin = tp;
        }
        if(end < tp) {
            end = tp;
        }
    };
};

let TimePoint = exports.TimePoint = function(timestamp) {
    let now = new Date(timestamp || Date.now());

    this.prototype.value = function() {
        return timestamp;
    };

    this.prototype.dateTime = function() {
        let year = now.getFullYear();
        let month = now.getMonth() + 1;
        let date = now.getDate();
        let day = now.getDay();
        let hour = now.getHours();
        let minute = now.getMinutes();
        let second = now.getSeconds();
        let ms = now.getMilliseconds();
        return {year, month, date, day, hour, minute, second, ms};
    };

    this.prototype.toString = function(fmt = 'year-month-date hour:minute:second') {
        let str = `${fmt}`;

        let dt = this.dateTime();
        for(let key in dt) {
            str = str.replace(key, dt[key]);
        }
        
        return str;
    };

    this.prototype.add = function(duration) {
        return new TimePoint(this.value() + duration.value());
    };

    this.prototype.sub = function(duration) {
        return new TimePoint(this.value() - duration.value());
    };

    this.prototype.from = function(beginPoint) {
        return new TimeSpan(beginPoint.value(), this.value());
    };

    this.prototype.to = function(endPoint) {
        return new TimeSpan(this.value(), endPoint.value());
    };

    this.prototype.thisSecond = function() {
        let beg = Math.floor(timestamp / MS_PER_SECOND) * MS_PER_SECOND;
        let end = Math.ceil(timestamp / MS_PER_SECOND) * MS_PER_SECOND;
        return new TimeSpan(beg, end);
    };

    this.prototype.thisMinute = function() {
        let beg = Math.floor(timestamp / MS_PER_MINUTE) * MS_PER_MINUTE;
        let end = Math.ceil(timestamp / MS_PER_MINUTE) * MS_PER_MINUTE;
        return new TimeSpan(beg, end);
    };

    this.prototype.thisHour = function() {
        let beg = Math.floor(timestamp / MS_PER_HOUR) * MS_PER_HOUR;
        let end = Math.ceil(timestamp / MS_PER_HOUR) * MS_PER_HOUR;
        return new TimeSpan(beg, end);
    };

    this.prototype.thisDay = function() {
        let beg = Math.floor(timestamp / MS_PER_DAY) * MS_PER_DAY;
        let end = Math.ceil(timestamp / MS_PER_DAY) * MS_PER_DAY;
        return new TimeSpan(beg, end);
    };

    this.prototype.thisWeek = function() {
        let dt = this.dateTime();
        
        let offset = 
            dt.day * MS_PER_DAY + 
            dt.hour * MS_PER_HOUR + 
            dt.minute * MS_PER_MINUTE +
            dt.second * MS_PER_SECOND +
            dt.ms;

        let beg = timestamp - offset;
        let end = beg + MS_PER_WEEK;
        return new TimeSpan(beg, end);
    };

    this.prototype.thisMonth = function() {
        let year = now.getFullYear();
        let month = now.getMonth();

        let beg = Date.UTC(year, month);

        month = month + 1;
        if(month >= 12){
            year += 1;
            month = 0;
        }

        let end = Date.UTC(year, month);

        return new TimeSpan(beg, end);
    };

    this.prototype.thisYear = function() {
        let year = now.getFullYear();

        let beg = Date.UTC(year, 0);
        let end = Date.UTC(year + 1, 0);

        return new TimeSpan(beg, end);
    };

    TimePoint.now = function() {
        return new TimePoint();
    };

    TimePoint.utc = function(dateTime) {
        if(!dateTime){
            return new TimePoint(Date.now());
        }

        let {year, month, date, day, hour, minute, second, ms} = dateTime;

        year = year || 0;
        month = (!!month) ? month - 1 : 1;
        date = date || 1;
        hour = hour || 0;
        minute = minute || 0;
        second = second || 0;
        ms = ms || 0;

        let value = Date.UTC(year, month, date, hour, minute, second, ms);

        return new TimePoint(value);
    };

    TimePoint.parse = function(str) {
        let value = Date.parse(str);
        return new TimePoint(value);
    };
};

exports.now = function() {
    return TimePoint.now();
};

exports.utc = function() {
    return TimePoint.utc.apply(this, arguments);
};

exports.parse = function(str) {
    return TimePoint.parse(str);
};

exports.add = function(timePoint, duration) {
    return timePoint.add(duration);
};

exports.sub = function(timePoint, duration) {
    return timePoint.sub(duration);
};

exports.between = function(beginPoint, endPoint) {
    return beginPoint.to(endPoint);
};
