const moment = require('moment');
const fs = require('fs');
const util = require('util');
const dao = require('../dao');
const { doesNotMatch } = require('assert');

let today = new Date();
const monday = new Date(today.setDate(today.getDate() - today.getDay() + 8));
today = new Date();
const wednesday = new Date(today.setDate(today.getDate() - today.getDay() + 10));
today = new Date();
const friday = new Date(today.setDate(today.getDate() - today.getDay() + 12));
/*const start1 = moment(monday.setHours("900001", 30, 0, 0)).format("YYYY-MM-DD HH:mm:ss");
const end1 = moment(monday.setHours(11, 30, 0, 0)).format("YYYY-MM-DD HH:mm:ss");
const start2 = moment(wednesday.setHours(10, 0, 0, 0)).format("YYYY-MM-DD HH:mm:ss");
const end2 = moment(wednesday.setHours(11, 30, 0, 0)).format("YYYY-MM-DD HH:mm:ss");
const start3 = moment(wednesday.setHours(10, 0, 0, 0)).format("YYYY-MM-DD HH:mm:ss");
const end3 = moment(wednesday.setHours(13, 0, 0, 0)).format("YYYY-MM-DD HH:mm:ss"); 
const start4 = moment(friday.setHours(10, 0, 0, 0)).format("YYYY-MM-DD HH:mm:ss");
const end4 = moment(friday.setHours(13, 0, 0, 0)).format("YYYY-MM-DD HH:mm:ss");*/ 

const range1 = moment(monday.setHours(0, 0, 0, 0)).format("YYYY-MM-DD");
const range2 = moment(friday.setHours(23, 59, 59, 0)).format("YYYY-MM-DD");

const stats = ["DELETE FROM sqlite_sequence",
            "DELETE FROM Report",
            "UPDATE RestrictedYear SET Restricted = 0",
            "DELETE FROM Booking", 
            "DELETE FROM Classroom",
            "DELETE FROM Lecture",
            "DELETE FROM StudentCourse",
            "DELETE FROM Course",
            "DELETE FROM User"
            /*`INSERT INTO Lecture(LectureId, CourseId, Start, End, State, ClassRoomId) VALUES (1, 2, '${start1}', '${end1}', 0, 3)`,
            `INSERT INTO Lecture(LectureId, CourseId, Start, End, State, ClassRoomId) VALUES (2, 2, '${start2}', '${end2}', 0, 5)`,
            `INSERT INTO Lecture(LectureId, CourseId, Start, End, State, ClassRoomId) VALUES (3, 3, '${start3}', '${end3}', 0, 4)`,
`INSERT INTO Lecture(LectureId, CourseId, Start, End, State, ClassRoomId) VALUES (4, 3, '${start4}', '${end4}', 0, 3)`*/];

const readfile = util.promisify(fs.readFile);
let db;

async function readFile(name) {
    const data = await readfile(name);
    return data;
}

beforeAll(async () => {
    db = await dao.initializeDBConn('./PULSEeBS_db_TEST');
})

test('Insert teachers in db', async() => {
    try {
        const data = await readFile("Professors-test.csv");
        const added = await dao.addTeachers(data);
        expect(added).toBeDefined();
        expect(added.length).toBe(2);
    }
    catch(e) {
        console.log(e);
    }
}, 30000);

test('Insert students in db', async() => {
    try {
        const data = await readFile("Students-test.csv");
        const added = await dao.addStudents(data);
        expect(added).toBeDefined();
        expect(added.length).toBe(2);
    }
    catch(e) {
        console.log(e);
    }
}, 30000);

test('Insert courses in db', async() => {
    try {
        const data = await readFile("Courses-test.csv");
        const added = await dao.addCourses(data);
        console.log(added)
        expect(added).toBeDefined();
        expect(added.length).toBe(2);
    }
    catch(e) {
        console.log(e);
    }
}, 30000);

test('Insert enrollments in db', async() => {
    try {
        const data = await readFile("Enrollment-test.csv");
        const added = await dao.addEnrollments(data);
        expect(added).toBeDefined();
        expect(added.length).toBe(2);
    }
    catch(e) {
        console.log(e);
    }
}, 30000);

test('Insert lectures in db', async() => {
    try {
        const data = await readFile("Schedule-test.csv");
        const added = await dao.addLectures(data, "2020-09-28", "2021-01-13");
        expect(added).toBeDefined();
        expect(added.length).toBe(2);
    }
    catch(e) {
        console.log(e);
    }
}, 30000);

