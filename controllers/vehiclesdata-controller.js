const mysql = require("../mysql").pool;
const formatVin = require("../utils/formatVin");

exports.findAll = (req, res) => {
  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query("SELECT * FROM Vehicle_Data", (error, result) => {
      conn.release();

      if (error) {
        res.status(400).json(error);
      } else {
        res.status(200).json({ vehicledata: result });
      }
    });
  });
};

exports.findByVin = (req, res) => {
  const vehicledata_vin = formatVin(req.params.vehicledata_vin)
    .toUpperCase()
    .replaceAll('"', "");

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM Vehicle_Data WHERE vehicledata_vin = ?",
      [vehicledata_vin],
      (error, result) => {
        conn.release();

        if (error) {
          res.status(400).json(error);
        } else {
          res.status(200).json({ vehicledata: result });
        }
      }
    );
  });
};

exports.findById = (req, res) => {
  const vehicledata_id = req.params.vehicledata_id;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM Vehicle_Data WHERE vehicledata_id = ?",
      [vehicledata_id],
      (error, result) => {
        conn.release();

        const vehicledata = result[0];
        if (error) {
          res.status(400).json(error);
        } else if (result.length == 1) {
          res.status(200).json(vehicledata);
        } else {
          res.status(404).json("Invalid vehicledata id");
        }
      }
    );
  });
};

exports.insert = (req, res) => {
  const vehicledata = req.body;

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM Vehicle_Data WHERE vehicledata_vin = ?",
      [formatVin(vehicledata.vehicledata_vin)],
      (error, result) => {
        if (error) {
          conn.release();
          res.status(400).json(error);
        }
        if (result.length == 0) {
          conn.query(
            "INSERT INTO Vehicle_Data (vehicledata_vin, vehicledata_odometer, vehicledata_tire_pressure, vehicledata_status, vehicledata_battery_status, vehicledata_fuel_level, vehicledata_lat, vehicledata_long) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
              formatVin(vehicledata.vehicledata_vin),
              vehicledata.vehicledata_odometer,
              vehicledata.vehicledata_tire_pressure,
              vehicledata.vehicledata_status,
              vehicledata.vehicledata_battery_status,
              vehicledata.vehicledata_fuel_level,
              vehicledata.vehicledata_lat,
              vehicledata.vehicledata_long,
            ],
            (error) => {
              conn.release();

              if (error) {
                res.status(400).json(error);
              }
              res.status(201).json(vehicledata);
            }
          );
        } else {
          conn.release();
          res.status(400).json("VIN already registered");
        }
      }
    );
  });
};

exports.updateData = (req, res) => {
  const vehicledata = req.body;
  req.body.vehicledata_vin = formatVin(req.body.vehicledata_vin);

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM Vehicle_Data WHERE vehicledata_vin = ?",
      [formatVin(vehicledata.vehicledata_vin)],
      (error, result) => {
        if (error) {
          conn.release();
          res.status(400).json(error);
        }
        if (result.length == 1) {
          conn.query(
            "UPDATE Vehicle_Data SET ? WHERE vehicledata_vin = ?",
            [req.body, formatVin(vehicledata.vehicledata_vin)],
            (error) => {
              conn.release();

              if (error) {
                res.status(400).json(error);
              } else {
                res.status(200).json({ ...req.body });
              }
            }
          );
        } else {
          conn.release();
          res.status(404).json("VIN code invalid");
        }
      }
    );
  });
};

exports.update = (req, res) => {
  const vehicledata = req.body;
  const vehicledata_id = parseInt(req.params.vehicledata_id);

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM Vehicle_Data WHERE vehicledata_vin = ?",
      [formatVin(vehicledata.vehicledata_vin)],
      (error, result) => {
        if (error) {
          conn.release();
          res.status(400).json(error);
        }
        if (result.length == 0) {
          conn.query(
            "UPDATE Vehicle_Data SET ? WHERE vehicledata_id = ?",
            [req.body, vehicledata_id],
            (error) => {
              conn.release();

              if (error) {
                res.status(400).json(error);
              } else {
                res.status(200).json({ ...req.body, vehicledata_id });
              }
            }
          );
        } else if (result.length == 1) {
          if (result[0].vehicledata_id == vehicledata_id) {
            conn.query(
              "UPDATE Vehicle_Data SET ? WHERE vehicledata_id = ?",
              [req.body, vehicledata_id],
              (error) => {
                conn.release();

                if (error) {
                  res.status(400).json(error);
                } else {
                  res.status(200).json({ ...req.body, vehicledata_id });
                }
              }
            );
          } else {
            conn.release();
            res.status(400).json("VIN already registered");
          }
        } else {
          conn.release();
          res.status(400).json("VIN already registered");
        }
      }
    );
  });
};

exports.deleteByVin = (req, res) => {
  const vehicledata_vin = formatVin(req.params.vehicledata_vin);

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM Vehicle_Data WHERE vehicledata_vin = ?",
      [vehicledata_vin],
      (error, result) => {
        if (error) {
          conn.release();
          res.status(400).json(error);
        } else if (result.length == 1) {
          const vehicledata_id = result[0].vehicledata_id;
          conn.query(
            "DELETE FROM Vehicle_Data WHERE vehicledata_id = ?",
            [vehicledata_id],
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
          res.status(404).json("VIN code invalid");
        }
      }
    );
  });
};

exports.delete = (req, res) => {
  const vehicledata_id = parseInt(req.params.vehicledata_id);

  mysql.getConnection((error, conn) => {
    if (error) {
      return res.status(500).send({ error: error });
    }
    conn.query(
      "SELECT * FROM Vehicle_Data WHERE vehicledata_id = ?",
      [vehicledata_id],
      (error, result) => {
        if (error) {
          conn.release();
          res.status(400).json(error);
        } else if (result.length == 1) {
          conn.query(
            "DELETE FROM Vehicle_Data WHERE vehicledata_id = ?",
            [vehicledata_id],
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
          res.status(404).json("Invalid vehicledata id");
        }
      }
    );
  });
};
