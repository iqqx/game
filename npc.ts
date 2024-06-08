import { EnemyType } from "./Enums/EnemyType.js";
import { platforms, player } from "./Level.js";
import { DrawRectangle, ResetTransform, SetFillColor } from "./context.js";
import { GetIntersectPointWithRectangle, Line } from "./utilites.js";

type Enemy = {
	x: number;
	y: number;
	xTarget: number;
	yTarget: number;
	type: EnemyType;
};

const npcs: Enemy[] = [
	{
		x: 1000,
		y: 0,
		xTarget: 0,
		yTarget: 0,
		type: EnemyType.Rat,
	},
];

function TrySpotPlayer(enemy: Enemy): boolean {
	for (const platform of platforms)
		if (
			GetIntersectPointWithRectangle(
				new Line(
					enemy.x + 25,
					enemy.y + 12.5,
					player.x + 50,
					player.y + 100
				),
				platform
			) !== undefined
		)
			return false;

	return true;
}

function gameLoop(timeStamp: number) {
	window.requestAnimationFrame(gameLoop);
	ResetTransform();

	for (const enemy of npcs) {
		// LOGIC
		if (TrySpotPlayer(enemy)) {
			enemy.x += Math.sign(player.x - enemy.x);
		}

		// RENDER
		SetFillColor("gray");
		DrawRectangle(enemy.x, enemy.y, 50, 25);
	}
}

gameLoop(0);
