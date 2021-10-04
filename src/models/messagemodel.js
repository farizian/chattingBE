/* eslint-disable max-len */
// menghandle query table message
const db = require('../config/db');

const messagemodel = {
  gettotal: () => new Promise((resolve, reject) => {
    db.query('select * from message', (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.length);
      }
    });
  }),
  getmsg: (sender, receiver) => new Promise((resolve, reject) => {
    db.query(`select * from message where
    (sender='${sender}' and receiver='${receiver}')
    OR
    (sender='${receiver}' and receiver='${sender}')`,
    (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }),
  getimg: (id) => new Promise((resolve, reject) => {
    db.query(`select img from message where id='${id}'`, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }),
  insert: (sender, receiver, msg) => new Promise((resolve, reject) => {
    db.query(`insert into message (sender, receiver, text_msg) value ('${sender}', '${receiver}', '${msg}')`, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }),
  del: (id) => new Promise((resolve, reject) => {
    db.query(`delete from message where id='${id}'`, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }),
  update: (body) => new Promise((resolve, reject) => {
    const { sender, receiver, msg } = body;
    db.query(`update message set msg="${msg}" where 
    (sender='${sender}' and receiver='${receiver}')
    OR
    (sender='${receiver}' and receiver='${sender}') `,
    (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  }),
};

module.exports = messagemodel;
