import { LoadImage, LoadSound } from "../../Utilites.js";
import { Weapon } from "../../Weapon.js";

export class M4A1 extends Weapon {
	private static readonly _icon = LoadImage("Images/M4A1-icon.png");
	private static readonly _image = LoadImage("Images/M4A1.png");
	private static readonly _fireSound = LoadSound("Sounds/shoot-2.wav");
	private static readonly _fireCooldown = 120;
	private static readonly _damage = 30;
	private static readonly _spread = 0.05;

	constructor() {
		super(
			M4A1._icon,
			M4A1._image,
			M4A1._fireSound,
			M4A1._fireCooldown,
			M4A1._damage,
			M4A1._spread
		);
	}
}
