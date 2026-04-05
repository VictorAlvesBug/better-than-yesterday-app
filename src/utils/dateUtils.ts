import dayjs, { Dayjs, isDayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toCapitalize } from './stringUtils';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

type NumberProperties<T extends object> = {
  [K in keyof T]: number;
}

export type DateOnly = string & { __brand: 'DateOnly' };
export type Time = string & { __brand: 'Time' };
export type DateTime = string & { __brand: 'DateTime' };
export type DateToFront = string & { __brand: 'DateToFront' };
export type DateTimeToFront = string & { __brand: 'DateTimeToFront' };

type AllTypes = 
  | Dayjs
  | Date
  | DateOnly
  | Time
  | DateTime
  | DateToFront
  | DateTimeToFront;

type DateComponents = {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}

const defaultDateComponents: DateComponents = {
  year: '1970',
  month: '01',
  day: '01',
  hour: '00',
  minute: '00',
}

function getDateComponents(param: AllTypes = new Date()): DateComponents{
  if (isDayjs(param))
    return {
      ...defaultDateComponents,
      year: String(param.get('year')),
      month: String(param.get('month')).padStart(2, '0'),
      day: String(param.get('day')).padStart(2, '0'),
      hour: String(param.get('hour')).padStart(2, '0'),
      minute: String(param.get('minute')).padStart(2, '0'),
    }

  if (isDate(param))
    return {
      ...defaultDateComponents,
      year: String(param.getFullYear()),
      month: String(param.getMonth() + 1).padStart(2, '0'),
      day: String(param.getDate()).padStart(2, '0'),
      hour: String(param.getHours()).padStart(2, '0'),
      minute: String(param.getMinutes()).padStart(2, '0'),
    }

  if (isDateOnly(param)){
    const [year, month, day] = param.split('-');
    return {
      ...defaultDateComponents,
      year,
      month,
      day
    }
  }

  if (isTime(param)){
    const [hour, minute] = param.split(':');
    return {
      ...defaultDateComponents,
      hour,
      minute
    }
  }

  if (isDateTime(param)){
    const [datePart, timePart] = param.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hour, minute] = timePart.split(':');
    return {
      ...defaultDateComponents,
      year,
      month,
      day,
      hour,
      minute
    }
  }

  if (isDateToFront(param)){
    const [day, month, year] = param.split('/');
    return {
      ...defaultDateComponents,
      year,
      month,
      day
    }
  }

  if (isDateTimeToFront(param)){
    const [datePart, timePart] = param.split(' ');
    const [day, month, year] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    return {
      ...defaultDateComponents,
      year,
      month,
      day,
      hour,
      minute
    }
  }

  const _exhaustive: never = param;
  return _exhaustive;
}

function dateComponentsAsNumber(dateComponents: DateComponents): NumberProperties<DateComponents>{
  return Object.fromEntries(
    Object.entries(dateComponents)
    .map(([key, value]) => [key, Number(value)])
  ) as NumberProperties<DateComponents>;
}

export function isDate(param: AllTypes): param is Date {
  return typeof param !== 'string'
}

export function isDateOnly(dateOnly: string): dateOnly is DateOnly {
  const pattern = /^\d{4}-\d{2}-\d{2}$/g;
  return pattern.test(dateOnly);
}

export function isTime(time: string): time is Time {
  const pattern = /^\d{2}:\d{2}$/g;
  return pattern.test(time);
}

export function isDateTime(dateTime: string): dateTime is DateTime {
  const pattern = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}$/g;
  return pattern.test(dateTime);
}

export function isDateToFront(dateToFront: string): dateToFront is DateToFront {
  const pattern = /^\d{2}\/\d{2}\/\d{4}$/g;
  return pattern.test(dateToFront);
}

export function isDateTimeToFront(dateTimeToFront: string): dateTimeToFront is DateTimeToFront {
  const pattern = /^\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}$/g;
  return pattern.test(dateTimeToFront);
}

export function assertDateOnly(dateOnly: string): asserts dateOnly is DateOnly {
  if (!isDateOnly(dateOnly)){
    throw new Error(`Formato de '${dateOnly}' inválido`);
  }
}

export function assertTime(time: string): asserts time is Time {
  if (!isTime(time)){
    throw new Error(`Formato de '${time}' inválido`);
  }
}

export function assertDateTime(dateTime: string): asserts dateTime is DateTime {
  if (!isDateTime(dateTime)){
    throw new Error(`Formato de '${dateTime}' inválido`);
  }
}

export function assertDateToFront(dateToFront: string): asserts dateToFront is DateToFront {
  if (!isDateToFront(dateToFront)){
    throw new Error(`Formato de '${dateToFront}' inválido`);
  }
}

export function assertDateTimeToFront(dateTimeToFront: string): asserts dateTimeToFront is DateTimeToFront {
  if (!isDateTimeToFront(dateTimeToFront)){
    throw new Error(`Formato de '${dateTimeToFront}' inválido`);
  }
}

export function parseDateOnly(value: string): DateOnly {
  assertDateOnly(value);
  return value;
}

