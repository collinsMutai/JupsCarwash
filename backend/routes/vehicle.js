// routes/vehicle.js
const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");

// Create a new vehicle
router.post("/", async (req, res) => {
  try {
    const { vehicleRegNumber, make, model, year, ownerName } = req.body;

    // Check if vehicle registration number already exists
    const existingVehicle = await Vehicle.findOne({ vehicleRegNumber });
    if (existingVehicle) {
      return res
        .status(400)
        .send({
          error: "Vehicle with this registration number already exists.",
        });
    }

    const newVehicle = new Vehicle({
      vehicleRegNumber,
      make,
      model,
      year,
      ownerName,
    });

    await newVehicle.save();
    res.status(201).json(newVehicle);
  } catch (err) {
    res.status(500).send({ error: "Failed to create vehicle" });
  }
});

// Update an existing vehicle
router.put("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).send({ error: "Vehicle not found" });
    }

    const { vehicleRegNumber, make, model, year, ownerName } = req.body;

    vehicle.vehicleRegNumber = vehicleRegNumber || vehicle.vehicleRegNumber;
    vehicle.make = make || vehicle.make;
    vehicle.model = model || vehicle.model;
    vehicle.year = year || vehicle.year;
    vehicle.ownerName = ownerName || vehicle.ownerName;

    await vehicle.save();
    res.status(200).json(vehicle);
  } catch (err) {
    res.status(500).send({ error: "Failed to update vehicle" });
  }
});

// Delete a vehicle
router.delete("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) {
      return res.status(404).send({ error: "Vehicle not found" });
    }

    res.status(200).send({ message: "Vehicle deleted successfully" });
  } catch (err) {
    res.status(500).send({ error: "Failed to delete vehicle" });
  }
});

// Get all vehicles
router.get("/", async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch vehicles" });
  }
});

// Get vehicle by ID
router.get("/:id", async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).send({ error: "Vehicle not found" });
    }
    res.status(200).json(vehicle);
  } catch (err) {
    res.status(500).send({ error: "Failed to fetch vehicle" });
  }
});

module.exports = router;
