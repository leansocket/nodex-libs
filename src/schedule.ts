
type Schedule_All = '*';
type Schedule_One = number;
type Schedule_Cond = (n: number) => boolean;
type Schedule_List = number[];

type ScheduleComponent =
    Schedule_All |
    Schedule_One |
    Schedule_Cond |
    Schedule_List;

export interface ScheduleOptions {
    Y: ScheduleComponent;
    M: ScheduleComponent;
    D: ScheduleComponent;
    d: ScheduleComponent;
    h: ScheduleComponent;
    m: ScheduleComponent;
    s: ScheduleComponent;
};

const testSchedule = function (schedule: ScheduleOptions, now: Date): boolean {

    const test = function (c: ScheduleComponent, n: number) {
        if (c === undefined || c === '*') {
            return true;
        }

        let t = typeof (c);
        if (t === 'number' && c !== n) {
            return false;
        }
        else if (t === 'function' && !(c as Schedule_Cond)(n)) {
            return false;
        }
        else if (Array.isArray(c) && !c.includes(n)) {
            return false;
        }

        return true;
    };

    if (!test(schedule.Y, now.getFullYear())) {
        return false;
    }
    if (!test(schedule.M, now.getMonth() + 1)) {
        return false;
    }
    if (!test(schedule.D, now.getDate())) {
        return false;
    }
    if (!test(schedule.d, now.getDay())) {
        return false;
    }
    if (!test(schedule.h, now.getHours())) {
        return false;
    }
    if (!test(schedule.m, now.getMinutes())) {
        return false;
    }
    if (!test(schedule.s, now.getSeconds())) {
        return false;
    }

    return true;
};

const inTheSameSecond = function (time1: Date, time2: Date): boolean {
    return time1.getSeconds() === time2.getSeconds()
        && time1.getMinutes() === time2.getMinutes()
        && time1.getHours() === time2.getHours()
        && time1.getDate() === time2.getDate()
        && time1.getFullYear() === time2.getFullYear();
};

class Schedule {
    private schedule: any;
    private precision: number;
    private interval: any;

    constructor(schedule: ScheduleOptions, precision: number) {
        this.schedule = schedule;
        this.precision = precision || 333;
        this.interval = undefined;
    }

    public get running() {
        return this.interval !== undefined;
    }

    public start(callback: (now: Date) => void): boolean {
        if (!this.schedule || typeof (callback) !== 'function') {
            return false;
        }

        let last = undefined;
        this.interval = setInterval(() => {
            let now = new Date();
            if (last && inTheSameSecond(last, now)) {
                return;
            }
            if (!testSchedule(this.schedule, now)) {
                return;
            }
            last = now;
            callback(now);

        }, this.precision);

        return this.interval !== undefined;
    }

    public stop(): void {
        if (this.interval === undefined) {
            return;
        }
        clearInterval(this.interval);
    }
}

export default Schedule;
