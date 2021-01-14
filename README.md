# PULSeBS_Team5

NOTE: the password is 'password' for every user
#Backend

## API List
* ### /api/seats/:lecture_id
    Access:public
    type: GET
    Body:none
    Response 200:{ 
        **LectureId**:integer,
      **BookedSeats**:integer,
    **TotalSeats**:integer}
    Description: returns **number of booked seats** and the **total seats** for the lecture with id **lecture_id**

* ### /api/login
    Access:public
    type: POST
    Body:{
    **email**:string,
    **password**:string}
    Response 200:  {
        **UserId**:integer,
        **Email**:string,
        **Name**:string,
        **Surname**:string,
        **Type**:string} 
    Description: signs a **webtoken** in the cookies containing authentication data {**user**:integer, role:**string**}

* ### /api/logout
    Access:authenticated /any user
    type: POST
    Body:none
    Response 200: none 
    Description: clears the authentication cookie

* ### /api/studentlectures
    Access:authenticated /student
    type: POST
    Body:{
        **date_start**:'aaaa-mm-dd',
        **date_end**:'aaaa-mm-dd'}
    Response 200: [{
        **LectureId**:integer, 
        **CourseId**:integer, 
        **CourseName**:string,
         **Start**:'aaaa-mm-dd hh:mm',
         **End**:'aaaa-mm-dd hh:mm', 
         **State**:0 or 1 or 2,
          **ClassroomId**:integer, 
          **ClassroomName**:string,
          **Seats**:integer,
           **TeacherName**:string, 
           **TeacherSurname**:string,
            **BookingCount**:integer,
             **BookingId**:integer (null), 
             **BookingState**:integer (null)},....]
    Description: return a JSON array containing the list of lectures bookable by a student in a certain time range

* ### /api/teacherlectures
    Access:authenticated /teacher
    type: POST
    Body:{
        **date_start**:'aaaa-mm-dd',
        **date_end**:'aaaa-mm-dd'}
    Response 200: [{
        **LectureId**:integer,
         **CourseId**:integer, 
         **CourseName**:string, 
         **Start**:'aaaa-mm-dd hh:mm',
         **End**:'aaaa-mm-dd hh:mm', 
         **State**:0 or 1 or 2, 
         **ClassroomId**:integer, 
         **ClassroomName**:string,
         **Seats**:integer,
         **BookingCount**:integer},....]
    Description: return a JSON array containing the list of lectures held by a teacher in a certain time range

