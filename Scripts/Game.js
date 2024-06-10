import { EnemyType } from "./Enums.js";
import { Human } from "./GameObjects/Enemies/Human.js";
import { Platform } from "./GameObjects/Platform.js";
import { Player } from "./GameObjects/Player.js";
import { Morshu } from "./GameObjects/QuestGivers/Morshu.js";
import { Wall } from "./GameObjects/Wall.js";
import { Scene } from "./Scene.js";
import { LoadImage } from "./Utilites.js";
const scene = new Scene(new Player(), LoadImage("Images/Level_1.png"));
scene.Instantiate(new Wall(500, 120, 25, 100));
scene.Instantiate(new Wall(800, 0, 50, 100));
scene.Instantiate(new Wall(1300, 300, 500, 100));
scene.Instantiate(new Platform(1000, 50, 300, 10));
scene.Instantiate(new Morshu(300, 0));
scene.Instantiate(new Human(1000, 100, EnemyType.Green));
function gameLoop(timeStamp) {
    window.requestAnimationFrame(gameLoop);
    scene.Update(timeStamp);
    scene.Render();
    scene.RenderOverlay();
}
gameLoop(0);
