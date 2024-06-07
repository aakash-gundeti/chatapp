import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import multer from "multer";
import session from "express-session";
import { isLogin, isLogout } from "../middlewares/auth.middleware.js";
import UserController from "../controllers/user.controller.js";

const userRoutes = express();
const userController = new UserController();
const { SESSION_SECRET } = process.env;

userRoutes.use(session({ secret: SESSION_SECRET }));
userRoutes.use(bodyParser.json());
userRoutes.use(bodyParser.urlencoded({ extended: true }));

userRoutes.set("view engine", "ejs");
userRoutes.set("views", "./views");

userRoutes.use(express.static("public"));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images");
  },
  filename: (req, file, cb) => {
    const fileName = Date.now() + "-" + file.originalname;
    cb(null, fileName);
  },
});

export const upload = multer({ storage: storage });

userRoutes.get("/register", isLogout, userController.registerLoad);
userRoutes.post("/register", upload.single("image"), userController.register);

userRoutes.get("/", isLogout, userController.loadLogin);
userRoutes.post("/", userController.login);
userRoutes.get("/logout", isLogin, userController.logout);

userRoutes.get("/dashboard", isLogin, userController.loadDashboard);
userRoutes.post("/save-chat", userController.saveChat);

userRoutes.get("*", (req, res) => {
  res.redirect("/");
});
export default userRoutes;