* ### /api/studentlist
    Access:authenticated /teacher
    type: POST
    Body:{**lecture_id**:integer'}
    Response 200: [{
        **BookingId**:integer, 
        **StudentId**:integer,
        **Timestamp**:integer, 
        **Present**:0 or 1, 
        **State**: 0 or 1 or 2, 
        **Name**:string, 
        **Surname**:string},....]
    Description: return a JSON array containing the list of students held by a teacher in one of **his** lecture

* ### /api/bookinglist
    Access:authenticated /students
    type: POST
    Body:none
    Response 200: [{
        **BookingId**:integer,
        **LectureId**:integer,
        **CourseId**:integer,
        **CourseName**:string, 
        **ClassroomName**:string,
    **Start**:'aaaa-mm-gg hh:mm',
    **End**:'aaaa-mm-gg hh:mm',  
    **Present**:0 or 1, 
    **LectureState**:0 or 1 or 2, 
    **BookingState**: 0 or 1 or 2, 
    **Timestamp**:integer },....]
    Description: return a JSON array containing the list of bookings held for a student

* ### /api/book
    Access:authenticated /students
    type: POST
    Body:{**lecture_id**:integer'}
    Response 200: {
        **BookingId**:lastID,
        **Enqueued**:0 or 1}
    Description: Books a student for a lecture, after checking id the student is enrolled for that course, it hasn't already booked the lecture and there are enough seats,if succesful return a JSON object containing the id of the of booking and a values that specifie if the student can attend the lecture(0) or is enqueued and has to wait for someone to cancel his booking. If the booking is succesfull it also sends an email to the student

* ### /api/cancelbooking
    Access:authenticated /students
    type: POST
    Body:{**booking_id**:integer'}
    Response 200: "OK"
    Description: cancel a booking for a student(after checking the booking_id is owned by the student who is logged), if the deletion is succesful it selects (if it exixts) the student in the waiting list for that lecture with the earlier timestamp and confirms the booing sending an email to him/her

* ### /api/cancellecture
    Access:authenticated /teacher
    type: POST
    Body:{**lecture_id**:integer'}
    Response 200: "OK"
    Description: cancel a lecture for a teacher(after checking the lecture_id is for a course held by the teacher who is logged), if the deletion is succesful sends an email notifiying all the studends who previosly booked the lecture

* ### /api/changelecture
    Access:authenticated /teacher
    type: POST
    Body:{**lecture_id**:integer'}
    Response 200: "OK"
    Description: declares a lecture to be held online (after checking the lecture_id is for a course held by the studteacher ent who is logged), if the deletion is succesful sends an email notifiying all the studends who previosly booked the lecture

* ### /api/stats/avg/week
    Access:authenticated /teacher/booking-manager
    type: POST
    Body:{
        **course_id**:integer',
        **Start**:'aaaa-mm-gg hh:mm',
        **End**:'aaaa-mm-gg hh:mm'}
    Response 200: [{
        **CourseId**:Integer,
        **Week**:Integer,
        **Month**:Integer,
        **Year**:Integer,
    **AvgBooked**:undefined,
    **AvgQueue**:undefined,
    **AvgCancelled**:undefined,
    **AvgPresent**:undefined}]
    Description: returns average statistic for lecture grouped by week for a specific course in the specified time range

* ### /api/stats/avg/month
    Access:authenticated /teacher/booking-manager
    type: POST
    Body:{
        **course_id**:integer',
        **Start**:'aaaa-mm-gg hh:mm',
        **End**:'aaaa-mm-gg hh:mm'}
    Response 200: [{
        **CourseId**:Integer,
        **Month**:Integer,
        **Year**:Integer,
    **AvgBooked**:undefined,
    **AvgQueue**:undefined,
    **AvgCancelled**:undefined,
    **AvgPresent**:undefined}]
    Description: returns average statistic for lecture grouped by month for a specific course in the specified time range

* ### /api/stats/tot/week
    Access:authenticated /teacher/booking-manager
    type: POST
    Body:{
        **course_id**:integer',
        **Start**:'aaaa-mm-gg hh:mm',
        **End**:'aaaa-mm-gg hh:mm'}
    Response 200:[ {
        **CourseId**:Integer,
        **Week**:Integer,
        **Month**:Integer,
        **Year**:Integer,
        **TotBooked**:Integer,
        **TotQueue**:Integer,
        **TotCancelled**:Integer,
        **TotPresent**:Integer}]
    Description: returns cumulative statistic for lecture grouped by week for a specific course in the specified time range

* ### /api/stats/tot/month
    Access:authenticated /teacher/booking-manager
    type: POST
    Body:{
        **course_id**:integer',
        **Start**:'aaaa-mm-gg hh:mm',
        **End**:'aaaa-mm-gg hh:mm'}
    Response 200:[ {
        **CourseId**:Integer,
        **Week**:Integer,
        **Month**:Integer,
        **Year**:Integer,
        **TotBooked**:Integer,
        **TotQueue**:Integer,
        **TotCancelled**:Integer,
        **TotPresent**:Integer}]
    Description: returns cumulative statistic for lecture grouped by month for a specific course in the specified time range

* ### /api/courselectures
    Access:authenticated /teacher/booking-manager
    type: POST
    Body:{
        **course_id**:integer',
        **Start**:'aaaa-mm-gg hh:mm',
        **End**:'aaaa-mm-gg hh:mm'}
    Response 200:  [{
                    **LectureId**:Integer,
                    **CourseId**:Integer,
                    **CourseName**:String,
                    **Start**:Datetime,
                    **End**:datetime,
                    **State**:Integer,
                    **ClassroomId**:Integer,
                    **ClassroomName**:String,
                    **Seats**:Integer
                }]
    Description: returns all lecture for a course  in the specified time range

* ### /api/dailystats
    Access:authenticated /teacher/booking-manager
    type: POST
    Body:{
        **lecture_id**:Integer',
        **n_lectures**:Integer}
    Response 200:  [{
        **LectureId**:undefined,
        **Start**:Integer,
        **CourseId**:Integer,
        **TotBooked**:Integer,
        **TotQueue**:Integer,
        **TotCancelled**:Integer,
        **TotPresent**:Integer}]
    Description: returns statistics about single lectures starting from the specified lecture id and taking previous n_lectures and following n_lecture of the same course

* ### /api/courselectures
    Access:authenticated /teacher/booking-manager
    type: GET
    Body:None,**End**:'aaaa-mm-gg hh:mm'}
    Response 200:  [{ **CourseId**:Integer,
                        **CourseName**:String,
                        **TeacherName**:String,
                        **TeacherSurname**:String
                    }]
    Description: returns all courses for techer if authenticated as teacher and all existing courses if authentictated as booking-manager

* ### /api/year
    Access:public
    type: GET
    Body:None
    Response 200:  [{ **Year**:Integer,
                        **Restricted**:Integer
                    }]
    Description: returns a list of all the years with their state (Restricted or not restricted)

* ### /api/uploadcsv/teachers
    Access:authenticated /officer
    type: POST
    Body:req.files.teachers in formdata
    Response 200:  an array with added teacher if the insert for that row of the file was successful or an error object if it wasn't
    Description: insert teacher info contained in the file

* ### /api/uploadcsv/students
    Access:authenticated /officer
    type: POST
    Body:req.files.students in formdata
    Response 200:  an array with added students if the insert for that row of the file was successful or an error object if it wasn't
    Description: insert students info contained in the file

* ### /api/uploadcsv/courses
    Access:authenticated /officer
    type: POST
    Body:req.files.courses in formdata
    Response 200:  an array with added courses if the insert for that row of the file was successful or an error object if it wasn't
    Description: insert courses and classrooms info contained in the file

* ### /api/uploadcsv/enrollments
    Access:authenticated /officer
    type: POST
    Body:req.files.enrollments in formdata
    Response 200:  an array with added enrollmentseacher if the insert for that row of the file was successful or an error object if it wasn't
    Description: insert enrollments info contained in the file (consistency check on courseId and studentId)

* ### /api/uploadcsv/lectures/:datestart/:dateend
    Access:authenticated /officer
    type: POST
    Body:req.files.lectures in formdata
    Response 200:  an array with added lecture if the insert for that row of the file was successful or an error object if it wasn't
    Description: insert lectures starting from a weekly schedule in the time range :datedtart-:dateend

* ### /api/generateContactTracingReport
    Access:authenticated booking-manager
    type: POST
    Body:{
        **student_id**:Integer',
        **date**:String AAAA-MM-DD}
    Response 200:  {
                        "JSON":[
                             {
                                UserId:Integer,
                                Email:String,
                                Name:String,
                                Surname:String,
                                Type:String
                            }
                        ],
                        "PathPDF":String,
                        "PathCSV":String
                    }
    Description: generates contact tracing report starting from a student id and the date he tested positive, returns a list of people who came into contact with him and path ro a pdf and a csv file containig the same information


* ### /api/reports
    Access:authenticated booking-manager
    type: GET
    Body:None
    Response 200:  [{
                        StudentId:Integer,
                        Date:String,
                        PathPDF:String,
                        pathCSV:String
                    }]
    Description: returns a list of all previously generated contact tracing report

* ### /api/putRestrictions
    Access:authenticated /students
    type: POST
    Body:{**year**:Integer,
        **date**: String AAAA-MM-DD}
    Response 200: "OK"
    Description: change lecture state from 'in-presence' to 'remote' for all lectures of courses of the specified year starting from the specified date

* ### /api/liftRestrictions
    Access:authenticated /students
    type: POST
    Body:{**year**:Integer,
        **date**: String AAAA-MM-DD}
    Response 200: "OK"
    Description: change lecture state from 'remotee' to 'remon-lineote' for all lectures of courses of the specified year starting from the specified date (only if they were previously restricted by the officer, it doesn't change lecture set to remote by the teacher )
    
* ### /api/classrooms
    Access:public
    type: POST
    Body:{**min_seats**:Integer}
    Response 200: {**ClassroomId**:Integer,
                   **Seats**:Integer,
                   **Name**:Strig}
    Description: returns the list of classrom with a number of seats greater or eqaul than min_seats
  
*  ### /api/updatePresence
    Access:authenticated /teacher
    type: POST
    Body:{**flag**:Integer,
        **booking_id**:integer}
    Response 200: "OK"
    Description: set a student who booked for a ecture as present (flag=1) or absentb(flag=0)
    
*  ### /api/updateSchedule
    Access:authenticated /officer
    type: POST
    Body:{**lecture_id**:Integer,
         **date**: String AAAA-MM-DD,
          **start_time**: String hh:mm,
          **end_time**: String hh:mm,
          **remote**:Integer,
          **classroom_id**:Integer}
    Response 200: "OK"
    Description: changes the schedule for a lecture starting from the one with id "lecture_id", it also sends email to all affected students
    
   
#Docker

The best way to launch the app from docker is to retreive the image from Docker Hub and launch it.
Simply run the following commands:

* ### docker pull jackgorga/pulsebs_team5:release3
* ### docker run -p 3000:3000 -p 3001:3001 jackgorga/pulsebs_team5:release3

The alternative is to download the code form Github, open the terminal in the main root and launch the following commands:

* ### docker-compose build
* ### docker-compose run

For this alternative, you have to change the proxy in package.json in client folder to "http://pulsebs-server:3001".





