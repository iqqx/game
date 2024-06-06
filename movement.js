const ctx = document.getElementById("main-canvas").getContext("2d");

const player = {
	x: 0,
	y: 0,
	movingLeft: false,
	movingRight: false,
	onGround: false,
	verticalAcceleration: 0,
};

ctx.fillRect(player.x, player.y, 100, 200);

addEventListener("keydown", (e) => {
	switch (e.code) {
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

	if (player.movingLeft) {
		moveLeft();
	} else if (player.movingRight) {
		moveRight();
	}
}

function moveRight() {
	ctx.clearRect(player.x, player.y, 100, 200);

	player.x = Math.min(player.x + 10, 1500 - 100);

	ctx.fillRect(player.x, player.y, 100, 200);
}

function moveLeft() {
	ctx.clearRect(player.x, player.y, 100, 200);

	player.x = Math.max(player.x - 10, 0);

	ctx.fillRect(player.x, player.y, 100, 200);
}

function applyForce() {
    // падает
    if (!player.onGround) {
        ctx.clearRect(player.x, player.y, 100, 200);

        player.verticalAcceleration = Math.min(player.verticalAcceleration + 2, 10);
        player.y = Math.min(player.y + player.verticalAcceleration, 500);
    
        ctx.fillRect(player.x, player.y, 100, 200);
    
        if (player.y >= 500) {
            player.onGround = true;
            player.verticalAcceleration = 0;
        }
        
        return
    }

    // прыгнул
	// if (player.verticalAcceleration < 0) {
    //     ctx.clearRect(player.x, player.y, 100, 200);

    //     player.verticalAcceleration = Math.min(player.verticalAcceleration + 1);
    //     player.y = Math.min(player.y - player.verticalAcceleration, 500);
    
    //     ctx.fillRect(player.x, player.y, 100, 200);
    
    //     if (player.y == 500) {
    //         player.onGround = true;
    //         player.jumpForce = 0;
    //     }

	// 	return;
	// }

	// ctx.clearRect(player.x, player.y, 100, 200);

	// player.jumpForce = Math.min(player.jumpForce + 5);
	// player.y = Math.min(player.y + --player.jumpForce, 500);

	// ctx.fillRect(player.x, player.y, 100, 200);

	// if (player.y == 500) {
	// 	player.onGround = true;
	// 	player.jumpForce = 0;
	// }
}

function jump() {
	if (!player.onGround) return;
	player.onGround = false;

	player.verticalAcceleration = -20;
}

gameLoop();
