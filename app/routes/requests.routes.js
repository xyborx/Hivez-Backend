var express = require('express');
var router = express.Router();

const event_repository = require('../repository/events.repository');
const group_repository = require('../repository/groups.repository');
const notification_repository = require('../repository/notifications.repository');
const request_repository = require('../repository/requests.repository');
const user_repository = require('../repository/users.repository');
const response = require('../utils/response.utils');

// Create request
router.post('/', async (req, res) => {
	try {
		// TODO: Cek body
		const body = req.body;
		const request_id = await request_repository.create_request(body['requester_user_id'], body['source_id'], body['source_type'], body['request_description'],
																   body['request_amount'], body['request_type'], body['receipt_picture'], body['request_date']);
		if (body['source_type'] === 'EVENT') {
			await body['request_payee'].map(async ({payee_user_id, amount}) => {
				await request_repository.create_requests_payees(request_id, payee_user_id, amount);
			});
		};
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get request detail
router.get('/:request_id/detail', async (req, res) => {
	try {
		if (!req.params['request_id']) {
			res.json(response.failed('HIVEZ-002-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const request_count = await request_repository.count_request(req.params['request_id']);
		if (request_count < 1) {
			res.json(response.failed('HIVEZ-002-0002', 'Request does not exists', 'Permintaan tidak ditemukan'));
			return;
		};
		const request_detail = await request_repository.get_request_detail(req.params['request_id']);
		let output = response.success(request_detail);
		if (request_detail['source_type'] === 'EVENT') {
			const request_payee = await request_repository.get_request_payees(req.params['request_id']);
			output['output_schema']['request_payee'] = request_payee;
		};
		res.json(output);
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Update request approval
router.put('/:request_id/approval', async (req, res) => {
	try {
		if (!req.params['request_id']) {
			res.json(response.failed('HIVEZ-002-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const request_count = await request_repository.count_request(req.params['request_id']);
		if (request_count < 1) {
			res.json(response.failed('HIVEZ-002-0002', 'Request does not exists', 'Permintaan tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		const request_data = await request_repository.update_request_approval(req.params['request_id'], body['approver_user_id'], body['approval_status']);
		if (body['approval_status'] === 'APPROVED') {
			if(request_data['source_type'] === 'GROUP') {
				await group_repository.update_group_balance(request_data['source_id'], request_data['request_type'], request_data['request_amount']);
			} else {
				await event_repository.update_event_expense(request_data['source_id'], request_data['request_amount']);
			}
		}
		await notification_repository.create_notification(request_data['requester_user_id'], req.params['request_id'], 'REQUEST', 'REQUEST_' + body['approval_status']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get group/event request list
router.get('/:source_id/lists', async (req, res) => {
	try {
		if (!req.params['source_id']) {
			res.json(response.failed('HIVEZ-002-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const request_list = await request_repository.get_request_list(req.params['source_id']);
		res.json(response.success(request_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

module.exports = router;