const fs = require('fs')
const _ = require('lodash')

const debug = require('debug')
var log = debug('DM:payload:store')

var payloads = []
// used to determine if we have added or removed payload-modules between compiles
var lastPayloads
// TODO, make payload.modules an object with module-path as key
var moduleTimestamps = {}

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
	lastPayloads = _.cloneDeep(payloads)
	payloads = []
}

function get(name, src) {
	src = src || payloads
	for (var i in src) {
		if (src[i].name == name) {
			return src[i]
		}
	}
}
function getAll() {
	return payloads
}

function update(payload) {
	// reference to previous compile's payloads
	let last = get(payload.name, lastPayloads)

	// get previous payload or create one
	let prev = get(payload.name)
	if (prev) {
		remove(prev)
	}

	// determine if we have new or updated modules
	if (payload.modules) {
		payload.dirty = false

		// process payload modules
		payload.modules.forEach(module => {
			// have existing modules have been updated?
			var { mtimeMs: timestamp } = fs.statSync(module)
			if (module in moduleTimestamps && moduleTimestamps[module] !== timestamp) {
				payload.dirty = true
			}
			moduleTimestamps[module] = timestamp

			// is this a new module?
			if (!last || !last.modules.includes(module)) {
				payload.dirty = true
			}
		})

		// de-dupe modules
		if (prev) {
			payload.modules = _.uniq(prev.modules.concat(payload.modules))
		}

		// have modules been removed?
		if (last && !_.isEqual(payload.modules.sort(), last.modules.sort())) {
			payload.dirty = true
		}
	}
	const merged = Object.assign(prev || {}, payload)
	payloads.push(merged)
}

module.exports = {
	add,
	remove,
	reset,
	get,
	getAll,
	update
}
