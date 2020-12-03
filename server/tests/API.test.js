const moment = require('moment');
const fs = require('fs');
const dao = require('../dao');

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

const db = dao.initializeDBConn('./PULSEeBS_db_TEST');

beforeAll(() => {
    const stats = ["DELETE FROM Booking", 
            "DELETE FROM Lecture",
            `INSERT INTO Lecture(LectureId, CourseId, Start, End, State, ClassRoomId) VALUES (1, 2, '${start1}', '${end1}', 0, 3)`,
            `INSERT INTO Lecture(LectureId, CourseId, Start, End, State, ClassRoomId) VALUES (2, 2, '${start2}', '${end2}', 0, 5)`,
            `INSERT INTO Lecture(LectureId, CourseId, Start, End, State, ClassRoomId) VALUES (3, 3, '${start3}', '${end3}', 0, 4)`,
            `INSERT INTO Lecture(LectureId, CourseId, Start, End, State, ClassRoomId) VALUES (4, 3, '${start4}', '${end4}', 0, 3)`];

    db.run(stats[0], (err1, rows1) => {
        if (err) {
            console.log(err1);
        }

        db.run(stats[1], (err2, rows2) => {
            if (err) {
                console.log(err3);
            }

            db.run(stats[2], (err3, rows3) => {
                if (err) {
                    console.log(err3);
                }

                db.run(stats[3], (err4, rows4) => {
                    if (err) {
                        console.log(err4);
                    }

                    db.run(stats[4], (err5, rows5) => {
                        if (err) {
                            console.log(err5);
                        }

                        db.run(stats[5], (err6, rows6) => {
                            if (err) {
                                console.log(err6);
                            }
                        });
                    });
                });
            });
        });
    });
});

beforeEach(() => jest.resetAllMocks());

test('User is defined', () => {
    dao.getUser("teacher1@gmail.com").then((user) => {
        expect(user).toBeDefined();
        expect(user.UserId).toBe(7);
    });
});

test('User is undefined', () => {
    dao.getUser("tea1@gmail.com").then((user) => {
        expect(user).toBeUndefined();
    });
});

test('User by id is defined', () => {
    dao.getUserById(7).then((user) => {
        expect(user).toBeDefined();
        expect(user.Email).toBe("teacher1@gmail.com");
    });
});

test('User by id is empty', () => {
    dao.getUser(0).then((user) => {
        expect(user).toBeUndefined;
    });
});

test('Get lectures for student 6', () => {
    dao.getLectures(6, range1, range2).then((lectures) => {
        expect(lectures).toBeDefined();
        console.log(lectures.length)
        expect(lectures.length).toBe(4);
    });
});

test('Get lectures for student 8', () => {
    dao.getLectures(8, range1, range2).then((lectures) => {
        expect(lectures).toBeDefined();
        expect(lectures.length).toBe(2);
    });
});

test('Check course for student 6', () => {
    dao.checkStudentCourses(6, 3).then((course) => {
        expect(course.ok).toBeTruthy();
    });
});

test('Check course for student 8', () => {
    dao.checkStudentCourses(8, 3).then((course) => {
        expect(course.ok).toBeFalsy();
    });
});

test('Check course for teacher 7', () => {
    dao.checkTeacherCourses(7, 1).then((course) => {
        expect(course.ok).toBeTruthy();
    });
});

test('Get lecture info', () => {
    dao.getLectureInfo(3).then((info) => {
        expect(info).toBeDefined();
        expect(info.CourseName).toBe("Web Applications");
    });
});

test('Get student info fulfilled', () => {
    dao.getStudentInfo(6).then((student) => {
        expect(student).toBeDefined();
        expect(student.Email).toBe("student1@gmail.com");
    });
});

test('Get student info empty', () => {
    dao.getStudentInfo(0).then((student) => {
        expect(student).toBeUndefined();
    });
});

test('Book lecture for student enrolled', () => {
    dao.bookLecture(6, 3).then((book) => {
        expect(book).toBeDefined();
    });
});

