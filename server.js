const express= require('express');
const fs=require('fs');
const path=require('path');
const cors=require('cors');
const app = express()
//Middlewarek
app.use(cors());
app.use(express.json()) //JSON formátum követelése
app.use(express.urlencoded({extended: true})) //req body-n keresztül átmennek az adatok

let users=[];
let lepesAdat=[];

const USERSFILE=path.join(__dirname,'users.json');
const LEPESFILE=path.join(__dirname,'stepData.json')



loadUsers();
loadData();

app.get('/', (req, res) => {
  res.send(' Backend API by Bajai SZC Türr IStván Technikum - 13.A Szerverfejlesztő')
});

//------------------USERS-----------------

//get all users
app.get('/users', (req,res)=>{
    res.send(users);
})
//get user by id
app.get('/users/:id',(req,res)=>{
    let id=req.params.id;
    let idx=users.findIndex(user=>user.id==id);
    
    if(idx>-1)
        {
           return res.send(users[idx]);
        }
        return res.status(400).send({msg:'Nincs ilyen felhasznalo'});
})

// POST new user

app.post('/users', (req,res)=>{

    let data=req.body;
    if(isEmailExists(data.email)){
        return res.status(400).send({msg:'Ez a cim mar regisztralt!'})
    }
    data.id=getNextID();
    users.push(data);
    saveUsers();
    res.send({msg:'Sikreres regisztráció!'});
    
});


//post Logged user
app.post('/users/login',(req,res)=> {
    let { email, password }=req.body;
    let loggeduser={};
    users.forEach(user => {
        if(user.email==email && user.password==password){
            loggeduser=user;
            return;
        }
    })
    res.send(loggeduser);

})

//DELELTE user By ID

app.delete('/users/:id', (req,res)=>{
    let id=req.params.id;
    let idx=users.findIndex(user=>user.id==id);
    
    if(idx>-1)
        {
          users.splice(idx,1);
          saveUsers();
          return res.send({msg:'A felhasználó törölve let'});
          
        }
        return res.status(400).send({msg:'Nincs ilyen felhasznalo'});

});

//UPDATE user by ID
app.patch('/users/:id', (req,res) =>{
    let id=Number(req.params.id);
    let data=req.body;
    let idx=users.findIndex(user=>Number(user.id)==id);
    
    if(idx>-1)
        {
          users[idx]=data;
          users[idx].id=Number(id);
          saveUsers();
          return res.send({msg:'A felhasználó módositva let'});
        }
        return res.status(400).send({msg:'Nincs ilyen felhasznalo'});
})

//UPDATE felhasználó cuccos
app.patch('/users/:id', (req,res) =>{
    let id=Number(req.params.id);
    let data=req.body;
    let idx=users.findIndex(user=>Number(user.id)===id);
    
    if(idx>-1)
    {
        if(data.email && data.email != users[idx].email)
            {
                let exists=users.some(user => user.email===data.email && Number(user.id)!==id)
                if(exists)
                    {return res.status(400).send({msg: "Foglalt email cím!"})
            }
            users[idx].email=data.email;
            }
        if(data.name) users[idx].name=data.name;
        saveUsers();
        return res.send({user: users[idx]})

    }
    return res.status(400).send({msg: "Nincs ilyen felhjasználó"})
})

//PATCH Jelszovaltas
app.patch('/users/jelszovalt/:id',(req, res) => {
    let id=Number(req.params.id);
    let data=req.body;
    let idx=users.findIndex(user=>Number(user.id)===id);
    
    if(idx>-1)
    {
        if(data.password && data.newPassword){
        users[idx].password=data.newPassword;
        saveUsers()
        return res.send({msg: "A felhasználó módosítva lett", user:users[idx]})}
        
    }
    
})

//----------------STEPS---------------------

//GET all steps by all users
app.get('/steps', (req,res)=>{
    res.send(lepesAdat);

})

