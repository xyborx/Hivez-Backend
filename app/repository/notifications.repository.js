const storage = require('../utils/storage.utils');

const create_notification = async (user_id, source_id, source_type, notification_type) => {
	try {
		const res = await storage({
			name: 'create_notification',
			text: `INSERT INTO notifications (notification_type, source_id, source_type, user_id)
				   VALUES ($1, $2, $3, $4) RETURNING notification_id`,
			values: [notification_type, source_id, source_type, user_id]
		});
		return Promise.resolve(res.rows[0]['notification_id']);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

const get_user_notifications = async (user_id) => {
	try {
		const res = await storage({
			name: 'get_user_notifications',
			text: `SELECT n.notification_id, n.notification_type, n.source_id, n.source_type, n.notification_date,
						g.group_name AS source_name, g.group_picture AS source_picture, '' AS description
					FROM notifications AS n
					INNER JOIN groups AS g ON (g.group_id=n.source_id)
					WHERE n.source_type='GROUP'
					AND n.user_id=$1
					AND n.notification_date  > (CURRENT_DATE - INTERVAL '30 days')
					UNION
					SELECT n.notification_id, n.notification_type, n.source_id, n.source_type, n.notification_date,
						e.event_name AS source_name, e.event_picture AS source_picture, '' AS description
					FROM notifications AS n
					INNER JOIN events AS e ON (e.event_id=n.source_id)
					WHERE n.source_type='EVENT'
					AND n.user_id=$1
					AND n.notification_date  > (CURRENT_DATE - INTERVAL '30 days')
					UNION
					SELECT n.notification_id, n.notification_type, n.source_id, n.source_type, n.notification_date,
						g.group_name AS source_name, g.group_picture AS source_picture, r.request_description AS description
					FROM notifications AS n
					INNER JOIN requests AS r ON (r.request_id=n.source_id)
					INNER JOIN groups AS g ON (g.group_id=r.source_id)
					WHERE n.source_type='REQUEST'
					AND r.source_type='GROUP'
					AND n.user_id=$1
					AND n.notification_date  > (CURRENT_DATE - INTERVAL '30 days')
					UNION
					SELECT n.notification_id, n.notification_type, n.source_id, n.source_type, n.notification_date,
						e.event_name AS source_name, e.event_picture AS source_picture, r.request_description AS description
					FROM notifications AS n
					INNER JOIN requests AS r ON (r.request_id=n.source_id)
					INNER JOIN events AS e ON (e.event_id=r.source_id)
					WHERE n.source_type='REQUEST'
					AND r.source_type='EVENT'
					AND n.user_id=$1
					AND n.notification_date  > (CURRENT_DATE - INTERVAL '30 days')
					UNION
					SELECT n.notification_id, n.notification_type, n.source_id, n.source_type, n.notification_date,
						g.group_name AS source_name, g.group_picture AS source_picture, b.bill_description AS description
					FROM notifications AS n
					INNER JOIN bills AS b ON (b.bill_id=n.source_id)
					INNER JOIN groups AS g ON (g.group_id=b.group_id)
					WHERE n.source_type='BILL_CREATION'
					AND n.user_id=$1
					AND n.notification_date  > (CURRENT_DATE - INTERVAL '30 days')
					UNION
					SELECT n.notification_id, n.notification_type, n.source_id, n.source_type, n.notification_date,
						g.group_name AS source_name, g.group_picture AS source_picture, b.bill_description AS description
					FROM notifications AS n
					INNER JOIN bill_payments AS bp ON (bp.bill_payment_id=n.source_id)
					INNER JOIN bills AS b ON (b.bill_id=bp.bill_id)
					INNER JOIN groups AS g ON (g.group_id=b.group_id)
					WHERE n.source_type='BILL_PAYMENT'
					AND n.user_id=$1
					AND n.notification_date  > (CURRENT_DATE - INTERVAL '30 days')`,
			values: [user_id]
		});
		return Promise.resolve(res.rows);
	} catch (error) {
		throw new Error('Database error: ' + error.stack);
	};
};

module.exports = {
	create_notification,
	get_user_notifications
};