export function parseTime(value: string): Time {
  assertTime(value);
  return value;
}

export function parseDateTime(value: string): DateTime {
  assertDateTime(value);
  return value;
}

export function parseDateToFront(value: string): DateToFront {
  assertDateToFront(value);
  return value;
}

export function parseDateTimeToFront(value: string): DateTimeToFront {
  assertDateTimeToFront(value);
  return value;
}

export function splitDateOnlyAndTime(dateTime: string) {
  assertDateTime(dateTime);
  const [dateOnly, time] = dateTime.split(' ');

  assertDateOnly(dateOnly);
  assertTime(time);

  return [dateOnly, time] as const;
}

export function formatRelativeDateTime(param: AllTypes) {
  const dateTime = getDateTime(param);
  const [dateOnly, time] = splitDateOnlyAndTime(dateTime);

  const formattedDateOnly = formatRelativeDateOnly(dateOnly);

  return `${formattedDateOnly}, às ${time}`
}

export function formatRelativeDateOnly(param: AllTypes) {
  const date = getDate(param);

  const dayjsDate = dayjs(date);
  const formattedDate = dayjsDate.format('DD/MM/YYYY');
  const formattedDayOfWeek = toCapitalize(dayjsDate.format('dddd'));

  const today = dayjs();
  const yesterday = today.subtract(1, 'day');
  const tomorrow = today.add(1, 'day');
  const lastWeek = today.subtract(7, 'day');

  if (dayjsDate.isSame(yesterday, 'day')) {
    return 'Ontem';
  }

  if (dayjsDate.isSame(tomorrow, 'day')) {
    return 'Amanhã';
  }

  if (dayjsDate.isSame(today, 'day')) {
    return 'Hoje';
  }

  if (dayjsDate.isAfter(lastWeek, 'day') && dayjsDate.isBefore(today, 'day')) {
    return formattedDayOfWeek;
  }

  return formattedDate;
}

export function formatDateRelativeToToday(param: AllTypes) {
  const date = getDate(param);

  const dayjsDate = dayjs(date).startOf('day');

  const formattedDate = dayjsDate.format('DD/MM/YYYY');

  const today = dayjs().startOf('day');
  const yesterday = today.subtract(1, 'day');
  const tomorrow = today.add(1, 'day');

  if (dayjsDate.isSame(yesterday, 'day')) {
    return 'Ontem';
  }

  if (dayjsDate.isSame(tomorrow, 'day')) {
    return 'Amanhã';
  }

  if (dayjsDate.isSame(today, 'day')) {
    return 'Hoje';
  }

  const daysAmount = dayjsDate.diff(today, 'days');
  const dayOrDays = Math.abs(daysAmount) === 1 ? 'dia' : 'dias';

  if (daysAmount < 0) {
    return `${Math.abs(daysAmount)} ${dayOrDays} atrás`;
  }

  if (daysAmount > 0) {
    return `Daqui ${Math.abs(daysAmount)} ${dayOrDays}`;
  }

  return formattedDate;
}

export function getDate(param: AllTypes = new Date()) {
  const {
      year,
      month,
      day,
  } = dateComponentsAsNumber(getDateComponents(param));
  
  return new Date(year, month - 1, day);
}

export function getDateOnly(param: AllTypes = new Date()) {
  const {
      year,
      month,
      day,
  } = getDateComponents(param);

  const dateOnly = `${year}-${month}-${day}`;

  assertDateOnly(dateOnly);

  return dateOnly;
}

export function getTime(param: AllTypes = new Date()) {
  const {
      hour,
      minute
  } = getDateComponents(param);

  const time = `${hour}:${minute}`;

  assertTime(time);

  return time;
}

export function getDateTime(param: AllTypes = new Date()) {
  const {
      year,
      month,
      day,
      hour,
      minute
  } = getDateComponents(param);

  const dateTime = `${year}-${month}-${day} ${hour}:${minute}`;

  assertDateTime(dateTime);

  return dateTime;
}

export function getDateToFront(param: AllTypes = new Date()) {
  const {
      year,
      month,
      day,
  } = getDateComponents(param);

  const dateToFront = `${day}/${month}/${year}`;

  assertDateToFront(dateToFront);

  return dateToFront;
}

export function getDateTimeToFront(param: AllTypes = new Date()) {
  const {
      year,
      month,
      day,
      hour,
      minute
  } = getDateComponents(param);

  const dateTimeToFront = `${day}/${month}/${year} ${hour}:${minute}`;

  assertDateTimeToFront(dateTimeToFront);

  return dateTimeToFront;
}

export function getDateWithOffset(daysOffset: number, param: AllTypes = new Date()) {
  const initialDate = getDate(param);
  initialDate.setDate(initialDate.getDate() + daysOffset);
  return initialDate;
}

export function getDateOnlyWithOffset(daysOffset: number, param: AllTypes = new Date()) {
  return getDateOnly(getDateWithOffset(daysOffset, param));
}

export function getDateToFrontWithOffset(daysOffset: number, param: AllTypes = new Date()) {
  return getDateToFront(getDateWithOffset(daysOffset, param));
}