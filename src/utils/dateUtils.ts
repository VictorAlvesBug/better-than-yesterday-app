import dayjs from 'dayjs';
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
  | string
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

function getDateComponents(param: AllTypes): DateComponents{
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

  if (typeof param === 'string'){ // TODO: Corrigir para não precisar de string no AllTypes
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
  const pattern = /$\d{4}-\d{2}-\d{2}^/g;
  return pattern.test(dateOnly);
}

export function assertDateOnly(dateOnly: string): asserts dateOnly is DateOnly {
  if (!isDateOnly){
    throw new Error(`Formato de '${dateOnly}' inválido`);
  }
}

export function isTime(time: string): time is Time {
  const pattern = /$\d{2}:\d{2}^/g;
  return pattern.test(time);
}

export function assertTime(time: string): asserts time is Time {
  if (!isTime){
    throw new Error(`Formato de '${time}' inválido`);
  }
}

export function isDateTime(dateTime: string): dateTime is DateTime {
  const pattern = /$\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}^/g;
  return pattern.test(dateTime);
}

export function assertDateTime(dateTime: string): asserts dateTime is DateTime {
  if (!isDateTime){
    throw new Error(`Formato de '${dateTime}' inválido`);
  }
}

export function isDateToFront(dateToFront: string): dateToFront is DateToFront {
  const pattern = /$\d{2}\/\d{2}\/\d{4}^/g;
  return pattern.test(dateToFront);
}

export function assertDateToFront(dateToFront: string): asserts dateToFront is DateToFront {
  if (!isDateToFront){
    throw new Error(`Formato de '${dateToFront}' inválido`);
  }
}

export function isDateTimeToFront(dateTimeToFront: string): dateTimeToFront is DateTimeToFront {
  const pattern = /$\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2}^/g;
  return pattern.test(dateTimeToFront);
}

export function assertDateTimeToFront(dateTimeToFront: string): asserts dateTimeToFront is DateTimeToFront {
  if (!isDateTimeToFront){
    throw new Error(`Formato de '${dateTimeToFront}' inválido`);
  }
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
  const dateOnly = getDateOnly(param);

  const dayjsDate = dayjs(dateOnly);
  const formattedDate = dayjsDate.format('DD/MM/YYYY');
  const formattedDayOfWeek = toCapitalize(dayjsDate.format('dddd'));

  const today = dayjs();
  const yesterday = today.subtract(1, 'day');
  const lastWeek = today.subtract(7, 'day');

  if (dayjsDate.isSame(yesterday, 'day')) {
    return 'Ontem';
  }

  if (dayjsDate.isSame(today, 'day')) {
    return 'Hoje';
  }

  if (dayjsDate.isAfter(lastWeek, 'day') && dayjsDate.isBefore(today, 'day')) {
    return formattedDayOfWeek;
  }

  return formattedDate;
}

export function getDate(param: AllTypes) {
  const {
      year,
      month,
      day,
  } = dateComponentsAsNumber(getDateComponents(param));
  
  return new Date(year, month - 1, day);
}

export function getDateOnly(param: AllTypes) {
  const {
      year,
      month,
      day,
  } = getDateComponents(param);

  const dateOnly = `${year}-${month}-${day}`;

  assertDateOnly(dateOnly);

  return dateOnly;
}

export function getTime(param: AllTypes) {
  const {
      hour,
      minute
  } = getDateComponents(param);

  const time = `${hour}:${minute}`;

  assertTime(time);

  return time;
}

export function getDateTime(param: AllTypes) {
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

export function getDateToFront(param: AllTypes) {
  const {
      year,
      month,
      day,
  } = getDateComponents(param);

  const dateToFront = `${day}/${month}/${year}`;

  assertDateToFront(dateToFront);

  return dateToFront;
}

export function getDateTimeToFront(param: AllTypes) {
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

export function getDateOnlyWithOffset(daysOffset: number, param: AllTypes = new Date()) {
  const initialDate = getDate(param);
  initialDate.setDate(initialDate.getDate() + daysOffset);
  return getDateOnly(initialDate);
}