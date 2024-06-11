import { LoadImage, LoadSound, Rectangle, Vector2 } from "../../Utilites.js";
import { Weapon } from "../../Weapon.js";
export class Glock extends Weapon {
    static _icon = LoadImage("Images/Glock-icon.png");
    static _image = LoadImage("Images/Player/Pistol.png", new Rectangle(0, 3, 32, 28), 0.75);
    static _fireSound = LoadSound("Sounds/shoot-1.wav");
    constructor() {
        super(Glock._icon, Glock._image, Glock._fireSound, 200, 20, 0.1, false, false, new Vector2(35, 10), new Vector2(30, 10));
    }
}
