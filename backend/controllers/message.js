const db = require('../config/db'); 

// Send a new message
exports.sendMessage = (req, res) => {
    const { senderId, receiverId, message, replyTo } = req.body;
    const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    db.query(
        'INSERT INTO messages (sender_id, receiver_id, message, reply_to, timestamp) VALUES (?, ?, ?, ?, ?)',
        [senderId, receiverId, message, replyTo || null, timestamp],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ message: 'Message sent successfully' });
        }
    );
};

// Fetch messages for a specific user
exports.getMessages = (req, res) => {
    const { userId } = req.params;
    db.query(
        'SELECT m.*, u.name AS sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.receiver_id = ? OR m.sender_id = ? ORDER BY m.timestamp DESC',
        [userId, userId],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        }
    );
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const { messageIds } = req.body; 

        if (messageIds && Array.isArray(messageIds)) {
            const query = `UPDATE messages SET isRead = 1 WHERE id IN (?)`;
            await db.query(query, [messageIds]);
        } else if (id) {
            const query = `UPDATE messages SET isRead = 1 WHERE id = ?`;
            await db.query(query, [id]);
        }

        res.status(200).json({ message: 'Messages marked as read.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error marking messages as read.' });
    }
};

// Get online status for all users
exports.getOnlineStatus = async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, is_online FROM users');
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get online status for a specific user
exports.getUserOnlineStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const [user] = await db.query('SELECT id, name, is_online FROM users WHERE id = ?', [id]);

        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

