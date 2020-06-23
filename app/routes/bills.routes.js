var express = require('express')
var router = express.Router()

const bill_repository = require('../repository/bills.repository');
const notification_repository = require('../repository/notifications.repository');
const user_repository = require('../repository/users.repository');
const response = require('../utils/response.utils');

// Create bill
router.post('/', async (req, res) => {
	try {
		// TODO: Cek body
		const body = req.body;
		const bill_id = await bill_repository.create_bill(body['creator_user_id'], body['group_id'], body['bill_description'], body['bill_amount']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get bill creation detail
router.get('/:bill_id/detail', async (req, res) => {
	try {
		if (!req.params['bill_id']) {
			res.json(response.failed('HIVEZ-003-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const bill_count = await bill_repository.count_bill(req.params['bill_id']);
		if (bill_count < 1) {
			res.json(response.failed('HIVEZ-003-0002', 'Bill does not exists', 'Tagihan tidak ditemukan'));
			return;
		};
		const bill_detail = await bill_repository.get_bill_creation_detail(req.params['bill_id']);
		res.json(response.success(bill_detail));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Update bill creation approval
router.put('/:bill_id/approval', async (req, res) => {
	try {
		if (!req.params['bill_id']) {
			res.json(response.failed('HIVEZ-003-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const request_count = await bill_repository.count_bill(req.params['bill_id']);
		if (request_count < 1) {
			res.json(response.failed('HIVEZ-003-0002', 'Bill does not exists', 'Tagihan tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		const bill_data = await bill_repository.update_bill_creation_approval(req.params['bill_id'], body['approver_user_id'], body['approval_status']);
		notification_repository.create_notification(bill_data['creator_user_id'], req.params['bill_id'], 'BILL_CREATION', 'BILL_CREATION_' + body['approval_status']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get group bill payment list
router.get('/:group_id/lists', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-003-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const bill_list = await bill_repository.get_group_bill_list(req.params['group_id'], req.query['user-id']);
		res.json(response.success(bill_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get payable group bill list
router.get('/groups/:group_id/payable', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-003-0001', 'Invalid input', 'Input salah'));
			return;
		};
		if (!req.query['user-id']) {
			res.json(response.failed('HIVEZ-003-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const user_count = await user_repository.count_user(req.query['user-id']);
		if (user_count < 1) {
			res.json(response.failed('HIVEZ-003-0004', 'User does not exists', 'Pengguna tidak ditemukan'));
			return;
		};
		const bill_list = await bill_repository.get_payable_group_bill_list(req.params['group_id'], req.query['user-id']);
		res.json(response.success(bill_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get group bill list
router.get('/groups/:group_id/pending/lists', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-003-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const bill_creation_list = await bill_repository.get_bill_creation_list(req.params['group_id']);
		res.json(response.success(bill_creation_list));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Create bill payment
router.post('/payments', async (req, res) => {
	try {
		// TODO: Cek body
		const body = req.body;
		const bill_payment_id = await bill_repository.create_bill_payment(body['bill_id'], body['payer_user_id'], body['receipt_picture']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get bill payment detail
router.get('/payments/:bill_payment_id/detail', async (req, res) => {
	try {
		if (!req.params['bill_payment_id']) {
			res.json(response.failed('HIVEZ-003-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const bill_payment_count = await bill_repository.count_bill_payment(req.params['bill_payment_id']);
		if (bill_payment_count < 1) {
			res.json(response.failed('HIVEZ-003-0003', 'Bill payment does not exists', 'Pembayaran tagihan tidak ditemukan'));
			return;
		};
		const bill_payment_detail = await bill_repository.get_bill_payment_detail(req.params['bill_payment_id']);
		res.json(response.success(bill_payment_detail));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Update bill payment approval
router.put('/payments/:bill_payment_id/approval', async (req, res) => {
	try {
		if (!req.params['bill_payment_id']) {
			res.json(response.failed('HIVEZ-003-0001', 'Invalid input', 'Input salah'));
			return;
		};
		const bill_payment_count = await bill_repository.count_bill_payment(req.params['bill_payment_id']);
		if (bill_payment_count < 1) {
			res.json(response.failed('HIVEZ-003-0003', 'Bill payment does not exists', 'Pembayaran tagihan tidak ditemukan'));
			return;
		};
		// TODO: Cek body
		const body = req.body;
		const bill_payment_data = await bill_repository.update_bill_payment_approval(req.params['bill_payment_id'], body['approver_user_id'], body['approval_status']);
		if (body['approval_status'] === 'APPROVED') {
			const bill_data = await bill_repository.get_bill_creation_detail(bill_payment_data['bill_id']);
			await group_repository.update_group_balance(bill_data['group_id'], 'INCOME', bill_data['bill_amount']);
		}
		notification_repository.create_notification(bill_payment_data['payer_user_id'], req.params['bill_payment_id'], 'BILL_PAYMENT', 'BILL_PAYMENT_' + body['approval_status']);
		res.json(response.success({'status': 'Success'}));
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

// Get group bill payment list
router.get('/payments/groups/:group_id/lists', async (req, res) => {
	try {
		if (!req.params['group_id']) {
			res.json(response.failed('HIVEZ-003-0001', 'Invalid input', 'Input salah'));
			return;
		};
		if (!req.query['user_id']) {
			const bill_payment_list = await bill_repository.get_group_bill_payment_list(req.params['group_id']);
			res.json(response.success(bill_payment_list));
		} else {
			const bill_payment_list = await bill_repository.get_bill_payment_list(req.params['group_id'], req.query['user_id']);
			res.json(response.success(bill_payment_list));
		}
	} catch (error) {
		console.log(error.stack);
		res.json(response.error_global);
	};
});

module.exports = router;