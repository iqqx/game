import { Human } from "./GameObjects/Enemies/Human.js";
import { Platform } from "./GameObjects/Platform.js";
import { Player } from "./GameObjects/Player.js";
import { Wall } from "./GameObjects/Wall.js";
import { Scene } from "./Scene.js";
const scene = new Scene(new Player(), 2000);
let prevTime = 0;
scene.Instantiate(new Wall(500, 120, 25, 100));
scene.Instantiate(new Wall(800, 0, 50, 100));
scene.Instantiate(new Wall(1300, 300, 500, 100));
scene.Instantiate(new Platform(1000, 50, 300, 10));
scene.Instantiate(new Human(1000, 100));
function gameLoop(timeStamp) {
    window.requestAnimationFrame(gameLoop);
    scene.Update(timeStamp - prevTime);
    scene.Render();
    scene.RenderOverlay();
    prevTime = timeStamp;
}
gameLoop(0);
