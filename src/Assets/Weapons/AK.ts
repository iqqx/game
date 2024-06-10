import { LoadImage, LoadSound } from "../../Utilites.js";
import { Weapon } from "../../Weapon.js";

export class AK extends Weapon {
	private static readonly _image = LoadImage("Images/AK.png");
	private static readonly _fireSound = LoadSound("Sounds/shoot-1.wav");
	private static readonly _fireCooldown = 150;
	private static readonly _damage = 40;
	private static readonly _spread = 0.01;

	constructor() {
		super(
			AK._image,
			AK._fireSound,
			AK._fireCooldown,
			AK._damage,
			AK._spread
		);
	}
}
