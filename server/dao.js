const sqlite=require('sqlite3').verbose();
const bcrypt=require('bcrypt');

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
            const sql="SELECT LectureId,Course.CourseId,Course.Name as CourseName,Start,End,State,Classroom.ClassroomId,Classroom.Name as ClassroomName,Seats,Teacher.Name as TeacherName,Surname as TeacherSurname "+
                        "FROM Lecture,StudentCourse,User as Teacher, Course ,Classroom "+
                        "where "+
                        "Lecture.CourseId=StudentCourse.CourseId "+ 
                        "and Course.CourseId=studentCourse.CourseId "+
                        "and Teacher.UserId=Course.TeacherId "+
                        "and Lecture.ClassRoomId=Classroom.ClassroomId "+
                        "and StudentCourse.UserId=? "+
                        "and date(Start)>=date(?) and date(Start)<=date(?)";
            db.all(sql,[userId,date_start,date_end],(err,rows)=>{
                console.log(JSON.stringify(rows));
                    if (err){
                        reject(err);
                    }
                    else if(rows.length===0){
                        resolve(undefined)
                    }else {
                        ret_array=[];
                        for (row of rows){
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
                                    TeacherSurname:row.TeacherSurname
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
        const sql="SELECT count(*) as n FROM Booking WHERE StudentId=? and LectureId=?";
        db.get(sql, [user_id,lecture_id], (err, row) => {
            if(err)
                reject(err);
            else if(row.n && row.n>0)
                resolve({ok:false});
            else
                resolve({ok:true});
        });
    });
}

//return true if the student is enrolled for the course of the lecture he is trying to attend
exports.checkCourses=function(user_id,lecture_id){
    return new Promise(
        (resolve,reject)=>{
        const sql="SELECT COUNT(*) as n FROM StudentCourse,Course,Lecture "+
                "where StudentCourse.CourseId=Course.CourseId and Lecture.CourseId=Course.CourseId "+
                "and StudentCourse.UserId=? and Lecture.LectureId=?";
        db.get(sql, [user_id,lecture_id], (err, row) => {
            if(err)
                reject(err);
            else if(row.n && row.n>0)
                resolve({ok:true});
            else
                resolve({ok:false});
        });
    });
}

//returns number og booked seats and the total seats for a lecture
exports.getSeatsCount=function(lecture_id){
    
    return new Promise(
        (resolve,reject)=>{
        const sql="SELECT Lecture.LectureId, count(distinct Booking.BookingId)as BookedSeats, Seats as TotalSeats "+
                    "FROM Classroom, Lecture LEFT JOIN Booking ON  Booking.LectureId=Lecture.LectureId "+
                    "and Lecture.LectureId=? and Booking.State=0 "+
                    "WHERE  Classroom.ClassroomId=Lecture.ClassRoomId " +
                    "Group BY Lecture.LectureId,Seats";
        db.get(sql, [lecture_id], (err, row) => {
            if(err)
                reject(err);
            else if(row)
                console.log(JSON.stringify(row));
                resolve({
                    LectureId:row.LectureId,
                    BookedSeats:row.BookedSeats,
                    TotalSeats:row.TotalSeats
                    });
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
            const isEnrolled=await this.checkCourses(user_id,lecture_id);
            if(isEnrolled.ok==true){

                const seats=await this.getSeatsCount(lecture_id);
                console.log(JSON.stringify(seats));
                if(seats.LectureId){
                    let enqueue=0;
                    if(seats.BookedSeats>=seats.TotalSeats)
                        enqueue=1;
                    console.log(enqueue);
                    const sql="INSERT INTO Booking (StudentId,LectureId,Timestamp,Present,State) "+
                                "VALUES (?,?,?,?,?)";
                                db.run(sql,[user_id,lecture_id,Date.now(),1,enqueue],
                                    function(err){
                                        if(err){
                                            reject(err);
                                        }
                                        else
                                            resolve({BookingId:this.lastID,Enquueued:enqueue});
                                    });
                }else
                    reject({error:"server error"})
            }else
                resolve({error:"student not enrolled"});
        }
    });
}

