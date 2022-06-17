import { Client } from './Client.js'

test('client.in()', () => {
	let client = new Client({
		in: (group) => ({
			emit: (...args) => {
				console.log('emit in', group, ':', ...args);
			}
		}),
		join: (group) => {
			console.log('join', group);
		}
	})

	client.in('test').emit('test');
	client.join('test');
	client.in('test').emit('test');
})

test('client.removeAllListeners()', () => {
	let client = new Client({
		on: (ev, listener) => {
			console.log('on', ev, '->', listener);
		},
		removeAllListeners: (ev) => {
			console.log('removeAllListeners', ev)
		}
	})

	client.removeAllListeners('test');
	client.on('test', () => {});
	client.removeAllListeners('test');
})