const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const UsersController = require("../controllers/users-controller");

router.get("/", verifyToken, UsersController.findAll);

router.get("/:user_id", verifyToken, UsersController.findById);

router.post("/", UsersController.insert);

router.post("/login", UsersController.login);

router.put("/:user_id", UsersController.update);

router.put("/change-password/:user_id", UsersController.changePassword);

router.delete("/:user_id", UsersController.delete);

module.exports = router;
