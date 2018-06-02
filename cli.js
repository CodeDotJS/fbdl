#!/usr/bin/env node

'use strict';

const dns = require('dns');
const https = require('https');
const fs = require('fs');
const os = require('os');
const fse = require('fs-extra');
const got = require('got');
const isUrl = require('is-url');
const chalk = require('chalk');
const logUpdate = require('log-update');
const ora = require('ora');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({pkg}).notify();

const arg = process.argv[2];
const inf = process.argv[3];
const pre = chalk.cyan.bold('›');
const pos = chalk.red.bold('›');
const dir = `${os.homedir()}/facebook-videos/`;
const spinner = ora();

if (!arg || arg === '--help') {
	console.log(`
 Usage: fbdl <command> [source]

 Command:
  -l, --low     Download video in low resolution
  -h, --high    Download video in high resolution

 Help:
  $ fbdl -l https://www.facebook.com/9gag/videos/10155721204506840/
 `);
	process.exit(1);
}

if (!inf || isUrl(inf) === false) {
	logUpdate(`\n${pos} Please provide a valid url \n`);
	process.exit(1);
}

fse.ensureDir(dir, err => {
	if (err) {
		process.exit(1);
	}
});

const checkConnection = () => {
	dns.lookup('facebook.com', err => {
		if (err) {
			logUpdate(`\n${pos} Please check your internet connection!\n`);
			process.exit(1);
		} else {
			logUpdate();
			spinner.text = `Calm down your bazooka`;
			spinner.start();
		}
	});
};

const downloadMessage = () => {
	logUpdate();
	spinner.text = 'Downloading video. Hold on!';
};

const showError = () => {
	logUpdate(`\n${pos}${pos} Maybe the video is : \n\n ${pre} Deleted \n ${pre} Not shared publicly!\n\n ${chalk.dim('for -h or --high : High resolution video is not available!\n')}`);
	process.exit(1);
};

const download = sources => {
	const rand = Math.random().toString(16).substr(10);
	const save = fs.createWriteStream(`${dir}/${rand}.mp4`);

	https.get(sources, (res, cb) => {
		res.pipe(save);

		save.on('finish', () => {
			save.close(cb);
			logUpdate(`\n${pre} Video Saved! ${chalk.dim(`[${rand}.mp4]`)}\n`);
			spinner.stop();

			save.on('error', () => {
				process.exit(1);
			});
		});
	});
};

if (arg === '-l' || arg === '--low') {
	checkConnection();
	got(inf).then(res => {
		downloadMessage();
		const data = res.body.split('sd_src_no_ratelimit:"')[1].split('",aspect_ratio:1,')[0];
		download(data);
	}).catch(err => {
		if (err) {
			showError();
		}
	});
}

if (arg === '-h' || arg === '--high') {
	checkConnection();
	got(inf).then(res => {
		downloadMessage();
		const data = res.body.split('hd_src:"')[1].split('",sd_src:"')[0];
		download(data);
	}).catch(err => {
		if (err) {
			showError();
		}
	});
}
