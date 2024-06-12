import { LoadImage, LoadSound, Rectangle, Vector2 } from "../../Utilites.js";
import { Weapon } from "../../Weapon.js";
export class AK extends Weapon {
    static _sprites = {
        Icon: LoadImage("Images/AK-icon.png"),
        Image: LoadImage("Images/Player/Rifle.png", new Rectangle(16, 6, 43, 15)),
    };
    static _sounds = {
        Fire: LoadSound("Sounds/shoot-1.wav"),
    };
    static _fireCooldown = 150;
    static _damage = 40;
    static _spread = 0.01;
    constructor() {
        super(AK._sprites, AK._sounds, AK._fireCooldown, AK._damage, AK._spread, true, true, new Vector2(0, 18), new Vector2(0, 0));
    }
}
