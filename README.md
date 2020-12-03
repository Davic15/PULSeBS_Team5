# PULSeBS_Team5

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



#Docker

The best way to launch the app from docker is to retreive the image from Docker Hub and launch it.
Simply run the following commands:

* ### docker pull jackgorga/pulsebs_team5:release1
* ### docker run -p 3000:3000 -p 3001:3001 jackgorga/pulsebs_team5:release1

The alternative is to download the code form Github, open the terminal in the main root and launch the following commands:

* ### docker-compose build
* ### docker-compose run

For this alternative, you have to change the proxy in package.json in client folder to "http://pulsebs-server:3001".





