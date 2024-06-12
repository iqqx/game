import { Platform } from "./GameObjects/Platform.js";
import { Player } from "./GameObjects/Player.js";
import { Wall } from "./GameObjects/Wall.js";
import { Scene } from "./Scene.js";
import { LoadImage } from "./Utilites.js";
// const scene = new SceneEditor(LoadImage("Images/Level_0.png"));
const scene = new Scene(new Player(600, 300), LoadImage("Images/Level_0.png"));
scene.Instantiate(new Wall(-56, -3, 156, 772));
scene.Instantiate(new Wall(-87, 48, 7777, 124));
scene.Instantiate(new Platform(81, 373, 590, 13));
scene.Instantiate(new Platform(720, 378, 1182, 8));
scene.Instantiate(new Platform(599, 210, 42, 7));
scene.Instantiate(new Platform(751, 207, 43, 10));
scene.Instantiate(new Platform(103, -153, 371, 69));
scene.Instantiate(new Wall(71, 618, 11380, 73));
scene.Instantiate(new Wall(3795, 164, 303, 77));
scene.Instantiate(new Wall(3863, 230, 200, 46));
scene.Instantiate(new Wall(4088, 163, 44, 45));
function gameLoop(timeStamp) {
    window.requestAnimationFrame(gameLoop);
    scene.Update(timeStamp);
    scene.Render();
    scene.RenderOverlay();
}
gameLoop(0);