test('Book lecture for student not enrolled', () => {
    dao.bookLecture(8, 3).then((book) => {
        expect(book.error).toBe("student not enrolled");
    });
});

test('Check bookings for students enrolled', () => {
    dao.checkBooking(6, 3).then((booking) => {
        expect(booking.ok).toBeFalsy();
        
        dao.checkBooking(8, 1).then((booking2) => {
            expect(booking2.ok).toBeTruthy();
        });
    });
});

test('Check bookings for students not enrolled', () => {
    dao.checkBooking(8, 3).then((booking) => {
        expect(booking.error).toBe("student not enrolled");
    });
});

test('Book lecture for student already booked', () => {
    dao.bookLecture(6, 3).then(function(book) {
        expect(book).toBeDefined();
        expect(book.error).toBe("already booked");

        dao.cancelBooking(book.BookingId).then((cancel) => {
            expect(cancel).toBe("OK");
        });
    });
});

test('Get seats count for lecture', () => {
    dao.getSeatsCount(1).then((seats) => {
        expect(seats).toBeDefined();
        expect(seats.BookedSeats).toBe(0);
        expect(seats.TotalSeats).toBe(50);

        dao.bookLecture(6, 1).then(function(book) {
            expect(book).toBeDefined();

            dao.getSeatsCount(1).then((seats2) => {
                expect(seats2).toBeDefined();
                expect(seats2.BookedSeats).toBe(1);
                expect(seats2.TotalSeats).toBe(50);

                dao.cancelBooking(book.BookingId).then((cancel) => {
                    expect(cancel).toBe("OK");
                });
            });
        });
    });
});

test('Get lectures for teacher', () => {
    dao.getTeacherLectures(7, range1, range2).then((lectures) => {
        expect(lectures).toBeDefined();
        expect(lectures.length).toBe(4);
    });
});

test('Get students for lecture', () => {
    dao.bookLecture(6, 2).then(function(book) {
        expect(book).toBeDefined();

        dao.getStudents(7, 2).then((students) => {
            expect(students).toBeDefined();
            expect(students.length).toBe(1);
            expect(students[0].BookingId).toBe(book.BookingId);
            expect(students[0].StudentId).toBe(6);

            dao.cancelBooking(book.BookingId).then((cancel) => {
                expect(cancel).toBe("OK");
            });
        });
    });
});

test('Get bookings for student', () => {
    dao.bookLecture(6, 2).then(function(book) {
        expect(book).toBeDefined();

        dao.getBookings(6).then(function(bookings) {
            expect(bookings).toBeDefined();
            expect(bookings.length).toBe(1);

            dao.cancelBooking(book.BookingId).then((cancel) => {
                expect(cancel).toBe("OK");
            });
        });
    });
});

test('Get next student in line', () => {
    dao.bookLecture(6, 2).then(function(book1) {
        expect(book1).toBeDefined();

        dao.bookLecture(8, 2).then(function(book2) {
            expect(book2).toBeDefined();

            dao.getNextInLine(book2.BookingId).then(function(line) {
                expect(line).toBeDefined();
                expect(line.StudentId).toBe(8);

                dao.cancelBooking(book.BookingId).then((cancel1) => {
                    expect(cancel1).toBe("OK");

                    dao.cancelBooking(book.BookingId).then((cancel2) => {
                        expect(cancel2).toBe("OK");
                    });
                });
            });
        });
    });
});

test('Cancel lecture for teacher', () => {
    dao.changeLecture(7, 3, 1).then((cancel) => {
        expect(cancel).toBe("OK");
        //await dao.changeLecture(7, 3, 0);
    });
});

test('Move lecture to remote for teacher', () => {
    dao.changeLecture(7, 4, 2).then((move) => {
        expect(move).toBe("OK");
        //await dao.changeLecture(7, 4, 0);
    });
});

