var express = require('express');
var router = express.Router();

const notification_repository = require('../repository/notifications.repository');
const user_repository = require('../repository/users.repository');
const response = require('../utils/response.utils');

// Get user notifications
router.get('/:user_id', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-006-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-006-0002', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		const user_notification_list = await notification_repository.get_user_notifications(req.params['user_id']);
		res.json(response.success(user_notification_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

module.exports = router;