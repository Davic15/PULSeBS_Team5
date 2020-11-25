const dao = require('./dao');
const moment=require('moment');
var schedule = require('node-schedule');
const emailer=require('./email');

const teacherEmail="<p>Dear Professor %NAME% %SURNAME%,<br/>the lecture  %LECTURE% at %TIME%, classroom %CLASSROOM% has %BOOKED%/%TOTAL% booked seats";
const subject="LECTURE BOOKING INFO";


let deamon;

exports.startEmailDeamon=function(){
     deamon=schedule.scheduleJob('30 23 * * *', async function(){
        console.log("starting scheduled job");
        lecture_list=await dao.getAllLecturesForEmail();
        console.log(JSON.stringify(lecture_list));
        for (let lecture of lecture_list){
            const emailReplacements={"%NAME%":lecture.TeacherName,
                                    "%SURNAME%":lecture.TeacherSurname,
                                    "%LECTURE%":lecture.CourseName,
                                    "%TIME%":lecture.Start,
                                    "%CLASSROOM%":lecture.ClassroomName,
                                    "%BOOKED%":' '+lecture.BookedSeats,
                                    "%TOTAL%":lecture.TotSeats}
            emailer.send(lecture.Email,subject,teacherEmail,emailReplacements);
            await dao.SetEmailSent(lecture.LectureId);
        }
    });
}