test('User is defined', async() => {
    const user = await dao.getUser("Ines.Beneventi@politu.it");
    expect(user).toBeDefined();
    expect(user.UserId).toBe("d9000");
});

test('User is undefined', async() => {
    const user = await dao.getUser("notvalid@politu.it");
    expect(user).toBeUndefined();
});

test('User by id is defined', async() => {
    const user = await dao.getUserById("d9001");
    expect(user).toBeDefined();
    expect(user.Email).toBe("Nino.Lucciano@politu.it");
});

test('User by id is empty', async() => {
    const user = await dao.getUserById("x0000");
    expect(user).toStrictEqual([]);
});

test('Course by id is defined', async() => {
    const course = await dao.getCourseById("XY4911");
    expect(course).toBeDefined();
    expect(course.Name).toBe("Chimica");
});

test('Course by id is empty', async() => {
    const course = await dao.getCourseById("XY0000");
    expect(course).toStrictEqual([]);
});

test('Classroom by id is defined', async() => {
    const classroom = await dao.getClassRoomById(2);
    expect(classroom).toBeDefined();
    expect(classroom.Name).toBe("2");
    expect(classroom.Seats).toBe(120);
});

test('Classroom by id is empty', async() => {
    const classroom = await dao.getClassRoomById(0);
    expect(classroom).toStrictEqual([]);
});

test('Get lectures for student "900000"', async() => {
    const lectures = await dao.getLectures("900000", range1, range2);
    expect(lectures).toBeDefined();
    expect(lectures.length).toBe(3);
});

test('Get lectures for student "900001"', async() => {
    const lectures = await dao.getLectures("900001", range1, range2);
    expect(lectures).toBeDefined();
    expect(lectures.length).toBe(2);
});

test('Check course for student "900000"', async() => {
    const course = await dao.checkStudentCourses("900000", 32);
    expect(course.ok).toBeTruthy();
});

test('Check course for student "900001"', async() => {
    const course = await dao.checkStudentCourses("900001", 32);
    expect(course.ok).toBeFalsy();
});

test('Check course for teacher "d0000"', async() => {
    const course = await dao.checkTeacherCourses("d9000", 1);
    expect(course.ok).toBeTruthy();
});

test('Check course for teacher "d0001"', async() => {
    const course = await dao.checkTeacherCourses("d9001", 1);
    expect(course.ok).toBeFalsy();
});

test('Get lecture info', async() => {
    const info = await dao.getLectureInfo(65);
    expect(info).toBeDefined();
    expect(info.CourseName).toBe("Informatica");
});

test('Get lecture info with valid course and date', async() => {
    const info = await dao.getLectureInfoWithCourseAndDate("XY4911", "2020-10-06 13:00");
    expect(info).toBeDefined();
    expect(info.CourseName).toBe("Chimica");
    expect(info.LectureId).toBeGreaterThanOrEqual(32);
});

test('Get lecture info with invalid course and date', async() => {
    const info = await dao.getLectureInfoWithCourseAndDate("XY4922", "2020-10-06 13:00");
    expect(info).toBeUndefined();
});

test('Get student info fulfilled', async() => {
    const student = await dao.getStudentInfo("900000");
    expect(student).toBeDefined();
    expect(student.Email).toBe("s900000@students.politu.it");
});

test('Get student info empty', async() => {
    const student = await dao.getStudentInfo(0);
    expect(student).toBeUndefined();
});

test('Book lecture for student enrolled', async() => {
    const book = await dao.bookLecture("900000", 44);
    expect(book).toBeDefined();
});

test('Book lecture for student not enrolled', async() => {
    const book = await dao.bookLecture("900001", 44);
    expect(book.error).toBe("student not enrolled");
});

test('Check booked lecture for student 900000', async() => {
    const booking = await dao.checkBooking("900000", 44);
    expect(booking.ok).toBeFalsy();
});

test('Check not booked lecture for student 900001', async() => {
    const booking2 = await dao.checkBooking("900001", 1);
    expect(booking2.ok).toBeTruthy();
});

test('Check booking for student not enrolled', async() => {
    const booking = await dao.checkBooking("900001", 32);
    expect(booking.error).toBe("student not enrolled");
});

test('Book lecture for student already booked', async() => {
    const book = await dao.bookLecture("900000", 44);
    expect(book).toBeDefined();
    expect(book.error).toBe("already booked");
});

