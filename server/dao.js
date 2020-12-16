const sqlite=require('sqlite3').verbose();
const bcrypt=require('bcrypt');
const emailer=require('./email');
const csvtojson = require('csvtojson');
const moment=require('moment');
const { ftruncateSync } = require('fs');


const bookinConfirmationText="<p>Dear %NAME% %SURNAME%,<br/>you were succesfully booked to lecture \"%LECTURE%\"  %TIME%, classroom %CLASSROOM%<p>";
const bookinEnqueueText="<p>Dear %NAME% %SURNAME%,<br/>the lecture you were trying to book (lecture %LECTURE% at %TIME%, classroom %CLASSROOM%) is full </br> you will be notified if a seats will be available <p>";
const bookinDequeueText="<p>Dear %NAME% %SURNAME%,<br/>the lecture you were trying to book (lecture %LECTURE% at %TIME%, classroom %CLASSROOM%) is now available </br> you can now attend the lecture <p>";
const lectureDeletedText="<p>Dear %NAME% %SURNAME%,<br/>the lecture  %LECTURE% at %TIME%, classroom %CLASSROOM% has been canceled";
const lectureChangedText="<p>Dear %NAME% %SURNAME%,<br/>the lecture  %LECTURE% at %TIME%, classroom %CLASSROOM% will be held online";

const subject="LECTURE BOOKING INFO";

let db;
//open db connection
exports.initializeDBConn = function(dbName) {
    db = new sqlite.Database(dbName,(err)=>{
        if (err) {
            throw err;
        }
    });

    return db;
}

exports.getUser=function(username){
    return new Promise(
        (resolve,reject)=>{
            const sql="SELECT * FROM User WHERE Email= ?";
            db.all(sql,[username],(err,rows)=>{
                    if (err){
                        reject(err);
                    }
                    else if(rows.length===0){
                        resolve(undefined)
                    }else {
                        resolve(rows[0]);
                    }
                }
            );
        }
    );
}

exports.getUserById = function (userid) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM User WHERE UserId = ?";
        db.all(sql, [userid], (err, rows) => {
            if (err) 
                reject(err);
            else if (rows.length === 0)
                resolve([]);
            else{
                resolve(rows[0]);
            }
        });
    });
  };

exports.getCourseById = function (courseId) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Course WHERE CourseId = ?";
        db.all(sql, [courseId], (err, rows) => {
            if (err) 
                reject(err);
            else if (rows.length === 0)
                resolve([]);
            else{
                resolve(rows[0]);
            }
        });
    });
};

exports.getClassRoomById = function (classroomId) {
    return new Promise((resolve, reject) => {
        const sql = "SELECT * FROM Classroom WHERE ClassroomId = ?";
        db.all(sql, [classroomId], (err, rows) => {
            if (err) 
                reject(err);
            else if (rows.length === 0)
                resolve([]);
            else{
                resolve(rows[0]);
            }
        });
    });
};

//caompares two crypted passwords
exports.checkPassword=function(clearpwd,password){
    return bcrypt.compareSync(clearpwd,password);
}


//WARNING: TO BE REMOVED IN FINAL VERSION!!!!
exports.generateHash=function(newpassword){
    bcrypt.hash(newpassword, 10, function(err, hash) {
        return hash;
    })
};


//return lectures a student can book in a certain time frame
exports.getLectures=function(userId,date_start,date_end){
    return new Promise(
        (resolve,reject)=>{
            const sql = "SELECT Lecture.LectureId AS LectureId, Lecture.Start AS Start, Lecture.End AS End, Lecture.State AS State, " +
                "Course.CourseId AS CourseId, Course.Name AS CourseName, " +
                "Classroom.ClassroomId AS ClassroomId, Classroom.Name AS ClassroomName, Classroom.Seats AS Seats, " +
                "User.Name AS TeacherName, User.Surname AS TeacherSurname, " +
                "COUNT(Booking.BookingId) AS BookingCount, " +
                "Booking2.BookingId AS BookingId, Booking2.State AS BookingState " +
                "FROM Lecture LEFT JOIN Booking ON Lecture.LectureId = Booking.LectureId AND Booking.State = 0 " +
                "LEFT JOIN Booking Booking2 ON Lecture.LectureId = Booking2.LectureId AND Booking2.StudentId = ? AND Booking2.State <> 2, " +
                "StudentCourse, Course, Classroom, User " +
                "WHERE Lecture.CourseId = StudentCourse.CourseId  AND StudentCourse.UserId = ? " +
                "AND Lecture.CourseId = Course.CourseId " +
                "AND Lecture.ClassRoomId = Classroom.ClassroomId " +
                "AND Course.TeacherId = User.UserId " +
                "AND DATE(Lecture.Start) >= DATE(?) AND DATE(Lecture.Start) <= DATE(?) " +
                "AND Lecture.State <> 1 " +
                "GROUP BY Lecture.LectureId ";
     
            db.all(sql,[userId,userId,date_start,date_end],(err,rows)=>{
                    if (err){
                        reject(err);
                    }
                    else if(rows.length===0){
                        resolve([])
                    }else {
                        let ret_array=[];
                        for (let row of rows){
                            ret_array.push(
                                {
                                    LectureId:row.LectureId,
                                    CourseId:row.CourseId,
                                    CourseName:row.CourseName,
                                    Start:row.Start,
                                    End:row.End,
                                    State:row.State,
                                    ClassroomId:row.ClassroomId,
                                    ClassroomName:row.ClassroomName,
                                    Seats:row.Seats,
                                    TeacherName:row.TeacherName,
                                    TeacherSurname:row.TeacherSurname,
                                    BookingCount:row.BookingCount,
                                    BookingId:row.BookingId,
                                    BookingState:row.BookingState
                                }
                            );
                        }
                        resolve(ret_array);
                    }
                }
            );
        }
    );
}

//return true if the studends hasn't already booked the lecture
exports.checkBooking=function(user_id,lecture_id){

    return new Promise(
        async (resolve,reject)=>{
            const isEnrolled = await this.checkStudentCourses(user_id,lecture_id);
            if (isEnrolled.ok==true) {
                const sql="SELECT count(*) as n FROM Booking WHERE StudentId=? and LectureId=? and State!=2";
                db.get(sql, [user_id,lecture_id], (err, row) => {
                    if(err){
                        reject(err);
                    }
                    else if(row.n && row.n>0)
                        resolve({ok:false});
                    else
                        resolve({ok:true});
                });
            }
            else {
                resolve({error:"student not enrolled"});
            }
    });
}

