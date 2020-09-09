/**
 * 日程规则：全部。此规则在任何情况下永远通过验证。
*/
type Schedule_All = '*';
/**
 * 日程规则：特定。此规则约束目标值与规则值相等时通过验证。
*/
type Schedule_One = number;
/**
 * 日程规则：条件。此规则定义一个函数判断目标值是否通过验证。
*/
type Schedule_Cond = (n: number) => boolean;
/**
 * 日程规则：列表。此规则约束目标值必须是列表中的元素时才能通过验证。
*/
type Schedule_List = number[];

/**
 * 日程规则
*/
type ScheduleRule =
    Schedule_All |
    Schedule_One |
    Schedule_Cond |
    Schedule_List;

/**
 * 日程选项参数
*/
export interface ScheduleOptions {
    /**
     * Year，年份
    */
    Y: ScheduleRule;
    /**
     * Month，月份
    */
    M: ScheduleRule;
    /**
     * Date，日期
    */
    D: ScheduleRule;
    /**
     * day，星期
    */
    d: ScheduleRule;
    /**
     * hour，时
    */
    h: ScheduleRule;
    /**
     * minute，分
    */
    m: ScheduleRule;
    /**
     * second，秒
    */
    s: ScheduleRule;
};

const testSchedule = function (schedule: ScheduleOptions, now: Date): boolean {

    const test = function (c: ScheduleRule, n: number) {
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

/**
 * 日程
 * * 日程是为了解决在特定的时刻执行任务的需求，例如：每周星期二上午九点执行任务A。
 * * 日程不是解决每隔单位时间执行任务的需求，如：每隔30秒执行任务B，你可以用计时器
 * setInterval之类的方法完成这类需求。
*/
class Schedule {
    private schedule: any;
    private precision: number;
    private interval: any;

    /**
     * 构造器
     * @param {ScheduleOptions} schedule 日程规则选项
     * @param {number} precision 日程检测精度，单位为毫秒。
    */
    constructor(schedule: ScheduleOptions, precision?: number) {
        this.schedule = schedule;
        this.precision = precision || 333;
        this.interval = undefined;
    }

    /**
     * 获取日程是否在运行
    */
    public get running() {
        return this.interval !== undefined;
    }

    /**
     * 启动日程
     * @param {(Date)=>void} task 日程触发时的任务函数
     * @returns {boolean} 日程是否启动成功
    */
    public start(task: (now: Date) => void): boolean {
        if (!this.schedule || typeof (task) !== 'function') {
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
            task(now);

        }, this.precision);

        return this.interval !== undefined;
    }

    /**
     * 停止日程
    */
    public stop(): void {
        if (this.interval === undefined) {
            return;
        }
        clearInterval(this.interval);
        this.interval = undefined;
    }
}

export default Schedule;
