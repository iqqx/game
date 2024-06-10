import { Human } from "./GameObjects/Enemies/Human.js";
import { Rat } from "./GameObjects/Enemies/Rat.js";
import { Platform } from "./GameObjects/Platform.js";
import { Player } from "./GameObjects/Player.js";
import { Wall } from "./GameObjects/Wall.js";
import { Scene } from "./Scene.js";
import { LoadImage } from "./Utilites.js";

const scene = new Scene(new Player(), 2000, LoadImage("Images/Level_1.png"));

scene.Instantiate(new Wall(500, 120, 25, 100));
scene.Instantiate(new Wall(800, 0, 50, 100));
scene.Instantiate(new Wall(1300, 300, 500, 100));
scene.Instantiate(new Platform(1000, 50, 300, 10));
scene.Instantiate(new Human(1000, 100));

function gameLoop(timeStamp: number) {
	window.requestAnimationFrame(gameLoop);

	scene.Update(timeStamp);
	scene.Render();
	scene.RenderOverlay();
}

gameLoop(0);