//return true if the student is enrolled for the course of the lecture he is trying to attend
exports.checkStudentCourses=function(user_id,lecture_id){
    return new Promise(
        (resolve,reject)=>{
        const sql="SELECT COUNT(*) as n FROM StudentCourse,Course,Lecture "+
                "where StudentCourse.CourseId=Course.CourseId and Lecture.CourseId=Course.CourseId "+
                "and StudentCourse.UserId=? and Lecture.LectureId=?";
        db.get(sql, [user_id,lecture_id], (err, row) => {
            if(err){
                reject(err);
            }
            else if(row.n && row.n>0)
                resolve({ok:true});
            else
                resolve({ok:false});
        });
    });
}

//return true if the lecture belongs to a course held by the teacher
exports.checkTeacherCourses=function(teacher_id,lecture_id){
    return new Promise(
        (resolve,reject)=>{
        const sql="SELECT COUNT(*) as n FROM Course,Lecture,User as Teacher "+
            "where Lecture.CourseId=Course.CourseId and Course.TeacherId=Teacher.UserId "+
            "and Teacher.UserId=? and Lecture.LectureId=? ";
        db.get(sql, [teacher_id,lecture_id], (err, row) => {
            if(err){
                reject(err);
            }
            else if(row.n && row.n>0)
                resolve({ok:true});
            else
                resolve({ok:false});
        });
    });
}

exports.getLectureInfo=function(lecture_id){
    return new Promise(
        
        (resolve,reject)=>{
            
        const sql="SELECT Course.CourseId as CourseId,Course.Name as CourseName, Start ,Classroom.Name as ClassroomName, Lecture.State as State "+
                    "FROM Lecture,Classroom,Course "+
                    "where Lecture.CourseId=Course.CourseId "+
                    "and Classroom.ClassroomId=Lecture.ClassroomId "+
                    "and LectureId=? ";
        db.get(sql, [lecture_id], (err, row) => {
            if(err){
                reject(err);
            }else if(row){
                resolve({
                    CourseId:row.CourseId,
                    CourseName:row.CourseName,
                    ClassroomName:row.ClassroomName,
                    Start:row.Start,
                    State:row.State
                    });
                }
            else
                resolve({});
        });
    });
}

exports.getStudentInfo=function(student_id){
    return new Promise(
        (resolve,reject)=>{
        const sql="SELECT Name,Surname,Email,Type FROM User where UserId=?";
        db.get(sql, [student_id], (err, row) => {
            if(err){
                reject(err);
            }else if(row) {
                if (row.Type != "student") {
                    resolve(undefined);
                }
                else {
                    resolve({
                        Name:row.Name,
                        Surname:row.Surname,
                        Email:row.Email
                        });
                }
            }
            else {
                resolve(undefined);
            }
        });
    });
}

//returns number of booked seats and the total seats for a lecture
exports.getSeatsCount=function(lecture_id){
    
    return new Promise(
        (resolve,reject)=>{
        const sql= "SELECT T.LectureId,TotalSeats,count(DISTINCT(Booking.BookingId)) as BookedSeats FROM "+
                    "(SELECT Lecture.LectureId, Seats as TotalSeats from Lecture,Classroom where Classroom.ClassroomId=Lecture.ClassRoomId) as T "+
                    "LEFT OUTER JOIN Booking ON T.LectureId=Booking.LectureId "+
                    "WHERE T.LectureId=? "+
                    "GROUP BY T.LectureId,TotalSeats";
        db.get(sql, [lecture_id], (err, row) => {
            if(err){
                reject(err);
            }else if(row){
                resolve({
                    LectureId:row.LectureId,
                    BookedSeats:row.BookedSeats,
                    TotalSeats:row.TotalSeats
                    });
                }
        });
    });
}

//book a lecture for a student
exports.bookLecture=async function(user_id,lecture_id){

    return new Promise(
        async (resolve,reject)=>{
        
        const isBooked=await this.checkBooking(user_id,lecture_id);
        if(isBooked.ok==false)
            resolve({error:"already booked"});
        else{
            const isEnrolled=await this.checkStudentCourses(user_id,lecture_id);
            if(isEnrolled.ok==true){

                const seats=await this.getSeatsCount(lecture_id);
                if(seats.LectureId){
                    let enqueue=0;
                    if(seats.BookedSeats>=seats.TotalSeats)
                        enqueue=1;
                    
                    const lectureInfo = await this.getLectureInfo(lecture_id);

                    if (lectureInfo.State != 0) {
                        resolve({error:"lecture not bookable"});
                    }

                    const studentInfo = await this.getStudentInfo(user_id);

                    const sql="INSERT INTO Booking (StudentId,LectureId,Timestamp,Present,State) "+
                                "VALUES (?,?,?,?,?)";
                                db.run(sql,[user_id,lecture_id,Date.now(),1,enqueue],
                                    async function(err){
                                        if(err){
                                            reject(err);
                                        }
                                        else{
                                            
                                            const emailReplacements={"%NAME%":studentInfo.Name,
                                                                     "%SURNAME%":studentInfo.Surname,
                                                                     "%LECTURE%":lectureInfo.CourseName,
                                                                    "%TIME%":lectureInfo.Start,
                                                                    "%CLASSROOM%":lectureInfo.ClassroomName}
                                            if(enqueue==0)
                                                emailer.send(studentInfo.Email,subject,bookinConfirmationText,emailReplacements);
                                            else if(enqueue==1)
                                                emailer.send(studentInfo.Email,subject,bookinEnqueueText,emailReplacements);
                                            
                                            resolve({BookingId:this.lastID,Enqueued:enqueue});
                                        }
                                    });
                }else
                    reject({error:"server error"})
            }else
                resolve({error:"student not enrolled"});
        }
    });
}

