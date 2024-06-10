import { LoadImage, LoadSound } from "../../Utilites.js";
import { Weapon } from "../../Weapon.js";
export class M4A1 extends Weapon {
    static _image = LoadImage("Images/M4A1.png");
    static _fireSound = LoadSound("Sounds/shoot-1.wav");
    static _fireCooldown = 120;
    static _damage = 30;
    static _spread = 0.05;
    constructor() {
        super(M4A1._image, M4A1._fireSound, M4A1._fireCooldown, M4A1._damage, M4A1._spread);
    }
}
