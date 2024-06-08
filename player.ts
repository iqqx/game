import {
	Clamp,
	Color,
	GetIntersectPointWithRectangle,
	GetNearestIntersectWithEnemies,
	GetNearestIntersectWithRectangles,
	Line,
	Rectangle,
	SquareMagnitude,
} from "./utilites.js";
import {
	BULLET_LIFETIME,
	PLAYER_HEIGHT,
	PLAYER_JUMP_FORCE,
	PLAYER_MAX_HEALTH,
	PLAYER_SIT_SPEED,
	PLAYER_WALK_FRAME_DURATION,
	PLAYER_WALK_SPEED,
	PLAYER_WIDTH,
} from "./constants.js";
import {
	DrawCircle,
	DrawImage,
	DrawImageFlipped,
	DrawImageWithAngle,
	DrawImageWithAngleVFlipped,
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
	SetFillColorRGBA,
	SetHorizontalFlip,
	SetLevelPosition,
	levelLength,
} from "./context.js";
import {
	player,
	platforms,
	bullets,
	sounds,
	enemies,
	images,
} from "./Level.js";

let intersects: { x: number; y: number }[] = [];
let needDrawAntiVegnitte = 0;
let needDrawRedVegnitte = 0;

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
	player.direction =
		e.x > player.x + PLAYER_WIDTH / 2 - GetLevelPosition() ? 1 : -1;

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

	player.direction =
		e.x > player.x + PLAYER_WIDTH / 2 - GetLevelPosition() ? 1 : -1;
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

	const prevX = player.x;
	if (player.movingLeft) moveLeft();
	else if (player.movingRight) moveRight();
	player.direction = player.xMouse > player.x + PLAYER_WIDTH / 2 ? 1 : -1;

	if (prevX != player.x) {
		if (
			timeStamp - player.lastFrameTimeStamp >=
			PLAYER_WALK_FRAME_DURATION
		) {
			player.frameIndex = (player.frameIndex + 1) % 4;
			player.lastFrameTimeStamp = timeStamp;
		}
	} else {
		player.frameIndex = 0;
	}

	if (player.LMBPressed && timeStamp - player.lastShootTick > 100)
		Shoot(timeStamp);

	for (const enemy of enemies) enemy.Update(timeStamp);

	const levelPosition =
		levelLength * (player.x / (levelLength - PLAYER_WIDTH));
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

	for (const enemy of enemies) enemy.Draw();

	// ИГРОК
	if (player.direction === 1) {
		DrawImage(
			(player.sit ? images.Player.Sit : images.Player.Walk)[
				player.frameIndex
			],
			new Rectangle(
				player.x - 25,
				player.y,
				PLAYER_WIDTH + 50,
				PLAYER_HEIGHT
			)
		);
	} else
		DrawImageFlipped(
			(player.sit ? images.Player.Sit : images.Player.Walk)[
				player.frameIndex
			],
			new Rectangle(
				player.x - 25,
				player.y,
				PLAYER_WIDTH + 50,
				PLAYER_HEIGHT
			)
		);

	if (player.direction == 1) {
		const angle = -Clamp(
			Math.atan2(
				player.yMouse -
					(player.y + PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75)),
				player.xMouse - (player.x + PLAYER_WIDTH / 2)
			),
			-Math.PI / 2 + 0.4,
			Math.PI / 2 - 0.4
		);

		DrawImageWithAngle(
			images.AK,
			new Rectangle(
				player.x + PLAYER_WIDTH / 2,
				player.y + PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75),
				52 * 3.125,
				16 * 3.125
			),
			angle,
			-12,
			16 * 2.4
		);
	} else {
		let angle = -Math.atan2(
			player.yMouse -
				(player.y + PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75)),
			player.xMouse - (player.x + PLAYER_WIDTH / 2)
		);

		angle =
			angle < 0
				? Clamp(angle, -Math.PI, -Math.PI / 2 - 0.4)
				: Clamp(angle, Math.PI / 2 + 0.4, Math.PI);

		DrawImageWithAngleVFlipped(
			images.AK,
			new Rectangle(
				player.x + PLAYER_WIDTH / 2,
				player.y + PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75),
				52 * 3.125,
				16 * 3.125
			),
			angle,
			-12,
			16 * 2.4
		);
	}

	// POST PROCESSING
	if (needDrawRedVegnitte > 0) {
		needDrawRedVegnitte--;
		DrawVignette(new Color(255, 0, 0));
	}
	if (needDrawAntiVegnitte > 0) {
		needDrawAntiVegnitte--;
		DrawVignette(new Color(100, 100, 100));
	}
	DrawVignette(new Color(0, 0, 0));

	// GUI
	SetFillColor("black");
	DrawRectangleFixed(1500 / 2 - 250 / 2, 750 - 25 - 10, 250, 25);
	DrawRectangleFixed(1500 / 2 - 240 / 2, 750 - 25 - 15, 240, 35);
	DrawRectangleFixed(1500 / 2 - 260 / 2, 750 - 20 - 10, 260, 15);
	SetFillColor("white");
	DrawText(10, 10, timeStamp.toString());
	DrawRectangleFixed(
		1500 / 2 -
			250 / 2 +
			PLAYER_HEIGHT * (player.x / (levelLength - PLAYER_WIDTH)),
		750 - 25 - 10,
		50,
		25
	);

	// Heath
	SetFillColorRGBA(new Color(255, 0, 0, 25));
	DrawRectangleFixed(25, 25, 250, 25);
	SetFillColorRGBA(new Color(255, 0, 0, 50));
	DrawRectangleFixed(25, 25, 250 * (player.health / PLAYER_MAX_HEALTH), 25);

	// Cursor
	SetFillColor("white");
	DrawCircle(player.xMouse - 1, player.yMouse - 1, 2);

	// Game over
	if (player.health <= 0) {
		SetFillColorRGB(255, 0, 0);
		DrawRectangleFixed(0, 0, 1500, 750);
	}

	SetFillColor("yellow");
	for (const intersect of intersects)
		DrawRectangle(intersect.x - 1, intersect.y - 1, 2, 2);
}

