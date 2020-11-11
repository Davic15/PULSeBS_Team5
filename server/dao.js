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

/*
SELECT LectureId,Course.CourseId,Course.Name as CourseName,Start,End,State,Classroom.ClassroomId,Classroom.Name as ClassroomName,#seats,Teacher.Name as TeacherName,Surname as TeacherSurnamem
FROM Lecture,StudentCourse,User as Teacher, Course ,Classroom
where 
Lecture.CourseId=StudentCourse.CourseId 
and Course.CourseId=studentCourse.CourseId
and Teacher.UserId=Course.TeacherId
and Lecture.ClassRoomId=Classroom.ClassroomId
and StudentCourse.UserId=1
*/