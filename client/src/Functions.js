const moment = require('moment');

export const weekFirst = (day) => {
    return moment(day).day(1).hour(0).minute(0).second(0);
}

export const weekLast = (day) => {
    return moment(day).day(7).hour(23).minute(59).second(59);
}

export const getWeek = (day) => {
    return {
        first: weekFirst(day),
        last: weekLast(day)
    };
}

export const monthFirst = (day) => {
    return moment(day).date(1).hour(0).minute(0).second(0);
}

export const monthLast = (day) => {
    return moment(day).date(moment(day).daysInMonth()).hour(23).minute(59).second(59);
}

export const getMonth = (day) => {
    return {
        first: monthFirst(day),
        last: monthLast(day)
    }
}

export const weekSQLtoMoment = (n) => {
    return n+1;
}

export const monthSQLtoMoment = (n) => {
    return n-1;
}