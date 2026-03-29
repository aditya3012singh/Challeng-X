import express from "express";
import NotificationController from "../controllers/notification.controller.js";
import AuthMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(AuthMiddleware.handle);

router.get("/", NotificationController.getNotifications);
router.patch("/read-all", NotificationController.markAllAsRead);
router.patch("/:id/read", NotificationController.markAsRead);
router.delete("/:id", NotificationController.deleteNotification);

export default router;
