import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

/*
This is triggered when the user clicks Login with Google button from the frontend.

passport.authenricate('google') will redirect the user to the google OAuth 2.0 Login page.

scope: ['profile', 'email'] tells google, that "I need access to the users basic profile and email"
*/
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

/*
After login google will redirect the user to this route.
If the login fails the user will be redirected to /login page with an error message.

session: true option tells PAssport to save the authenticated user in the session after successful login.

If the login is successful, the user will be redirected to the frontend application.

The frontend application will then check if the user is authenticated and display the appropriate UI.

If we dont write the session: true option, the user will not be saved in the session and the frontend application will not know that the user is automatically logged in.
*/
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const user = {
      id: req.user._id,
      name: req.user.displayName,
      email: req.user.email,
      image: req.user.image
    };

    const token = jwt.sign(user, process.env.JWT, { expiresIn: '50h' });

    res.redirect(`http://localhost:5173/?token=${token}`);
  }
);

/*
This route is used to log out the user from the server-side session.

req.logout() is passport's built-in method to clear the session.

After logging out, the user will be redirected to the frontend application.
*/
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.status(200).json({ message: "Logged out successfully" });
  });
});

router.get("/current_user", (req, res) => {
  if (req.user) res.json(req.user);
  else res.json(null);
});

export default router;
