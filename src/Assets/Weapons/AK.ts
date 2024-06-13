import { LoadImage, LoadSound, Rectangle, Vector2 } from "../../Utilites.js";
import { Weapon } from "./Weapon.js";

export class AK extends Weapon {
	private static readonly _sprites = {
		Icon: LoadImage("Images/AK-icon.png"),
		Image: LoadImage("Images/Player/Rifle.png", new Rectangle(16, 6, 43, 15)),
	};
	private static readonly _sounds = {
		Fire: LoadSound("Sounds/shoot-1.wav"),
	};

	private static readonly _fireCooldown = 150;
	private static readonly _damage = 40;
	private static readonly _spread = 0.01;

	constructor() {
		super(AK._sprites, AK._sounds, AK._fireCooldown, AK._damage, AK._spread, true, true, 2500, 30, new Vector2(0, 18), new Vector2(0, 0));
	}

	static toString(): string {
		return "Калак 12";
	}
}
