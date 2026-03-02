const Notification = require('../models/Notification');

// Get notifications for logged in user
exports.getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user.id })
            .sort({ createdAt: -1 }) // Newest first
            .limit(50); // Limit to last 50 notifications

        res.json({
            success: true,
            count: notifications.length,
            data: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Make sure notification belongs to user
        if (notification.recipient.toString() !== req.user.id.toString()) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
        }

        notification.read = true;
        await notification.save();

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Create notification (can be called via API or internally)
exports.createNotification = async (req, res) => {
    try {
        const { recipient, type, category, title, message, data } = req.body;

        const notification = await Notification.create({
            recipient: recipient || req.user.id,
            type: type || 'info',
            category: category || 'general',
            title,
            message,
            data: data || {}
        });

        if (res) {
            return res.status(201).json({
                success: true,
                data: notification
            });
        }
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        if (res) {
            return res.status(500).json({
                success: false,
                message: 'Server Error'
            });
        }
    }
};
