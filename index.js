const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const users = require('./users.json');

const app = express();
const PORT = 4000;
const dbUrl = "mongodb url";

// connection 
mongoose.connect(dbUrl)
    .then(() => console.log("Mongo DB Connected"))
    .catch((error) => console.log("Mongo err", error))


//schema
const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required:true
        },
        lastName: {
            type: String
        },
        email: {
            type: String,
            unique:true,
            required:true
        },
        gender: {
            type: String,
        },
        jobTitle: {
            type: String,
        },
    },
    { timestamps: true }
)    
const User =    mongoose.model('user',userSchema)

//Middleware
app.use(express.urlencoded({ extended: true })) 

//Routes
app.get('/users', async(req, res) => {
    const allDBUser =await User.find({})
    const html = `
    <ul>
    ${allDBUser.map((user) => `
    <li>First Name: ${user.firstName}</li>
    <li>Last Name: ${user.lastName}</li>
    <li>Email: ${user.email}</li>
    <li>Gender: ${user.gender}</li>
    <li>Job Title: ${user.jobTitle}</li>
    `).join("")}
    </ul>
    `;
    return res.send(html)
})
//Rest API

app.get("/api/user-list", async(req, res) => {
    res.setHeader("x-myName","Minakshi Dev")
    const allDBUser =await User.find({})
    return res.json(allDBUser)
})
//Grouping of routes
app
.route("/api/users/:id")
    .get(async(req, res) => {
    const id = req.params.id
    const user = await User.findById(id)
    if(!user) return res.status(404).json({error:"user not found"})
    return res.json(user)
})
.patch(async (req, res) => {
    const id = req.params.id
    const user = await User.findByIdAndUpdate(id,{lastName:req.body.last_name})
    if (user) {
        return res.status(202).json({status:"Success User updated",user})
    } else {
         return res.status(504).json({ status: "error" })
    }
})
.delete(async (req, res) => {
    const id = req.params.id
    const user = await User.findByIdAndDelete(id)
    if (user) {
        return res.json({status:"Success User deleted"})
    } else {
         return res.json({ status: "User not found" })
    }

})

app.post('/api/users',async (req, res) => {
    const body = req.body
    if (
        !body ||
        !body.first_name ||
        !body.last_name ||
        !body.email ||
        !body.gender ||
        !body.job_title
    ) {
        return res.status(404).json({ msg:'All fields are required'})
    }
    await User.create({
        firstName: body.first_name,
        lastName: body.last_name,
        email: body.email,
        gender: body.gender,
        jobTitle: body.job_title
    });
    return res.status(201).json({msg:'Success'})

})


app.listen(PORT, (req, res) => {
    console.log(`Server started at ${PORT}`)
})