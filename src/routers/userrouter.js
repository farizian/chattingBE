// untuk menghandle router table user

const express = require('express');
const userctrl = require('../controllers/userctrl');
const midAuth = require('../middleware/auth');
const upload = require('../middleware/upload');

const userrouter = express.Router();
userrouter
  .get('/user', userctrl.getlist)
  .get('/userdetails', midAuth, userctrl.getdetail)
  .get('/detailbyname/:username', userctrl.detailByName)
  .post('/user', upload, userctrl.insert)
  .post('/login', userctrl.login)
  .post('/register', userctrl.register)
  .delete('/user/:id', midAuth, userctrl.del)
  .put('/user/:id', midAuth, upload, userctrl.update)
  .put('/userpw/:id', midAuth, upload, userctrl.updatePw);

module.exports = userrouter;