exports.getTeacherLectures=function(teacher_id, date_start,date_end){
    return new Promise(
        (resolve,reject)=>{
            const sql = "SELECT Lecture.LectureId AS LectureId, Lecture.Start AS Start, Lecture.End AS End, Lecture.State AS State, " +
                "Course.CourseId AS CourseId, Course.Name AS CourseName, " +
                "Classroom.ClassroomId AS ClassroomId, Classroom.Name AS ClassroomName, Classroom.Seats AS Seats, " +
                "COUNT(Booking.BookingId) AS BookingCount " +
                "FROM Lecture LEFT JOIN Booking ON Lecture.LectureId = Booking.LectureId AND Booking.State = 0, Course, Classroom " +
                "WHERE Lecture.CourseId = Course.CourseId AND Course.TeacherId = ? " +
                "AND Lecture.ClassRoomId = Classroom.ClassroomId " +
                "AND DATE(Lecture.Start) >= DATE(?) AND DATE(Lecture.Start) <= DATE(?) " +
                "AND Lecture.State <> 1 " +
                "GROUP BY Lecture.LectureId ";

                db.all(sql,[teacher_id,date_start,date_end],(err,rows)=>{
                    if (err){
                        reject(err);
                    }
                    else if(rows.length===0){
                        resolve([])
                    }else {
                        let ret_array=[];
                        for (let row of rows){
                            ret_array.push(
                                {
                                    LectureId:row.LectureId,
                                    CourseId:row.CourseId,
                                    CourseName:row.CourseName,
                                    Start:row.Start,
                                    End:row.End,
                                    State:row.State,
                                    ClassroomId:row.ClassroomId,
                                    ClassroomName:row.ClassroomName,
                                    Seats:row.Seats,
                                    BookingCount:row.BookingCount
                                }
                            );
                        }
                        resolve(ret_array);
                    }
                }
            );
        }
    );
}

exports.getStudents=function(user,lecture_id){
    return new Promise(
        async (resolve,reject)=>{


            const chk=await this.checkTeacherCourses(user,lecture_id);
            if(chk.ok==false)
                resolve({error:"unauthorized access"});
            else{

                const sql="SELECT BookingId,StudentId,Timestamp,Present,Name,Surname FROM Booking,User as Student "+
                        "where Booking.StudentId=Student.UserId "+
                        "and Booking.State=0 "+
                        "and Booking.LectureId=?";
                    db.all(sql,[lecture_id],(err,rows)=>{
                        if (err){
                            reject(err);
                        }
                        else if(rows.length===0){
                            resolve([])
                        }else {
                            let ret_array=[];
                            for (let row of rows){
                                ret_array.push(
                                    {
                                        BookingId:row.BookingId,
                                        StudentId:row.StudentId,
                                        Timestamp:row.Timestamp,
                                        Present:row.Present,
                                        State:row.State,
                                        Name:row.Name,
                                        Surname:row.Surname
                                    }
                                );
                            }
                            resolve(ret_array);
                        }
                    }
                );
            }
        }
    );
}

exports.getBookings=function(student_id){
    return new Promise(
        (resolve,reject)=>{
            const sql="SELECT BookingId,Lecture.LectureId,Course.CourseId,Course.Name as CourseName, Classroom.Name as ClassroomName,Start,End,Present,Lecture.State as LectureState, Booking.State as BookingState,Timestamp FROM Booking,Course,Lecture,Classroom "+
                        "where Lecture.CourseId=Course.CourseId "+
                        "and Booking.LectureId=Lecture.LectureId "+
                        "and Lecture.CourseId=Classroom.ClassroomId "+
                        "and Booking.State <> 2 "+
                        "and Booking.StudentId=?";
                db.all(sql,[student_id],(err,rows)=>{
                    if (err){
                        reject(err);
                    }
                    else if(rows.length===0){
                        resolve([])
                    }else {
                       let ret_array=[];
                        for (let row of rows){
                            ret_array.push(
                                {
                                    BookingId:row.BookingId,
                                    LectureId:row.LectureId,
                                    CourseId:row.CourseId,
                                    CourseName:row.CourseName,
                                    ClassroomName:row.ClassroomName,
                                    Start:row.Start,
                                    End:row.End,
                                    Present:row.Present,
                                    LectureState:row.LectureState,
                                    BookingState:row.BookingState,
                                    Timestamp:row.Timestamp
                                }
                            );
                        }
                        resolve(ret_array);
                    }
                }
            );
        }
    );
}


exports.getNextInLine=function(booking_id){
    return new Promise(
        (resolve,reject)=>{
        const sql="SELECT BookingId,LectureId,StudentId FROM Booking  where LectureId=(SELECT LectureId from Booking where BookingId=?) and State=1 order by Timestamp";
        db.get(sql, [booking_id], (err, row) => {
            if(err){
                reject(err);
            }else if(row){
                resolve({
                    BookingId:row.BookingId,
                    LectureId:row.LectureId,
                    StudentId:row.StudentId
                    });
                }
            else
                {
                    resolve({
                        });
                }
        });
    });
}

exports.cancelBooking=function( booking_id){
    return new Promise( async (resolve,reject)=>{
        const nextBooking= await this.getNextInLine(booking_id);
        
        let lectureInfo=undefined;
        let studentInfo=undefined;
        let othersql=undefined;
        let sql="UPDATE Booking SET State=2 WHERE BookingId=?";
        
        if(nextBooking.BookingId!=undefined){
            othersql="UPDATE Booking SET State=0 WHERE BookingId=?"
            lectureInfo = await this.getLectureInfo(nextBooking.LectureId); 
            studentInfo = await this.getStudentInfo(nextBooking.StudentId);
        }
        db.run(sql,[booking_id],
            function(err){
                if(err){
                    reject(err);
                }
                else{
                    if(nextBooking.BookingId!=undefined){
                        db.run(othersql,[nextBooking.BookingId],function(err2){
                            if(err2){
                                reject(err2);
                            }else{
                                const emailReplacements={"%NAME%":studentInfo.Name,
                                                "%SURNAME%":studentInfo.Surname,
                                                "%LECTURE%":lectureInfo.CourseName,
                                                "%TIME%":lectureInfo.Start,
                                                "%CLASSROOM%":lectureInfo.ClassroomName};
                                 emailer.send(studentInfo.Email,subject,bookinDequeueText,emailReplacements);
                            }
                        });   
                    }
                    resolve("OK");
                }
            });
        });
}