function moveRight() {
	player.x = Math.min(
		player.x + (player.sit ? PLAYER_SIT_SPEED : PLAYER_WALK_SPEED),
		levelLength - PLAYER_WIDTH
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
			player.x + PLAYER_WIDTH > platform.X &&
			player.x < platform.X + platform.Width &&
			player.y + (player.sit ? 100 : PLAYER_HEIGHT) > platform.Y &&
			player.y < platform.Y + platform.Height
		) {
			const xstart = player.x + PLAYER_WIDTH - platform.X;
			const xend = platform.X + platform.Width - player.x;
			const ystart = platform.Y + platform.Height - player.y;
			const yend =
				player.y + (player.sit ? 100 : PLAYER_HEIGHT) - platform.Y;
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
			player.x + PLAYER_WIDTH > platform.X &&
			player.x < platform.X + platform.Width &&
			player.y + PLAYER_HEIGHT > platform.Y &&
			player.y < platform.Y + platform.Height
		)
			return true;

	return false;
}

function IsOnGround() {
	for (const platform of platforms)
		if (
			player.x + PLAYER_WIDTH > platform.X &&
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
			player.x + PLAYER_WIDTH > platform.X &&
			player.x < platform.X + platform.Width &&
			player.y <= platform.Y + platform.Height
		) {
			const xstart = player.x + PLAYER_WIDTH - platform.X;
			const xend = platform.X + platform.Width - player.x;
			const ystart = platform.Y + platform.Height - player.y;
			const yend =
				platform.Y - (player.y + (player.sit ? 100 : PLAYER_HEIGHT));
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

export function Attack(damage: number) {
	player.health -= damage;
	needDrawRedVegnitte = 5;

	if (player.health <= 0) {
	}
}

function Shoot(timeStamp: number) {
	const hit = GetNearestIntersectWithRectangles(
		new Line(
			player.x + PLAYER_WIDTH / 2,
			player.y + PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75),
			player.xMouse +
				(player.xMouse - (player.x + PLAYER_WIDTH / 2)) * 10000,
			player.yMouse +
				(player.yMouse -
					(player.y + PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75))) *
					10000
		),
		platforms
	);

	const enemyHit = GetNearestIntersectWithEnemies(
		new Line(
			player.x + PLAYER_WIDTH / 2,
			player.y + PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75),
			player.xMouse +
				(player.xMouse - (player.x + PLAYER_WIDTH / 2)) * 10000,
			player.yMouse +
				(player.yMouse -
					(player.y + PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75))) *
					10000
		),
		enemies
	);

	if (
		(enemyHit !== undefined && hit === undefined) ||
		(enemyHit !== undefined &&
			hit !== undefined &&
			SquareMagnitude(
				player.x + PLAYER_WIDTH / 2,
				player.y + PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75),
				enemyHit.x,
				enemyHit.y
			) <
				SquareMagnitude(
					player.x + PLAYER_WIDTH / 2,
					player.y + PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75),
					hit.x,
					hit.y
				))
	) {
		enemyHit.enemy.TakeDamage(50);
	}

	const angle = (function () {
		const angle = -Math.atan2(
			player.yMouse -
				(player.y + PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75)),
			player.xMouse - (player.x + PLAYER_WIDTH / 2)
		);

		if (player.direction == 1)
			return Clamp(angle, -Math.PI / 2 + 0.4, Math.PI / 2 - 0.4);
		else
			return angle < 0
				? Clamp(angle, -Math.PI, -Math.PI / 2 - 0.4)
				: Clamp(angle, Math.PI / 2 + 0.4, Math.PI);
	})();

	bullets.push({
		x: player.x + PLAYER_WIDTH / 2,
		y: player.y + PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75),
		length:
			hit === undefined
				? 2000
				: Math.min(
						Math.sqrt(
							(player.x + PLAYER_WIDTH / 2 - hit.x) ** 2 +
								(player.y +
									PLAYER_HEIGHT * (player.sit ? 0.25 : 0.75) -
									hit.y) **
									2
						),
						2000
				  ),
		angle: angle,
		shootTimeStamp: timeStamp,
	});

	sounds.Shoot.Play(0.5);

	needDrawAntiVegnitte = 5;
	player.lastShootTick = timeStamp;
}

function jump() {
	if (!IsOnGround() || player.sit) return;

	player.verticalAcceleration = PLAYER_JUMP_FORCE;
}

gameLoop(0);
