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

const USERSFILE=path.join(__dirname,'users.json');

loadUsers();

app.get('/', (req, res) => {
  res.send(' Backend API by Bajai SZC Türr IStván Technikum - 13.A Szerverfejlesztő')
});

//get all users
app.get('/users', (req,res)=>{
    res.send(users);
})
//random get
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
          return res.send({msg:'A felhasználó törölve let'});
          saveUsers();
        }
        return res.status(400).send({msg:'Nincs ilyen felhasznalo'});

});

//UPDATE user by ID
app.patch('/users/:id', (req,res) =>{
    let id=req.params.id;
    let data=req.body;
    let idx=users.findIndex(user=>user.id==id);
    
    if(idx>-1)
        {
          users[idx]=data;
          users[idx].id=Number(id);
          saveUsers();
          return res.send({msg:'A felhasználó módositva let'});
        }
        return res.status(400).send({msg:'Nincs ilyen felhasznalo'});
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