exports.getEmailInfo=function(lecture_id){
    return new Promise(
        async (resolve,reject)=>{


        const sql="SELECT Email,User.Name StudentName,Surname,Course.Name as CourseName, Start, Classroom.Name as ClassroomName FROM Booking,User,Lecture,Course,Classroom "+
                    "where Booking.StudentId=User.UserId "+
                    "and Booking.LectureId=Lecture.LectureId "+
                    "and Course.CourseId=Lecture.CourseId "+   
                    "and Lecture.ClassRoomId=Classroom.ClassroomId "+
                    "and (Booking.State=0 or Booking.State=1) "+
                    "and Booking.LectureId=?";
            db.all(sql,[lecture_id],(err,rows)=>{
                if (err){
                    reject(err);
                }
                else if(rows.length===0){
                    resolve([])
                }else {
                    let ret_array=[];
                    for (let row of rows){
                        ret_array.push(
                            {
                                Email:row.Email,
                                StudentName:row.StudentName,
                                Surname:row.Surname,
                                CourseName:row.CourseName,
                                ClassroomName:row.ClassroomName,
                                Start:row.Start
                            }
                        );
                    }
                    resolve(ret_array);
                }
            }
        );
    }
        
    );
}

exports.changeLecture=function(teacher_id,lecture_id,state){
    return new Promise( async (resolve,reject)=>{

        const chk=await this.checkTeacherCourses(teacher_id,lecture_id);
        if(chk.ok==false)
            resolve({error:"unauthorized access"});
        else{
            const students=await this.getEmailInfo(lecture_id);
            const sql="UPDATE Lecture SET State=? WHERE LectureId=? ";
            db.run(sql,[state,lecture_id],
                function(err){
                    
                    if(err){
                        reject(err);
                    }
                    else{
                        if(students){
                            for(let s of students){
                                const emailReplacements={
                                "%NAME%":s.StudentName,
                                "%SURNAME%":s.Surname,
                                "%LECTURE%":s.CourseName,
                                "%TIME%":s.Start,
                                "%CLASSROOM%":s.ClassroomName};
                                if(state==1)
                                    emailer.send(s.Email,subject,lectureDeletedText,emailReplacements);
                                else if(state==2)
                                    emailer.send(s.Email,subject,lectureChangedText,emailReplacements);
                            }
                        }

                        resolve("OK");
                    }
                });
        }
    });
}

////SPRINT 2

//get information needed to send scheduled email at teachers
exports.getAllLecturesForEmail=function(teacher_id, date_start,date_end){
    return new Promise(
        (resolve,reject)=>{
            const sql = "SELECT Lecture.LectureId as Lec_id, Course.Name as CourseName,Start,Email,User.Name as TeacherName,Surname, Classroom.Name as ClassroomName , Seats as TotSeats, COUNT(DISTINCT Booking.BookingId) as BookedSeats "+
            "FROM Lecture left join Booking on Booking.LectureId=Lecture.LectureId and Booking.State=0 "+
			"inner join Course on Lecture.CourseId=Course.CourseId "+
			"inner join User on Course.TeacherId=User.UserId "+
			"inner join Classroom on Lecture.ClassroomId= Classroom.ClassroomId "+
            "and Lecture.State=0  and EmailSent=0 and DATE(Start)>DATE('now') and DATE(Start)<=Date('now','+1 day')"+
            "Group by Course.Name ,Start,Email,User.Name ,Surname,Classroom.Name,Seats" 

                db.all(sql,(err,rows)=>{
                    if (err){
                        reject(err);
                    }
                    else if(rows.length===0){
                        resolve([])
                    }else {
                        let ret_array=[];
                        for (let row of rows){
                            ret_array.push(
                                {
                                    LectureId:row.Lec_id,
                                    CourseName:row.CourseName,
                                    Start:row.Start,
                                    Email:row.Email,
                                    TeacherName:row.TeacherName,
                                    TeacherSurname:row.Surname,
                                    ClassroomName:row.ClassroomName,
                                    TotSeats:row.TotSeats,
                                    BookedSeats:row.BookedSeats
                                }
                            );
                        }

                        resolve(ret_array);
                    }
                }
            );
        }
    );
}

//update EmailSent flag in lecture table
exports.SetEmailSent=function(lecture_id){
    return new Promise((resolve,reject)=>{      
        const sql="UPDATE Lecture SET EmailSent=1 WHERE LectureId=? ";
        db.run(sql,[lecture_id],
            function(err){ 
                if(err){
                    reject(err);
                }else
                    resolve("OK");
                
            });       
    });
}

