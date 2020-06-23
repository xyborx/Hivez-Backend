var express = require('express');
var router = express.Router();

const user_repository = require('../repository/users.repository');
const response = require('../utils/response.utils');

// Find user name
router.get('/', async (req, res) => {
	try {
		if (!req.query['user-id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.query['user-id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		if (!req.query['user-name']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_list = await user_repository.find_user_name(req.query['user-id'], req.query['user-name']);
		res.json(response.success(user_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Create user (Sign up)
router.post('/', async (req, res) => {
	try {
		// TODO: Cek body
		const body = req.body;
		const duplicate_user_name_count = await user_repository.count_user_name(body['user_name']);
		if (duplicate_user_name_count > 0) {
			res.json(response.failed('HIVEZ-001-0002', 'Username already used', 'Username sudah digunakan'));
			return;
		};
		const duplicate_email_count = await user_repository.count_email(body['email']);
		if (duplicate_email_count > 0) {
			res.json(response.failed('HIVEZ-001-0003', 'Email already used', 'Email sudah digunakan'));
			return;
		};
		const user_id = await user_repository.create_user(body['user_name'], body['full_name'], body['email'], body['password']);
		const login_token = 'dummy token';
		await user_repository.create_login_data(user_id, login_token);
		const login_id = await user_repository.create_audit_user_login(user_id, body['ip_address'], 'Sign Up');
		res.json(response.success({
			'user_id': user_id,
			'user_name': body['user_name'],
			'full_name': body['full_name'],
			'email': body['email'],
			'login_token': login_token,
			'login_id': login_id
		}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Delete user
router.delete('/:user_id', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		await user_repository.delete_user(req.params['user_id']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Change password
router.put('/:user_id/password', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		await user_repository.update_password(req.params['user_id'], body['password']);
		await user_repository.create_audit_change_password(req.params['user_id'], body['login_id']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Forgot password
router.put('/:user_id/password/reset', async (req, res) => {
	res.send('Forgot password');
});

// Get profile
router.get('/:user_id/profile', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		const profile = await user_repository.get_user_profile(req.params['user_id']);
		res.json(response.success(profile));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Change profile
router.put('/:user_id/profile', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		await user_repository.update_user_profile(req.params['user_id'], body['user_name'], body['full_name'], body['email']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Change seachable
router.put('/:user_id/searchable', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		await user_repository.update_user_searchable(req.params['user_id'], body['is_searchable']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get profile picture
router.get('/:user_id/picture', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		const user_picture = await user_repository.get_user_picture(req.params['user_id']);
		res.json(response.success({'user_picture': user_picture}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Change profile picture
router.put('/:user_id/picture', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		await user_repository.update_user_picture(req.params['user_id'], body['user_picture']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Create login token (Sign In)
router.post('/login-token', async (req, res) => {
	// SELECT is_reset_password FROM user WHERE user_id=$1;
	try {
		// TODO: Cek body
		const body = req.body;
		const user_count = await user_repository.count_user(body['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		const login_token = 'dummy token';
		await user_repository.update_login_data(body['user_id'], login_token);
		const login_id = await user_repository.create_audit_user_login(body['user_id'], body['ip_address'], 'Sign In');
		res.json(response.success({
			'login_token': login_token,
			'login_id': login_id
		}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get new login token
router.get('/:user_id/new-login-token', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		if (!req.query['ip-address']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const login_token = 'dummy token';
		const login_id = await user_repository.create_audit_user_login(req.params['user_id'], req.query['ip_address'], 'Extend session');
		await user_repository.update_login_data(req.params['user_id'], login_token);
		res.json(response.success({
			'login_token': login_token,
			'login_id': login_id
		}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Delete login token (Sign out)
router.delete('/:user_id/login-token', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		if (!req.query['ip-address']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		await user_repository.create_audit_user_login(req.params['user_id'], req.query['ip_address'], 'Sign Out');
		await user_repository.update_login_data(req.params['user_id'], null);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
	res.send('Delete login token');
});

// Get favourite list
router.get('/:user_id/favourite-lists', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		const user_favourites_list = await user_repository.get_user_favourites(req.params['user_id']);
		res.json(response.success(user_favourites_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get user group
router.get('/:user_id/groups', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		const user_group_list = await user_repository.get_user_group(req.params['user_id']);
		res.json(response.success(user_group_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get user event
router.get('/:user_id/events', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-001-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-001-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		const user_event_list = await user_repository.get_user_event(req.params['user_id']);
		res.json(response.success(user_event_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

module.exports = router;