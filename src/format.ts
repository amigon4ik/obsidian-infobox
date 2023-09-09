import type {Gender} from './parser';
import type {Dayjs} from 'dayjs';

function plural(number: number, titles: string[]): string {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}

export function formatGender(gender: Gender): string {
    if (gender === 'male') {
        return 'Мужской';
    } else if (gender === 'female') {
        return 'Женский';
    }

    return '<не указан>';
}

export function formatDate(date: Dayjs): string {
    return date.isValid() ? date.format('LL') : '<не указана>';
}

export function formatAge(age: number, ageInMonths: number): string {
    const ageInt = Math.floor(age);

    if (ageInt > 0) {
        const unit = plural(ageInt, ['год', 'года', 'лет']);
        return `${ageInt} ${unit}`;
    }

    const ageInMonthsInt = Math.floor(ageInMonths);

    if (ageInMonthsInt >= 0) {
        const unit = plural(ageInMonthsInt, ['месяц', 'месяца', 'месяцев']);
        return `${ageInMonthsInt} ${unit}`;
    }

    return '';
}
