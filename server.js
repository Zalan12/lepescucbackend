const express= require('express');

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))

let users=[

    {id:0, name:'Béla',age:23,gender:'male'},
    {id:1, name:'Anna',age:15,gender:'female'},
    {id:2, name:'Martin',age:19,gender:'male'},
    {id:3, name:'Józsi',age:34,gender:'male'},
    {id:4, name:'Maria',age:21,gender:'female'}
];

app.get('/', (req, res) => {
  res.send(' Backend API by Bajai SZC Türr IStván Technikum - 13.A Szerverfejlesztő')
});

//get all users
app.get('/users', (req,res)=>{
    res.send(users);
})

app.get('/users/:id',(req,res)=>{
    let id=req.params.id;
    let idx=users.findIndex(user=>user.id==id);
    
    if(idx>-1)
        {
           return res.send(users[idx]);
        }
        return res.send('Nincs ilyen felhasznalo');
})

// POST new user

app.post('/users', (req,res)=>{

    let data=req.body;
    console.log(data);
    res.send("blablablaableblebe")
});

app.listen(3000)

