const moment = require('moment');
const dao = require('../dao');
const sqlite = require('sqlite3').verbose();

const db = new sqlite.Database('./PULSEeBS_db_TEST',(err)=>{
    if(err){
         console.error(err.message);
         throw err;
    }
});

dao.db = this.db;
let today = new Date();
const monday = new Date(today.setDate(today.getDate() - today.getDay() + 8));
today = new Date();
const wednesday = new Date(today.setDate(today.getDate() - today.getDay() + 10));
today = new Date();
const friday = new Date(today.setDate(today.getDate() - today.getDay() + 12));
const start1 = moment(monday.setHours(8, 30, 0, 0)).format("YYYY-MM-DD HH:mm:ss");
const end1 = moment(monday.setHours(11, 30, 0, 0)).format("YYYY-MM-DD HH:mm:ss");
const start2 = moment(wednesday.setHours(10, 0, 0, 0)).format("YYYY-MM-DD HH:mm:ss");
const end2 = moment(wednesday.setHours(11, 30, 0, 0)).format("YYYY-MM-DD HH:mm:ss");
const start3 = moment(wednesday.setHours(10, 0, 0, 0)).format("YYYY-MM-DD HH:mm:ss");
const end3 = moment(wednesday.setHours(13, 0, 0, 0)).format("YYYY-MM-DD HH:mm:ss"); 
const start4 = moment(friday.setHours(10, 0, 0, 0)).format("YYYY-MM-DD HH:mm:ss");
const end4 = moment(friday.setHours(13, 0, 0, 0)).format("YYYY-MM-DD HH:mm:ss"); 

const range1 = moment(monday.setHours(0, 0, 0, 0)).format("YYYY-MM-DD");
const range2 = moment(friday.setHours(23, 59, 59, 0)).format("YYYY-MM-DD");
console.log(range1);
console.log(range2);

const stats = ["DELETE FROM Booking", 
            "DELETE FROM Lecture",
            `INSERT INTO Lecture(LectureId, CourseId, Start, End, State, ClassRoomId) VALUES (1, 2, '${start1}', '${end1}', 0, 3)`,
            `INSERT INTO Lecture(LectureId, CourseId, Start, End, State, ClassRoomId) VALUES (2, 2, '${start2}', '${end2}', 0, 4)`,
            `INSERT INTO Lecture(LectureId, CourseId, Start, End, State, ClassRoomId) VALUES (3, 3, '${start3}', '${end3}', 0, 5)`,
            `INSERT INTO Lecture(LectureId, CourseId, Start, End, State, ClassRoomId) VALUES (4, 3, '${start4}', '${end4}', 0, 3)`];


