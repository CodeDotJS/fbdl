import childProcess from 'child_process';
import test from 'ava';

test.cb('regular', t => {
	const cp = childProcess.spawn('./cli.js', {stdio: 'inherit'});

	cp.on('error', t.ifError);

	cp.on('close', code => {
		t.is(code, 1);
		t.end();
	});
});

test.cb('resolution', t => {
	const cp = childProcess.spawn('./cli.js', ['-l', 'https://www.facebook.com/9gag/videos/10155721204506840/'], {stdio: 'inherit'});

	cp.on('error', t.ifError);

	cp.on('close', code => {
		t.is(code, 0);
		t.end();
	});
});
