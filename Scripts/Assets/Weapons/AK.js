import { LoadImage, LoadSound, Rectangle, Vector2 } from "../../Utilites.js";
import { Weapon } from "../../Weapon.js";
export class AK extends Weapon {
    static _icon = LoadImage("Images/AK-icon.png");
    static _image = LoadImage("Images/Player/Rifle.png", new Rectangle(16, 6, 43, 15));
    static _fireSound = LoadSound("Sounds/shoot-1.wav");
    static _fireCooldown = 150;
    static _damage = 40;
    static _spread = 0.01;
    constructor() {
        super(AK._icon, AK._image, AK._fireSound, AK._fireCooldown, AK._damage, AK._spread, true, true, new Vector2(0, 18), new Vector2(0, 0));
    }
}
