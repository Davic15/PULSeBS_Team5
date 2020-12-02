const express = require('express');
const dao = require('./dao');
const emaildeamon=require('./emailDeamon');
const morgan = require('morgan');
const jwt=require('express-jwt');
const jsonwebtoken=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const upload = require('express-fileupload');


const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
const expireTime = 1800; //seconds

const PORT = 3001;
const app = express();
app.disable("x-powered-by");

app.use(morgan('tiny'));
app.use(express.json());
app.use(upload());

dao.initializeDBConn('./PULSEeBS_db');
emaildeamon.startEmailDeamon()

//public API


//WARNING TO BE REMOVED IN FINAL VERSION!!!!!
app.post('/api/hash',(req,res)=>{
    const password=req.body.password;
    console.log(password);
    const hash=dao.generateHash(password);
    console.log(hash);
    res.json(hash);
});
/////////////////////////////

app.get('/api/seats/:lecture_id',(req,res)=>{
    dao.getSeatsCount(req.params.lecture_id).then((obj)=>{
        res.json(obj);
    }).catch((e)=>{
        res.status(400).json({errors:[{'param':'Server','msg':e}]});
    });
});


app.post('/api/login',(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;


    dao.getUser(email)
        .then((user)=>{
            
            if(user===undefined){
                res.status(401).send({
                    errors:[{'param':'Server','msg':'Invalid username'}]
                });
            }else{
                console.log(password);
                if(!dao.checkPassword(password,user.Password)){
                    res.status(401).send({
                        errors:[{'param':'Server','msg':'Wrong password'}]
                    });
                }else{
                    
                    const token=jsonwebtoken.sign({user:user.UserId, role:user.Type},jwtSecret,{expiresIn:expireTime});
                    
                    res.cookie('token',token,{httpOnly:true,sameSite:true,maxAge:1000*expireTime});
                    res.json({UserId:user.UserId,
                        Email:user.Email,
                        Name:user.Name,
                        Surname:user.Surname,
                        Type:user.Type});
                }
            }
        }).catch(
            (err)=>{
                
                new Promise((resolve)=>{
                    setTimeout(resolve,1000)
                }).then(()=>res.status(401).json(
                    {errors:[{'param':'Server','msg':'Authorization error'}]}
                ));
            }
        );
});

app.use(cookieParser());

app.post('/api/logout',(req,res)=>{
    res.clearCookie('token').end();
});

function checkRole(role, roles) {
    return roles.includes(role);
}

app.use(
    jwt({
        secret:jwtSecret,
        getToken:req=>req.cookies.token
    })
);

//Authorized API
app.post('/api/user', (req,res) => {
    const userid=req.user && req.user.user;

    dao.getUserById(userid)
        .then((user) => {
            res.json({UserId:user.UserId,
                Email:user.Email,
                Name:user.Name,
                Surname:user.Surname,
                Type:user.Type});
        }).catch(
        (err) => {
            res.status(401).json(authErrorObj);
        }
    );
});

app.post('/api/studentlectures',(req,res)=>{
    const user=req.user && req.user.user;
    const role = req.user && req.user.role;
    const date_start=req.body.date_start;
    const date_end =req.body.date_end;

    if(!checkRole(role,['student'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
    }

    dao.getLectures(user,date_start,date_end).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':'Server error'}]}
        );
    });
});

app.post('/api/teacherlectures',(req,res)=>{
    const user=req.user && req.user.user;
    const role = req.user && req.user.role;
    const date_start=req.body.date_start;
    const date_end =req.body.date_end;

    if(!checkRole(role,['teacher'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
    }

    dao.getTeacherLectures(user,date_start,date_end).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(JSON.stringify(err));
        res.status(500).json(
            {errors:[{'param':'Server','msg':'Server error'}]}
        );
    });
});

app.post('/api/studentlist',(req,res)=>{
    const user=req.user && req.user.user;
    const role = req.user && req.user.role;
    const lecture_id=req.body.lecture_id;

    if(!checkRole(role,['teacher'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
    }

    dao.getStudents(user,lecture_id).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(JSON.stringify(err));
        res.status(500).json(
            {errors:[{'param':'Server','msg':'Server error'}]}
        );
    });
});

app.post('/api/bookinglist',(req,res)=>{
    const user=req.user && req.user.user;
    const role = req.user && req.user.role;

    if(!checkRole(role,['student'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
    }

    dao.getBookings(user).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        console.log(JSON.stringify(err));
        res.status(500).json(
            {errors:[{'param':'Server','msg':'Server error'}]}
        );
    });
});

