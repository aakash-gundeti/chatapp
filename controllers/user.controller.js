import bcrypt from "bcrypt";
import { userModel } from "../models/user.model.js";
import { chatModel } from "../models/chat.model.js";

export default class UserController {
  async registerLoad(req, res) {
    try {
      res.render("register");
    } catch (err) {
      console.log(err);
    }
  }

  async register(req, res) {
    try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const newUser = new userModel({
        name: req.body.name,
        email: req.body.email,
        image: "images/" + req.file.filename,
        password: hashedPassword,
      });

      await newUser.save();

      res.render("register", { message: "Registration Successfull" });
    } catch (err) {
      console.log(err);
    }
  }

  async loadLogin(req, res) {
    try {
      res.render("login");
    } catch (err) {
      console.log(err);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await userModel.findOne({ email: email });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          req.session.user = user;
          res.redirect("/dashboard");
        } else {
          res.render("login", { message: "Email and password is incorrect!" });
        }
      } else {
        res.render("login", { message: "Email and password is incorrect!" });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async logout(req, res) {
    try {
      req.session.destroy();
      res.redirect("/login");
    } catch (err) {
      console.log("logout", err);
    }
  }

  async loadDashboard(req, res) {
    try {
      const users = await userModel.find({
        _id: { $nin: [req.session.user._id] },
      });
      res.render("dashboard", { user: req.session.user, users: users });
    } catch (err) {
      console.log("dashboard", err);
    }
  }

  async saveChat(req, res) {
    try {
      const { sender_id, receiver_id, message } = req.body;
      // res.render("login");
      console.log("sender", sender_id);
      console.log("receiver", receiver_id);
      console.log("message", message);
      const newChat = new chatModel({
        senderId: sender_id,
        receiverId: receiver_id,
        message: message,
      });

      const chat = await newChat.save();

      res.status(201).send({ success: true, msg: "chat sent!", data: chat });
    } catch (err) {
      console.log(err);
      res.status(400).send({ success: false, msg: err.message });
    }
  }
}
