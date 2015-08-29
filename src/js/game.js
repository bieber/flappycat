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

var G = 0.3;
var FLAP_ACCELERATION = -0.1;

export default class Game {
	player: {
		y: number;
		vy: number;
	};

	constructor() {
		this.player = {y: .5, vy: 0};
	}

	flap() {
		this.player.vy += FLAP_ACCELERATION;
	}
	
	tick(dt: number) {
		var {y, vy} = this.player;
		y += vy * dt;
		vy += dt * G;
		this.player = {y, vy};
	}
	
	render(context: CanvasRenderingContext2D) {
		var {width, height} = context.canvas;

		context.clearRect(0, 0, width, height);
		
		context.fillStyle = 'black';
		context.fillRect(0, 0, width, height);

		//Drawing the player
		context.fillStyle = 'white';
		context.strokeStyle = 'white';
		var playerCenterX = 0.1 * width;
		var playerCenterY = this.player.y * height;
		var playerRadius = Math.min(width, height) * 0.01;

		context.beginPath();
		context.arc(playerCenterX, playerCenterY, playerRadius, 0, Math.PI * 2);
		context.stroke();
	}
}
