import { 
  Duration, 
  TimeSpan,
  TimePoint,
  duration,
  now,
  utc,
  span,
  point,
  parse,
  add,
  sub,
} from '../src/time';

test("test Duration class", () => {
  let duration = new Duration(5000);
  
  let a = duration.value;  
  let b = duration.accurateMilliseconds;
  let c = duration.accurateSeconds;
  let d = duration.accurateMinutes;
  let e = duration.accurateHours;
  let f = duration.accurateDays;
  let g = duration.accurateMonths;
  let h = duration.accurateYears;
  let i = duration.milliseconds;
  let j = duration.seconds;
  let k = duration.minutes;
  let l = duration.hours;
  let m = duration.days;
  let n = duration.months;
  let o = duration.years;

  expect(a).toBe(5000);
  expect(b).toBe(5000);
  expect(c).toBe(5);
  expect(d).toBe(0.08333333333333333);
  expect(e).toBe(0.001388888888888889);
  expect(f).toBe(0.00005787037037037037);
  expect(g).toBe(0.0000019290123456790124);
  expect(h).toBe(1.5844043907014477e-7);
  expect(i).toBe(5000);
  expect(j).toBe(5);
  expect(k).toBe(1);
  expect(l).toBe(1);
  expect(m).toBe(1);
  expect(n).toBe(1);
  expect(o).toBe(1);
})

test("test TimeSpan class", () => {
  let timeSpan = new TimeSpan(1600349469, 1600349497);
  let begin = timeSpan.begin;
  let end = timeSpan.end;
  let duration = timeSpan.duration;
  expect(begin).toBe(1600349469);
  expect(end).toBe(1600349497);
  expect(duration.value).toBe(28);

  let timePoint = new TimePoint(1600349470);
  expect(timeSpan.include(timePoint)).toBeTruthy();

  let timePoint2 = new TimePoint(1600349570); 
  let timePoint3 = new TimePoint(1600349000);
  expect(timeSpan.expand(timePoint2).duration).toEqual(new Duration(101));
  expect(timeSpan.expand(timePoint3).duration.value).toBe(570);
})

test("test TimePoint class", () => {
  let timePoint = new TimePoint(1600349470);
  expect(timePoint.value).toBe(1600349470);

  let dateTime = timePoint.dateTime;
  expect(dateTime.year).toBe(1970);
  expect(dateTime.month).toBe(1);
  expect(dateTime.day).toBe(1);
  expect(dateTime.hour).toBe(20);
  expect(dateTime.minute).toBe(32);
  expect(dateTime.second).toBe(29);
  expect(dateTime.ms).toBe(470);
  
  let fmt = timePoint.toString();
  expect(fmt).toBe("1970-01-19 20:32:29");

  let du = new Duration(20)
  let add = timePoint.add(du);
  expect(add.value).toBe(1600349490);

  let sub = timePoint.sub(du);
  expect(sub.value).toBe(1600349450);

  let beginPoint = new TimePoint(1600349450);
  let res = timePoint.from(beginPoint);
  expect(res.duration.value).toBe(20);

  let endPoint = new TimePoint(1600349490);
  let res2 = timePoint.from(endPoint);
  expect(res2.duration.value).toBe(20);

  let nowTime = new TimePoint();
  let thisSecond = nowTime.thisSecond;
  expect(thisSecond.duration.value).toBe(1000);

  let thisMinute = nowTime.thisMinute;
  expect(thisMinute.duration.value).toBe(60000);

  let thisHour = nowTime.thisHour;
  expect(thisHour.duration.value).toBe(3600000);

  let thisDay = nowTime.thisDay;
  expect(thisDay.duration.value).toBe(86400000);

  let thisWeek = nowTime.thisWeek;
  expect(thisWeek.duration.value).toBe(604800);

  let thisMonth = nowTime.thisMonth;
  expect(thisMonth.duration.value).toBe(2592000000);

  let thisYear = nowTime.thisYear;
  expect(thisYear.duration.value).toBe(31622400000);

  // month == 12 case
  expect(new TimePoint(+new Date('2020-12-01 00:00:00')).thisMonth).toEqual(new TimeSpan(Date.UTC(2020, 11), Date.UTC(2020, 12)))
})

test("test duration function", () => {
  let du = duration(5000);
  expect(du.value).toBe(5000);
})

test("test span function", () => {
  expect(span(1600360555, 1600360560).duration.value).toBe(5);

  // timePoint param case
  expect(span(new TimePoint(1600360555), new TimePoint(1600360560)).duration.value).toBe(5);
})

test("test point function", () => {
  let po = point(1600360555);
  expect(po.value).toBe(1600360555);
})

test("test utc function", () => {
  const timePoint = new TimePoint(+new Date())
  expect(utc(timePoint.UTCTime)).toEqual(timePoint)

  // null value case
  const dtp = utc(null);
  const timeSpan = new TimeSpan(dtp.value, Date.now()+1)
  expect(timeSpan.include(dtp)).toBeTruthy();
})

test("test parse function", () => {
  expect(parse('2020-01-01 00:00:00')).toEqual(new TimePoint(+new Date('2020-01-01 00:00:00')))
})

test("test add function", () => {
  let tp = new TimePoint(1600360555);
  let du = new Duration(5);
  expect(add(tp, du)).toEqual(new TimePoint(1600360560))
})

test("test sub function", () => {
  let tp = new TimePoint(1600360560);
  let du = new Duration(5);
  expect(sub(tp, du)).toEqual(new TimePoint(1600360555))
})

test('test now function', ()  => {
  const timePoint = now()
  const timeSpan = new TimeSpan(timePoint.value, Date.now()+1)
  expect(timeSpan.include(timePoint)).toBeTruthy()
})

test('test to timePoint', () => {
  const now = Date.now()
  const next = now + 10
  const timePoint = new TimePoint(now)
  expect(timePoint.to(new TimePoint(next))).toEqual(new TimeSpan(now, next))
})

test('test from timePoint', () => {
  const now = Date.now()
  const prev = now - 10
  const timePoint = new TimePoint(now)
  expect(timePoint.from(new TimePoint(prev))).toEqual(new TimeSpan(prev, now))
})
