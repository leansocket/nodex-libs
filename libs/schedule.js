
let testSchedule = function(schedule, now) {

    let testScheduleComponent = function(c, n) {
        if(c !== undefined && c !== '*'){
            let t = typeof(c);
            if(t === 'number' && c !== n){
                return false;
            }
            else if(t === 'function' && !c(n)){
                return false;
            }
            else if(Array.isArray(c) && !c.includes(n)){
                return false;
            }
        }
        return true;
    };

    if(!testScheduleComponent(schedule.Y, now.getFullYear())){
        return false;
    }
    if(!testScheduleComponent(schedule.M, now.getMonth())){
        return false;
    }
    if(!testScheduleComponent(schedule.D, now.getDate())){
        return false;
    }
    if(!testScheduleComponent(schedule.d, now.getDay())){
        return false;
    }
    if(!testScheduleComponent(schedule.h, now.getHours())){
        return false;
    }
    if(!testScheduleComponent(schedule.m, now.getMinutes())){
        return false;
    }
    if(!testScheduleComponent(schedule.s, now.getSeconds())){
        return false;
    }
    return true;
};

let inTheSameSecond = function(time1, time2) {
    return time1.getSeconds() === time2.getSeconds()
        && time1.getMinutes() === time2.getMinutes()
        && time1.getHours() === time2.getHours()
        && time1.getDate() === time2.getDate()
        && time1.getFullYear() === time2.getFullYear();
};

let Schedule = function(schedule, precision) {
    if(!(this instanceof Schedule)){
        return new Schedule(schedule);
    }
    if(!precision){
        precision = 333;
    }

    let interval = undefined;

    this.start = function(callback) {
        if(!schedule || typeof(callback) !== 'function'){
            return false;
        }

        let last = undefined;
        interval = setInterval(() => {
            let now = new Date();
            if (last && inTheSameSecond(last, now)){
                return;
            }
            if(!testSchedule(schedule, now)){
                return;
            }
            last = now;
            callback(now);

        }, precision);

        return interval !== undefined;
    };

    this.stop = function() {
        if(interval === undefined){
            return;
        }
        clearInterval(interval);
    };

    this.running = function() {
        return interval !== undefined;
    }
};

module.exports = Schedule;
