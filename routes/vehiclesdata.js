const express = require("express");
const router = express.Router();

const VehiclesdataController = require("../controllers/vehiclesdata-controller");

router.get("/", VehiclesdataController.findAll);

router.get("/:vehicledata_vin", VehiclesdataController.findByVin);

router.get("/:vehicledata_id", VehiclesdataController.findById);

router.post("/", VehiclesdataController.insert);

router.put("/update", VehiclesdataController.updateData);

router.put("/:vehicledata_id", VehiclesdataController.update);

router.delete("/:vehicledata_vin", VehiclesdataController.deleteByVin);

router.delete("/:vehicledata_id", VehiclesdataController.delete);

module.exports = router;
