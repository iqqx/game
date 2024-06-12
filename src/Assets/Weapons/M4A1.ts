import { LoadImage, LoadSound, Vector2 } from "../../Utilites.js";
import { Weapon } from "../../Weapon.js";

export class M4A1 extends Weapon {
	private static readonly _sprites = {
		Icon: LoadImage("Images/M4A1-icon.png"),
		Image: LoadImage("Images/M4A1.png"),
	};
	private static readonly _sounds = {
		Fire: LoadSound("Sounds/shoot-2.mp3"),
	};

	private static readonly _fireCooldown = 120;
	private static readonly _damage = 30;
	private static readonly _spread = 0.05;

	constructor() {
		super(M4A1._sprites, M4A1._sounds, M4A1._fireCooldown, M4A1._damage, M4A1._spread, true, true, new Vector2(0, 18), new Vector2(0, 0));
	}
}
