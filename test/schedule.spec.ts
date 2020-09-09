import Schedule from '../src/schedule';

jest.useFakeTimers()

test('schedule', () => {
    const schedule = new Schedule({Y:'*',M:'*',D:'*',d:'*',h:'*',m:'*',s:'*'});
    const task = jest.fn();
    const hasInterval = schedule.start(task);

    expect(hasInterval).toBeTruthy();

    expect(task).not.toBeCalled()

    jest.advanceTimersByTime(1000)

    expect(task).toBeCalled()

    expect(schedule.running).toBeTruthy();
    
    schedule.stop();

    expect(schedule.running).toBeFalsy();
    
});