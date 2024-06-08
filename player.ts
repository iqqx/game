import {
	Clamp,
	Color,
	GetIntersectPointWithRectangle,
	Line,
	Rectangle,
} from "./utilites.js";
import {
	BULLET_LIFETIME,
	PLAYER_JUMP_FORCE,
	PLAYER_SIT_SPEED,
	PLAYER_WALK_SPEED,
} from "./constants.js";
import {
	DrawAntiVignette,
	DrawCircle,
	DrawRectangle,
	DrawRectangleEx,
	DrawRectangleFixed,
	DrawRectangleWithAngle,
	DrawRectangleWithGradientAndAngle,
	DrawText,
	DrawVignette,
	GetClientRectangle,
	GetLevelPosition,
	ProgradeLerp,
	ResetTransform,
	SetFillColor,
	SetFillColorRGB,
	SetLevelPosition,
	levelLength,
} from "./context.js";
import { player, platforms, bullets, sounds, enemies } from "./Level.js";

let intersects: { x: number; y: number }[] = [{ x: 30, y: 120 }];
let needDrawAntiVegnitte = 0;

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
		case "KeyX":
			intersects = [];
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

addEventListener("mousedown", (e) => {
	player.xMouse = e.x - GetClientRectangle().left + GetLevelPosition();
	player.yMouse = 750 - (e.y - GetClientRectangle().top);
	player.direction = e.x > player.x + 50 - GetLevelPosition() ? 1 : -1;

	if (e.button === 0) {
		player.LMBPressed = true;

		Shoot(e.timeStamp);
	}
});

addEventListener("mouseup", (e) => {
	if (e.button === 0) {
		player.LMBPressed = false;
	}
});

addEventListener("mousemove", (e) => {
	player.xMouse = e.x - GetClientRectangle().left + GetLevelPosition();
	player.yMouse = 750 - (e.y - GetClientRectangle().top);

	player.direction = e.x > player.x + 50 - GetLevelPosition() ? 1 : -1;
});

