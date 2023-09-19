var express = require("express");
var router = express.Router();
var Register = require("../models/employee");

const employee = require("../models/employee");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
var {
  createToken,
} = require("../authentication");


// var reg=require("../models/router");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.json( { title: "Express" });
});

router.post("/company", async (req, res) => {
  try {
    const user = await Register.findOne({
      name: req.body.name,
    });
    if (user) {
      return res
        .status(400)
        .send({ statusCode: 403, message: "name already in use" });
    }

    var count = await employee.count();
    function pad(num) {
      num = num.toString();
      while (num.length < 2) num = "0" + num;
      return num;
    }
      
    const employeeName = req.body.name;
     const paddedCount = pad(count + 1);
     // Assuming name is in req.body
    
    // Generate the employee ID by combining the padded count and the name
    const empid = employeeName + paddedCount ;
    
    // Assign the generated employee ID to req.body
    req.body["empid"] = empid;
    
    const data = await Register.create(req.body);

    if (data) {
      res.json({
        statusCode: 200,
        data: data,
        message: "Register Successfully",
      });
    }
  } catch (error) {
    res.json({
      statusCode: 500,
      message: error.message,
    });
  }
});

module.exports = router;

router.get("/company", async (req, res) => {
  try {
    const companies = await Register.find();
    companies.reverse();
    res.json({
      statuscode: 200,
      data: companies,
      massage: " successfully",
    });
  } catch (error) {
    res.status(500).json({
      statuscode: 500,
      message: error.message,
    });
  }
});
module.export = router;

router.put("/company/:id", async (req, res) => {
  try {
    const updatedCompany = await Register.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedCompany) {
      return res.status(404).json({
        statusCode: 404,
        message: "Company not found",
      });
    }
    res.json({
      statusCode: 200,
      data: updatedCompany,
      message: "Company updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});

router.delete("/company/:id", async (req, res) => {
  try {
    const deletedCompany = await Register.findByIdAndRemove(req.params.id);

    if (!deletedCompany) {
      return res.status(404).json({
        statusCode: 404,
        message: "Company not found",
      });
    }

    res.json({
      statusCode: 200,
      data: deletedCompany,
      message: "Company deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: error.message,
    });
  }
});
//autoid generate

// Assuming this code is inside an asynchronous function or an async route handler.




//login page

router.post("/login", async (req, res) => {
  try {
    const user = await Register.findOne({
      name: req.body.name,
    });
    if (!user) {
      return res.json({ statusCode: 403, message: "User doesn't exist" });
    }
    const isMatch = await Register.findOne(req.body.password, user.password).toString();
    if (!isMatch) {
      return res.json({ statusCode: 402, message: "Enter Valid Password" });
    }
    const tokens = await createToken({
      _id: user._id, // Corrected from user_id to user._id
      name: user.name,
      password: user.password,
      email: user.email,
    });

    if (isMatch) {
      res.json({
        statusCode: 200,
        message: "User Authenticated",
        token: tokens,
      });
    } 
  } catch (error) {
    res.json({ statusCode: 500, message: error.message });
  }
});

module.exports = router;
