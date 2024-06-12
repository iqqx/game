import { LoadImage, LoadSound, Vector2 } from "../../Utilites.js";
import { Weapon } from "../../Weapon.js";
export class M4A1 extends Weapon {
    static _sprites = {
        Icon: LoadImage("Images/M4A1-icon.png"),
        Image: LoadImage("Images/M4A1.png"),
    };
    static _sounds = {
        Fire: LoadSound("Sounds/shoot-2.mp3"),
    };
    static _fireCooldown = 120;
    static _damage = 30;
    static _spread = 0.05;
    constructor() {
        super(M4A1._sprites, M4A1._sounds, M4A1._fireCooldown, M4A1._damage, M4A1._spread, true, true, new Vector2(0, 18), new Vector2(0, 0));
    }
}
