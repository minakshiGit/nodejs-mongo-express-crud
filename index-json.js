const express = require("express")
const fs = require("fs")
const users = require('./users.json')

const app = express()
const PORT = 4000

//Middleware
app.use(express.urlencoded({ extended: true })) 
app.use((req, res, next) => {
    console.log("Hello from middleware 1");
    //return res.json({ msg: "Hello from middleware 1" })
    //return res.end("hey")
    req.myUsername = "mindev";
    next();
})
app.use((req, res, next) => {
    console.log("Hello from middleware 2",req.myUsername)
    //return res.json({ msg: "Hello from middleware 2" })
    // return res.end("hey")
    next()
})
//Routes
app.get('/', (req, res) => {
    return res.json("Welcome to home page")
    
})
app.get('/users', (req, res) => {
    const html = `
    <ul>
    ${users.map((user) => `
    <li>First Name: ${user.first_name}</li>
    <li>Last Name: ${user.last_name}</li>
    <li>Email: ${user.email}</li>
    <li>Gender: ${user.gender}</li>
    <li>Job Title: ${user.job_title}</li>
    `).join("")}
    </ul>
    `;
    return res.send(html)
})
//Rest API

// app.get('/api/users/:id', (req, res) => {
//     const id = Number(req.params.id)
//     const user =users.find((user) =>user.id ===id)
//     return res.json(user)
    
// })
//
app.get("/api/user-list", (req, res) => {
    //console.log("response middleware 1", req.myUsername)
    console.log(req.headers)
    //Always add X to custom header like x-myName
    res.setHeader("x-myName","Minakshi Dev")
    return res.json(users)
})
//Grouping of routes
app
.route("/api/users/:id")
.get((req, res) => {
    const id = Number(req.params.id)
    const user =users.find((user) =>user.id ===id)
    return res.json(user)
})
.patch((req, res) => {
    const id = Number(req.params.id)
    const usersBody = req.body
    const user = users.find((user) => user.id === id)
    if (user) {
        user.first_name = usersBody.first_name;
        fs.writeFile('./users.json', JSON.stringify(users, null, 2),(err, data) => {
        return res.json({status:"Success User updated",user})
        })
        
    } else {
         return res.json({ status: "pending" })
    }
})
.delete((req, res) => {
    const id = Number(req.params.id)
    const usersBody = req.body
    const user = users.find((user) => user.id === id)
   
    //delete users[user]; // Deletes the entire object at index 0
    if (user) {
       // user.first_name = ""
        const deleteObj = (data, column, search) => {
        let result = data.filter(m => m[column] !== search);
            fs.writeFile('./users.json', JSON.stringify(result, null, 2),(err, data) => {
                return res.json({status:"Success User deleted",result})
            })
        }
        const deleted = deleteObj(users, 'id', id);
    } else {
         return res.json({ status: "User not found" })
    }

})

app.post('/api/users', (req, res) => {
    const body = req.body
    if (!body || !body.first_name || !body.last_name || !body.email || !body.gender || !body.job_title) {
        return res.status(404).json({ msg:'All fields are required'})
    }
    users.push({...body, id:users.length+1 })
    fs.writeFile('./users.json', JSON.stringify(users),(err, data) => {
       // return res.json({ status: "pending" })
        return res.status(201).json({status:"Success",id:users.length })
    })
  
// })
})
// app.patch("/api/users:id", (req, res) => {
//     TODO: update Users
//     return res.json({status:"pending"})
// })
// app.delete("/api/users:id", (req, res) => {
    //TODO: delete Users
//     return res.json({status:"pending"})
// })

app.listen(PORT, (req, res) => {
    console.log(`Server started at ${PORT}`)
})