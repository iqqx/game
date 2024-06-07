import { Clamp } from "./utilites.js";
import {
	PLAYER_JUMP_FORCE,
	PLAYER_SIT_SPEED,
	PLAYER_WALK_SPEED,
} from "./constants.js";
import {
	DrawRectangle,
	DrawRectangleFixed,
	DrawRectangleWithAngle,
	DrawText,
	GetFillColor,
	GetLevelPosition,
	ProgradeLerp,
	ResetTransform,
	SetFillColor,
	SetFillColorRGB,
	SetLevelPosition,
	levelLength,
} from "./context.js";

const player = {
	x: 900,
	y: 0,
	xMouse: 0,
	yMouse: 0,
	direction: 1,
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
		y: 220,
		width: 200,
		height: 25,
	},
	{
		x: 1500,
		y: 200,
		width: 80,
		height: 30,
	},
	{
		x: 2000 - 25,
		y: 350,
		width: 25,
		height: 100,
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

addEventListener("mousemove", (e) => {
	player.xMouse = e.x;
	player.yMouse = 750 - e.y;

	player.direction = e.x > player.x + 50 - GetLevelPosition() ? 1 : -1;
});

function gameLoop() {
	window.requestAnimationFrame(gameLoop);
	ResetTransform();

	// PHYSICS
	applyVForce();

	// LOGIC
	if (player.movingLeft) moveLeft();
	else if (player.movingRight) moveRight();

	const levelPosition = levelLength * (player.x / (levelLength - 100));
	SetLevelPosition(levelPosition);
	ProgradeLerp();

	// GUI
	SetFillColorRGB(50, 50, 50);
	DrawRectangleFixed(0, 0, levelLength, 750);

	SetFillColor("black");
	DrawRectangleFixed(1500 / 2 - 250 / 2, 750 - 25 - 10, 250, 25);
	DrawRectangleFixed(1500 / 2 - 240 / 2, 750 - 25 - 15, 240, 35);
	DrawRectangleFixed(1500 / 2 - 260 / 2, 750 - 20 - 10, 260, 15);
	SetFillColor("white");
	DrawRectangleFixed(
		1500 / 2 - 250 / 2 + 200 * (player.x / (levelLength - 100)),
		750 - 25 - 10,
		50,
		25
	);

	// RENDER
	const prev = GetFillColor();
	SetFillColor("blue");
	for (const platform of platforms)
		DrawRectangle(platform.x, platform.y, platform.width, platform.height);
	SetFillColor(prev);

	SetFillColor("black");
	DrawRectangle(player.x, player.y, 100, player.sit ? 100 : 200);

	if (player.direction == 1) {
		const angle = -Clamp(
			Math.atan2(
				player.yMouse - (player.y + (player.sit ? 50 : 120) - 5 / 2),
				player.xMouse - (player.x + 30 - GetLevelPosition()) - 15 / 2
			),
			-Math.PI / 2 + 0.4,
			Math.PI / 2 - 0.4
		);
		SetFillColor("red");
		DrawRectangleWithAngle(
			player.x + 30,
			player.y + (player.sit ? 50 : 120),
			200,
			5,
			angle,
			-50 / 2,
			-5 / 2
		);
	} else {
		let angle = -Math.atan2(
			player.yMouse - (player.y + (player.sit ? 50 : 120) - 5 / 2),
			player.xMouse - (player.x + 70 - GetLevelPosition()) - 15 / 2
		);

		angle =
			angle < 0
				? Clamp(angle, -Math.PI, -Math.PI / 2 - 0.4)
				: Clamp(angle, Math.PI / 2 + 0.4, Math.PI);

		SetFillColor("red");
		DrawRectangleWithAngle(
			player.x + 70,
			player.y + (player.sit ? 50 : 120),
			200,
			5,
			angle,
			-50 / 2,
			-5 / 2
		);
	}
}

function moveRight() {
	player.x = Math.min(
		player.x + (player.sit ? PLAYER_SIT_SPEED : PLAYER_WALK_SPEED),
		levelLength - 100
	);

	const collideOffsets = IsCollideEx();
	if (collideOffsets !== false && collideOffsets.xOffset != 0)
		player.x -= collideOffsets.xOffset;
}

function moveLeft() {
	player.x = Math.max(
		player.x - (player.sit ? PLAYER_SIT_SPEED : PLAYER_WALK_SPEED),
		0
	);

	const collideOffsets = IsCollideEx();
	if (collideOffsets !== false && collideOffsets.xOffset != 0)
		player.x -= collideOffsets.xOffset;
}

function applyVForce() {
	if (player.verticalAcceleration == 0 && IsOnGround()) return;

	player.verticalAcceleration -= player.verticalAcceleration > 0 ? 2 : 3;
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
	for (const platform of platforms)
		if (
			player.x + 100 > platform.x &&
			player.x < platform.x + platform.width &&
			player.y == platform.y + platform.height
		)
			return true;

	if (player.y <= 0) return true;

	return false;
}

function IsOnGroundEx(): { xOffset: number; yOffset: number } | false {
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

	if (player.y <= 0) return { xOffset: 0, yOffset: player.y };

	return false;
}

function jump() {
	if (!IsOnGround() || player.sit) return;

	player.verticalAcceleration = PLAYER_JUMP_FORCE;
}

gameLoop();
