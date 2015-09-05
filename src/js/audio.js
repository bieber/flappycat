/*
 * Copyright 2015, Robert Bieber
 *
 * This file is part of flappycat.
 *
 * flappycat is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * flappycat is distributed in the hope that it will be useful,
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with flappycat.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @flow
 */

var TOP_FREQUENCY = 880;
var BOTTOM_FREQUENCY = 440;

var MAX_CHIRP_FREQUENCY = 40;
var MIN_CHIRP_FREQUENCY = 0;

function freq(y: number): number {
	return ((1 - y) * (TOP_FREQUENCY - BOTTOM_FREQUENCY)) + BOTTOM_FREQUENCY;
}

// in milliseconds
function chirpPeriod(distance: number): number {
	var position = (1 - distance) * (MAX_CHIRP_FREQUENCY - MIN_CHIRP_FREQUENCY);
	var freq = MIN_CHIRP_FREQUENCY + position;
	return 1000 / freq;
}

export default class Audio {
	_gain: any;
	_chirpGain: any;

	_topPipe: any;
	_bottomPipe: any;
	_cat: any;

	_chirpPeriod: number;

	constructor() {
		var AudioContext = window.AudioContext || window.webkitAudioContext;
		var context = new AudioContext();

		this._gain = context.createGain();
		this._gain.gain.value = 0;
		this._gain.connect(context.destination);

		this._chirpGain = context.createGain();
		this._chirpGain.gain.value = 0;
		this._chirpGain.connect(this._gain);

		this._topPipe = context.createOscillator();
		this._topPipe.connect(this._gain);
		this._topPipe.start();

		this._bottomPipe = context.createOscillator();
		this._bottomPipe.connect(this._gain);
		this._bottomPipe.start();

		this._cat  = context.createOscillator();
		this._cat.connect(this._chirpGain);
		this._cat.start();
		this._chirpOn();
	}

	start() {
		this._gain.gain.value = 0.4;
	}

	stop() {
		this._gain.gain.value = 0;
	}

	_chirpOn() {
		this._chirpGain.gain.value = 1;
		setTimeout(this._chirpOff.bind(this), this._chirpPeriod);
	}

	_chirpOff() {
		this._chirpGain.gain.value = 0;
		setTimeout(this._chirpOn.bind(this), this._chirpPeriod);
	}

	setPositions(
		topPipe: number,
		bottomPipe: number,
		catY: number,
		distance: number
	) {
		this._topPipe.frequency.value = freq(topPipe);
		this._bottomPipe.frequency.value = freq(bottomPipe);
		this._cat.frequency.value = freq(catY);
		this._chirpPeriod = chirpPeriod(distance);
	}
}
