import { Router } from "express";
import SocialController from "./social.controller.js";
import AuthMiddleware from "./auth.middleware.js";

const router = Router();

router.post("/follow", AuthMiddleware.handle, SocialController.toggleFollow);
router.post("/friend-request", AuthMiddleware.handle, SocialController.sendFriendRequest);
router.post("/friend-respond", AuthMiddleware.handle, SocialController.respondToRequest);
router.get("/requests/incoming", AuthMiddleware.handle, SocialController.getIncomingRequests);
router.get("/friends", AuthMiddleware.handle, SocialController.getFriends);
router.get("/chat/:friendId", AuthMiddleware.handle, SocialController.getChatHistory);
router.get("/status/:targetUserId", AuthMiddleware.handle, SocialController.getSocialStatus);

export default router;