app.post('/api/book',(req,res)=>{
    const user=req.user && req.user.user;
    const lecture_id=req.body.lecture_id;
    const role = req.user && req.user.role;
    if(!checkRole(role,['student'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
    }
    dao.bookLecture(user,lecture_id).then((obj)=>{
        console.log(JSON.stringify(obj));
        res.json(obj);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':'Server error'}]}
        );
    });
});

app.post('/api/cancelbooking',(req,res)=>{
    //const user=req.user && req.user.user;
    const booking_id=req.body.booking_id;
    const role = req.user && req.user.role;
    if(!checkRole(role,['student'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
    }

    dao.cancelBooking(booking_id).then((obj)=>{
        res.json(obj);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':'Server error'}]}
        );
    });
});

app.post('/api/cancellecture',(req,res)=>{
    const user=req.user && req.user.user;
    const lecture_id=req.body.lecture_id;
    const role = req.user && req.user.role;

    if(!checkRole(role,['teacher'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
    }

    dao.changeLecture(user,lecture_id,1).then((obj)=>{
        res.json(obj);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':'Server error'}]}
        );
    });
});

app.post('/api/changelecture',(req,res)=>{
    const user=req.user && req.user.user;
    const lecture_id=req.body.lecture_id;
    const role = req.user && req.user.role;

    if(!checkRole(role,['teacher'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
    }

    dao.changeLecture(user,lecture_id,2).then((obj)=>{
        res.json(obj);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':'Server error'}]}
        );
    });
});

//sprint 2

app.post('/api/stats/:type/:groupby', async (req,res)=>{
    const user=req.user && req.user.user;
    const course_id=req.body.course_id;
    const date_start=req.body.date_start;
    const date_end=req.body.date_end;
    const type = req.params.type;
    const groupby= req.params.groupby;
    const role = req.user && req.user.role;


    if((type!="avg" && type !="tot") || (groupby!="week" && groupby !="month" ))
        res.status(400).json(
            {errors:[{'param':'Server','msg':'Bad Request'}]}
    );

    /*if(!checkRole(role,['teacher','booking-manager']) ){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
    }else if (checkRole(role,['teacher'])){
            let courselist= (await dao.getTeacherCourses(user)).map(obj=>{return obj.CourseId});
            if(!courselist.includes(course_id)){
                res.status(401).json(
                    {errors:[{'param':'Server','msg':'Unauthorized'}]}
                );
            }
    }*/

    dao.getStatistics(course_id,groupby,date_start,date_end).then((rows)=>{
        let ret_array=[];
        let obj={CourseId:-1,Week:undefined,Month:undefined,TotBooked:undefined,TotQueue:undefined,TotCancelled:undefined,TotPresent:undefined,
            AvgBooked:undefined,AvgQueue:undefined,AvgCancelled:undefined,AvgPresent:undefined}
        for (let row of rows){
           
            obj.CourseId=row.CourseId;
            obj.Week= groupby=="week" ?  row.Week : undefined;
            obj.Month= groupby=="month" ? row.Month : undefined;
            obj.Year=row.Year;
            if(type=="tot"){
                obj.TotBooked=row.SumBooked;            //number of bookings, refers only to held and cancelled lectures
                obj.TotQueue=row.SumQueue;              //number of people in queue, refers only to held and cancelled lectures
                obj.TotCancelled=row.SumCancelled;      //number of cancelled bookings, refers only to held and cancelled lectures
                obj.TotPresent=row.SumPresent;          //number of recorded presence, refers only to held lectures
            }
            if(type=="avg"){
                obj.AvgBooked=row.SumBooked/(row.TotHeld+row.TotCancelled);            
                obj.AvgQueue=row.SumQueue/(row.TotHeld+row.TotCancelled);              
                obj.AvgCancelled=row.SumCancelled/row.TotLectures;      
                obj.AvgPresent=row.SumPresent/row.TotHeld;          
            }
            ret_array.push(Object.assign({},obj));        
        }
        res.json(ret_array);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':'Server error'}]}
        );
    });
});



app.post('/api/courselectures', async (req,res)=>{
    const user=req.user && req.user.user;
    const course_id=req.body.course_id;
    const date_start=req.body.date_start;
    const date_end=req.body.date_end;
    const role = req.user && req.user.role;

    /*if(!checkRole(role,['teacher','booking-manager']) ){
        console.log("COURSES DEBUG 1");
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
    }else if (checkRole(role,['teacher'])){
            let courselist= (await dao.getTeacherCourses(user)).map(obj=>{return obj.CourseId});
            console.log(course_id+ " IN " + courselist+" "+courselist.constructor.name);
            console.log([1,2,3]);
            console.log(courselist.includes(course_id));
            if(!courselist.includes(course_id)){
                console.log("COURSES DEBUG 3");
                res.status(401).json(
                    {errors:[{'param':'Server','msg':'Unauthorized'}]}
                );
            }
    }*/

    dao.getCourseLecture(course_id,date_start,date_end).then((obj)=>{
        res.json(obj);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':'Server error'}]}
        );
    });

});


app.post('/api/dailystats', async (req,res)=>{
    const user=req.user && req.user.user;
    const lecture_id=req.body.lecture_id;
    const n_lectures=parseInt(req.body.n_lectures);
    const role = req.user && req.user.role;
    
    if(!checkRole(role,['teacher','booking-manager']) ){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
    }

    console.log("OK"+ lecture_id);
    let lectObj= await dao.getLectureInfo(lecture_id);
    /*if (checkRole(role,['teacher'])){
            let courselist= (await dao.getTeacherCourses(user)).map(obj=>{return obj.CourseId});
            if(!courselist.includes(lectObj.CourseId)){
                res.status(401).json(
                    {errors:[{'param':'Server','msg':'Unauthorized'}]}
                );
            }
    }*/
    let start = await dao.getLowerDate(lecture_id,n_lectures+1);
    let end = await dao.getHigherDate(lecture_id,n_lectures+1);
    console.log(JSON.stringify(end));

    dao.getStatistics(lectObj.CourseId,'lecture',start.Date,end.Date).then((rows)=>{
        let ret_array=[];
        let obj={LectureId:undefined,Start:undefined,CourseId:-1,TotBooked:undefined,TotQueue:undefined,TotCancelled:undefined,TotPresent:undefined}
        for (let row of rows){
           
            obj.LectureId=row.LectureId;
            obj.CourseId=row.CourseId;
            obj.Start=row.Start;
            obj.Year=row.Year;
            obj.TotBooked=row.SumBooked;            //number of bookings, refers only to held and cancelled lectures
            obj.TotQueue=row.SumQueue;              //number of people in queue, refers only to held and cancelled lectures
            obj.TotCancelled=row.SumCancelled;      //number of cancelled bookings, refers only to held and cancelled lectures
            obj.TotPresent=row.SumPresent;          //number of recorded presence, refers only to held lectures
            
            ret_array.push(Object.assign({},obj));        
        }
        res.json(ret_array);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':'Server error'}]}
        );
    });

});

app.get('/api/courses', async (req,res)=>{
    const user=req.user && req.user.user;
    const role = req.user && req.user.role;

    if(!checkRole(role,['teacher','booking-manager']) ){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
    }else if (checkRole(role,['teacher'])){
            
        dao.getTeacherCourses(user).then((obj)=>{
            res.json(obj);
        }).catch((err)=>{
            res.status(500).json(
                {errors:[{'param':'Server','msg':'Server error'}]}
            );
        });
    }else{
        dao.getAllCourses().then((obj)=>{
            res.json(obj);
        }).catch((err)=>{
            res.status(500).json(
                {errors:[{'param':'Server','msg':'Server error'}]}
            );
        });
    }
});

app.post('/api/uploadcsv/teachers', (req,res) => {
    const file = req.files.teachers;    //teachers must be the input name in template
    const role = req.user && req.user.role;

    if(!checkRole(role,['officer'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
        return;
    }

    if(file == undefined || file.data == undefined) {
        res.status(400).json(
            {errors:[{'param':'Server','msg':'File undefined, check the input name and file content'}]}
        );
        return;
    }

    dao.addTeachers(file.data).then((obj)=>{
        res.json(obj);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':err}]}
        );
    });
});

app.post('/api/uploadcsv/students', (req,res) => {
    const file = req.files.students;    //students must be the input name in template
    const role = req.user && req.user.role;

    if(!checkRole(role,['officer'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
        return;
    }

    if(file == undefined || file.data == undefined) {
        res.status(400).json(
            {errors:[{'param':'Server','msg':'File undefined, check the input name and file content'}]}
        );
        return;
    }

    dao.addStudents(file.data).then((obj)=>{
        res.json(obj);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':err}]}
        );
    });
});

app.post('/api/uploadcsv/courses', (req,res) => {
    const file = req.files.courses;    //courses must be the input name in template
    const role = req.user && req.user.role;

    if(!checkRole(role,['officer'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
        return;
    }
    
    if(file == undefined || file.data == undefined) {
        res.status(400).json(
            {errors:[{'param':'Server','msg':'File undefined, check the input name and file content'}]}
        );
        return;
    }

    dao.addCourses(file.data).then((obj)=>{
        res.json(obj);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':err}]}
        );
    });
});

app.post('/api/uploadcsv/lectures', (req,res) => {
    const file = req.files.lectures;    //lectures must be the input name in template
    const role = req.user && req.user.role;

    if(!checkRole(role,['officer'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
        return;
    }

    if(file == undefined || file.data == undefined) {
        res.status(400).json(
            {errors:[{'param':'Server','msg':'File undefined, check the input name and file content'}]}
        );
        return;
    }

    dao.addLectures(file.data).then((obj)=>{
        res.json(obj);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':err}]}
        );
    });
});

app.post('/api/uploadcsv/classrooms', (req,res) => {
    const file = req.files.classrooms;    //classrooms must be the input name in template
    const role = req.user && req.user.role;

    if(!checkRole(role,['officer'])){
        res.status(401).json(
            {errors:[{'param':'Server','msg':'Unauthorized'}]}
        );
        return;
    }

    if(file == undefined || file.data == undefined) {
        res.status(400).json(
            {errors:[{'param':'Server','msg':'File undefined, check the input name and file content'}]}
        );
        return;
    }

    dao.addClassrooms(file.data).then((obj)=>{
        res.json(obj);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':err}]}
        );
    });
});

app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));