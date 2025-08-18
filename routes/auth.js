import express from "express";

//auth controller
import {
  google,
  googleCallback,
  logout,
  current_user,
  Signup,
  Login,
  VerifyUser
} from "../controller/auth.controller.js";
import AuthMiddleware from "../middleware/authMiddleware.js";

//email controller
import { SendOtp, VerifyOtp } from "../controller/email.controller.js";


const router = express.Router();

/*
This is triggered when the user clicks Login with Google button from the frontend.

passport.authenricate('google') will redirect the user to the google OAuth 2.0 Login page.

scope: ['profile', 'email'] tells google, that "I need access to the users basic profile and email"
*/
router.get("/google", google);

/*
After login google will redirect the user to this route.
If the login fails the user will be redirected to /login page with an error message.

session: true option tells PAssport to save the authenticated user in the session after successful login.

If the login is successful, the user will be redirected to the frontend application.

The frontend application will then check if the user is authenticated and display the appropriate UI.

If we dont write the session: true option, the user will not be saved in the session and the frontend application will not know that the user is automatically logged in.
*/
router.get("/google/callback", googleCallback);

/*
This route is used to log out the user from the server-side session.

req.logout() is passport's built-in method to clear the session.

After logging out, the user will be redirected to the frontend application.
*/
router.get("/logout", logout);
router.get("/current_user", current_user);
router.post("/sendOtp", SendOtp);
router.post("/verifyOtp", VerifyOtp);
router.post("/signup", Signup);
router.post("/login", Login);
router.get("/me", AuthMiddleware, (req, res) => {
  return res.status(200).json({ user: req.user });
});

export default router;
