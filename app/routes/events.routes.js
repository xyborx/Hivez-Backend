var express = require('express');
var router = express.Router();

const event_repository = require('../repository/events.repository');
const notification_repository = require('../repository/notifications.repository');
const user_repository = require('../repository/users.repository');
const user_join_request_repository = require('../repository/user_join_request.repository');
const user_invitaiton_repository = require('../repository/user_invitation.repository');
const response = require('../utils/response.utils');

// Find event
router.get('/', async (req, res) => {
	try {
		if (!req.query['user-id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user_name(req.query['user-id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-005-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		if (!req.query['event-name']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_list = await event_repository.find_event_by_name(req.query['user-id'], req.query['event-name']);
		res.json(response.success(user_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Create event
router.post('/', async (req, res) => {
	try {
		// TODO: Cek body
		const body = req.body;
		const event_id = await event_repository.create_event(body['event_name'], body['event_description'], body['event_picture']);
		await event_repository.create_event_member(event_id, body['user_id'], 'LEADER');
		notification_repository.create_notification(body['user_id'], event_id, 'EVENT', 'CREATE_EVENT');
		res.json(response.success({
			'event_id': event_id,
			'event_name': body['user_name'],
			'event_description': body['full_name'],
			'event_picture': body['email']
		}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Delete event
router.delete('/:event_id', async (req, res) => {
	try {
		if (!req.params['event_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const event_count = await event_repository.count_event(req.params['event_id']);
		if (event_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event does not exists', 'Event tidak ditemukan'));
			return;
		};
		await event_repository.delete_event(req.params['event_id']);
		event_repository.get_event_members(req.params['event_id']).then(event_member_list => {
			event_member_list.map(member => {
				notification_repository.create_notification(member['user_id'], req.params['event_id'], 'EVENT', 'DELETE_EVENT');
			});
		});
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get event detail
router.get('/:event_id/detail', async (req, res) => {
	try {
		if (!req.params['event_id'] || !req.query['user-id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const event_count = await event_repository.count_event(req.params['event_id']);
		if (event_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event does not exists', 'Event tidak ditemukan'));
			return;
		};
		const event_detail = await event_repository.get_event_detail(req.params['event_id'], req.query['user-id']);
		res.json(response.success(event_detail));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Change event detail
router.put('/:event_id/detail', async (req, res) => {
	try {
		if (!req.params['event_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const event_count = await event_repository.count_event(req.params['event_id']);
		if (event_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event does not exists', 'Event tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		await event_repository.update_event_detail(req.params['event_id'], body['event_name'], body['event_description']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Change event searchable
router.put('/:event_id/searchable', async (req, res) => {
	try {
		if (!req.params['event_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const event_count = await event_repository.count_event(req.params['event_id']);
		if (event_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event does not exists', 'Event tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		await event_repository.update_event_searchable(req.params['event_id'], body['is_searchable']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get event picture
router.get('/:event_id/picture', async (req, res) => {
	try {
		if (!req.params['event_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const event_count = await event_repository.count_event(req.params['event_id']);
		if (event_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event does not exists', 'Event tidak ditemukan'));
			return;
		};
		const event_picture = await event_repository.get_event_picture(req.params['event_id']);
		res.json(response.success({'event_picture': event_picture}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Change event picture
router.put('/:event_id/picture', async (req, res) => {
	try {
		if (!req.params['event_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const event_count = await event_repository.count_event(req.params['event_id']);
		if (event_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event does not exists', 'Event tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		await event_repository.update_event_picture(req.params['event_id'], body['event_picture']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get event member list
router.get('/:event_id/members', async (req, res) => {
	try {
		if (!req.params['event_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const event_count = await event_repository.count_event(req.params['event_id']);
		if (event_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event does not exists', 'Event tidak ditemukan'));
			return;
		};
		const event_member_list = await event_repository.get_event_members(req.params['event_id']);
		res.json(response.success(event_member_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get event report
router.get('/:event_id/report', async (req, res) => {
	try {
		if (!req.params['event_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const event_count = await event_repository.count_event(req.params['event_id']);
		if (event_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event does not exists', 'Event tidak ditemukan'));
			return;
		};
		if (!req.query['start-date']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		// TODO: Validate start date
		if (!req.query['end-date']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		// TODO: Validate end date
		const event_report = await event_repository.get_event_report(req.params['event_id'], req.query['start-date'], req.query['end-date']);
		res.json(response.success(event_report));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Remove event member/Left event
router.delete('/:event_id/members/:user_id', async (req, res) => {
	try {
		if (!req.params['event_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const event_count = await event_repository.count_event(req.params['event_id']);
		if (event_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event does not exists', 'Event tidak ditemukan'));
			return;
		};
		if (!req.params['user_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user_name(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-005-0003', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		if (!req.query['reason']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		await event_repository.delete_event_member(req.params['event_id'], req.params['user_id']);
		notification_repository.create_notification(req.params['user_id'], req.params['event_id'], 'EVENT', req.query['reason']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Change event member role
router.put('/:event_id/members/:user_id/', async (req, res) => {
	try {
		if (!req.params['event_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const event_count = await event_repository.count_event(req.params['event_id']);
		if (event_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event does not exists', 'Event tidak ditemukan'));
			return;
		};
		const user_count = await user_repository.count_user_name(req.params['user_id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-005-0003', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		await event_repository.update_event_member_role(req.params['event_id'], req.params['user_id'], body['role']);
		notification_repository.create_notification(req.params['user_id'], req.params['event_id'], 'EVENT', 'CHANGED_ROLE');
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Request join event
router.post('/join-request', async (req, res) => {
	try {
		// TODO: Cek body
		const body = req.body;
		await user_join_request_repository.create_join_request(body['source_id'], 'EVENT', body['requester_user_id']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get join event request list
router.get('/join-request/:event_id', async (req, res) => {
	try {
		if (!req.params['event_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const event_count = await event_repository.count_event(req.params['event_id']);
		if (event_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event does not exists', 'Event tidak ditemukan'));
			return;
		};
		const join_request_list = await user_join_request_repository.get_join_request_list(req.params['event_id'], 'EVENT');
		res.json(response.success(join_request_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Update join event request approval
router.put('/join-request/:join_request_id/approval', async (req, res) => {
	try {
		if (!req.params['join_request_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const join_request_count = await user_join_request_repository.count_join_request(req.params['join_request_id']);
		if (join_request_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Join event request does not exists', 'Permintaan bergabung event tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		const join_data = await user_join_request_repository.update_join_approval(req.params['join_request_id'], body['approver_user_id'], body['approval_status']);
		if (body['approval_status'] === 'APPROVED') {
			const user_already_joined = await event_repository.count_duplicate_event_member(join_data['invited_source_id'], join_data['requester_user_id']);
			if (user_already_joined < 1) {
				await event_repository.create_event_member(join_data['invited_source_id'], join_data['requester_user_id'], 'MEMBER');
			} else {
				await event_repository.recreate_event_member(join_data['invited_source_id'], join_data['requester_user_id']);
			}
		};
		notification_repository.create_notification(join_data['requester_user_id'], join_data['invited_source_id'], 'EVENT', 'JOIN_' + body['approval_status']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get join group request list
router.get('/:event_id/users/inviteable', async (req, res) => {
	try {
		if (!req.params['event_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const event_count = await event_repository.count_event(req.params['event_id']);
		if (event_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event does not exists', 'Event tidak ditemukan'));
			return;
		};
		const user_list = await user_join_request_repository.get_event_inviteale_user(req.params['event_id']);
		res.json(response.success(user_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Invite new member
router.post('/invitation', async (req, res) => {
	try {
		// TODO: Cek body
		const body = req.body;
		await user_invitaiton_repository.create_invitation(body['inviter_user_id'], body['invited_user_id'], body['invited_source_id'], 'EVENT');
		notification_repository.create_notification(body['invited_user_id'], body['invited_source_id'], 'EVENT', 'INVITED');
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Update invitation event approval
router.put('/invitation/:invitation_id/approval', async (req, res) => {
	try {
		if (!req.params['invitation_id']) {
			res.json(response.failed('HIVEZ-005-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const invitation_count = await user_invitaiton_repository.count_invitation(req.params['invitation_id']);
		if (invitation_count < 1) {
			res.json(response.failed('HIVEZ-005-0002', 'Event invitation does not exists', 'Ajakan bergabung event tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		const invitation_data = await user_invitaiton_repository.update_invitation_approval(req.params['invitation_id'], body['approval_status']);
		if (body['approval_status'] === 'APPROVED') {
			const user_already_joined = await event_repository.count_duplicate_event_member(invitation_data['invited_source_id'], invitation_data['invited_user_id']);
			if (user_already_joined < 1) {
				await event_repository.create_event_member(invitation_data['invited_source_id'], invitation_data['invited_user_id'], 'MEMBER');
			} else {
				await event_repository.recreate_event_member(invitation_data['invited_source_id'], invitation_data['invited_user_id']);
			}
		};
		// notification_repository.create_notification(invitation_data['inviter_user_id'], invitation_data['invited_source_id'], 'EVENT', 'INVITE_' + body['approval_status']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

module.exports = router;