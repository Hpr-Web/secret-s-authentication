//jshint esversion:6
const express = require("express");
const mongoose = require("mongoose");
const app = express();


app.use(express.static("public"));
app.use(express.urlencoded({extended:true}))
app.set("view engine", "ejs");

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');

  const userSchema = {
    email:String,
    password:String
  };

  const user = mongoose.model("User", userSchema);

  app.get("/", (req, res)=>{
    res.render("home")
});

app.get("/login", (req, res)=>{
    res.render("login")
});

app.get("/register", (req, res)=>{
    res.render("register")
});

app.post("/register", async(req, res)=> {
    const email = req.body.username; 
    const password = req.body.password; 

    const newUser = new user({
        email:email,
        password:password
    });

    await newUser.save();

    res.render("secrets");

    console.log(email);
    console.log(password);
});

app.post("/login", async(req, res) =>{
    const username = req.body.username;
    const password = req.body.password;

    console.log(username);
    console.log(password);
    
    const foundUser = await user.findOne({email:username});
    console.log(foundUser);

    if(foundUser){
        if(foundUser.password === password){
            res.render("secrets")
        }else{
            res.json("mess:Incorrect password")
        }
    }else{
        res.json("mess:Incorrect username")
    }   
});

app.listen(3000, ()=>{
    console.log("server is listening on port:3000")
});

}
