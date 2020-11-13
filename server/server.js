const express = require('express');
const dao = require('./dao');
const morgan = require('morgan');
const jwt=require('express-jwt');
const jsonwebtoken=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const moment=require('moment');

const jwtSecret = '6xvL4xkAAbG49hcXf5GIYSvkDICiUAR6EdR5dLdwW7hMzUjjMUe9t6M5kSAYxsvX';
const expireTime = 1800; //seconds

const PORT = 3001;
const app = express();

app.use(morgan('tiny'));
app.use(express.json());

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
                    
                    const token=jsonwebtoken.sign({user:user.UserId},jwtSecret,{expiresIn:expireTime});
                    
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

app.use(
    jwt({
        secret:jwtSecret,
        getToken:req=>req.cookies.token
    })
);


//Authorized API



app.post('/api/lectures',(req,res)=>{
    const user=req.user && req.user.user;
    const date_start=req.body.date_start;
    const date_end =req.body.date_end;

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
    const date_start=req.body.date_start;
    const date_end =req.body.date_end;

    dao.getTeacherLectures(user,date_start,date_end).then((data)=>{
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
    dao.bookLecture(user,lecture_id).then((obj)=>{
        console.log(JSON.stringify(obj));
        res.json(obj);
    }).catch((err)=>{
        res.status(500).json(
            {errors:[{'param':'Server','msg':'Server error'}]}
        );
    });
});

app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}/`));