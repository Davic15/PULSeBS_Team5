const sqlite=require('sqlite3').verbose();
const bcrypt=require('bcrypt');
const emailer=require('./email');

const bookinConfirmationText="<p>Dear %NAME% %SURNAME%,<br/>you were succesfully booked to lecture \"%LECTURE%\"  %TIME%, classroom %CLASSROOM%<p>";
const bookinEnqueueText="<p>Dear %NAME% %SURNAME%,<br/>the lecture you were trying to book (lecture %LECTURE% at %TIME%, classroom %CLASSROOM%) is full </br> you will be notified if a seats will be available <p>";
const bookinDequeueText="<p>Dear %NAME% %SURNAME%,<br/>the lecture you were trying to book (lecture %LECTURE% at %TIME%, classroom %CLASSROOM%) is now available </br> you can now attend the lecture <p>";
const lectureDeletedText="<p>Dear %NAME% %SURNAME%,<br/>the lecture  %LECTURE% at %TIME%, classroom %CLASSROOM% has been canceled";
const lectureChangedText="<p>Dear %NAME% %SURNAME%,<br/>the lecture  %LECTURE% at %TIME%, classroom %CLASSROOM% will be held online";

const subject="LECTURE BOOKING INFO";

//open db connection
const db=new sqlite.Database('./PULSEeBS_db',(err)=>{
    if(err){
         console.error(err.message);
         throw err;
    }
 });

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
                        const user={UserId:rows[0].UserId,
                                    Email:rows[0].Email,
                                    Password:rows[0].Password,
                                    Name:rows[0].Name,
                                    Surname:rows[0].Surname,
                                    Type:rows[0].Type};
                        resolve(user);
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

//caompares two crypted passwords
exports.checkPassword=function(clearpwd,password){
    return bcrypt.compareSync(clearpwd,password);
}


