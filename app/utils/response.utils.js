const template = {
	'output_schema': {},
	'error_schema': {
		'error_message': {
			'indonesian': '',
			'english': ''
		},
		'error_code': ''
	}
};

const success = (output) => {
	let response = template;
	response['error_schema']['error_code'] = 'HIVEZ-000-0000';
	response['error_schema']['error_message']['english'] = 'Success';
	response['error_schema']['error_message']['indonesian'] = 'Sukses';
	response['output_schema'] = output;
	return response;
};

const failed = (error_code, english, indonesian) => {
	let response = template;
	response['error_schema']['error_code'] = error_code;
	response['error_schema']['error_message']['english'] = english;
	response['error_schema']['error_message']['indonesian'] = indonesian;
	response['output_schema'] = 'Failed';
	return response;
};

const error_global = failed('HIVEZ-999-9999', 'Global error', 'Error global');

module.exports = {
	template,
	success,
	failed,
	error_global
};