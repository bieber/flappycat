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

var SPACEBAR = 32;

var lastTime: ?number = null;

function resizeCanvas(canvas: HTMLCanvasElement) {
	canvas.width = document.documentElement.clientWidth;
	canvas.height = document.documentElement.clientHeight - 30;
}

function frame(game: Game, canvas: HTMLCanvasElement, timeStamp: number) {
	if (lastTime) {
		var dt = (timeStamp - lastTime) / 1000;
		game.tick(dt);
		lastTime = timeStamp;
	} else {
		lastTime = timeStamp;
	}

	var context = canvas.getContext('2d');
	if (!(context instanceof CanvasRenderingContext2D)) {
		throw new Error('Rendering context error');
	}
	game.render(context);
	
	window.requestAnimationFrame(frame.bind(null, game, canvas));
}

export default function init() {
	var canvas = document.getElementById('canvas');
	if (!(canvas instanceof HTMLCanvasElement)) {
		throw new Error('Canvas element must be a canvas');
	}

	var input = document.getElementById('input');
	if (!(input instanceof HTMLInputElement)) {
		throw new Error('input must be an input element');
	}
	
	resizeCanvas(canvas);
	window.onresize = resizeCanvas.bind(null, canvas);

	var game = new Game();
	var keyDownHandler = (event: Event) => {
		if (!(canvas instanceof HTMLCanvasElement)) {
			throw new Error('Needed canvas element');
		}

		if (event.keyCode === SPACEBAR) {
			event.preventDefault();
			if (lastTime === null) {
				window.requestAnimationFrame(frame.bind(null, game, canvas));
			} else {
				game.flap();
			}
		}
	};
	input.addEventListener('keydown', keyDownHandler);
	document.body.addEventListener('keydown', keyDownHandler);
	
	var context = canvas.getContext('2d');
	if (!(context instanceof CanvasRenderingContext2D)) {
		throw new Error('Rendering context error');
	}
	game.render(context);
}
