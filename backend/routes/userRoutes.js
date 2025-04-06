import express from "express";
const router = express.Router();
import { getUserProfile, followUser, logoutUser, getSuggestedUsers, signupUser, loginUser, updateUser} from "../controller/userController.js";
import protectRoute from "../middlewares/protectRoute.js";


router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/signup", signupUser);
router.post('/login', loginUser);
router.post("/logout", logoutUser);

router.post("/follow/:id", protectRoute, followUser);
router.put("/update/:id", protectRoute, updateUser);

export default router;