//WARNING: TO BE REMOVED IN FINAL VERSION!!!!
exports.generateHash=function(newpassword){
    bcrypt.hash(newpassword, 10, function(err, hash) {
        console.log(hash);
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
                console.log(sql+"\n"+userId+" "+date_start+ " "+date_end);
            /*const sql="SELECT LectureId,Course.CourseId,Course.Name as CourseName,Start,End,State,Classroom.ClassroomId,Classroom.Name as ClassroomName,Seats,Teacher.Name as TeacherName,Surname as TeacherSurname "+
                        "FROM Lecture,StudentCourse,User as Teacher, Course ,Classroom "+
                        "where "+
                        "Lecture.CourseId=StudentCourse.CourseId "+ 
                        "and Course.CourseId=studentCourse.CourseId "+
                        "and Teacher.UserId=Course.TeacherId "+
                        "and Lecture.ClassRoomId=Classroom.ClassroomId "+
                        "and StudentCourse.UserId=? "+
                        "and date(Start)>=date(?) and date(Start)<=date(?)";*/
            //db.all(sql,[userId,date_start,date_end],(err,rows)=>{
            db.all(sql,[userId,userId,date_start,date_end],(err,rows)=>{
                //console.log(JSON.stringify(rows));
                    if (err){
                        console.log(JSON.stringify(err));
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
        (resolve,reject)=>{
        const sql="SELECT count(*) as n FROM Booking WHERE StudentId=? and LectureId=? and State!=2";
        db.get(sql, [user_id,lecture_id], (err, row) => {
            if(err){
                console.log(JSON.stringify(err));
                reject(err);
            }
            else if(row.n && row.n>0)
                resolve({ok:false});
            else
                resolve({ok:true});
        });
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
                console.log(JSON.stringify(err));
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
                console.log(JSON.stringify(err));
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
        const sql="SELECT Course.Name as CourseName, Start ,Classroom.Name as ClassroomName "+
                    "FROM Lecture,Classroom,Course "+
                    "where Lecture.CourseId=Course.CourseId "+
                    "and Classroom.ClassroomId=Lecture.ClassroomId "+
                    "and LectureId=? ";
        db.get(sql, [lecture_id], (err, row) => {
            if(err){
                console.log(JSON.stringify(err));
                reject(err);
            }else if(row){
                console.log(JSON.stringify(row));
                resolve({
                    CourseName:row.CourseName,
                    ClassroomName:row.ClassroomName,
                    Start:row.Start
                    });
                }
        });
    });
}

exports.getStudentInfo=function(student_id){
    return new Promise(
        (resolve,reject)=>{
        const sql="SELECT Name,Surname,Email FROM User where UserId=?";
        db.get(sql, [student_id], (err, row) => {
            if(err){
                console.log(JSON.stringify(err));
                reject(err);
            }else if(row){
                console.log(JSON.stringify(row));
                resolve({
                    Name:row.Name,
                    Surname:row.Surname,
                    Email:row.Email
                    });
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
                console.log(JSON.stringify(err));
                reject(err);
            }else if(row){
                console.log(JSON.stringify(row));
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
                    console.log(JSON.stringify(seats));
                    if(seats.BookedSeats>=seats.TotalSeats)
                        enqueue=1;
                    console.log(enqueue);
                    
                    const lectureInfo = await this.getLectureInfo(lecture_id);
                    const studentInfo = await this.getStudentInfo(user_id);

                    const sql="INSERT INTO Booking (StudentId,LectureId,Timestamp,Present,State) "+
                                "VALUES (?,?,?,?,?)";
                                db.run(sql,[user_id,lecture_id,Date.now(),1,enqueue],
                                    async function(err){
                                        if(err){
                                            console.log(JSON.stringify(err));
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
                console.log(sql+"\n"+teacher_id+" "+date_start+ " "+date_end);
            /*const sql="SELECT LectureId,Course.CourseId,Course.Name as CourseName,Start,End,State,Classroom.ClassroomId,Classroom.Name as ClassroomName,Seats "+
                        "FROM Lecture,User as Teacher, Course ,Classroom "+
                        "where   Teacher.UserId=Course.TeacherId "+
                        "and Lecture.ClassRoomId=Classroom.ClassroomId "+
                        "and Lecture.CourseId=Course.CourseId "+
                        "and Teacher.UserId==? "+
                        "and date(Start)>=date(?) and date(Start)<=date(?)";*/
                db.all(sql,[teacher_id,date_start,date_end],(err,rows)=>{
                    if (err){
                        console.log(JSON.stringify(err));
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
                            console.log(JSON.stringify(err));
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
                        console.log(JSON.stringify(err));
                        reject(err);
                    }
                    else if(rows.length===0){
                        resolve([])
                    }else {
                        ret_array=[];
                        for (row of rows){
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
                console.log(JSON.stringify(err));
                reject(err);
            }else if(row){
                console.log(JSON.stringify(row));
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
        console.log("OOK");
        const nextBooking= await this.getNextInLine(booking_id);
        
        console.log("doppio ok");
        let lectureInfo=undefined;
        let studentInfo=undefined;
        let othersql=undefined;
        let sql="UPDATE Booking SET State=2 WHERE BookingId=?";
        
        if(nextBooking.BookingId!=undefined){
            console.log(JSON.stringify(nextBooking));
             othersql="UPDATE Booking SET State=0 WHERE BookingId=?"
            lectureInfo = await this.getLectureInfo(nextBooking.LectureId); 
            studentInfo = await this.getStudentInfo(nextBooking.StudentId);
            console.log(JSON.stringify(lectureInfo));
            console.log(JSON.stringify(studentInfo));
        }
        db.run(sql,[booking_id],
            function(err){
                if(err){
                    console.log(JSON.stringify(err));
                    reject(err);
                }
                else{
                    if(nextBooking.BookingId!=undefined){
                        db.run(othersql,[nextBooking.BookingId],function(err2){
                            if(err2){
                                console.log(JSON.stringify(err2));
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
                    console.log(JSON.stringify(err));
                    reject(err);
                }
                else if(rows.length===0){
                    resolve([])
                }else {
                    ret_array=[];
                    for (row of rows){
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
                        console.log(JSON.stringify(err));
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

/*exports.getLectureBookings = function(lecture_id) {
    return new Promise(
        (resolve,reject)=>{
            const sql="SELECT BookingId, Name, Surname, Present, Booking.State as BookingState, Timestamp FROM Booking, User " +
                        "WHERE Booking.LectureId=?"
                        "and Booking.StudentId=User.UserId";
                db.all(sql,[lecture_id],(err,rows)=>{
                    if (err){
                        console.log(JSON.stringify(err));
                        reject(err);
                    }
                    else if(rows.length===0){
                        resolve(undefined)
                    }else {
                        ret_array=[];
                        for (row of rows){
                            ret_array.push(
                                {
                                    BookingId:row.BookingId,
                                    Present:row.Present,
                                    BookingState:row.BookingState,
                                    Timestamp:row.Timestamp,
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
    );
}*/