exports.getStatistics=function(course_id,group_by,date_start,date_end){
    return new Promise(
        async (resolve,reject)=>{

           
        let sql="SELECT LectureId,CourseId,Start, ";
    sql+=group_by=="week" ? "CAST(strftime('%W',Start) as INTEGER)as Week, " : "";
    sql+=group_by=="month" ? " CAST(strftime('%m',Start) as INTEGER) as Month,": ""; 
    sql+="CAST(strftime('%Y',Start) as INTEGER)as Year, "+
        "SUM(BookedSeats) as SumBooked, "+
        "SUM (Queuecount) as SumQueue, "+
        "SUM(CancelledBookings) as SumCancelled, "+
        "SUM (PresentCount) as SumPresent, "+
        "SUM (CASE WHEN State = 0 then 1 ELSE 0 END) as TotHeld, "+
        "SUM (CASE WHEN State = 1 then 1 ELSE 0 END) as TotCancelled, "+
        "SUM (CASE WHEN State = 2 then 1 ELSE 0 END) as TotOnline, "+
        "COUNT( * ) as TotLectures "+
        "FROM "+
        "(SELECT Lecture.LectureId,Lecture.CourseId,Lecture.State,Start,BookedSeats,Queuecount,CancelledBookings,PresentCount "+
        "from (SELECT LectureId, "+
                "SUM(CASE WHEN State = 0 then 1 ELSE 0 END) as BookedSeats, "+
                "SUM(CASE WHEN State = 1 then 1 ELSE 0 END) as Queuecount, "+
                "SUM(CASE WHEN State = 2 then 1 ELSE 0 END) as CancelledBookings, "+
                "SUM(CASE WHEN Present = 1 and State=0 then 1 ELSE 0 END) as PresentCount "+
                "FROM Booking "+
                "Group by LectureId) as T1 "+
        ", Lecture "+
        "where T1.LectureId=Lecture.LectureId "+
        "and CourseId=? and Lecture.State!=1 "+
        "UNION "+
        "SELECT Lecture.LectureId,Lecture.CourseId,Lecture.State,Start,BookedSeats,Queuecount,CancelledBookings,PresentCount "+
        "from (SELECT LectureId, "+
                "SUM(CASE WHEN State = 0 then 0 ELSE 0 END) as BookedSeats, "+
                "SUM(CASE WHEN State = 1 then 0 ELSE 0 END) as Queuecount, "+
                "SUM(CASE WHEN State = 2 then 1 ELSE 0 END) as CancelledBookings, "+
                "SUM(CASE WHEN Present = 1 and State= 0 then 1 ELSE 0 END) as PresentCount "+
                "FROM Booking "+
                "Group by LectureId) as T2 "+
        ", Lecture "+
        "where T2.LectureId=Lecture.LectureId "+
        "and CourseId=? and Lecture.State=1) as T "+
        "WHERE "+
        "Date(Start)>=Date(?) and Date(Start)<=Date(?) "+
        "GROUP BY CourseId, ";
    sql+=group_by=="lecture" ? "LectureId" :"";
    sql+=group_by=="week" ? "Week" :"";
    sql+=group_by=="month" ? "Month" :"";
    sql+=",Year;";
            db.all(sql,[course_id,course_id,date_start,date_end],(err,rows)=>{
                if (err){
                    reject(err);
                }
                else if(rows.length===0){
                    resolve([])
                }else {
                    let ret_array=[];
                    var obj={LectureId:undefined,CourseId:0,Start:undefined,Week:undefined,Year:0,SumBooked:0,SumQueue:0,SumCancelled:0,SumPresent:0,TotHeld:0,TotCancelled:0,TotOnline:0,TotLectures:0};
                    for (let row of rows){
                        obj.LectureId=row.LectureId; 
                        obj.CourseId=row.CourseId;
                        obj.Start=row.Start;
                        group_by=="lecture" ? obj.LectureId=row.LectureId : obj.LectureId=undefined;
                        group_by=="week" ?  obj.Week=row.Week : obj.LectureId=undefined;
                        group_by=="month" ? obj.Month=row.Month : obj.LectureId=undefined;
                        obj.Year=row.Year;
                        obj.SumBooked=row.SumBooked;            //number of bookings, refers only to held and cancelled lectures
                        obj.SumQueue=row.SumQueue;              //number of people in queue, refers only to held and cancelled lectures
                        obj.SumCancelled=row.SumCancelled;      //number of cancelled bookings, refers only to held and cancelled lectures
                        obj.SumPresent=row.SumPresent;          //number of recorded presence, refers only to held lectures
                        obj.TotHeld=row.TotHeld;                //number of held lectures
                        obj.TotCancelled=row.TotCancelled;      //number of cancelled lectures
                        obj.TotOnline=row.TotOnline;            //refers only to held and cancelled lectures
                        obj.TotLectures=row.TotLectures;        //total number of lectures
                        ret_array.push(Object.assign({},obj));
                           
                    }
                    resolve(ret_array);
                }
            }
        );
    }
        
    );
}

/*DO NOT DELETE THIS COMMENT PLEASE

SELECT LectureId,CourseId,State,
CAST(strftime('%d',Start) as INTEGER)as Day,
CAST(strftime('%W',Start) as INTEGER)as Week,
CAST(strftime('%m',Start) as INTEGER) as Month,
CAST(strftime('%Y',Start) as INTEGER)as Year,
SUM(BookedSeats) as SumBooked,
SUM (Queuecount) as SumQueue,
SUM(CancelledBookings) as SumCancelled,
SUM (PresentCount) as SumPresent,
SUM (CASE WHEN State = 0 then 1 ELSE 0 END) as TotHeld,
SUM (CASE WHEN State = 1 then 1 ELSE 0 END) as TotCanceled,
SUM (CASE WHEN State = 2 then 1 ELSE 0 END) as TotOnline,
COUNT( * ) as TotLectures
from
(SELECT Lecture.CourseId,Lecture.State,Start,BookedSeats,Queuecount,CancelledBookings,PresentCount
from (SELECT LectureId,
		SUM(CASE WHEN State = 0 then 1 ELSE 0 END) as BookedSeats,
		SUM(CASE WHEN State = 1 then 1 ELSE 0 END) as Queuecount,
		SUM(CASE WHEN State = 2 then 1 ELSE 0 END) as CancelledBookings,
		SUM(CASE WHEN Present = 1 and State=0 then 1 ELSE 0 END) as PresentCount
		FROM Booking
		Group by LectureId) as T1
, Lecture
where T1.LectureId=Lecture.LectureId
and CourseId=2 and Lecture.State!=1

UNION

SELECT Lecture.CourseId,Lecture.State,Start,BookedSeats,Queuecount,CancelledBookings,PresentCount
from (SELECT LectureId,
		SUM(CASE WHEN State = 0 then 0 ELSE 0 END) as BookedSeats,
		SUM(CASE WHEN State = 1 then 0 ELSE 0 END) as Queuecount,
		SUM(CASE WHEN State = 2 then 1 ELSE 0 END) as CancelledBookings,
		SUM(CASE WHEN Present = 1 and State= 0 then 1 ELSE 0 END) as PresentCount
		FROM Booking
		Group by LectureId) as T2
, Lecture
where T2.LectureId=Lecture.LectureId
and CourseId=2 and Lecture.State=1) as T
WHERE
 Date(Start)>=Date('2020-01-01') and Date(Start)<=Date('2020-12-31')
GROUP BY LectureId,CourseId,Day,Year;*/

