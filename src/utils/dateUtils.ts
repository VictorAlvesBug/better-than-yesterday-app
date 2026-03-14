import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import relativeTime from 'dayjs/plugin/relativeTime';
import { toCapitalize } from './stringUtils';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

export function formatDate(strDate: string) {
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