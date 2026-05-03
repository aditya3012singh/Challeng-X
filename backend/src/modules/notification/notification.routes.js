import express from "express";
import NotificationController from "./notification.controller.js";
import AuthMiddleware from "./auth.middleware.js";

const router = express.Router();

router.use(AuthMiddleware.handle);

router.get("/", NotificationController.getNotifications);
router.patch("/read-all", NotificationController.markAllAsRead);
router.patch("/:id/read", NotificationController.markAsRead);
router.delete("/:id", NotificationController.deleteNotification);

export default router;
