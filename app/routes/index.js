const bills = require('./bills.routes');
const events = require('./events.routes');
const groups = require('./groups.routes');
const notifications = require('./notifications.routes');
const requests = require('./requests.routes');
const users = require('./users.routes');

module.exports = app => {
	app.use('/bills', bills);
	app.use('/events', events);
	app.use('/groups', groups);
	app.use('/notifications', notifications);
	app.use('/requests', requests);
	app.use('/users', users);
};