//return a list of lectures for a course in a date range
exports.getCourseLecture=function(course_id, date_start,date_end){
    return new Promise(
        (resolve,reject)=>{
            const sql = "SELECT Lecture.LectureId AS LectureId, Lecture.Start AS Start, Lecture.End AS End, Lecture.State AS State,  "+
                        "Course.CourseId AS CourseId, Course.Name AS CourseName,  "+
                        "User.Name as TeacherName, "+
                        "User.Surname as TeacherSurname, "+
                        "Classroom.ClassroomId as ClassroomId,Classroom.Name AS ClassroomName, Classroom.Seats AS Seats "+
                        "FROM Lecture, Course, Classroom ,User "+
                        "WHERE "+
                        "Lecture.ClassRoomId = Classroom.ClassroomId  "+
                        "and Course.TeacherId=User.UserId "+
                        "and  Course.CourseId =? "+
                        "and Lecture.CourseId=Course.CourseId "+
                        "AND DATE(Lecture.Start) >= DATE(?) AND DATE(Lecture.Start) <= DATE(?);"

                db.all(sql,[course_id,date_start,date_end],(err,rows)=>{
                    if (err){
                        console.log(err);
                        reject(err);
                    }
                    else if(rows.length===0){
                        
                        resolve([])
                    }else {
                        let ret_array=[];
                        
                        for (let row of rows){
                            ret_array.push(
                                {
                                    LectureId:row.LectureId,
                                    CourseId:row.CourseId,
                                    CourseName:row.CourseName,
                                    Start:row.Start,
                                    End:row.End,
                                    State:row.State,
                                    ClassroomId:row.ClassroomId,
                                    ClassroomName:row.ClassroomName,
                                    Seats:row.Seats
                                }
                            );
                        }
                        resolve(ret_array);
                    }
                }
            );
        }
    );
}



exports.getLowerDate=function(lecture_id, n_lectures){
    return new Promise(
        (resolve,reject)=>{
        const sql="SELECT Start from(SELECT Lecture.LectureId AS LectureId, Lecture.Start AS Start,Lecture.State AS State "+
                    "FROM Lecture "+
                    "where date(Start) <= (select date(Start) From lecture where LectureId=?) "+
                    "and CourseId=(select CourseId From lecture where LectureId=?) "+
                    "order by Start DESC "+
                    "limit ?) as T "+
                    "order by Start "+
                    "limit 1;";
        db.get(sql, [lecture_id,lecture_id,n_lectures], (err, row) => {
            if(err){
                reject(err);
            }else if(row){
                resolve({Date:row.Start});
                }
            else
                {
                    resolve({
                        });
                }
        });
    });
}

exports.getHigherDate=function(lecture_id, n_lectures){
    return new Promise(
        (resolve,reject)=>{
        const sql="SELECT Start from(SELECT Lecture.LectureId AS LectureId, Lecture.Start AS Start,Lecture.State AS State "+
                    "FROM Lecture "+
                    "where date(Start) >= (select date(Start) From lecture where LectureId=?) "+
                    "and CourseId=(select CourseId From lecture where LectureId=?) "+
                    "order by Start "+
                    "limit ?) as T "+
                    "order by Start DESC "+
                    "limit 1;";
        console.log(sql);
        db.get(sql, [lecture_id,lecture_id,n_lectures], (err, row) => {
            if(err){
                reject(err);
            }else if(row){
                resolve({Date:row.Start});
                }
            else
                {
                    resolve({
                        });
                }
        });
    });
}

exports.getTeacherCourses=function(teacher_id){
    return new Promise(
        (resolve,reject)=>{
            const sql = "SELECT CourseId, Name as CourseName from Course WHERE TeacherId=?"

                db.all(sql,[teacher_id],(err,rows)=>{
                    if (err){
                        reject(err);
                    }
                    else if(rows.length===0){
                        
                        resolve([])
                    }else {
                        let ret_array=[];
                        
                        for (let row of rows){
                            ret_array.push(
                                {
                                    CourseId:row.CourseId,
                                    CourseName:row.CourseName
                                }
                            );
                        }
                        resolve(ret_array);
                    }
                }
            );
        }
    );
}

exports.getAllCourses=function(){
    return new Promise(
        (resolve,reject)=>{
            const sql = "SELECT CourseId, Course.Name as CourseName,User.Name as TeacherName, User.Surname as TeacherSurname  from Course,User WHERE Course.TeacherId=User.UserId"

                db.all(sql,(err,rows)=>{
                    if (err){
                        reject(err);
                    }
                    else if(rows.length===0){
                        
                        resolve([])
                    }else {
                        let ret_array=[];
                        
                        for (let row of rows){
                            ret_array.push(
                                {
                                    CourseId:row.CourseId,
                                    CourseName:row.CourseName,
                                    TeacherName:row.TeacherName,
                                    TeacherSurname:row.Surname
                                }
                            );
                        }
                        resolve(ret_array);
                    }
                }
            );
        }
    );
}

//add teachers to db from csv
exports.addTeachers=function(data) {
    return new Promise(async (resolve, reject) => {
        const users_added = [];
        let users_to_add = [];

        let csvData = data.toString('utf8');
        users_to_add = await csvtojson().fromString(csvData);

        for (let user of users_to_add) {
            if (user.Number == undefined || user.GivenName == undefined || user.Surname == undefined || user.OfficialEmail == undefined || user.SSN == undefined) {
                users_added.push({"error":"Make sure the csv is correctly written"});
                continue;
            }

            const sql = "INSERT INTO User(UserId, Email, Password, Name, Surname, City, Birthday, SSN, Type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"; 
            
            try {
                await db.run(sql, [user.Number, user.OfficialEmail, '$2b$10$E60Ykpqvvi.Bt4ZJnCRDKuJcfRN/dQg4sbq5aBjPWnyd/C7xofOlO', user.GivenName, user.Surname, 'NULL', 'NULL', user.SSN, 'teacher']);
                users_added.push(user);
            }
            catch (ex) {
                users_added.push({"error": ex});
            }
        }

        resolve(users_added);
    });
}

//add students to db from csv
exports.addStudents=function(data) {
    return new Promise(async (resolve, reject) => {
        const users_added = [];
        let users_to_add = [];

        let csvData = data.toString('utf8');
        users_to_add = await csvtojson().fromString(csvData);

        for (let user of users_to_add) {
            if (user.Id == undefined || user.Name == undefined || user.Surname == undefined || user.City == undefined || user.OfficialEmail == undefined || user.Birthday == undefined || user.SSN == undefined) {
                users_added.push({"error":"Make sure the csv is correctly written"});
                continue;
            }

            const sql = "INSERT INTO User(UserId, Email, Password, Name, Surname, City, Birthday, SSN, Type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"; 
            
            try {
                await db.run(sql, [user.Id, user.OfficialEmail, '$2b$10$E60Ykpqvvi.Bt4ZJnCRDKuJcfRN/dQg4sbq5aBjPWnyd/C7xofOlO', user.Name, user.Surname, user.City, user.Birthday, user.SSN, 'student']);
                users_added.push(user);
            }
            catch (ex) {
                users_added.push({"error": ex});
            }
        }

        resolve(users_added);
    })
}

