import { LoadImage, LoadSound, Rectangle, Vector2 } from "../../Utilites.js";
import { Weapon } from "./Weapon.js";
export class Glock extends Weapon {
    static _sprites = {
        Icon: LoadImage("Images/Glock-icon.png"),
        Image: LoadImage("Images/Player/Pistol.png", new Rectangle(0, 3, 32, 28), 0.75),
    };
    static _sounds = {
        Fire: LoadSound("Sounds/shoot-3.mp3"),
        Shell: LoadSound("Sounds/shell.mp3"),
    };
    constructor() {
        super(Glock._sprites, Glock._sounds, 200, 20, 0.1, false, false, 1, 30, new Vector2(40, 10), new Vector2(30, 10));
    }
}
