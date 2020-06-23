const storage = require('../utils/storage.utils');

const count_invitation = async (user_invitation_id) => {
	try {
		const res = await storage({
			name: 'count_invitation',
			text: 'SELECT user_invitation_id FROM users_invitations WHERE user_invitation_id=$1',
			values: [user_invitation_id],
		});
		return Promise.resolve(Number(res.rowCount));
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const create_invitation = async (inviter_user_id, invited_user_id, invited_source_id, invited_source_type) => {
	try {
		const res = await storage({
			name: 'create_invitation',
			text: 'INSERT INTO users_invitations (inviter_user_id, invited_user_id, invited_source_id, invited_source_type) VALUES ($1, $2, $3, $4)',
			values: [inviter_user_id, invited_user_id, invited_source_id, invited_source_type],
		});
		return Promise.resolve(res);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const update_invitation_approval = async (user_join_request_id, approval_status) => {
	try {
		const res = await storage({
			name: 'update_invitation_approval',
			text: `UPDATE users_invitations SET approval_status=$1, approval_date=CURRENT_TIMESTAMP
				   WHERE user_join_request_id=$2
				   RETURNING inviter_user_id, invited_user_id, invited_source_id`,
			values: [approval_status, user_join_request_id],
		});
		return Promise.resolve(res.rows[0]);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

module.exports = {
	count_invitation,
	create_invitation,
	update_invitation_approval
};