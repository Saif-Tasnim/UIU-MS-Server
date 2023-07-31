const express = require('express');
const cors = require('cors')
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());


//testing
app.get("/", (req,res) =>{
    res.send("UIU MS Server is running 24/7")
})

app.listen(port , ()=>{
    console.log(`uiu server is using current free port : ${port}`)
})