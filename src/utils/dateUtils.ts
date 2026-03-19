import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toCapitalize } from './stringUtils';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

export function formatRelativeDate(strDate: string) {
  const format = 'YYYY-MM-DD HH:mm';
  
  if(!dayjs(strDate, format, true).isValid() || strDate?.length !== format.length)
    throw new Error(`Data inválida (${strDate})`);

  const date = dayjs(strDate);
  const formattedDate = date.format('DD/MM/YYYY');
  const formattedTime = date.format('HH:mm');
  const formattedDayOfWeek = toCapitalize(date.format('dddd'));

  const today = dayjs();
  const yesterday = today.subtract(1, 'day');
  const lastWeek = today.subtract(7, 'day');

  if (date.isSame(yesterday, 'day')) {
    return `Ontem, ${formattedTime}`;
  }

  if (date.isSame(today, 'day')) {
    return `Hoje, ${formattedTime}`;
  }

  if (date.isAfter(lastWeek, 'day') && date.isBefore(today, 'day')) {
    return `${formattedDayOfWeek}, ${formattedTime}`;
  }

  return formattedDate;
}

export function getRelativeDate_old(relation: number = 0) {
  const today = dayjs();
  const relativeDate = today.add(relation, 'day');

  return relativeDate.format('DD/MM/YYYY');
}

export function formatDate(date: Date){
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function rawDate(strDate: string){
  const pattern = /^\d{2}\/\d{2}\/\d{4}$/;
  
  if(!pattern.test(strDate))
    throw new Error(`Data inválida (${strDate})`);

    const [day, month, year] = strDate.split('/').map(Number);
    return new Date(year, month - 1, day);
}

export function getRelativeDate(daysOffset: number = 0){
  const today = new Date();
  const relativeDate = today;
  relativeDate.setDate(relativeDate.getDate() + daysOffset);
  return relativeDate;
}