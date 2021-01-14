export const statistics = {
    bookings: {
        label: "Bookings",
        color: "lightgreen"
    },
    waiting: {
        label: "Bookings (Waiting)",
        color: "yellow"
    },
    cancellations: {
        label: "Cancellations",
        color: "indianred"
    },
    attendance: {
        label: "Attendance",
        color: "lightblue"
    }
}

export const statisticMap = {};
for(let name in statistics) {
    const statistic = statistics[name];
    statisticMap[statistic.label] = statistic;
}

export const normalizeWeek = (firstWeek, firstYear, week, year) => {
    if(year > firstYear) 
        return week + (52);
    else
        return week;
}

export const normalizeMonth = (firstMonth, firstYear, month, year) => {
    if(year > firstYear) 
        return month + (12);
    else
        return month;
}