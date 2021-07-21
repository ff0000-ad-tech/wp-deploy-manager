const _ = require('lodash')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:payload:store')

var payloads = []
// used to determine if we have added or removed payload-modules between compiles
var oldPayloads = []

const required = ['entry', 'type', 'modules']

function add(payload) {
	const valid = required.reduce((acc, value) => {
		return (acc && value in payload) || false
	}, true)
	if (!valid) {
		log(`\nWarning!! Malformed payload object:`)
		//log(payload);
		log(`Required keys:`)
		log(required)
		return
	}
	update(payload)
}

function remove(payload) {
	for (var i in payloads) {
		if (payloads[i].entry === payload.entry && payloads[i].type === payload.type) {
			payloads.splice(i, 1)
			return
		}
	}
}
function reset() {
	oldPayloads = _.cloneDeep(payloads)
	payloads = []
}

function get(payload, comparePayloads) {
	const src = comparePayloads || payloads
	for (var i in src) {
		if (src[i].entry === payload.entry && src[i].type === payload.type) {
			return src[i]
		}
	}
}
const getSourcesBy = (type) => {
	for (var i in payloads) {
		if (payloads[i].type === type) {
			return Object.keys(payloads[i].modules)
		}
	}
	return []
}
function getAll() {
	return payloads
}

// are any payloads/modules changed?
function anyDirty() {
	// added payloads?
	for (var i in payloads) {
		if (!get(payloads[i], oldPayloads)) {
			return true
		}
	}
	// removed payloads?
	for (var i in oldPayloads) {
		if (!get(oldPayloads[i])) {
			return true
		}
	}
	// payload modules changed?
	for (var i in payloads) {
		const oldPayload = get(payloads[i], oldPayloads)
		if (JSON.stringify(payloads[i].modules) !== JSON.stringify(oldPayload.modules)) {
			return true
		}
	}
}

// are there any asset payloads?
function anyAssets() {
	for (var i in payloads) {
		if (payloads[i].type.indexOf('fba') > -1) {
			return true
		}
	}
}

function update(payload) {
	// get previous payload or create one
	let prevState = get(payload)
	if (prevState) {
		remove(prevState)
	}
	payloads.push(_.merge(prevState || {}, payload))
}

module.exports = {
	add,
	remove,
	reset,
	get,
	getSourcesBy,
	getAll,
	anyDirty,
	anyAssets,
	update
}
