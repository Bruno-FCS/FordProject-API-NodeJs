const mysql = require("../mysql").pool;

exports.findAll = (req, res) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query("SELECT * FROM Vehicle", (error, result) => {
      conn.release();

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json({ vehicles: result });
      }
    });
  });
};

exports.findById = (req, res) => {
  const vehicle_id = parseInt(req.params.vehicle_id);

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM Vehicle WHERE vehicle_id = ?",
      [vehicle_id],
      (error, result) => {
        conn.release();

        const vehicle = result[0];
        if (error) {
          res.status(400).json(error);
        } else if (result.length == 1) {
          res.status(200).json(vehicle);
        } else {
          res.status(404).json("Invalid vehicle id");
        }
      }
    );
  });
};

exports.insert = (req, res) => {
  const vehicle = req.body;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM Vehicle WHERE vehicle_model = ?",
      [vehicle.vehicle_model],
      (error, result) => {
        if (error) {
          conn.release();
          res.status(400).json(error);
        }
        if (result.length == 0) {
          conn.query(
            "INSERT INTO Vehicle (vehicle_model, vehicle_total_volume, vehicle_connected, vehicle_software_updates) VALUES (?, ?, ?, ?)",
            [
              vehicle.vehicle_model,
              vehicle.vehicle_total_volume,
              vehicle.vehicle_connected,
              vehicle.vehicle_software_updates,
            ],
            (error) => {
              conn.release();

              if (error) {
                res.status(400).json(error);
              }
              res.status(201).json(vehicle);
            }
          );
        } else {
          conn.release();
          res.status(400).json("Model already registered");
        }
      }
    );
  });
};

exports.update = (req, res) => {
  const vehicle = req.body;
  const vehicle_id = parseInt(req.params.vehicle_id);

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM Vehicle WHERE vehicle_model = ?",
      [vehicle.vehicle_model],
      (error, result) => {
        if (error) {
          conn.release();
          res.status(400).json(error);
        }
        if (result.length == 0) {
          conn.query(
            "UPDATE Vehicle SET ? WHERE vehicle_id = ?",
            [req.body, vehicle_id],
            (error) => {
              conn.release();

              if (error) {
                res.status(400).json(error);
              } else {
                res.status(200).json({ ...req.body, vehicle_id });
              }
            }
          );
        } else if (result.length == 1) {
          if (result[0].vehicle_id == vehicle_id) {
            conn.query(
              "UPDATE Vehicle SET ? WHERE vehicle_id = ?",
              [req.body, vehicle_id],
              (error) => {
                conn.release();

                if (error) {
                  res.status(400).json(error);
                } else {
                  res.status(200).json({ ...req.body, vehicle_id });
                }
              }
            );
          } else {
            conn.release();
            res.status(400).json("Model already registered");
          }
        } else {
          conn.release();
          res.status(400).json("Model already registered");
        }
      }
    );
  });
};

exports.delete = (req, res) => {
  const vehicle_id = parseInt(req.params.vehicle_id);

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM Vehicle WHERE vehicle_id = ?",
      [vehicle_id],
      (error, result) => {
        if (error) {
          conn.release();
          res.status(400).json(error);
        } else if (result.length == 1) {
          conn.query(
            "DELETE FROM Vehicle WHERE vehicle_id = ?",
            [vehicle_id],
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
          res.status(404).json("Invalid vehicle id");
        }
      }
    );
  });
};
