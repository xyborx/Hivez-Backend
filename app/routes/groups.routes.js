var express = require('express');
var router = express.Router();

const group_repository = require('../repository/groups.repository');
const notification_repository = require('../repository/notifications.repository');
const user_repository = require('../repository/users.repository');
const user_join_request_repository = require('../repository/user_join_request.repository');
const user_invitaiton_repository = require('../repository/user_invitation.repository');
const response = require('../utils/response.utils');

// Find group
router.get('/', async (req, res) => {
	try {
		if (!req.query['user-id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.query['user-id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-004-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		if (!req.query['group-name']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_list = await group_repository.find_group_by_name(req.query['user-id'], req.query['group-name']);
		res.json(response.success(user_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Create group
router.post('/', async (req, res) => {
	try {
		// TODO: Cek body
		const body = req.body;
		const group_id = await group_repository.create_group(body['group_name'], body['group_description'], body['group_picture']);
		await group_repository.create_group_member(group_id, body['user_id'], 'LEADER');
		notification_repository.create_notification(body['user_id'], group_id, 'GROUP', 'CREATE_GROUP');
		res.json(response.success({
			'group_id': group_id,
			'group_name': body['group_name'],
			'group_description': body['group_description'],
			'group_picture': body['group_picture']
		}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Delete group
router.delete('/:group_id', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const group_count = await group_repository.count_group(req.params['group_id']);
		if (group_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group does not exists', 'Grup tidak ditemukan'));
			return;
		};
		await group_repository.delete_group(req.params['group_id']);
		group_repository.get_group_members(req.params['group_id']).then(group_member_list => {
			group_member_list.map(member => {
				notification_repository.create_notification(member['user_id'], req.params['group_id'], 'GROUP', 'DELETE_GROUP');
			});
		});
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get group detail
router.get('/:group_id/detail', async (req, res) => {
	try {
		if (!req.params['group_id'] || !req.query['user-id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const group_count = await group_repository.count_group(req.params['group_id']);
		if (group_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group does not exists', 'Grup tidak ditemukan'));
			return;
		};
		const group_detail = await group_repository.get_group_detail(req.params['group_id'], req.query['user-id']);
		res.json(response.success(group_detail));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Change group detail
router.put('/:group_id/detail', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const group_count = await group_repository.count_group(req.params['group_id']);
		if (group_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group does not exists', 'Grup tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		await group_repository.update_group_detail(req.params['group_id'], body['group_id'], body['group_name'], body['group_description']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Change group searchable
router.put('/:group_id/searchable', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const group_count = await group_repository.count_group(req.params['group_id']);
		if (group_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group does not exists', 'Grup tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		await group_repository.update_group_searchable(req.params['group_id'], body['is_searchable']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get group picture
router.get('/:group_id/picture', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const group_count = await group_repository.count_group(req.params['group_id']);
		if (group_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group does not exists', 'Grup tidak ditemukan'));
			return;
		};
		const group_picture = await group_repository.get_group_picture(req.params['group_id']);
		res.json(response.success({'group_picture': group_picture}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Change group picture
router.put('/:group_id/picture', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const group_count = await group_repository.count_group(req.params['group_id']);
		if (group_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group does not exists', 'Grup tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		await group_repository.update_group_picture(req.params['group_id'], body['group_picture']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get group member list
router.get('/:group_id/members', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const group_count = await group_repository.count_group(req.params['group_id']);
		if (group_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group does not exists', 'Grup tidak ditemukan'));
			return;
		};
		const group_member_list = await group_repository.get_group_members(req.params['group_id']);
		res.json(response.success(group_member_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get group report
router.get('/:group_id/report', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const group_count = await group_repository.count_group(req.params['group_id']);
		if (group_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group does not exists', 'Grup tidak ditemukan'));
			return;
		};
		if (!req.query['start-date']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		// TODO: Validate start date
		if (!req.query['end-date']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		// TODO: Validate end date
		const transaction_list = await group_repository.get_group_report(req.params['group_id'], req.query['start-date'], req.query['end-date']);
		const income = Number(await group_repository.get_group_report_count(req.params['group_id'], req.query['start-date'], req.query['end-date'], 'INCOME'));
		const expense = Number(await group_repository.get_group_report_count(req.params['group_id'], req.query['start-date'], req.query['end-date'], 'EXPENSE'));
		const start_balance = Number(await group_repository.get_group_balance(req.params['group_id'])) -
							  Number(await group_repository.get_group_report_count(req.params['group_id'], req.query['start-date'], new Date().toISOString().split('T')[0], 'INCOME')) +
							  Number(await group_repository.get_group_report_count(req.params['group_id'], req.query['start-date'], new Date().toISOString().split('T')[0], 'EXPENSE'));
		res.json(response.success({
			'transaction_list': transaction_list,
			'inflow': income,
			'outflow': expense,
			'opening_balance': start_balance,
			'ending_balance': start_balance + income + expense
		}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Remove group member/Left group
router.delete('/:group_id/members/:user_id', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const group_count = await group_repository.count_group(req.params['group_id']);
		if (group_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group does not exists', 'Grup tidak ditemukan'));
			return;
		};
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-004-0003', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		if (!req.query['reason']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		await group_repository.delete_group_member(req.params['group_id'], req.params['user_id']);
		notification_repository.create_notification(req.params['user_id'], req.params['group_id'], 'GROUP', req.query['reason']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Change group member role
router.put('/:group_id/members/:user_id/role', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const group_count = await group_repository.count_group(req.params['group_id']);
		if (group_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group does not exists', 'Grup tidak ditemukan'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-004-0003', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		await group_repository.update_group_member_role(req.params['group_id'], req.params['user_id'], body['role']);
		notification_repository.create_notification(req.params['user_id'], req.params['group_id'], 'GROUP', 'CHANGED_ROLE');
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Request join group
router.post('/join-request', async (req, res) => {
	try {
		// TODO: Cek body
		const body = req.body;
		await user_join_request_repository.create_join_request(body['source_id'], 'GROUP', body['requester_user_id']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get join group request list
router.get('/:group_id/join-request', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const group_count = await group_repository.count_group(req.params['group_id']);
		if (group_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group does not exists', 'Grup tidak ditemukan'));
			return;
		};
		const join_request_list = await user_join_request_repository.get_join_request_list(req.params['group_id'], 'GROUP');
		res.json(response.success(join_request_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Update join group request approval
router.put('/join-request/:join_request_id/approval', async (req, res) => {
	try {
		if (!req.params['join_request_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const join_request_count = await user_join_request_repository.count_join_request(req.params['join_request_id']);
		if (join_request_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Join group request does not exists', 'Permintaan bergabung grup tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		const join_data = await user_join_request_repository.update_join_approval(req.params['join_request_id'], body['approver_user_id'], body['approval_status']);
		if (body['approval_status'] === 'APPROVED') {
			const user_already_joined = await group_repository.count_duplicate_group_member(join_data['source_id'], join_data['requester_user_id']);
			if (user_already_joined < 1) {
				await group_repository.create_group_member(join_data['source_id'], join_data['requester_user_id'], 'MEMBER');
			} else {
				await group_repository.recreate_group_member(join_data['source_id'], join_data['requester_user_id']);
			}
		};
		notification_repository.create_notification(join_data['requester_user_id'], join_data['source_id'], 'GROUP', 'JOIN_' + body['approval_status']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get join group request list
router.get('/:group_id/users/inviteable', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const group_count = await group_repository.count_group(req.params['group_id']);
		if (group_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group does not exists', 'Grup tidak ditemukan'));
			return;
		};
		const user_list = await user_join_request_repository.get_group_inviteale_user(req.params['group_id']);
		res.json(response.success(user_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Invite new member
router.post('/invitations', async (req, res) => {
	try {
		// TODO: Cek body
		const body = req.body;
		await user_invitaiton_repository.create_invitation(body['inviter_user_id'], body['invited_user_id'], body['invited_source_id'], 'GROUP');
		notification_repository.create_notification(body['invited_user_id'], body['invited_source_id'], 'GROUP', 'INVITED');
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Update invitation group approval
router.put('/invitations/:invitation_id/approval', async (req, res) => {
	try {
		if (!req.params['invitation_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const invitation_count = await user_invitaiton_repository.count_invitation(req.params['invitation_id']);
		if (invitation_count < 1) {
			res.json(response.failed('HIVEZ-004-0002', 'Group invitation does not exists', 'Ajakan bergabung grup tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		const invitation_data = await user_invitaiton_repository.update_invitation_approval(req.params['invitation_id'], body['approval_status']);
		if (body['approval_status'] === 'APPROVED') {
			const user_already_joined = await group_repository.count_duplicate_group_member(invitation_data['invited_source_id'], invitation_data['invited_user_id']);
			if (user_already_joined < 1) {
				await group_repository.create_group_member(invitation_data['invited_source_id'], invitation_data['invited_user_id'], 'MEMBER');
			} else {
				await group_repository.recreate_group_member(invitation_data['invited_source_id'], invitation_data['invited_user_id']);
			}
		};
		// notification_repository.create_notification(invitation_data['inviter_user_id'], invitation_data['invited_source_id'], 'EVENT', 'INVITE_' + body['approval_status']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get joinable group
router.get('/:user_id/joinable', async (req, res) => {
	try {
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-004-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-004-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		const group_list = await group_repository.find_joinable_group(req.params['user_id']);
		res.json(response.success(group_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

module.exports = router;