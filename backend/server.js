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
  fs.appendFile('../cs179m_project/Logs/log.txt', req.body.datetime, err => {
    if (err) {
      console.error(err)
      return
    }
  })
next()
}, function(req, res, next) {
  res.sendStatus(200)
});

app.post("/manifestDownload", (req, res, next) => {
  var manifestName = req.body.manifestName
  var manifestContents= req.body.manifestContents
  manifestName = manifestName.substring(0, manifestName.length - 4) + "_OUTBOUND.txt"
  console.log(manifestName);
  fs.writeFile(`./finalManifest/${manifestName}`, manifestContents, err => {
    if (err) {
      console.error(err)
      return
    }
  })
next()
}, function(req, res, next) {
  res.sendStatus(200)
});

app.post("/CycleLog", (req, res, next) => {
  fs.appendFile('../cs179m_project/Logs/log.txt', req.body.logMessage, err => {
    if (err) {
      console.error(err)
      return
    }
  })
next()
}, function(req, res, next) {
  res.sendStatus(200)
});

app.post("/writeInstruction", (req, res, next) => {
  fs.appendFile('../cs179m_project/Logs/log.txt', req.body.instruction, err => {
    if (err) {
      console.error(err)
      return
    }
  })
next()
}, function(req, res, next) {
  res.sendStatus(200)
});


// For log after manifest is uploaded
app.post("/manifestLogWrite", (req, res, next) => {
  fs.appendFile('../cs179m_project/Logs/log.txt', req.body.logData, err => {
    if (err) {
      console.error(err)
      return
    }
  })
  next()
}, 
  function(req, res, next) {
    res.sendStatus(200)
  }
);


const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Server started on port ${PORT}`));

