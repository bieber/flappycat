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

import Audio from './audio.js';

type Pipe = {
	x: number;
	top: number;
	bottom: number;
};

var PLAYER_X = 0.1;
var PIPE_VX = -0.12;
var G = 1.6;
var FLAP_V = -0.65;

var MAX_SCORE = 50;

var MIN_PIPE_MARGIN = 0.1;
var MAX_PIPE_MARGIN = 0.5;
var MIN_PIPE_OPENING = 0.3;
var MAX_PIPE_OPENING = 0.8;

export default class Game {
	_player: {
		y: number;
		vy: number;
	};
	_pipes: Array<Pipe>;

	_score: number;

	_gameOverCallback: (() => void);
	_scoreChangeCallback: ((score: number) => void);

	constructor(
		scoreChangeCallback: ((score: number) => void),
		gameOverCallback: (() => void)
	) {
		this._scoreChangeCallback = scoreChangeCallback;
		this._gameOverCallback = gameOverCallback;
		this._player = {y: .5, vy: 0};
		this._score = 0;
		this._pipes = [this._randomPipe()];
	}

	flap() {
		this._player.vy = FLAP_V;
	}

	tick(dt: number) {
		// Caching pipes that haven't passed the player yet
		var pipesPastPlayer = {};
		this._pipes
			.filter((p, i, ps) => p.x < PLAYER_X)
			.forEach((p, i, ps) => pipesPastPlayer[i] = true);

		// Moving everything
		var {y, vy} = this._player;
		y += vy * dt;
		vy += dt * G;
		this._player = {y, vy};
		if (y < 0 || y > 1) {
			this._gameOverCallback();
		}

		this._pipes = this._pipes.map(
			(p, i, ps) => {
				var {x, top, bottom} = p;
				x += PIPE_VX * dt;
				return {x, top, bottom};
			}
		);

		// Pipes which have passed the player in this tick
		this._pipes
			.filter((p, i, ps) => p.x < PLAYER_X && !(i in pipesPastPlayer))
			.forEach(
				(p, i, ps) => {
					if (p.top < this._player.y && p.bottom > this._player.y) {
						this._score++;
						this._scoreChangeCallback(this._score);
					} else {
						this._gameOverCallback();
					}
				}
			);

		// Clearing out pipes that hit the screen edge
		this._pipes = this._pipes.filter((p, i, ps) => p.x > 0);

		// Adding a new pipe if necessary
		var maximumPipeMargin = MIN_PIPE_MARGIN
			+ (MAX_PIPE_MARGIN - MIN_PIPE_MARGIN)
			* (1 - this._scoreRatio());

		var rightMostPipe = this._pipes[this._pipes.length - 1];
		if (1 - rightMostPipe.x > maximumPipeMargin) {
			this._pipes.push(this._randomPipe());
		}
	}

	// cleanScreen selectively removes only the elements that will
	// need redrawing from the screen
	cleanScreen(context: CanvasRenderingContext2D) {
		var {width, height} = context.canvas;
		context.fillStyle = 'black';

		// Clearing the player
		var {
			playerCenterX,
			playerCenterY,
			playerRadius,
		} = this._playerCoordinates(width, height);
		context.fillRect(
			playerCenterX - playerRadius - 1,
			playerCenterY - playerRadius - 1,
			playerRadius * 2 + 2,
			playerRadius * 2 + 2
		);

		// Clearing the pipes
		this._pipes.forEach(
			(p, i, ps) => {
				var {
					pipeCenterX,
					pipeWidth,
					pipeTop,
					pipeBottom,
					pipeBottomHeight,
				} = this._pipeCoordinates(p, width, height);

				context.fillRect(
					pipeCenterX - pipeWidth / 2 - 2,
					0,
					pipeWidth + 4,
					pipeTop + 1
				);
				context.fillRect(
					pipeCenterX - pipeWidth / 2 - 2,
					pipeBottom - 1,
					pipeWidth + 4,
					pipeBottomHeight + 1
				);
			}
		);
	}

	renderScreen(context: CanvasRenderingContext2D) {
		var {width, height} = context.canvas;

		// Drawing the player
		var {
			playerCenterX,
			playerCenterY,
			playerRadius
		} = this._playerCoordinates(width, height);

		context.strokeStyle = 'white';
		context.beginPath();
		context.arc(playerCenterX, playerCenterY, playerRadius, 0, Math.PI * 2);
		context.stroke();

		// Drawing the pipes
		context.fillStyle = 'green';
		this._pipes.forEach(
			(p, i, ps) => {
				var {
					pipeCenterX,
					pipeWidth,
					pipeTop,
					pipeBottom,
					pipeBottomHeight,
				} = this._pipeCoordinates(p, width, height);

				context.fillRect(
					pipeCenterX - pipeWidth / 2,
					0,
					pipeWidth,
					pipeTop
				);
				context.fillRect(
					pipeCenterX - pipeWidth / 2,
					pipeBottom,
					pipeWidth,
					pipeBottomHeight
				);
			}
		);
	}

	renderAudio(audio: Audio) {
		for (var i = 0; i < this._pipes.length; i++) {
			var pipe = this._pipes[i];
			if (pipe.x >= PLAYER_X) {
				audio.setPositions(
					pipe.top,
					pipe.bottom,
					this._player.y,
					pipe.x - PLAYER_X
				);
				return;
			}
		}
	}

	_scoreRatio(): number {
		return Math.min(this._score, MAX_SCORE) / MAX_SCORE;
	}

	_playerCoordinates(width: number, height: number): {
		playerCenterX: number;
		playerCenterY: number;
		playerRadius: number;
	} {
		return {
			playerCenterX: PLAYER_X * width,
			playerCenterY: this._player.y * height,
			playerRadius: Math.min(width, height) * 0.01,
		};
	}

	_pipeCoordinates(pipe: Pipe, width: number, height: number): {
		pipeCenterX: number;
		pipeWidth: number;
		pipeTop: number;
		pipeBottom: number;
		pipeBottomHeight: number;
	} {
		return {
			pipeCenterX: pipe.x * width,
			pipeWidth: Math.min(width, height) * 0.02,
			pipeTop: pipe.top * height,
			pipeBottom: pipe.bottom * height,
			pipeBottomHeight: (1 - pipe.bottom) * height,
		};
	}

	_randomPipe(): Pipe {
		var openingSize = MIN_PIPE_OPENING
			+ ((1 - this._scoreRatio())
					* (MAX_PIPE_OPENING - MIN_PIPE_OPENING)
			);

		var top = (1 - openingSize) * Math.random();
		var bottom = top + openingSize;
		var x = 1.0;

		return {top, bottom, x};
	}
}
