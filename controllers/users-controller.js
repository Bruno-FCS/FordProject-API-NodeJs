const mysql = require("../mysql").pool;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const SECRET = process.env.JWT_SECRET;

exports.findAll = (req, res) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query("SELECT * FROM User", (error, result) => {
      conn.release();

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json(result);
      }
    });
  });
};

exports.findById = (req, res) => {
  const user_id = parseInt(req.params.user_id);

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM User WHERE user_id = ?",
      [user_id],
      (error, result) => {
        conn.release();

        const user = result[0];
        if (error) {
          res.status(400).json(error);
        } else if (result.length == 1) {
          res.status(200).json(user);
        } else {
          res.status(404).json("Invalid user id");
        }
      }
    );
  });
};

exports.insert = (req, res) => {
  const user = req.body;
  const user_join_date = new Date();
  const userWithDate = { ...user, user_join_date };

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM User WHERE user_name = ? OR user_email = ?",
      [userWithDate.user_name, userWithDate.user_email],
      (error, result) => {
        if (error) {
          conn.release();
          res.status(400).json(error);
        }
        if (result.length == 0) {
          bcrypt.hash(req.body.user_password, 10, (error, hash) => {
            if (error) {
              conn.release();
              return res.status(500).send({ error: error });
            }
            conn.query(
              "INSERT INTO User (user_name, user_email, user_password, user_full_name, user_join_date) VALUES (?, ?, ?, ?, ?)",
              [
                userWithDate.user_name,
                userWithDate.user_email,
                hash,
                userWithDate.user_full_name,
                userWithDate.user_join_date,
              ],
              (error) => {
                conn.release();

                if (error) {
                  res.status(400).json(error);
                }
                res.status(201).json(result);
              }
            );
          });
        } else {
          conn.release();
          res.status(400).json("Username or email already registered");
        }
      }
    );
  });
};

exports.login = (req, res) => {
  const user_name = req.body.user_name;
  const user_password = req.body.user_password;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM User WHERE user_name = ?",
      [user_name],
      (error, result) => {
        conn.release();

        if (error) {
          res.status(401).json(error);
        } else {
          if (result.length == 0) {
            res.status(401).json("Username or password invalid");
          } else {
            bcrypt.compare(
              user_password,
              result[0].user_password,
              (error, bcryptResult) => {
                if (error) {
                  res.status(401).json("Username or password invalid");
                } else if (bcryptResult) {
                  const token = jwt.sign(
                    {
                      user_id: result[0].user_id,
                      user_name: result[0].user_name,
                      user_email: result[0].user_email,
                      user_full_name: result[0].user_full_name,
                    },
                    SECRET,
                    { expiresIn: process.env.JWT_EXPIRATION }
                  );
                  res.set("x-access-token", token);
                  res.setHeader(
                    "Access-Control-Expose-Headers",
                    "x-access-token"
                  );
                  res.status(200).json({
                    user_id: result[0].user_id,
                    user_name: result[0].user_name,
                    user_email: result[0].user_email,
                    user_full_name: result[0].user_full_name,
                  });
                } else {
                  res.status(401).json("Username or password invalid");
                }
              }
            );
          }
        }
      }
    );
  });
};

exports.update = (req, res) => {
  const user = req.body;
  const user_id = parseInt(req.params.user_id);

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM User WHERE user_name = ? OR user_email = ?",
      [user.user_name, user.user_email],
      (error, result) => {
        if (error) {
          conn.release();
          res.status(400).json(error);
        }
        if (result.length == 0) {
          conn.query(
            "UPDATE User SET ? WHERE user_id = ?",
            [user, user_id],
            (error) => {
              conn.release();

              if (error) {
                res.status(400).json(error);
              } else {
                const token = jwt.sign(
                  {
                    user_id: user.user_id,
                    user_name: user.user_name,
                    user_email: user.user_email,
                    user_full_name: user.user_full_name,
                  },
                  SECRET,
                  { expiresIn: process.env.JWT_EXPIRATION }
                );
                res.set("x-access-token", token);
                res.setHeader(
                  "Access-Control-Expose-Headers",
                  "x-access-token"
                );
                res.status(200).json({
                  user_id: user.user_id,
                  user_name: user.user_name,
                  user_email: user.user_email,
                  user_full_name: user.user_full_name,
                });
              }
            }
          );
        } else if (result.length == 1) {
          if (result[0].user_id == user_id) {
            conn.query(
              "UPDATE User SET ? WHERE user_id = ?",
              [user, user_id],
              (error) => {
                conn.release();

                if (error) {
                  res.status(400).json(error);
                } else {
                  const token = jwt.sign(
                    {
                      user_id: user.user_id,
                      user_name: user.user_name,
                      user_email: user.user_email,
                      user_full_name: user.user_full_name,
                    },
                    SECRET,
                    { expiresIn: process.env.JWT_EXPIRATION }
                  );
                  res.set("x-access-token", token);
                  res.setHeader(
                    "Access-Control-Expose-Headers",
                    "x-access-token"
                  );
                  res.status(200).json({
                    user_id: user.user_id,
                    user_name: user.user_name,
                    user_email: user.user_email,
                    user_full_name: user.user_full_name,
                  });
                }
              }
            );
          } else {
            conn.release();
            res.status(400).json("Username or email already registered");
          }
        } else {
          conn.release();
          res.status(400).json("Username or email already registered");
        }
      }
    );
  });
};

exports.changePassword = (req, res) => {
  const user_former_password = req.body.user_former_password;
  const user_password = req.body.user_password;
  const user_id = parseInt(req.params.user_id);

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM User WHERE user_id = ?",
      [user_id],
      (error, result) => {
        if (error) {
          conn.release();
          res.status(400).json(error);
        } else if (result.length == 1) {
          bcrypt.compare(
            user_former_password,
            result[0].user_password,
            (error, bcryptResult) => {
              if (error) {
                conn.release();
                res.status(400).json("Invalid former password");
              } else if (bcryptResult) {
                bcrypt.hash(user_password, 10, (error, hash) => {
                  if (error) {
                    conn.release();
                    return res.status(500).send({ error: error });
                  }
                  conn.query(
                    "UPDATE User SET user_password = ? WHERE user_id = ?",
                    [hash, user_id],
                    (error) => {
                      conn.release();

                      if (error) {
                        res.status(400).json(error);
                      } else {
                        res.status(204).end();
                      }
                    }
                  );
                });
              } else {
                conn.release();
                res.status(400).json("Invalid former password");
              }
            }
          );
        } else {
          conn.release();
          res.status(400).json("Invalid user id");
        }
      }
    );
  });
};

exports.delete = (req, res) => {
  const user_id = parseInt(req.params.user_id);

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM User WHERE user_id = ?",
      [user_id],
      (error, result) => {
        if (error) {
          conn.release();
          res.status(400).json(error);
        } else if (result.length == 1) {
          conn.query(
            "DELETE FROM User WHERE user_id = ?",
            [user_id],
            (error) => {
              conn.release();

              if (error) {
                res.status(400).json(error);
              } else {
                res.status(204).end();
              }
            }
          );
        } else {
          conn.release();
          res.status(404).json("Invalid user id");
        }
      }
    );
  });
};
