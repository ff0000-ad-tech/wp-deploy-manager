const _ = require('lodash')

const debug = require('@ff0000-ad-tech/debug')
var log = debug('DM:payload:store')

var payloads = []
// used to determine if we have added or removed payload-modules between compiles
var oldPayloads = []

const required = ['name', 'type', 'modules']

function add(payload) {
	const valid = required.reduce((result, value) => {
		return !(value in payload) ? false : result
	})
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
		if (payloads[i].name == payload.name) {
			payloads.splice(i, 1)
			return
		}
	}
}
function reset() {
	oldPayloads = _.cloneDeep(payloads)
	payloads = []
}

function get(name, src) {
	src = src || payloads
	for (var i in src) {
		if (src[i].name === name) {
			return src[i]
		}
	}
}
function getAll() {
	return payloads
}

// are any payloads/modules changed?
function anyDirty() {
	// added payloads?
	for (var i in payloads) {
		if (!get(payloads[i].name, oldPayloads)) {
			return true
		}
	}
	// removed payloads?
	for (var i in oldPayloads) {
		if (!get(oldPayloads[i].name)) {
			return true
		}
	}
	// payload modules changed?
	for (var i in payloads) {
		const oldPayload = get(payloads[i].name, oldPayloads)
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
	let prevState = get(payload.name)
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
	getAll,
	anyDirty,
	anyAssets,
	update
}