test('Get seats count for lecture', async() => {
    const seats = await dao.getSeatsCount(28);
    expect(seats).toBeDefined();
    expect(seats.BookedSeats).toBe(0);
    expect(seats.TotalSeats).toBe(120);

    const book = await dao.bookLecture("900000", 28);
    expect(book).toBeDefined();

    const seats2 = await dao.getSeatsCount(28);
    expect(seats2).toBeDefined();
    expect(seats2.BookedSeats).toBe(1);
    expect(seats2.TotalSeats).toBe(120);

    const cancel = await dao.cancelBooking(book.BookingId);
    expect(cancel).toBe("OK");
});

test('Get lectures for teacher', async() => {
    const lectures = await dao.getTeacherLectures("d9000", range1, range2);
    expect(lectures).toBeDefined();
    expect(lectures.length).toBe(3);
});

test('Get students for lecture', async() => {
    const book = await dao.bookLecture("900000", 28);
    expect(book).toBeDefined();

    const students = await dao.getStudents("d9000", 28);
    expect(students).toBeDefined();
    expect(students.length).toBe(1);
    expect(students[0].BookingId).toBe(book.BookingId);
    expect(students[0].StudentId).toBe("900000");

    const cancel = await dao.cancelBooking(book.BookingId);
    expect(cancel).toBe("OK");
});

test('Get next student in line', async() => {
    const book1 = await dao.bookLecture("900000", 13);
    expect(book1).toBeDefined();

    const book2 = await dao.bookLecture("900001", 13);
    expect(book2).toBeDefined();

    const line = await dao.getNextInLine(book2.BookingId);
    expect(line).toBeDefined(); 
    expect(line.StudentId).toBe("900001");

    const cancel1 = await dao.cancelBooking(book1.BookingId);
    expect(cancel1).toBe("OK");

    const cancel2 = await dao.cancelBooking(book2.BookingId);
    expect(cancel2).toBe("OK");
});

test('Get bookings for student 900000', async() => {
    const book = await dao.bookLecture("900000", 28);
    expect(book).toBeDefined();

    const bookings = await dao.getBookings("900000");
    expect(bookings).toBeDefined();
    //expect(bookings.length).toBe(1);

    const cancel = await dao.cancelBooking(book.BookingId);
    expect(cancel).toBe("OK");
});

test('Get email info', async() => {
    const book = await dao.bookLecture("900000", 28);
    expect(book).toBeDefined();

    const info = await dao.getEmailInfo(28);
    expect(info).toBeDefined();
    expect(info.length).toBe(1);
    expect(info[0].Email).toBe("s900000@students.politu.it");

    const cancel = await dao.cancelBooking(book.BookingId);
    expect(cancel).toBe("OK");
});

test('Cancel lecture for authorized teacher', async() => {
    const cancel = await dao.changeLecture("d9001", 75, 1);
    expect(cancel).toBe("OK");
});

test('Move lecture to remote for authorized teacher', async() => {
    const move = await dao.changeLecture("d9001", 74, 2);
    expect(move).toBe("OK");
});

test('Move lecture to remote for unauthorized teacher', async() => {
    const move = await dao.changeLecture("d9000", 89, 2);
    expect(move.error).toBe("unauthorized access");
});

test('Get all lectures for email', async() => {
    //useless test, only for coverage
    const list = await dao.getAllLecturesForEmail();
    expect(list).toBeDefined();
});

test('Set email sent', async() => {
    //useless test, only for coverage
    const email = await dao.SetEmailSent(1);
    expect(email).toBeDefined();
    expect(email).toBe("OK");
});

test('Book canceled lecture for student enrolled', async() => {
    const book = await dao.bookLecture("900003", 75);
    expect(book).toBeDefined();
    expect(book.error).toBe("lecture not bookable");
});

test('Get lectures for course in time range', async() => {
    const lectures = await dao.getCourseLecture("XY1211", range1, range2);
    expect(lectures).toBeDefined();
    expect(lectures.length).toBe(2);
});

test('Get courses of teacher d9000', async() => {
    const nc = await dao.getTeacherCourses("d9000");
    expect(nc).toBeDefined();
    expect(nc.length).toBe(2);
});

test('Get courses of teacher d9001', async() => {
    const nc = await dao.getTeacherCourses("d9001");
    expect(nc).toBeDefined();
    expect(nc.length).toBe(3);
});

test('Get all courses', async() => {
    const courses = await dao.getAllCourses();
    expect(courses).toBeDefined();
    expect(courses.length).toBe(5);
});

test('Get lecture lower date between lectures', async() => {
    const lecture = await dao.getLectureInfoWithCourseAndDate("XY1211", "2020-12-01 16:00");
    expect(lecture).toBeDefined();
    const low = await dao.getLowerDate(lecture.LectureId, 2);
    expect(low).toBeDefined();
    expect(low.Date).toBe("2020-11-24 16:00");
});

