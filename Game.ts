import { Player } from "./Player.js";
import { Platform, Scene } from "./utilites.js";
import { Human } from "./Enemies/Human.js";

const scene = new Scene(new Player(), 2000);
let prevTime = 0;

scene.Instantiate(new Platform(500, 120, 25, 100));
scene.Instantiate(new Platform(800, 0, 50, 100));
scene.Instantiate(new Human(1000, 0));

function gameLoop(timeStamp: number) {
	window.requestAnimationFrame(gameLoop);

	scene.Update(timeStamp - prevTime);
	scene.Render();

	prevTime = timeStamp;
}

gameLoop(0);
