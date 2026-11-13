const express = require('express');
const router = express.Router();
const store = require('../models/mockStore');
const { authenticateToken } = require('../middleware/auth');

// GET /api/notifications - User's notifications
router.get('/', authenticateToken, (req, res) => {
  const notifs = store.notifications.filter(n => n.user_id === req.user.id);
  res.json({ success: true, count: notifs.length, data: notifs });
});

// PATCH /api/notifications/:id/read - Mark single as read
router.patch('/:id/read', authenticateToken, (req, res) => {
  const item = store.notifications.find(n => n.id === req.params.id && n.user_id === req.user.id);
  if (item) {
    item.is_read = true;
  }
  res.json({ success: true, message: 'Notification marked as read' });
});

// PATCH /api/notifications/read-all - Mark all as read
router.patch('/read-all', authenticateToken, (req, res) => {
  store.notifications.forEach(n => {
    if (n.user_id === req.user.id) {
      n.is_read = true;
    }
  });
  res.json({ success: true, message: 'All notifications marked as read' });
});

module.exports = router;
