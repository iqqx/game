import { LoadImage, LoadSound } from "../../Utilites.js";
import { Weapon } from "../../Weapon.js";
export class AK extends Weapon {
    static _image = LoadImage("Images/AK.png");
    static _fireSound = LoadSound("Sounds/shoot-1.wav");
    static _fireCooldown = 150;
    static _damage = 40;
    static _spread = 0.01;
    constructor() {
        super(AK._image, AK._fireSound, AK._fireCooldown, AK._damage, AK._spread);
    }
}
