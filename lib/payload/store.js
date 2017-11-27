const debug = require('debug');
var log = debug('DM:payload:store');

var payloads = [];

const required = [
	'name', 'type', 'recompile', 'modules'
];

function add(payload) {
	log('trying to add:', payload.name);
	const valid = required.reduce((result, value) => {
		return !(value in payload) ? false : result;
	});
	if (!valid) {
		log(`\nWarning!! Malformed payload object:`);
		//log(payload);
		log(`Required keys:`);
		log(required);
		return;
	}
	if (!get(payload.name)) {
		payloads.push(
			Object.assign({}, payload)
		);
	}
	else {
		update(payload);
	}
}

function remove(payload) {
	for (var i in payloads) {
		if (payloads[i].name == payload.name) {
			payloads.splice(i, 1);
			return;
		}
	}
}
function reset() {
	payloads = [];
}

function get(name) {
	for (var i in payloads) {
		if (payloads[i].name == name) {
			return payloads[i];
		}
	}
}
function getAll() {
	return payloads;
}

function update(payload) {
	const prev = get(payload.name);
	if (!prev) {
		add(payload);
		return;
	}
	remove(prev);
	payloads.push(
		Object.assign(prev, payload)
	);
}


module.exports = {
	add,
	remove,
	reset,
	get,
	getAll,
	update
};