db.run(stats[0], (err, rows) => {
    if (err) {
        console.log(err);
    }

    db.run(stats[1], (err, rows) => {
        if (err) {
            console.log(err);
        }

        db.run(stats[2], (err, rows) => {
            if (err) {
                console.log(err);
            }

            db.run(stats[3], (err, rows) => {
                if (err) {
                    console.log(err);
                }

                db.run(stats[4], (err, rows) => {
                    if (err) {
                        console.log(err);
                    }

                    db.run(stats[5], (err, rows) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                });
            });
        });
    });
});


test('User is defined', async() => {
    const user = await dao.getUser("teacher1@gmail.com");
    expect(user).toBeDefined();
    expect(user.UserId).toBe(7);
});

test('User is undefined', async() => {
    const user = await dao.getUser("tea1@gmail.com");
    expect(user).toBeUndefined();
});

test('User by id is defined', async() => {
    const user = await dao.getUserById(7)
    expect(user).toBeDefined();
    expect(user.Email).toBe("teacher1@gmail.com");
});

test('User by id is empty', async() => {
    const user = await dao.getUser(0);
    expect(user).toBeUndefined;
});

/*test('Different passwords', async() => {
    const hash = dao.generateHash("pw")
    expect(hash).toBeDefined();
    const res = await dao.checkPassword("pwd", hash);
    expect(res).toBeFalsy();
});

test('Equal passwords', async() => {
    const hash = dao.generateHash("pwd");
    expect(hash).toBeDefined();
    const res = await dao.checkPassword("pwd", hash);
    expect(res).toBeTruthy();
});*/

test('Get lectures for student', async() => {
    const lectures = await dao.getLectures(6, range1, range2);
    expect(lectures).toBeDefined();
    expect(lectures.length).toBe(4);
});

test('Check bookings for student 6', async() => {
    const booking = await dao.checkBooking(6, 5);
    expect(booking.ok).toBeTruthy();
});

test('Check bookings for student 8', async() => {
    const booking = await dao.checkBooking(8, 5);
    expect(booking.ok).toBeFalsy();
});

test('Check course for student 6', async() => {
    const course = await dao.checkStudentCourses(6, 6);
    expect(course.ok).toBeTruthy();
});

test('Check course for student 8', async() => {
    const course = await dao.checkStudentCourses(8, 6);
    expect(course.ok).toBeFalsy();
});

test('Check course for teacher 7', async() => {
    const course = await dao.checkTeacherCourses(7, 6);
    expect(course.ok).toBeTruthy();
});

/*test('Check course for teacher 8', async() => {
    const course = await dao.checkTeacherCourses(8, 6);
    expect(course.ok).toBeFalsy();
});*/

test('Get lecture info', async() => {
    const info = await dao.getLectureInfo(6);
    expect(info).toBeDefined();
    expect(info.CourseName).toBe("Web Applications");
});

test('Get student info fulfilled', async() => {
    const student = await dao.getStudentInfo(6);
    expect(student).toBeDefined();
    expect(student.Email).toBe("student1@gmail.com");
});

test('Get student info empty', async() => {
    const student = await dao.getStudentInfo(0);
    expect(student).toBeUndefined();
});

test('Book lecture for student', async() => {
    const book = await dao.bookLecture(8, 5);
    expect(book).toBeDefined();
});

test('Book lecture for student already booked', async() => {
    dao.bookLecture(8, 5).then(async function(book) {
        expect(book).toBeDefined();
        expect(book.error).toBe("already booked");

        const cancel = await dao.cancelBooking(book.BookingId);
        expect(cancel).toBe("OK");
    });
});

test('Get seats count for lecture', async() => {
    const seats = await dao.getSeatsCount(6);
    expect(seats).toBeDefined();
    expect(seats.BookedSeats).toBe(0);
    expect(seats.TotalSeats).toBe(50);

    dao.bookLecture(8, 6).then(async function(book) {
        expect(book).toBeDefined();

        const seats2 = await dao.getSeatsCount(6);
        expect(seats2).toBeDefined();
        expect(seats2.BookedSeats).toBe(1);
        expect(seats2.TotalSeats).toBe(50);
    });
});

test('Get lectures for teacher', async() => {
    const lectures = await dao.getTeacherLectures(7, range1, range2);
    expect(lectures).toBeDefined();
    expect(lectures.length).toBe(4);
});

test('Get students for lecture', async() => {
    dao.bookLecture(6, 10).then(async function(book) {
        expect(book).toBeDefined();

        const students = await dao.getStudents(7, 10);
        expect(students).toBeDefined();
        expect(students.length).toBe(1);
        expect(students[0].BookingId).toBe(book.BookingId);
        expect(students[0].StudentId).toBe(6);

        const cancel = await dao.cancelBooking(book.BookingId);
        expect(cancel).toBe("OK");
    });
});

test('Get bookings for student', async() => {
    dao.bookLecture(6, 10).then(async function(book) {
        expect(book).toBeDefined();

        dao.getBookings(6).then(async function(bookings) {
            expect(bookings).toBeDefined();
            expect(bookings.length).toBe(1);

            const cancel = await dao.cancelBooking(book.BookingId);
            expect(cancel).toBe("OK");
        });
    });
});

/*test('Get next student in line', async() => {
    const line = await dao.getNextInLine(34);
    expect(line).toBe({});
});*/

/*test('Cancel booking for student', async() => {
    const booking = await dao.cancelBooking(33);
    expect(booking).toBeDefined();
    expect(booking).toBe("OK");
});*/

/*test('Get email info', async() => {
    
});*/

test('Cancel lecture for teacher', async() => {
    dao.changeLecture(7, 7, 0).then(async function(reset) {
        expect(reset).toBe("OK");   //reset lecture status

        const cancel = await dao.changeLecture(7, 7, 1);
        expect(cancel).toBe("OK");
        await dao.changeLecture(7, 7, 0);
    });
});

test('Move lecture to remote for teacher', async() => {
    dao.changeLecture(7, 8, 0).then(async function(reset) {
        expect(reset).toBe("OK");   //reset lecture status

        const move = await dao.changeLecture(7, 8, 2);
        expect(move).toBe("OK");
        await dao.changeLecture(7, 8, 0);
    });
});