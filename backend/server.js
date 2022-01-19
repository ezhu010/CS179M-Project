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
  res.send(200)
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, console.log(`Server started on port ${PORT}`));

