/* eslint-disable no-shadow */
/* eslint-disable max-len */
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const models = require('../models/usermodel');
const { success, failed, successlogin } = require('../helper/response');

const env = require('../helper/env');

// table user di dalam database coffee_shop di mysql
const userctrl = {
// menampilkan list user
  getlist: (req, res) => {
    try {
      const { query } = req;
      const search = query.search === undefined ? '' : query.search;
      const field = query.field === undefined ? 'username' : query.field;
      const sort = query.sort === undefined ? 'asc' : query.sort;
      const limit = query.limit === undefined ? 50 : query.limit;
      const offset = query.page === undefined || query.page === 1 ? 0 : (query.page - 1) * limit;
      models.getlist(search, field, sort, limit, offset)
        .then(async (result) => {
          const total = await models.gettotal();
          const output = {
            data: result,
            search,
            limit,
            page: query.page,
            totalpage: Math.ceil(total / limit),
          };
          success(res, output, 'get user data success');
        })
        .catch((err) => {
          failed(res, 500, err);
        });
    } catch (err) {
      failed(res, 401, err);
    }
  },
  // menampilkan detail table user berdasarkan id
  getdetail: (req, res) => {
    try {
      const id = req.userId; // url parameter untuk mengambil id
      models.getdetail(id).then((result) => {
        success(res, result, 'get user details success');
      })
        .catch((err) => {
          failed(res, 500, err);
        });
    } catch (err) {
      failed(res, 401, err);
    }
  },
  detailByName: (req, res) => {
    try {
      const { username } = req.params; // url parameter untuk mengambil id
      models.detailByName(username).then((result) => {
        success(res, result, 'get user details success');
      })
        .catch((err) => {
          failed(res, 500, err);
        });
    } catch (err) {
      failed(res, 401, err);
    }
  },
  // insert data user
  insert: (req, res) => {
    try {
      const { body } = req;
      const img = req.file.filename;
      const pw = bcrypt.hashSync(body.password, 10);
      models.insert(img, body, pw)
        .then((result) => {
          success(res, result, 'Input To User Data Success');
        })
        .catch((err) => {
          failed(res, 400, err);
        });
    } catch (err) {
      failed(res, 401, err);
    }
  },
  // login ke database
  login: (req, res) => {
    try {
      const { body } = req;
      models.login(body).then((result) => {
        if (result.length <= 0) {
          failed(res, 400, 'Email salah');
        } else {
          const user = result[0];
          const userId = {
            id: user.id,
          };
          const token = jwt.sign(userId, env.pwtoken);
          const passwordHash = result[0].password;
          const pw = bcrypt.compareSync(body.password, passwordHash);
          if (pw === true) {
            successlogin(res, result, token);
          } else {
            failed(res, 404, 'password salah');
          }
        }
      }).catch((err) => {
        failed(res, 404, err);
      });
    } catch (err) {
      failed(res, 500, err);
    }
  },
  // register
  register: (req, res) => {
    try {
      const { body } = req;
      const img = 'default.png';
      models.checkregister(body).then((result) => {
        if (result[0].email) {
          failed(res, 401, 'email sudah digunakan');
        }
      }).catch(() => {
        bcrypt.hash(body.password, 10, (err, hash) => {
          // Store hash in your password DB.
          if (err) {
            failed(res, 401, err);
          } else {
            models.register(body, hash, img).then((result2) => {
              success(res, result2);
            }).catch((err1) => {
              failed(res, 401, err1);
            });
          }
        });
      });
    } catch (error) {
      failed(res, 401, error);
    }
  },
  // delete data user
  del: async (req, res) => {
    try {
      const { id } = req.params;
      const imgName = await models.getimg(id);
      const imgPath = `./src/img/${imgName[0].img}`;
      fs.unlink(imgPath, ((errImg) => {
        if (errImg) {
          models.del(id).then((result) => {
            success(res, result, 'Delete User Data Success');
          })
            .catch((err) => {
              failed(res, 404, err);
            });
        } else {
          models.del(id).then((result) => {
            success(res, result, 'Delete User Data Success');
          })
            .catch((err) => {
              failed(res, 404, err);
            });
        }
      }));
    } catch (err) {
      failed(res, 404, err);
    }
  },
  updatePw: (req, res) => {
    try {
      const { body } = req;
      const { id } = req.params;
      const pw = bcrypt.hashSync(body.password, 10);
      models.updatePw(id, pw)
        .then((result) => {
          success(res, result, 'Update Password Data Success');
        })
        .catch((err) => {
          failed(res, 400, err);
        });
    } catch (err) {
      failed(res, 500, err);
    }
  },
  update: async (req, res) => {
    try {
      const { body } = req;
      const { id } = req.params;
      const imgName = await models.getimg(id);
      const imgPath = `./src/img/${imgName[0].img}`;
      const img = !req.file ? imgName[0].img : req.file.filename;
      if (!req.file) {
        models.update(id, img, body)
          .then((result) => {
            success(res, result, 'Update User Data Success');
          })
          .catch((err) => {
            failed(res, 400, err);
          });
      } else {
        fs.unlink(imgPath, ((errImg) => {
          if (errImg) {
            models.update(id, img, body)
              .then((result) => {
                success(res, result, 'Update User Data Success');
              })
              .catch((err) => {
                failed(res, 400, err);
              });
          } else {
            models.update(id, img, body)
              .then((result) => {
                success(res, result, 'Update User Data Success');
              })
              .catch((err) => {
                failed(res, 400, err);
              });
          }
        }));
      }
    } catch (err) {
      failed(res, 500, err);
    }
  },
};

module.exports = userctrl;
