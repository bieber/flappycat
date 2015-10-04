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
var I = 73;
var R = 82;
var S = 83;

var lastTime: ?number = null;

var canvas: HTMLCanvasElement = getCanvas();
var input: HTMLInputElement = getInput();

var game: Game = new Game(
	setScore,
	stopGame
);
var audio: Audio = new Audio;

var active: bool = false;

// I know this is dumb, it's just a little hack to get around Web
// mode's handling of generic types (in a function declaration it
// would break indentation).

type NodeArray = Array<HTMLElement>;

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

function getInstructions(): NodeArray {
	return [
		document.getElementById('instructions_header'),
		document.getElementById('instructions_1'),
		document.getElementById('instructions_2'),
	];
}

function setScore(score: number) {
	var node = document.getElementById('score');
	node.textContent = score.toString();
}

function onKeyDown(event: Event) {
	if (event.ctrlKey) {
		return;
	}

	if (event.keyCode === SPACEBAR) {
		event.preventDefault();
		if (active) {
			game.flap();
		} else {
			resetGame();
			startGame();
		}
	} else if (event.keyCode === I) {
		getInstructions().forEach(
			(node, i, nodes) => {
				if (node.getAttribute('aria-hidden') === 'true') {
					node.setAttribute('aria-hidden', 'false');
				} else {
					node.setAttribute('aria-hidden', 'true');
				}
			}
		);
	} else if (event.keyCode === R) {
		event.preventDefault();
		resetGame();
	} else if (event.keyCode === S) {
		audio.toggle();
	}
}

function resizeCanvas() {
	var heightOffset = getInput().offsetHeight * 1.5;

	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight - heightOffset;

	var context = getContext();
	context.fillStyle = 'black';
	context.fillRect(0, 0, canvas.width, canvas.height);
	game.renderScreen(context);
}


function frame(timeStamp: number) {
	if (!active) {
		return;
	}

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

function startGame() {
	active = true;
	setScore(0);
	window.requestAnimationFrame(frame);
	audio.start();
}

function stopGame() {
	active = false;
	audio.stop();
}

function resetGame() {
	active = false;
	game = new Game(
		setScore,
		stopGame
	);
	resizeCanvas();
	audio.stop();
	setScore(0);
	lastTime = null;
	game.renderScreen(getContext());
}

export default function init() {
	window.onresize = resizeCanvas;
	input.addEventListener('keydown', onKeyDown);
	document.body.addEventListener('keydown', onKeyDown);

	resetGame();
}
