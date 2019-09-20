const Schedule = require('../libs/schedule');

test('schedule', () => {
    const schedule = new Schedule();
    const cb = jest.fn();
    const hasInterval = schedule.start(cb);

    jest.useFakeTimers(() => {
        expect(hasInterval).toBeTruthy();
        expect(cb).toHaveBeenCalled();
    
        let isRunning = schedule.running();
        expect(isRunning).toBeTruthy();
    
        schedule.stop();
    
        isRunning = schedule.running();
        expect(isRunning).toBeFalsy();
    })
});