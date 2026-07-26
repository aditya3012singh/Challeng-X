import express from "express";
import NotificationController from "./notification.controller.js";
import AuthMiddleware from "./auth.middleware.js";
import asyncWrapper from "../../api/middleware/asyncWrapper.middleware.js";

const router = express.Router();

router.use(AuthMiddleware.handle);

router.get("/", asyncWrapper(NotificationController.getNotifications));
router.patch("/read-all", asyncWrapper(NotificationController.markAllAsRead));
router.patch("/:id/read", asyncWrapper(NotificationController.markAsRead));
router.delete("/:id", asyncWrapper(NotificationController.deleteNotification));

export default router;