test('Get lecture higher date between lectures', async() => {
    const lecture = await dao.getLectureInfoWithCourseAndDate("XY1211", "2020-12-01 16:00");
    expect(lecture).toBeDefined();
    const high = await dao.getHigherDate(lecture.LectureId, 2);
    expect(high).toBeDefined();
    expect(high.Date).toBe("2020-12-08 16:00");
});

test('Get tot for lectures in week' , async() => {
    const lecture1 = await dao.getLectureInfoWithCourseAndDate("XY1211", "2020-10-12 11:30");
    expect(lecture1).toBeDefined();
    const book = await dao.bookLecture("900000", lecture1.LectureId);
    expect(book).toBeDefined();
    const cancel1 = await dao.cancelBooking(book.BookingId);
    expect(cancel1).toBe("OK");
    const lecture2 = await dao.getLectureInfoWithCourseAndDate("XY1211", "2020-10-13 16:00");
    expect(lecture2).toBeDefined();
    const book1 = await dao.bookLecture("900000", lecture2.LectureId);
    expect(book1).toBeDefined();
    const book2 = await dao.bookLecture("900001", lecture2.LectureId);
    expect(book2).toBeDefined();
    const cancel2 = await dao.cancelBooking(book1.BookingId);
    expect(cancel2).toBe("OK");
    const week = await dao.getStatistics("XY1211", "week", "2020-10-12", "2020-10-16");
    expect(week).toBeDefined();
    expect(week.length).toBe(1);
    expect(week[0].SumBooked).toBe(1);
    expect(week[0].SumCancelled).toBe(2);
    expect(week[0].TotLectures).toBe(2);
    expect(week[0].TotHeld).toBe(2);
});

test('Get tot for lectures in month' , async() => {
    const lecture = await dao.getLectureInfoWithCourseAndDate("XY2312", "2020-11-09 8:30");
    expect(lecture).toBeDefined();

    const book = await dao.bookLecture("900005", lecture.LectureId);
    expect(book).toBeDefined();

    const month = await dao.getStatistics("XY2312", "month", "2020-10-15", "2020-11-15");
    expect(month).toBeDefined();
    expect(month.length).toBe(2);
    expect(month[0].SumBooked).toBe(1);
    expect(month[0].SumCancelled).toBe(0);
    expect(month[0].TotLectures).toBe(3);
    expect(month[0].TotHeld).toBe(2);
});

test('Get tot for lectures in lecture' , async() => {
    const lecture = await dao.getLectureInfoWithCourseAndDate("XY8612", "2020-10-26 8:30");
    expect(lecture).toBeDefined();

    const low = await dao.getLowerDate(lecture.LectureId, 2);
    expect(low).toBeDefined();
    expect(low.Date).toBe("2020-10-12 8:30");

    const high = await dao.getHigherDate(lecture.LectureId, 2);
    expect(high).toBeDefined();
    expect(high.Date).toBe("2020-11-9 8:30");

    const book = await dao.bookLecture("900003", lecture.LectureId);
    expect(book).toBeDefined();

    const lec = await dao.getStatistics("XY8612", "lecture", low.Date, high.Date);
    expect(lec).toBeDefined();
    expect(lec.length).toBe(3);
    expect(lec[0].SumBooked).toBe(0);
    expect(lec[0].SumCancelled).toBe(1);
    expect(lec[0].TotLectures).toBe(1);
    expect(lec[0].TotHeld).toBe(1);
});

test('Contact tracing for student "900001', async() => {
    const book1 = await dao.bookLecture("900000", 13);
    expect(book1).toBeDefined();
    const book2 = await dao.bookLecture("900001", 13);
    expect(book2).toBeDefined();
    const tracing = await dao.generateContactTracingReport("900001", "2020-10-20");
    expect(tracing).toBeDefined();
    expect(tracing.length).toBe(2);
});

test('Insert report for student "900001"', async() => {
    const pathPDF="http://localhost:3001/report_900001"+ "_" + "2020-10-20" + ".pdf";
    const pathCSV="http://localhost:3001/report_900001"+ "_" + "2020-10-20" + ".csv";
    const report = await dao.insertReport("900001", "2020-10-20", pathPDF, pathCSV);
    expect(report).toBeDefined();
    expect(report).toBe(1);
});

test('Put restrictions', async() => {
    const res = await dao.putRestrictions(1, range2);
    expect(res).toBeDefined();
    expect(res).toBe("OK");
});

