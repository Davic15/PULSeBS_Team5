const baseURL = "/api";
const moment = require('moment');

/* Login function */
async function userLogin(email, password){
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({email: email, password: password}),
        }).then((response) => {
            if (response.ok){
                response.json().then((user) => {
                    resolve(user);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

/* Logout function */
async function userLogout() {
    return new Promise((resolve, reject) => {
        fetch(baseURL + '/logout', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        });
    });
}

/* isAuthenticated function*/
async function isAuthenticated(){
    return new Promise((resolve, reject) => {
        fetch(baseURL + '/user', {
            method: 'POST',
        }).then((response) => {
            if (response.ok) {
                resolve(null);
            } else {
                // analyze the cause of error
                response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject({ errors: [{ param: "Application", msg: "Cannot parse server response" }] }) }); // something else
            }
        });
    });
}

async function getStudentLectures(start, end) {
    const startDate = moment(start).format("YYYY-MM-DD");
    const endDate = moment(end).format("YYYY-MM-DD");
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/studentlectures", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({date_start: startDate, date_end: endDate}),
        }).then((response) => {
            if (response.ok){
                response.json().then((lectures) => {
                    resolve(lectures);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}


async function getTeacherLectures(start, end) {
    const startDate = moment(start).format("YYYY-MM-DD");
    const endDate = moment(end).format("YYYY-MM-DD");
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/teacherlectures", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({date_start: startDate, date_end: endDate}),
        }).then((response) => {
            if (response.ok){
                response.json().then((lectures) => {
                    resolve(lectures);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function getStudentList(lectureId) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/studentlist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({lecture_id: lectureId}),
        }).then((response) => {
            if (response.ok){
                response.json().then((students) => {
                    resolve(students);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function book(lectureId) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/book", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({lecture_id: lectureId}),
        }).then((response) => {
            if (response.ok){
                resolve({});
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function cancelBooking(bookingId) {
    console.log("APIcancel "+bookingId+" "+baseURL + "/cancelbooking");
    return new Promise((resolve, reject) => {
         fetch(baseURL + "/cancelbooking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({booking_id: bookingId})
        }).then((response) => {
            if (response.ok){
                resolve({});
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function cancelLecture(lectureId) {
    return new Promise((resolve, reject) => {
         fetch(baseURL + "/cancellecture", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({lecture_id: lectureId})
        }).then((response) => {
            if (response.ok){
                resolve({});
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function changeLecture(lectureId) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/changelecture", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({lecture_id: lectureId}),
        }).then((response) => {
            if (response.ok){
                resolve({});
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function getWeeklyStatistics(courseId, start, end) {
    start = moment(start).format("YYYY-MM-DD HH:mm");
    end = moment(end).format("YYYY-MM-DD HH:mm");

    return new Promise((resolve, reject) => {
        fetch(baseURL + "/stats/avg/week", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({course_id: courseId, date_start: start, date_end: end}),
        }).then((response) => {
            if (response.ok){
                response.json().then((rows) => {
                    resolve(rows);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function getMonthlyStatistics(courseId, start, end) {
    start = moment(start).format("YYYY-MM-DD HH:mm");
    end = moment(end).format("YYYY-MM-DD HH:mm");

    return new Promise((resolve, reject) => {
        fetch(baseURL + "/stats/avg/month", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({course_id: courseId, date_start: start, date_end: end}),
        }).then((response) => {
            if (response.ok){
                response.json().then((rows) => {
                    resolve(rows);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function getLectureStatistics(lectureId, n) {
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/dailystats", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({lecture_id: lectureId, n_lectures: n}),
        }).then((response) => {
            if (response.ok){
                response.json().then((rows) => {
                    resolve(rows);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function getCourseLectures(courseId, start, end) {
    start = moment(start).format("YYYY-MM-DD HH:mm");
    end = moment(end).format("YYYY-MM-DD HH:mm");

    return new Promise((resolve, reject) => {
        fetch(baseURL + "/courselectures", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({course_id: courseId, date_start: start, date_end: end}),
        }).then((response) => {
            if (response.ok){
                response.json().then((rows) => {
                    resolve(rows);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function getCourseList() {
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/courses", {
            method: "GET"
        }).then((response) => {
            if (response.ok){
                response.json().then((rows) => {
                    resolve(rows);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function generateContactTracingReport(studentId, date) {
    date = moment(date).format("YYYY-MM-DD");

    return new Promise((resolve, reject) => {
        fetch(baseURL + "/generateContactTracingReport", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({student_id: studentId, date: date}),
        }).then((response) => {
            if (response.ok){
                resolve({});
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function getReportList() {
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/reports", {
            method: "GET"
        }).then((response) => {
            if (response.ok){
                response.json().then((reports) => {
                    resolve(reports);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function putRestrictions(year, date) {
    date = moment(date).format("YYYY-MM-DD");

    return new Promise((resolve, reject) => {
        fetch(baseURL + "/putRestrictions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({year: year, date: date}),
        }).then((response) => {
            if (response.ok){
                resolve({});
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function liftRestrictions(year, date) {
    date = moment(date).format("YYYY-MM-DD HH:mm");

    return new Promise((resolve, reject) => {
        fetch(baseURL + "/liftRestrictions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({year: year, date: date}),
        }).then((response) => {
            if (response.ok){
                resolve({});
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function getRestrictedYears() {
    return new Promise((resolve, reject) => {
        fetch(baseURL + "/years", {
            method: "GET"
        }).then((response) => {
            if (response.ok){
                response.json().then((years) => {
                    resolve(years);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function uploadTeachers(file) {
    const data = new FormData();
    data.append("teachers", file);

    return new Promise((resolve, reject) => {
        fetch(baseURL + "/uploadcsv/teachers", {
            method: "POST",
            body: data
        }).then((response) => {
            if (response.ok){
                response.json().then((rows) => {
                    resolve(rows);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function uploadStudents(file) {
    const data = new FormData();
    data.append("students", file);

    return new Promise((resolve, reject) => {
        fetch(baseURL + "/uploadcsv/students", {
            method: "POST",
            body: data
        }).then((response) => {
            if (response.ok){
                response.json().then((rows) => {
                    resolve(rows);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function uploadCourses(file) {
    const data = new FormData();
    data.append("courses", file);

    return new Promise((resolve, reject) => {
        fetch(baseURL + "/uploadcsv/courses", {
            method: "POST",
            body: data
        }).then((response) => {
            if (response.ok){
                response.json().then((rows) => {
                    resolve(rows);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function uploadEnrollments(file) {
    const data = new FormData();
    data.append("enrollments", file);

    return new Promise((resolve, reject) => {
        fetch(baseURL + "/uploadcsv/enrollments", {
            method: "POST",
            body: data
        }).then((response) => {
            if (response.ok){
                response.json().then((rows) => {
                    resolve(rows);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

async function uploadLectures(file, start, end) {
    const data = new FormData();
    data.append("lectures", file);

    start = moment(start).format("YYYY-MM-DD");
    end = moment(end).format("YYYY-MM-DD");

    return new Promise((resolve, reject) => {
        fetch(baseURL + "/uploadcsv/lectures/" + start + "/" + end , {
            method: "POST",
            body: data
        }).then((response) => {
            if (response.ok){
                response.json().then((rows) => {
                    resolve(rows);
                });
            }else{
                response.json()
                .then((obj) => {reject(obj); })
                .catch((err) => {reject({errors: [{param: "Application", msg: "Cannot parse server response"}]})});
            }
        }).catch((err) => { reject({ errors: [{ param: "Server", msg: "Cannot communicate" }] }) });
    });
}

const API = { 
    userLogin, 
    isAuthenticated, 
    userLogout, 
    getStudentLectures, 
    getTeacherLectures, 
    getStudentList, 
    book, 
    cancelBooking, 
    cancelLecture, 
    changeLecture, 
    getWeeklyStatistics,
    getMonthlyStatistics,
    getLectureStatistics,
    getCourseLectures,
    getCourseList,
    generateContactTracingReport,
    getReportList,
    putRestrictions,
    liftRestrictions,
    getRestrictedYears,
    uploadTeachers,
    uploadStudents,
    uploadCourses,
    uploadEnrollments,
    uploadLectures 
};
export default API;