exports.addEnrollments=function(data) {
    return new Promise(async (resolve, reject) => {
        const enrollments_added = [];
        let enrollments_to_add = [];    //array of enrollments in the csv

        let csvData = data.toString('utf8');
        enrollments_to_add = await csvtojson().fromString(csvData);

        let checkedIds = [];
        let skippedIds = [];
        let checkedCourses = [];
        let skippedCourses = [];

        for (let enrollment of enrollments_to_add) {
            if (enrollment.Code == undefined || enrollment.Student == undefined) {
                enrollments_added.push({"error":"Make sure the csv is correctly written"});
                continue;
            }

            let id = enrollment.Student;
            if (!checkedIds.includes(id)) {
                const user = await this.getUserById(id);
                checkedIds.push(id);

                if (user == undefined) {
                    enrollments_added.push({"error":"Make sure student with id " + id + " exists"});
                    skippedIds.push(id);
                    continue;
                }
                else if (user.Type != "student") {
                    enrollments_added.push({"error":"The user with id " + id + " is not a student"});
                    skippedIds.push(id);
                    continue;
                }
            }
            else if (skippedIds.includes(id)) {
                continue;
            }

            if (!checkedCourses.includes(enrollment.Code)) {
                const course = await this.getCourseById(enrollment.Code);
                checkedCourses.push(enrollment.Code);

                if (course == undefined) {
                    enrollments_added.push({"error":"Make sure course with id " + enrollment.Code + " exists"});
                    skippedCourses.push(enrollment.Code);
                    continue;
                }
            }
            else if (skippedCourses.includes(enrollment.Code)) {
                enrollments_added.push({"error":"Make sure course with id " + enrollment.Code + " exists"});
                continue;
            }

            const sql = "INSERT INTO StudentCourse(UserId, CourseId) VALUES (?, ?)";

            try {
                await db.run(sql, [enrollment.Student, enrollment.Code]);
                enrollments_added.push(enrollment);
            }
            catch (ex) {
                enrollments_added.push({"error":ex});
            }
        }

        resolve(enrollments_added);
    });
}

//add courses to db from csv
exports.addCourses=function(data) {
    return new Promise(async (resolve, reject) => {
        const courses_added = [];
        let courses_to_add = [];    //array of courses in the csv

        let csvData = data.toString('utf8');
        courses_to_add = await csvtojson().fromString(csvData);

        let checkedIds = [];
        let skippedIds = [];

        for (let course of courses_to_add) {
            if (course.Code == undefined || course.Year == undefined || course.Semester == undefined || course.Course == undefined || course.Teacher == undefined) {
                courses_added.push({"error":"Make sure the csv is correctly written"});
                continue;
            }

            let id = course.Teacher;
            if (!checkedIds.includes(id)) {
                const user = await this.getUserById(id);
                checkedIds.push(id);

                if (user == undefined) {
                    courses_added.push({"error":"Make sure teacher with id " + id + " exists"});
                    skippedIds.push(id);
                    continue;
                }
                else if (user.Type != "teacher") {
                    courses_added.push({"error":"The user with id " + id + " is not a teacher"});
                    skippedIds.push(id);
                    continue;
                }
            }
            else if (skippedIds.includes(id)) {
                continue;
            }

            const sql = "INSERT INTO Course(CourseId, TeacherId, Name, Year, Semester) VALUES (?, ?, ?, ?, ?)";

            try {
                await db.run(sql, [course.Code, course.Teacher, course.Course, course.Year, course.Semester]);
                courses_added.push(course);
            }
            catch (ex) {
                courses_added.push({"error":ex});
            }
        }

        resolve(courses_added);
    });
}

//add lectures to db from csv
exports.addLectures=function(data,date_start,date_end) {
    return new Promise(async (resolve, reject) => {
        const lectures_added = [];
        let lectures_to_add = [];

        let csvData = data.toString('utf8');
        lectures_to_add = await csvtojson().fromString(csvData);

        let checkedCourses = [];
        let skippedCourses = [];
        let checkedClasses = [];

        for (let lecture of lectures_to_add) {
            if (lecture.Code == undefined || lecture.Room == undefined || lecture.Day == undefined || lecture.Seats == undefined || lecture.Time == undefined) {
                lectures_added.push({"error":"Make sure the csv is correctly written"});
                continue;
            }

            if (!checkedCourses.includes(lecture.Code)) {
                const course = await this.getCourseById(lecture.Code);
                checkedCourses.push(lecture.Code);

                if (course == undefined) {
                    courses_added.push({"error":"Make sure course with id " + lecture.Code + " exists"});
                    skippedCourses.push(lecture.Code);
                    continue;
                }
            }
            else if (skippedCourses.includes(lecture.Code)) {
                courses_added.push({"error":"Make sure course with id " + lecture.Code + " exists"});
                continue;
            }

            if (!checkedClasses.includes(lecture.Room)) {
                const classroom = await this.getClassRoomById(lecture.Room);
                checkedClasses.push(lecture.Room);

                if (classroom.length===0) {
                    const sql1 = "INSERT INTO Classroom(ClassroomId, Seats, Name) VALUES (?, ?, ?)";

                    try {
                        await db.run(sql1, [lecture.Room, lecture.Seats, lecture.Room]);
                    }
                    catch (ex) {
                        lectures_added.push({"error":ex});
                    }
                }
            }

            const start_time = lecture.Time.split('-')[0];
            const end_time = lecture.Time.split('-')[1];
            let day = 0;

            switch(lecture.Day) {
                case "Mon":
                    day = 0;
                    break;
                case "Tue":
                    day = 1;
                    break;
                case "Wed":
                    day = 2;
                    break;
                case "Thu":
                    day = 3;
                    break;
                case "Fri":
                    day = 4;
                    break;
                case "Sat":
                    day = 5;
                    break;
                case "Sun":
                    day = 6;
                    break;
            }
            curDate=moment(date_start);
            endDate=moment(date_end).add(1,'days');
            while(curDate.day()!=day){
                curDate=curDate.add(1,'days');
            }
            let sql2;
            let Start="";
            let End="";
            while(endDate.isAfter(curDate)){
                sql2= "INSERT INTO Lecture(CourseId, Start, End, State, ClassRoomId) VALUES (?, ?, ?, ?, ?)";
                Start=curDate.year()+'-'+(curDate.month()+1)+'-'+(curDate.date()+1)+' '+start_time
                End=curDate.year()+'-'+(curDate.month()+1)+'-'+(curDate.date()+1)+' '+end_time
                try {
                    ret=await db.run(sql2, [lecture.Code,Start, End, 0, lecture.Room]);
                    lectures_added.push(lecture);
                }
                catch (ex) {
                    lectures_added.push({"error":ex});
                }
                curDate=curDate.add(7,'days');
            }
           
        }

        resolve(lectures_added);
    });
}

