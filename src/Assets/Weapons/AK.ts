import { LoadImage, LoadSound, Rectangle, Vector2 } from "../../Utilites.js";
import { Weapon } from "../../Weapon.js";

export class AK extends Weapon {
	private static readonly _icon = LoadImage("Images/AK-icon.png");
	private static readonly _image = LoadImage("Images/Player/Rifle.png", new Rectangle(16, 6, 43, 15));
	private static readonly _fireSound = LoadSound("Sounds/shoot-1.wav");
	private static readonly _fireCooldown = 150;
	private static readonly _damage = 40;
	private static readonly _spread = 0.01;

	constructor() {
		super(AK._icon, AK._image, AK._fireSound, AK._fireCooldown, AK._damage, AK._spread, true, true, new Vector2(0, 18), new Vector2(0, 0));
	}
}
