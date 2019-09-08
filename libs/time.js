
const MS_PER_SECOND = exports.MS_PER_SECOND = 1000;
const MS_PER_MINUTE = exports.MS_PER_MINUTE = 60000;
const MS_PER_HOUR = exports.MS_PER_HOUR = 3600000;
const MS_PER_DAY = exports.MS_PER_DAY = 86400000;
const MS_PER_WEEK = exports.MS_PER_WEEK = 86400 * 7;

let Duration = exports.Duration = function(duration) {
    duration = Math.abs(duration);
    
    Duration.prototype.value = function() {
        return duration;
    };

    Duration.prototype.accurateMilliseconds = function() {
        return duration;
    };

    Duration.prototype.accurateSeconds = function() {
        return duration / MS_PER_SECOND;
    };

    Duration.prototype.accurateMinutes = function() {
        return duration / MS_PER_MINUTE;
    };

    Duration.prototype.accurateHours = function() {
        return duration / MS_PER_HOUR;
    };

    Duration.prototype.accurateDays = function() {
        return duration / MS_PER_DAY;
    };

    Duration.prototype.accurateMonths = function() {
        return duration / MS_PER_DAY / 30;
    };

    Duration.prototype.accurateYears = function() {
        return duration / MS_PER_DAY / 30 / 12;
    };

    Duration.prototype.milliseconds = function() {
        return Math.ceil(this.accurateMilliseconds());
    };

    Duration.prototype.seconds = function() {
        return Math.ceil(this.accurateSeconds());
    };

    Duration.prototype.minutes = function() {
        return Math.ceil(this.accurateMinutes());
    };

    Duration.prototype.hours = function() {
        return Math.ceil(this.accurateHours());
    };

    Duration.prototype.days = function() {
        return Math.ceil(this.accurateDays());
    };

    Duration.prototype.months = function() {
        return Math.ceil(this.accurateMonths());
    };

    Duration.prototype.years = function() {
        return Math.ceil(this.accurateYears());
    };
};

let TimeSpan = exports.TimeSpan = function(begin, end) {
    let duration = new Duration(end - begin);

    TimeSpan.prototype.begin = function(){
        return begin;
    };

    TimeSpan.prototype.end = function() {
        return end;
    };

    TimeSpan.prototype.duration = function() {
        return duration;
    };

    TimeSpan.prototype.include = function(timePoint) {
        let tp = timePoint.value();
        return tp >= begin && tp < end;
    };

    TimeSpan.prototype.expand = function(timePoint) {
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
    timestamp = timestamp || Date.now();
    let now = new Date(timestamp);

    TimePoint.prototype.value = function() {
        return timestamp;
    };

    TimePoint.prototype.dateTime = function() {
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

    TimePoint.prototype.toString = function(fmt = 'year-month-date hour:minute:second') {
        let str = `${fmt}`;

        let pad = function(val){
            if(val < 10){
                return `0${val}`;
            }
        };

        let dt = this.dateTime();
        dt.month = pad(dt.month);
        dt.date = pad(dt.date);
        dt.hour = pad(dt.hour);
        dt.minute = pad(dt.minute);
        dt.second = pad(dt.second);

        for(let key in dt) {
            str = str.replace(key, dt[key]);
        }
        
        return str;
    };

    TimePoint.prototype.add = function(duration) {
        return new TimePoint(this.value() + duration.value());
    };

    TimePoint.prototype.sub = function(duration) {
        return new TimePoint(this.value() - duration.value());
    };

    TimePoint.prototype.from = function(beginPoint) {
        return new TimeSpan(beginPoint.value(), this.value());
    };

    TimePoint.prototype.to = function(endPoint) {
        return new TimeSpan(this.value(), endPoint.value());
    };

    TimePoint.prototype.thisSecond = function() {
        let beg = Math.floor(timestamp / MS_PER_SECOND) * MS_PER_SECOND;
        let end = Math.ceil(timestamp / MS_PER_SECOND) * MS_PER_SECOND;
        return new TimeSpan(beg, end);
    };

    TimePoint.prototype.thisMinute = function() {
        let beg = Math.floor(timestamp / MS_PER_MINUTE) * MS_PER_MINUTE;
        let end = Math.ceil(timestamp / MS_PER_MINUTE) * MS_PER_MINUTE;
        return new TimeSpan(beg, end);
    };

    TimePoint.prototype.thisHour = function() {
        let beg = Math.floor(timestamp / MS_PER_HOUR) * MS_PER_HOUR;
        let end = Math.ceil(timestamp / MS_PER_HOUR) * MS_PER_HOUR;
        return new TimeSpan(beg, end);
    };

    TimePoint.prototype.thisDay = function() {
        let beg = Math.floor(timestamp / MS_PER_DAY) * MS_PER_DAY;
        let end = Math.ceil(timestamp / MS_PER_DAY) * MS_PER_DAY;
        return new TimeSpan(beg, end);
    };

    TimePoint.prototype.thisWeek = function() {
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

    TimePoint.prototype.thisMonth = function() {
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

    TimePoint.prototype.thisYear = function() {
        let year = now.getFullYear();

        let beg = Date.UTC(year, 0);
        let end = Date.UTC(year + 1, 0);

        return new TimeSpan(beg, end);
    };
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

exports.duration = function(ms) {
    return new Duration(ms);
}

exports.span = function(beginTimeStamp, endTimeStamp) {
    return new TimeSpan(beginTimeStamp, endTimeStamp);
};

exports.between = function(beginTimePoint, endTimePoint) {
    return new TimeSpan(beginTimePoint.value(), endTimePoint.value());
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