test('Get restricted years with restrictions', async() => {
    const res = await dao.getRestrictedYears();
    expect(res).toBeDefined();
    expect(res.length).toBe(5);
    expect(res[0].Restricted).toBe(1);
});

test('Lift restrictions', async() => {
    const lift = await dao.liftRestrictions(1, range2);
    expect(lift).toBeDefined();
    expect(lift).toBe("OK");
});

test('Get restricted years with no restrictions', async() => {
    const res = await dao.getRestrictedYears();
    expect(res).toBeDefined();
    expect(res.length).toBe(5);
    expect(res[0].Restricted).toBe(0);
});

test('Set student absent for teacher d9000', async() => {
    const book = await dao.bookLecture("900000", 1);
    expect(book).toBeDefined();
    const res = await dao.updatePresence(0, book.BookingId, "d90000");
    expect(res).toBeDefined();
    expect(res).toBe("OK");
});

test('Set student present for teacher d9000', async() => {
    const book = await dao.bookLecture("900001", 1);
    expect(book).toBeDefined();
    const res = await dao.updatePresence(1, book.BookingId, "d90000");
    expect(res).toBeDefined();
    expect(res).toBe("OK");
});

test('Get all classrooms', async() => {
    const classes = await dao.getClassRooms(1);
    expect(classes).toBeDefined();
    expect(classes.length).toBe(4);
});

test('Get big classrooms', async() => {
    const classes = await dao.getClassRooms(100);
    expect(classes).toBeDefined();
    expect(classes.length).toBe(1);
});

test('Get schedule from lecture', async() => {
    const lecture = await dao.getLectureInfoWithCourseAndDate("XY2312", "2020-11-02 8:30");
    expect(lecture).toBeDefined();
    const schedule = await dao.getScheduled(lecture.LectureId);
    expect(schedule).toBeDefined();
    expect(schedule.length).toBe(11);
});

test('Update lecture with new schedule', async() => {
    const lecture = await dao.getLectureInfoWithCourseAndDate("XY8612", "2021-01-11 8:30");
    expect(lecture).toBeDefined();
    const up = await dao.updateLecture("2021-01-12 11:30", "2021-01-12 13:00", 2, lecture.LectureId);
    expect(up).toBeDefined();
    expect(up).toBe("OK");
    /*const info = await dao.getLectureInfo(lecture.LectureId);
    expect(info).toBeDefined();
    expect(info.ClassroomName).toBe("2");
    expect(info.Start).toBe("2021-01-12 11:30");*/
});

test('Update table schedule with schedule id', async() => {
    const lecture = await dao.getLectureInfoWithCourseAndDate("XY2312", "2021-01-11 8:30");
    expect(lecture).toBeDefined();
    const schedule = await dao.getScheduled(lecture.LectureId);
    expect(schedule).toBeDefined();
    const up = await dao.updateScheduleRecord("Wed", "14:30-17:30", 2, lecture.ScheduleId);
    expect(up).toBeDefined();
    expect(up).toBe("OK");
});

test('Update schedule', async() => {
    const lecture = await dao.getLectureInfoWithCourseAndDate("XY6012", "2020-10-19 10:00");
    expect(lecture).toBeDefined();
    const up = await dao.updateSchedule(lecture.LectureId, "Wed", "14:30", "16:00", 0, 1);
    expect(up).toBeDefined();
    expect(up).toBe("OK");
    const info = await dao.getLectureInfo(lecture.LectureId);
    expect(info).toBeDefined();
    expect(info.ClassroomName).toBe("1");
    expect(info.CourseId).toBe("XY6012");
});

test('Get booked lecture info', async() => {
    const book = await dao.bookLecture("900007", 58);
    expect(book).toBeDefined();
    const info = await dao.getBookedLectureInfo(58);
    expect(info).toBeDefined();
    expect(info.length).toBe(1);
    expect(info[0].UserId).toBe("900007");
    const dequeue = await dao.deQueue(book.BookingId);
    expect(dequeue).toBeDefined();
    expect(dequeue).toBe("OK");
});

test('Dequeue student from bookings', async() => {
    //useless test, only for coverage
    const book = await dao.bookLecture("900005", 92);
    expect(book).toBeDefined();
    const dequeue = await dao.deQueue(book.BookingId);
    expect(dequeue).toBeDefined();
    expect(dequeue).toBe("OK");
});

afterAll(async() => {
    for (stat of stats) {
        try {
            await db.run(stat);
        }
        catch(e) {
            console.log(e);
        }
    }

    /*try {
        await db.run(stats[3]);
    }
    catch(e) {
        console.log(e);
    }*/
});