function gameLoop(timeStamp: number) {
	window.requestAnimationFrame(gameLoop);
	ResetTransform();

	// Задний фон
	SetFillColorRGB(50, 50, 50);
	DrawRectangleFixed(0, 0, levelLength, 750);

	// PHYSICS
	applyVForce();

	// LOGIC
	if (player.movingLeft) moveLeft();
	else if (player.movingRight) moveRight();

	if (player.LMBPressed && timeStamp - player.lastShootTick > 100)
		Shoot(timeStamp);

	for (const enemy of enemies) enemy.Update();

	const levelPosition = levelLength * (player.x / (levelLength - 100));
	SetLevelPosition(levelPosition);
	ProgradeLerp();

	// RENDER
	// platforms
	SetFillColor("blue");
	for (const platform of platforms) DrawRectangleEx(platform);

	// bullets
	const bulletColor0 = new Color(255, 255, 255, 5);
	const bulletColor1 = new Color(255, 255, 255, 50);
	for (let i = 0; i < bullets.length; i++) {
		if (timeStamp - bullets[i].shootTimeStamp >= BULLET_LIFETIME)
			if (bullets.length > 1)
				// unordered remove
				bullets[i] = bullets.pop();
			else bullets.pop();
		else
			DrawRectangleWithGradientAndAngle(
				new Rectangle(bullets[i].x, bullets[i].y, bullets[i].length, 2),
				[
					(timeStamp - bullets[i].shootTimeStamp) / BULLET_LIFETIME,
					bulletColor0,
				],
				[1, bulletColor1],
				bullets[i].angle,
				0,
				1
			);
	}

	// ИГРОК
	SetFillColor("black");
	DrawRectangle(player.x, player.y, 100, player.sit ? 100 : 200);

	SetFillColor("yellow");
	for (const intersect of intersects)
		DrawRectangle(intersect.x - 1, intersect.y - 1, 2, 2);

	if (player.direction == 1) {
		const angle = -Clamp(
			Math.atan2(
				player.yMouse - (player.y + (player.sit ? 50 : 120)),
				player.xMouse - (player.x + 30)
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
			5 / 2
		);
	} else {
		let angle = -Math.atan2(
			player.yMouse - (player.y + (player.sit ? 50 : 120)),
			player.xMouse - (player.x + 70)
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
			5 / 2
		);
	}

	for (const enemy of enemies) enemy.Draw();

	// POST PROCESSING
	if (needDrawAntiVegnitte > 0) {
		needDrawAntiVegnitte--;
		DrawAntiVignette();
	} else DrawVignette();

	// GUI
	SetFillColor("black");
	DrawRectangleFixed(1500 / 2 - 250 / 2, 750 - 25 - 10, 250, 25);
	DrawRectangleFixed(1500 / 2 - 240 / 2, 750 - 25 - 15, 240, 35);
	DrawRectangleFixed(1500 / 2 - 260 / 2, 750 - 20 - 10, 260, 15);
	SetFillColor("white");
	DrawText(10, 10, timeStamp.toString());
	DrawRectangleFixed(
		1500 / 2 - 250 / 2 + 200 * (player.x / (levelLength - 100)),
		750 - 25 - 10,
		50,
		25
	);
	SetFillColor("white");
	DrawCircle(player.xMouse - 1, player.yMouse - 1, 2);
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

function IsCollideEx(): { xOffset: number; yOffset: number } | false {
	for (const platform of platforms)
		if (
			player.x + 100 > platform.X &&
			player.x < platform.X + platform.Width &&
			player.y + (player.sit ? 100 : 200) > platform.Y &&
			player.y < platform.Y + platform.Height
		) {
			const xstart = player.x + 100 - platform.X;
			const xend = platform.X + platform.Width - player.x;
			const ystart = platform.Y + platform.Height - player.y;
			const yend = player.y + (player.sit ? 100 : 200) - platform.Y;
			let xOffset = 0;
			let yOffset = 0;

			if (
				xstart > 0 &&
				xend > 0 &&
				xend < platform.Width &&
				xstart < platform.Width
			)
				xOffset = 0;
			else if (xstart > 0 && (xend < 0 || xstart < xend))
				xOffset = xstart;
			else if (xend > 0) xOffset = -xend;

			if (
				ystart > 0 &&
				yend > 0 &&
				yend < platform.Height &&
				ystart < platform.Height
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
			player.x + 100 > platform.X &&
			player.x < platform.X + platform.Width &&
			player.y + 200 > platform.Y &&
			player.y < platform.Y + platform.Height
		)
			return true;

	return false;
}

function IsOnGround() {
	for (const platform of platforms)
		if (
			player.x + 100 > platform.X &&
			player.x < platform.X + platform.Width &&
			player.y == platform.Y + platform.Height
		)
			return true;

	if (player.y <= 0) return true;

	return false;
}

function IsOnGroundEx(): { xOffset: number; yOffset: number } | false {
	for (const platform of platforms)
		if (
			player.x + 100 > platform.X &&
			player.x < platform.X + platform.Width &&
			player.y <= platform.Y + platform.Height
		) {
			const xstart = player.x + 100 - platform.X;
			const xend = platform.X + platform.Width - player.x;
			const ystart = platform.Y + platform.Height - player.y;
			const yend = platform.Y - (player.y + (player.sit ? 100 : 200));
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

function Shoot(timeStamp: number) {
	if (player.direction == 1) {
		const angle = -Clamp(
			Math.atan2(
				player.yMouse - (player.y + (player.sit ? 50 : 120)),
				player.xMouse - (player.x + 30)
			),
			-Math.PI / 2 + 0.4,
			Math.PI / 2 - 0.4
		);

		const inters: { x: number; y: number }[] = [];
		for (const platform of platforms) {
			const intersect = GetIntersectPointWithRectangle(
				new Line(
					player.x + 30,
					player.y + (player.sit ? 50 : 120),
					player.xMouse + (player.xMouse - (player.x + 30)) * 10000,
					player.yMouse +
						(player.yMouse - (player.y + (player.sit ? 50 : 120))) *
							10000
				),
				platform
			);

			if (intersect !== undefined) inters.push(intersect);
		}
		const intersect =
			inters.length === 0
				? undefined
				: inters.minBy(
						(x) => (x.x - player.x) ** 2 + (x.y - player.y) ** 2
				  );
		if (intersect !== undefined) intersects.push(intersect);

		bullets.push({
			x: player.x + 30,
			y: player.y + (player.sit ? 50 : 120),
			length:
				intersect === undefined
					? 2000
					: Math.min(
							Math.sqrt(
								(player.x + 30 - intersect.x) ** 2 +
									(player.y +
										(player.sit ? 50 : 120) -
										intersect.y) **
										2
							),
							2000
					  ),
			angle: angle,
			shootTimeStamp: timeStamp,
		});
	} else {
		let angle = -Math.atan2(
			player.yMouse - (player.y + (player.sit ? 50 : 120)),
			player.xMouse - (player.x + 70)
		);

		angle =
			angle < 0
				? Clamp(angle, -Math.PI, -Math.PI / 2 - 0.4)
				: Clamp(angle, Math.PI / 2 + 0.4, Math.PI);

		const inters: { x: number; y: number }[] = [];
		for (const platform of platforms) {
			const intersect = GetIntersectPointWithRectangle(
				new Line(
					player.x + 70,
					player.y + (player.sit ? 50 : 120),
					player.xMouse + (player.xMouse - (player.x + 70)) * 10000,
					player.yMouse +
						(player.yMouse - (player.y + (player.sit ? 50 : 120))) *
							10000
				),
				platform
			);

			if (intersect !== undefined) inters.push(intersect);
		}
		const intersect =
			inters.length === 0
				? undefined
				: inters.minBy(
						(x) => (x.x - player.x) ** 2 + (x.y - player.y) ** 2
				  );
		if (intersect !== undefined) intersects.push(intersect);

		bullets.push({
			x: player.x + 70,
			y: player.y + (player.sit ? 50 : 120),
			length:
				intersect === undefined
					? 2000
					: Math.min(
							Math.sqrt(
								(player.x + 70 - intersect.x) ** 2 +
									(player.y +
										(player.sit ? 50 : 120) -
										intersect.y) **
										2
							),
							2000
					  ),
			angle: angle,
			shootTimeStamp: timeStamp,
		});
	}

	sounds.Shoot.Play(0.5);

	needDrawAntiVegnitte = 5;
	player.lastShootTick = timeStamp;
}

function jump() {
	if (!IsOnGround() || player.sit) return;

	player.verticalAcceleration = PLAYER_JUMP_FORCE;
}

gameLoop(0);
