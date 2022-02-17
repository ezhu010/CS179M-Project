const express = require("express");
const app = express();
const cors = require('cors');
const fs =  require('fs')
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors()) // Use this after the variable declaration

//use cors to allow cross origin resource sharing
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
  
app.post("/post", (req, res, next) => {
  fs.appendFile('../cs179m_project/Logs/test.txt', req.body.datetime, err => {
    if (err) {
      console.error(err)
      return
    }
  })
next()
}, function(req, res, next) {
  res.sendStatus(200)
});


app.post("/uploadfile", (req, res, next) => {
  // put the file in public/data folder and make sure data folder is empty
  var fileData = Object.keys(req.body)
  var fileContents = ""
  for(var line of fileData){
    fileContents += line
  } 
  fs.appendFile("../cs179m_project/public/data/manifest.txt", fileContents, err => {
    if(err) {
      console.log(err)
    }
  })
  console.log("testing here");
next()
}, function(req, res, next) {
  res.sendStatus(200)
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Server started on port ${PORT}`));

