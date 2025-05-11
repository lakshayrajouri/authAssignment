import mongoose from "mongoose";

const loginSchema = new mongoose.Schema({
  f_sno: Number,
  f_userName: String,
  f_Pwd: String
});

const Login = mongoose.model("Login", loginSchema, "t_login");
export default Login;