//GET all step by UserID
app.get('/steps/user/:uid',(req,res) => {
    let userLepes = []
    let uid = Number(req.params.uid)
    for (let i = 0; i < lepesAdat.length; i++) {
        if(lepesAdat[i].uid == uid){
            userLepes.push(lepesAdat[i])
        }
        
    }
    res.send(userLepes)
})


//GET one step by id
app.get('/steps/:id', (req,res)=>{
    let id=req.params.id;
    let idx=lepesAdat.findIndex(step=>step.sid==id);
    
    if(idx>-1)
        {
           return res.send(lepesAdat[idx]);
        }
        return res.status(400).send({msg:'Nincs ilyen felhasznalo'});
    
})
//POST new step
app.post('/steps',(req,res)=>{
    let data=req.body;
    data.sid=getNextSID();
    lepesAdat.push(data);
    saveData();
    res.send({msg:'Sikreres adatfelvétel!'});

})

//PATCH step by id

app.patch('/steps/:id', (req,res) =>{
    let id=Number(req.params.id);
    let data=req.body;
    let idx=lepesAdat.findIndex(adat=>Number(adat.sid)===id);
    
    if(idx>-1)
    {
       if(data.datum) lepesAdat[idx].datum=data.datum;
       if(data.lepes) lepesAdat[idx].lepes=data.lepes;
       saveData();
       return res.send({msg: "A lépésadat módosítva lett!",lepes:lepesAdat[idx]})
    }
    return res.status(400).send({msg: "Nincs ilyen fazonosítóval ellátott adat"})
})

//DELETE step by id

app.delete('/steps/:id', (req,res)=>{
    let id=req.params.id;
    let idx=lepesAdat.findIndex(user=>user.sid==id);

        lepesAdat.splice(idx,1);
        saveData();
        return res.send({msg:'Az adat törölve let'});
        

});

//DELETE all steps by userId
app.delete('/steps/user/:uid', (req,res)=>{
    let uid=req.params.uid;
        for (let i = 0; i < lepesAdat.length; i++) {
        if(lepesAdat[i].uid == uid){
            lepesAdat.splice(i,1)
            i--
        }
        
    }
    saveData()
    res.send("Sikeresen törölve!")
});
//DELETE all stepData
app.delete('/steps',(req,res) =>{
    lepesAdat = []
    saveData()
    res.send("Összes adat törölve")
})

app.listen(3000)

function getNextID()
{
    let nextID=1;
    if(users.length==0)
        {
            return nextID;
        }
    let maxIndex=0;
    for (let i = 0; i < users.length; i++) {
        if(users[i].id>users[maxIndex].id)
            {
                maxIndex=i;
                
            }
        
    }
    return users[maxIndex].id+1;
}

function getNextSID()
{
    let nextSID=1;
    if(lepesAdat.length==0)
        {
            return nextSID;
        }
    let maxIndex=0;
    for (let i = 0; i < lepesAdat.length; i++) {
        if(lepesAdat[i].sid>lepesAdat[maxIndex].sid)
            {
                maxIndex=i;
                
            }
        
    }
    return lepesAdat[maxIndex].sid+1;
}
function loadUsers()
{
    if(fs.existsSync(USERSFILE))
        {
            const raw=fs.readFileSync(USERSFILE);
            try
            {
                users=JSON.parse(raw);

            }
            catch(err){
                console.log("Hiba!",err);
                users=[];
            }
        }
    else{
        saveUsers();
    }
}
function saveUsers(){
    fs.writeFileSync(USERSFILE,JSON.stringify(users));

}

function isEmailExists(email)
{
    let exists=false;
    users.forEach(user=>{
        if(user.email==email){
            exists=true;
            return;
        }
    })
    return exists;
}
function saveData(){
    fs.writeFileSync(LEPESFILE,JSON.stringify(lepesAdat));
}

function loadData()
{
    if(fs.existsSync(LEPESFILE))
        {
            const raw=fs.readFileSync(LEPESFILE);
            try
            {
                lepesAdat=JSON.parse(raw);

            }
            catch(err){
                console.log("Hiba!",err);
                lepesAdat=[];
            }
        }
    else{
        saveData();
    }
}