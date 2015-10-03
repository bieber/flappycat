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

import Game from './game.js';
import Audio from './audio.js';

var SPACEBAR = 32;

var lastTime: ?number = null;

var canvas: HTMLCanvasElement = getCanvas();
var input: HTMLInputElement = getInput();

var game: Game = new Game(
	console.log.bind(console, 'score'),
	console.log.bind(console, 'game over')
);
var audio: Audio = new Audio;


function getCanvas(): HTMLCanvasElement {
	var canvas = document.getElementById('canvas');
	if (!(canvas instanceof HTMLCanvasElement)) {
		throw new Error('Canvas element must be a canvas');
	}
	return canvas;
}

function getContext(): CanvasRenderingContext2D {
	var context = canvas.getContext('2d');
	if (!(context instanceof CanvasRenderingContext2D)) {
		throw new Error('Rendering context error');
	}
	return context;
}

function getInput(): HTMLInputElement {
	var input = document.getElementById('input');
	if (!(input instanceof HTMLInputElement)) {
		throw new Error('input must be an input element');
	}
	return input;
}

function resizeCanvas() {
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight - 30;

	var context = getContext();
	context.fillStyle = 'black';
	context.fillRect(0, 0, canvas.width, canvas.height);
}

function onFlap(event: Event) {
	if (event.keyCode === SPACEBAR) {
		event.preventDefault();
		if (lastTime === null) {
			window.requestAnimationFrame(frame);
			audio.start();
		} else {
			game.flap();
		}
	}
}

function frame(timeStamp: number) {
	var context = getContext();

	if (lastTime) {
		game.cleanScreen(context);

		var dt = (timeStamp - lastTime) / 1000;
		game.tick(dt);
		lastTime = timeStamp;
	} else {
		lastTime = timeStamp;
	}

	game.renderScreen(context);
	game.renderAudio(audio);
	window.requestAnimationFrame(frame);
}

export default function init() {
	resizeCanvas();
	window.onresize = resizeCanvas;

	input.addEventListener('keydown', onFlap);
	document.body.addEventListener('keydown', onFlap);

	var context = getContext();
	game.renderScreen(context);
}