exports.generateContactTracingReport=function(student_id,date){

    return new Promise(
        (resolve,reject)=>{
            const sql = "SELECT User.UserId,Email,Name,Surname,Type FROM User,(SELECT DISTINCT(StudentId) as UserId FROM Booking where "+
                        "Present=1 and not StudentId=? and "+
                        "LectureId IN(SELECT Booking.LectureId FROM Booking,Lecture where Booking.LectureId=Lecture.LectureId and StudentId=? "+
                        "and Present=1 and date(Start)> date(?,'-14 day') and date(Start)< date(?,'+14 day')) "+
                        "UNION "+
                        "SELECT Course.TeacherId as UserId FROM Course,Lecture where Course.CourseId=Lecture.CourseId "+
                        "and Lecture.LectureId in (SELECT Booking.LectureId FROM Booking,Lecture where Booking.LectureId=Lecture.LectureId and StudentId=? "+
                        "and Present=1 and date(Start)> date(?,'-14 day') and date(Start)< date(?,'+14 day'))) as T "+
                        "WHERE T.UserId=User.UserId"

                db.all(sql,[student_id,student_id,date,date,student_id,date,date],(err,rows)=>{
                    if (err){
                        console.log(err);
                        reject(err);
                    }
                    else if(rows.length===0){
                        
                        resolve([])
                    }else {
                        let ret_array=[];
                        
                        for (let row of rows){
                            ret_array.push(
                                {
                                    UserId:row.UserId,
                                    Email:row.Email,
                                    Name:row.Name,
                                    Surname:row.Surname,
                                    Type:row.Type
                                }
                            );
                        }
                        resolve(ret_array);
                    }
                }
            );
        }
    );
}

exports.insertReport=async function(student_id,date,pathPDF,pathCSV){
    const sql = "INSERT INTO Report(StudentId,Date,PathPDF,PathCSV) VALUES (?, ?,?,?)"; 
    
    await db.run(sql, [student_id,date,pathPDF,pathCSV]);     
            try {
                return 1
            }
            catch (ex) {
                return 0
            }
}

exports.getReports=function(){
    return new Promise(
        (resolve,reject)=>{
            const sql="SELECT * FROM Report";
                db.all(sql,(err,rows)=>{
                    if (err){
                        reject(err);
                    }
                    else if(rows.length===0){
                        resolve([])
                    }else {
                       let ret_array=[];
                        for (let row of rows){
                            ret_array.push(
                                {
                                    StudentId:row.StudentId,
                                    Date:row.Date,
                                    PathPDF:row.PathPDF,
                                    pathCSV:row.PathCSV
                                }
                            );
                        }
                        resolve(ret_array);
                    }
                }
            );
        }
    );
}




exports.putYearRestrictions=function(year){
    return new Promise((resolve,reject)=>{      
        const sql="UPDATE RestrictedYear "+
                "Set "+
                "Restricted=1 "+
                "where "+
                "Year=? "
        db.run(sql,[year],
            function(err){ 
                console.log("IT WORKS");
                if(err){
                    console.log(err)
                    reject(err);
                }else
                    resolve("OK");
                
            });       
    });
}
exports.putRestrictions=  function(year,date){
    return new Promise(async (resolve,reject)=>{      
        await this.putYearRestrictions(year)
        const sql="UPDATE Lecture "+
                "Set "+
                "State=1,"+
                "Restricted=1 "+
                "where "+
                "State=0 and Restricted=0 "+
                "and date(Start)>=date(?) "+
                "and CourseId in (SELECT CourseId from Course where Year=?)";
        db.run(sql,[date,year],
            function(err){ 
                if(err){
                    console.log(err)
                    reject(err);
                }else
                    resolve("OK");
                
            });       
    });
}

exports.liftYearRestrictions=function(year){
    return new Promise((resolve,reject)=>{      
        const sql="UPDATE RestrictedYear "+
                "Set "+
                "Restricted=0 "+
                "where "+
                "Year=? "
        db.run(sql,[year],
            function(err){ 
                if(err){
                    console.log(err)
                    reject(err);
                }else
                    resolve("OK");
                
            });       
    });
}

exports.liftRestrictions=function(year,date){
    return new Promise(async(resolve,reject)=>{  
        await this.liftYearRestrictions(year)    
        const sql="UPDATE Lecture "+
                "Set "+
                "State=0,"+
                "Restricted=0 "+
                "where "+
                "State=1 and Restricted=1 "+
                "and date(Start)>=date(?) "+
                "and CourseId in (SELECT CourseId from Course where Year=?)";
        db.run(sql,[date,year],
            function(err){ 
                if(err){
                    reject(err);
                }else
                    resolve("OK");
                
            });       
    });
}

exports.getRestrictedYears=function(student_id){
    return new Promise(
        (resolve,reject)=>{
            const sql="SELECT * FROM RestrictedYear";
                db.all(sql,[student_id],(err,rows)=>{
                    if (err){
                        reject(err);
                    }
                    else if(rows.length===0){
                        resolve([])
                    }else {
                       let ret_array=[];
                        for (let row of rows){
                            ret_array.push(
                                {
                                    Year:row.Year,
                                    Restricted:row.Restricted
                                }
                            );
                        }
                        resolve(ret_array);
                    }
                }
            );
        }
    );
}
