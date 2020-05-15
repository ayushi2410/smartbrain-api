const express=require('express');
const bodyParser=require('body-parser');
const app=express();
const cors=require('cors');
const bcrypt = require('bcryptjs');
app.use(bodyParser.json());
app.use(cors());


var db = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'system',
    database : 'smartbrain'
  }
});


db.select('*').from('users').then(data=>console.log(data));
const database={
users:[
{
	email:'john@gmail.com',
	id:'123',
  entries:'0',
  password:'sss'
},
{
  email:'a@gmail.com',
  id:'124',
   entries:'0',
   password:'ppp'
}]
,
login:[{
email:'',
hash:'',
id:''
}]
};
app.get('/',(req,res)=>{
  res.json(database.users);
})
////login
app.post('/signin',(req,res)=>{
db.select('email','hash').from('login').
where('email','=',req.body.email).
then(data=>{
  const isValid=bcrypt.compareSync(req.body.password,data[0].hash);
  //console.log(isValid);
  if(isValid)
{
 return db.select('*').from('users').
  where('email','=',req.body.email).
  then(user=>{
    res.json(user[0])
  }).
  catch(err=>res.status(400).json('error'))
}else{
return res.status(400).json("wrong credentials");}
}).catch(err=>res.status(400).json("error loggining in"))
})
////register
app.post('/register',(req,res)=>{
       const {email,name,password}=req.body;
       const hash=bcrypt.hashSync(password);
      // console.log(hash);
  db.transaction(trx=>{
    trx.insert({
      hash:hash,
      email:email
    }).into('login').
    returning('email').
    then(loginEmail=>{
       return trx('users').
              returning('*').
               insert({
                email:loginEmail[0],
                name:name,
                joined:new Date()
               }).then(user=>
                res.json(user[0]))
               
  }).then(trx.commit).catch(trx.rollback)
  }).catch(err=>res.status(400).json('unable to join'));
    
             
})
///profile id
app.get('/profile/:id',(req,res)=>{
  const {id}=req.params;
  db.select('*').from('users').where({id}).
  then(user=>{
    if(user.length)
    res.json(user[0]);
  else res.status(400).json('error user does not exist');
  }).catch(err=>res.json('error getting users'));
 
})///image count
app.put('/image',(req,res)=>{
  const {id}=req.body;
  db('users').where('id','=',id).
    increment('entries',1).
    returning('entries').
    then(entries=>res.json(entries)).
    catch(err=>res.status(400).json('erroor'));
})


app.listen(8008,()=>{console.log("running..");})