test('Book canceled lecture for student enrolled', () => {
    dao.bookLecture(6, 3).then((book) => {
        expect(book).toBeDefined();
    });
});

test('Insert teachers in db', () => {
    fs.readFile("teachersCSV.csv", "utf8", (err, data) => {
        dao.addTeachers(data).then((added) => {
            expect(added).toBeDefined();
            expect(added.length).toBe(2);
        });
    });
});

test('Insert students in db', () => {
    fs.readFile("studentsCSV.csv", "utf8", (err, data) => {
        dao.addStudents(data).then((data) => {
            expect(added).toBeDefined();
            expect(added.length).toBe(2);
        });
    });
});

test('Insert courses in db', () => {
    fs.readFile("coursesCSV.csv", "utf8", (err, data) => {
        dao.addCourses(data).then((added) => {
            expect(added).toBeDefined();
            expect(added.length).toBe(2);
        });
    });
});

test('Insert enrollments in db', () => {
    fs.readFile("enrollmentsCSV.csv", "utf8", (err, data) => {
        dao.addEnrollments(data).then((added) => {
            expect(added).toBeDefined();
            expect(added.length).toBe(2);
        });
    });
});

test('Insert lectures in db', () => {
    fs.readFile("lecturesCSV.csv", "utf8", (err, data) => {
        dao.addLectures(data).then((added) => {
            expect(added).toBeDefined();
            expect(added.length).toBe(4);
        });
    });
});

test('Insert classrooms in db', () => {
    fs.readFile("classroomsCSV.csv", "utf8", (err, data) => {
        dao.addClassrooms(data).then((added) => {
            expect(added).toBeDefined();
            expect(added.length).toBe(4);
        });
    });
});

test('Get lectures for course in time range', () => {
    dao.getCourseLecture(2, range1, range2).then((lectures) => {
        expect(lectures).toBeDefined();
        expect(lectures.length).toBe(2);
    });
});

test('Get courses of teacher', () => {
    dao.getTeacherCourses(7).then((nc) => {
        expect(nc).toBeDefined();
        expect(nc.length).toBe(3);
    });
});

test('Get all courses', () => {
    dao.getAllCourses().then((courses) => {
        expect(courses).toBeDefined();
        expect(courses.length).toBe(3);
    });
});

test('Get lecture lower date between lectures', () => {
    dao.getLowerDate(1, 0).then((low) => {
        expect(low).toBeDefined();
        //expect(high.Date).toBe("2020-12-07 08:30:00");;
    });
});

test('Get lecture higher date between lectures', () => {
    dao.getHigherDate(1, 0).then((high) => {
        expect(high).toBeDefined();
        //expect(high.Date).toBe("2020-12-07 08:30:00");;
    });
});

test('Get tot for lectures in week' , () => {
    dao.getStatistics(2, "week", range1, range2).then((week) => {
        expect(week).toBeDefined();
        expect(week.SumBooked).toBe(3);
        expect(week.TotLectures).toBe(2);
        expect(week.TotHeld).toBe(2);
    });
});

test('Get tot for lectures in month' , () => {
    dao.getStatistics(2, "month", range1, range2).then((month) => {
        expect(month).toBeDefined();
        expect(month.SumBooked).toBe(4);
        expect(month.TotLectures).toBe(2);
        expect(month.TotHeld).toBe(2);
    });   
});

test('Get tot for lectures in lecture' , () => {
    dao.getLowerDate(1, 0).then((low) => {
        expect(low).toBeDefined();
        //expect(high.Date).toBe("2020-12-07 08:30:00");;
    });

    dao.getHigherDate(1, 0).then((high) => {
        expect(high).toBeDefined();
        //expect(high.Date).toBe("2020-12-07 08:30:00");;
    });

    /*dao.getStatistics(2, "lecture", range1, range2).then(() => {

    });*/
    /*expect(n).toBeDefined();
    expect(n.SumBooked).toBe(1);
    expect(n.TotLectures).toBe(1);
    expect(n.TotHeld).toBe(1);*/
});