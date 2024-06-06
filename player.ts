import { PLAYER_JUMP_FORCE, PLAYER_SIT_SPEED, PLAYER_WALK_SPEED } from "./constants.js";
import { Clear, DrawRectangle, GetFillColor, SetFillColor } from "./context.js";

const player = {
	x: 0,
	y: 0,
	sit: false,
	movingLeft: false,
	movingRight: false,
	verticalAcceleration: 0,
};

const platforms = [
	{
		x: 300,
		y: 0,
		width: 300,
		height: 25,
	},
	{
		x: 900,
		y: 120,
		width: 200,
		height: 25,
	},
	{
		x: 1100,
		y: 200,
		width: 80,
		height: 30,
	},
];

addEventListener("keydown", (e) => {
	switch (e.code) {
		case "KeyC":
			if (IsStandingCollide() && player.sit) break;

			player.sit = !player.sit;
			break;
		case "Space":
			jump();
			break;
		case "KeyA":
			player.movingLeft = true;
			break;
		case "KeyD":
			player.movingRight = true;
			break;
		default:
			break;
	}
});

addEventListener("keyup", (e) => {
	switch (e.code) {
		case "KeyA":
			player.movingLeft = false;
			break;
		case "KeyD":
			player.movingRight = false;
			break;
		default:
			break;
	}
});

function gameLoop() {
	window.requestAnimationFrame(gameLoop);

	applyForce();

	if (player.movingLeft) moveLeft();
	else if (player.movingRight) moveRight();

	Clear();

	const prev = GetFillColor();
	SetFillColor("blue");
	for (const platform of platforms)
		DrawRectangle(platform.x, platform.y, platform.width, platform.height);
	SetFillColor(prev);

	DrawRectangle(player.x, player.y, 100, player.sit ? 100 : 200);
}

function moveRight() {
	player.x = Math.min(player.x + (player.sit ? PLAYER_SIT_SPEED : PLAYER_WALK_SPEED), 1500 - 100);

	const collideOffsets = IsCollideEx();
	if (collideOffsets !== false && collideOffsets.xOffset != 0)
		player.x -= collideOffsets.xOffset;
}

function moveLeft() {
	player.x = Math.max(player.x - (player.sit ? PLAYER_SIT_SPEED : PLAYER_WALK_SPEED), 0);

	const collideOffsets = IsCollideEx();
	if (collideOffsets !== false && collideOffsets.xOffset != 0)
		player.x -= collideOffsets.xOffset;
}

function applyForce() {
	if (player.verticalAcceleration == 0 && IsOnGround()) return;

	player.verticalAcceleration--;
	player.y = Math.max(player.y + player.verticalAcceleration, 0);

	if (player.verticalAcceleration <= 0) {
		const offsets = IsOnGroundEx();

		if (offsets !== false) {
			player.verticalAcceleration = 0;

			player.y += offsets.yOffset;

			return;
		}
	} else if (player.verticalAcceleration > 0) {
		const offsets = IsCollideEx();

		if (offsets !== false) {
			player.verticalAcceleration = 0;

			player.y += offsets.yOffset;

			return;
		}
	}
}

function IsCollide() {
	for (const platform of platforms)
		if (
			player.x + 100 > platform.x &&
			player.x < platform.x + platform.width &&
			player.y + (player.sit ? 100 : 200) > platform.y &&
			player.y < platform.y + platform.height
		)
			return true;

	return false;
}

function IsCollideEx(): { xOffset: number; yOffset: number } | false {
	for (const platform of platforms)
		if (
			player.x + 100 > platform.x &&
			player.x < platform.x + platform.width &&
			player.y + (player.sit ? 100 : 200) > platform.y &&
			player.y < platform.y + platform.height
		) {
			const xstart = player.x + 100 - platform.x;
			const xend = platform.x + platform.width - player.x;
			const ystart = platform.y + platform.height - player.y;
			const yend = player.y + (player.sit ? 100 : 200) - platform.y;
			let xOffset = 0;
			let yOffset = 0;

			if (
				xstart > 0 &&
				xend > 0 &&
				xend < platform.width &&
				xstart < platform.width
			)
				xOffset = 0;
			else if (xstart > 0 && (xend < 0 || xstart < xend))
				xOffset = xstart;
			else if (xend > 0) xOffset = -xend;

			if (
				ystart > 0 &&
				yend > 0 &&
				yend < platform.height &&
				ystart < platform.height
			)
				yOffset = 0;
			else if (ystart > 0 && (yend < 0 || ystart < yend))
				yOffset = ystart;
			else if (yend > 0) yOffset = -yend;

			if (xOffset == 0 && yOffset == 0) return false;

			return { xOffset: xOffset, yOffset: yOffset };
		}

	return false;
}

function IsStandingCollide() {
	for (const platform of platforms)
		if (
			player.x + 100 > platform.x &&
			player.x < platform.x + platform.width &&
			player.y + 200 > platform.y &&
			player.y < platform.y + platform.height
		)
			return true;

	return false;
}

function IsOnGround() {
	if (player.y <= 0) return true;

	for (const platform of platforms)
		if (
			player.x + 100 > platform.x &&
			player.x < platform.x + platform.width &&
			player.y == platform.y + platform.height
		)
			return true;

	return false;
}

function IsOnGroundEx(): { xOffset: number; yOffset: number } | false {
	if (player.y <= 0) return { xOffset: 0, yOffset: player.y };

	for (const platform of platforms)
		if (
			player.x + 100 > platform.x &&
			player.x < platform.x + platform.width &&
			player.y <= platform.y + platform.height
		) {
			const xstart = player.x + 100 - platform.x;
			const xend = platform.x + platform.width - player.x;
			const ystart = platform.y + platform.height - player.y;
			const yend = platform.y - (player.y + (player.sit ? 100 : 200));
			let xOffset = 0;
			let yOffset = 0;

			if (xstart > 0 && xend > 0) xOffset = 0;
			else if (xstart > 0 && (xend < 0 || xstart < xend))
				xOffset = xstart;
			else if (xend > 0) xOffset = -xend;

			if (ystart > 0 && yend > 0) yOffset = 0;
			else if (ystart > 0 && (yend < 0 || ystart < yend))
				yOffset = ystart;
			else if (yend > 0) yOffset = -yend;

			if (xOffset == 0 && yOffset == 0) return false;

			return { xOffset: xOffset, yOffset: yOffset };
		}

	return false;
}

function jump() {
	if (!IsOnGround() || player.sit) return;

	player.verticalAcceleration = PLAYER_JUMP_FORCE;
}

gameLoop();
