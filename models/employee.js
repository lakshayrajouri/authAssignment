import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  f_Id: Number,
  f_Image: String,
  f_Name: String,
  f_Email: String,
  f_Mobile: String,
  f_Designation: String,
  f_gender: String,
  f_Course: String,
  f_Createdate: Date,
  active: Boolean
});

const Employee = mongoose.model("Employee", employeeSchema, "t_Employee");
export default Employee;