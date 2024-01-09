const express = require("express");
const router = express.Router();

const VehiclesController = require("../controllers/vehicles-controller");

router.get("/", VehiclesController.findAll);

router.get("/:vehicle_id", VehiclesController.findById);

router.post("/", VehiclesController.insert);

router.put("/:vehicle_id", VehiclesController.update);

router.delete("/:vehicle_id", VehiclesController.delete);

module.exports = router;
