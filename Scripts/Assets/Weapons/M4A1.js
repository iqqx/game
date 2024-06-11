import { LoadImage, LoadSound, Vector2 } from "../../Utilites.js";
import { Weapon } from "../../Weapon.js";
export class M4A1 extends Weapon {
    static _icon = LoadImage("Images/M4A1-icon.png");
    static _image = LoadImage("Images/M4A1.png");
    static _fireSound = LoadSound("Sounds/shoot-2.wav");
    static _fireCooldown = 120;
    static _damage = 30;
    static _spread = 0.05;
    constructor() {
        super(M4A1._icon, M4A1._image, M4A1._fireSound, M4A1._fireCooldown, M4A1._damage, M4A1._spread, true, true, new Vector2(0, 18), new Vector2(0, 0));
    }
}
