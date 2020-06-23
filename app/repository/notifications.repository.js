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
			text: `SELECT n.notification_id, n.notification_type, n.source_id, n.source_type, n.notification_date, s.source_name, s.source_picture, s.description
				   FROM notifications AS n
				   INNER JOIN (
						CASE
							WHEN (n.source_type='GROUP)' THEN (
								SELECT group_id AS source_id, group_name AS source_name, group_picture AS source_picture, '' AS description
								FROM groups
								WHERE group_id=n.source_id
							)
							WHEN (n.source_type='EVENT') THEN (
								SELECT event_id AS source_id, event_name AS source_name, event_picture AS source_picture, '' AS description
								FROM events
								WHERE event_id=n.source_id
							)
							WHEN (n.source_type='REQUEST') THEN (
								SELECT r.request_id AS source_id, req_source.source_name AS source_name,
									   req_source.source_picture AS source_picture, r.request_description AS description
								FROM requests AS r
								INNER JOIN (
									CASE
										WHEN r.source_type='GROUP' THEN (
											SELECT group_id AS source_id, group_name AS source_name, group_picture AS source_picture
											FROM groups
											WHERE group_id=r.source_id
										)
										ELSE (
											SELECT event_id AS source_id, event_name AS source_name, event_picture AS source_picture
											FROM events
											WHERE event_id=r.source_id
										)
									END
								) AS req_source ON (r.source_id=req_source.source_id)
								WHERE r.request_id=n.source_id
							)
							WHEN (n.source_type='BILL_CREATION') THEN (
								SELECT b.bill_id AS source_id, g.group_name AS source_name, g.group_picture AS source_picture, b.bill_description AS description
								FROM bills AS b
								INNER JOIN groups AS g ON (b.group_id=g.group_id)
								WHERE b.bill_id=n.source_id
							)
							WHEN (n.source_type='BILL_PAYMENT') THEN (
								SELECT bp.bill_payment_id AS source_id, g.group_name AS source_name, g.group_picture AS source_picture, b.bill_description AS description
								FROM bill_payments AS bp
								INNER JOIN bills AS b ON (bp.bill_id=b.bill_id)
								INNER JOIN groups AS g ON (b.group_id=g.group_id)
								WHERE b.bill_id=n.source_id
							)
							ELSE (
								SELECT '' AS source_id, '' AS source_name, '' AS source_picture, '' AS description
							)
						END
				   ) AS s ON (s.source_id=n.source_id)
				   WHERE n.user_id=$1
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