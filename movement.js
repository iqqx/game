const ctx = document.getElementById("main-canvas").getContext("2d");

const player = {
	x: 0,
	y: 0,
	sit: false,
	movingLeft: false,
	movingRight: false,
	onGround: false,
	verticalAcceleration: 0,
};

const platforms = [
	{
		x: 700,
		y: 650,
		width: 300,
		height: 25,
	},
	{
		x: 900,
		y: 600,
		width: 200,
		height: 25,
	},
	{
		x: 1100,
		y: 700 - 30,
		width: 80,
		height: 30,
	},
];

ctx.fillRect(player.x, player.y, 100, 200);

addEventListener("keydown", (e) => {
	switch (e.code) {
		case "KeyZ":
			player.sit = !player.sit;

			ctx.clearRect(player.x, player.y, 100, 200);

			ctx.fillRect(
				player.x,
				player.y + (player.sit ? 100 : 0),
				100,
				player.sit ? 100 : 200
			);
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

	const prev = ctx.fillStyle;
	ctx.fillStyle = "blue";
	for (const platform of platforms)
		ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
	ctx.fillStyle = prev;

	applyForce();

	if (player.movingLeft) {
		moveLeft();
	} else if (player.movingRight) {
		moveRight();
	}
}

function moveRight() {
	const prev = player.x;
	player.x = Math.min(player.x + (player.sit ? 5 : 10), 1500 - 100);
	if (IsCollide()) {
		player.x = prev;
		return;
	}

	ctx.clearRect(prev, player.y, 100, 200);

	ctx.fillRect(
		player.x,
		player.y + (player.sit ? 100 : 0),
		100,
		player.sit ? 100 : 200
	);
}

function moveLeft() {
	const prev = player.x;
	player.x = Math.max(player.x - (player.sit ? 5 : 10), 0);
	if (IsCollide()) {
		player.x = prev;
		return;
	}

	ctx.clearRect(prev, player.y, 100, 200);

	ctx.fillRect(
		player.x,
		player.y + (player.sit ? 100 : 0),
		100,
		player.sit ? 100 : 200
	);
}

function IsCollide() {
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

function applyForce() {
	// падает
	if (!isOnGround() || player.verticalAcceleration < 0) {
		ctx.clearRect(player.x, player.y, 100, 200);

		player.verticalAcceleration = Math.min(
			player.verticalAcceleration + 2,
			10
		);
		player.y = Math.min(player.y + player.verticalAcceleration, 500);

		if (IsCollide()) {
			player.y -= player.verticalAcceleration;
			player.verticalAcceleration -= 2;

			ctx.fillRect(player.x, player.y, 100, 200);
			player.onGround = true;
			return;
		}

		ctx.fillRect(
			player.x,
			player.y + (player.sit ? 100 : 0),
			100,
			player.sit ? 100 : 200
		);

		if (player.y >= 500) {
			player.onGround = true;
			player.verticalAcceleration = 0;
		}

		return;
	}
}

function isOnGround() {
	if (player.y >= 500 + (player.sit ? 100 : 0)) return true;

	for (const platform of platforms)
		if (
			player.x + 100 > platform.x &&
			player.x < platform.x + platform.width &&
			player.y + 200 + (player.sit ? 100 : 0) == platform.y
		)
			return true;

	return false;
}

function jump() {
	if (!isOnGround()) return;

	player.verticalAcceleration = -20;
}

gameLoop();
