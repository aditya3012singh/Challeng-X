import Database from "../config/db.js";
import logger from "../utils/logger.js";
import RedisClient from "../cache/redis.client.js";
import eventBus from "../events/eventBus.js";

class SocialController {
    /**
     * Follow or Unfollow a user
     */
    static async toggleFollow(req, res) {
        const { targetUserId } = req.body;
        const followerId = req.user.id;

        if (targetUserId === followerId) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        try {
            const existingFollow = await Database.client.follow.findUnique({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId: targetUserId
                    }
                }
            });

            if (existingFollow) {
                await Database.client.follow.delete({
                    where: { id: existingFollow.id }
                });
                return res.json({ followed: false, message: "Unfollowed successfully" });
            } else {
                await Database.client.follow.create({
                    data: {
                        followerId,
                        followingId: targetUserId
                    }
                });
                return res.json({ followed: true, message: "Followed successfully" });
            }
        } catch (error) {
            logger.error(`Error toggling follow: ${error.message}`);
            res.status(500).json({ message: "Failed to process follow request" });
        }
    }

    /**
     * Send a friend request
     */
    static async sendFriendRequest(req, res) {
        const { receiverId } = req.body;
        const senderId = req.user.id;

        if (receiverId === senderId) {
            return res.status(400).json({ message: "You cannot add yourself as a friend" });
        }

        try {
            // Check if already friends or request exists
            const existingRequest = await Database.client.friendRequest.findFirst({
                where: {
                    OR: [
                        { senderId, receiverId },
                        { senderId: receiverId, receiverId: senderId }
                    ]
                }
            });

            if (existingRequest) {
                return res.status(400).json({ message: "A request already exists between these users" });
            }

            await Database.client.friendRequest.create({
                data: { senderId, receiverId }
            });

            // Emit friend request sent event (Phase 2: Event-driven)
            const sender = await Database.client.user.findUnique({ where: { id: senderId } });
            eventBus.emitEvent('FriendRequestSent', {
                senderId,
                receiverId,
                senderUsername: sender?.username
            });

            res.json({ message: "Friend request sent" });
        } catch (error) {
            logger.error(`Error sending friend request: ${error.message}`);
            res.status(500).json({ message: "Failed to send friend request" });
        }
    }

    /**
     * Accept or Reject a friend request
     */
    static async respondToRequest(req, res) {
        const { requestId, status } = req.body; // status: ACCEPTED or REJECTED
        const userId = req.user.id;

        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        try {
            const request = await Database.client.friendRequest.findUnique({
                where: { id: requestId }
            });

            if (!request || request.receiverId !== userId) {
                return res.status(404).json({ message: "Request not found" });
            }

            await Database.client.friendRequest.update({
                where: { id: requestId },
                data: { status }
            });

            // Emit friend request accepted event (Phase 2: Event-driven)
            if (status === 'ACCEPTED') {
                const receiver = await Database.client.user.findUnique({ where: { id: userId } });
                eventBus.emitEvent('FriendRequestAccepted', {
                    senderId: request.senderId,
                    receiverId: userId,
                    receiverUsername: receiver?.username
                });
            }

            res.json({ message: `Friend request ${status.toLowerCase()}` });
        } catch (error) {
            logger.error(`Error responding to friend request: ${error.message}`);
            res.status(500).json({ message: "Failed to respond to request" });
        }
    }

    /**
     * Get social stats and status for a profile
     */
    static async getSocialStatus(req, res) {
        const { targetUserId } = req.params;
        const currentUserId = req.user?.id;

        try {
            const followersCount = await Database.client.follow.count({
                where: { followingId: targetUserId }
            });

            const followingCount = await Database.client.follow.count({
                where: { followerId: targetUserId }
            });

            let isFollowing = false;
            let friendStatus = null;

            if (currentUserId) {
                const follow = await Database.client.follow.findUnique({
                    where: {
                        followerId_followingId: {
                            followerId: currentUserId,
                            followingId: targetUserId
                        }
                    }
                });
                isFollowing = !!follow;

                const friendRequest = await Database.client.friendRequest.findFirst({
                    where: {
                        OR: [
                            { senderId: currentUserId, receiverId: targetUserId },
                            { senderId: targetUserId, receiverId: currentUserId }
                        ]
                    }
                });
                friendStatus = friendRequest ? friendRequest.status : null;
            }

            res.json({
                followersCount,
                followingCount,
                isFollowing,
                friendStatus
            });
        } catch (error) {
            logger.error(`Error fetching social status: ${error.message}`);
            res.status(500).json({ message: "Failed to fetch social stats" });
        }
    }

    /**
     * Get pending friend requests for the current user
     */
    static async getIncomingRequests(req, res) {
        const userId = req.user.id;

        try {
            const requests = await Database.client.friendRequest.findMany({
                where: {
                    receiverId: userId,
                    status: 'PENDING'
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            profilePic: true,
                            rankPoints: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            res.json(requests);
        } catch (error) {
            logger.error(`Error fetching incoming requests: ${error.message}`);
            res.status(500).json({ message: "Failed to fetch requests" });
        }
    }

    /**
     * Get accepted friends for the current user
     */
    static async getFriends(req, res) {
        const userId = req.user.id;

        try {
            const friends = await Database.client.friendRequest.findMany({
                where: {
                    OR: [
                        { senderId: userId, status: 'ACCEPTED' },
                        { receiverId: userId, status: 'ACCEPTED' }
                    ]
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            username: true,
                            profilePic: true,
                            rankPoints: true
                        }
                    },
                    receiver: {
                        select: {
                            id: true,
                            username: true,
                            profilePic: true,
                            rankPoints: true
                        }
                    }
                }
            });

            // Extract the friend's data (the one who is NOT the current user)
            const friendList = friends.map(f => {
                const friendData = f.senderId === userId ? f.receiver : f.sender;
                return { ...friendData, requestId: f.id };
            });

            // Check online status in Redis
            const onlineUserIds = await RedisClient.client.smembers("online_users");
            const finalFriends = friendList.map(f => ({
                ...f,
                isOnline: onlineUserIds.includes(f.id)
            }));

            res.json(finalFriends);
        } catch (error) {
            logger.error(`Error fetching friends: ${error.message}`);
            res.status(500).json({ message: "Failed to fetch friends" });
        }
    }

    /**
     * Get chat history between current user and a friend
     */
    static async getChatHistory(req, res) {
        const userId = req.user.id;
        const { friendId } = req.params;

        try {
            const messages = await Database.client.privateMessage.findMany({
                where: {
                    OR: [
                        { senderId: userId, receiverId: friendId },
                        { senderId: friendId, receiverId: userId }
                    ]
                },
                orderBy: { createdAt: 'asc' },
                take: 50 // Limit to last 50 messages
            });

            res.json(messages);
        } catch (error) {
            logger.error(`Error fetching chat history: ${error.message}`);
            res.status(500).json({ message: "Failed to fetch chat history" });
        }
    }
}

export default SocialController;
