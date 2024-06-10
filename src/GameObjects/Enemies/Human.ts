import { Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Canvas } from "../../Context.js";
import { Rectangle, Vector2 } from "../../Utilites.js";
import { Bullet } from "../Bullet.js";
import { Player } from "../Player.js";
import { Enemy } from "./Enemy.js";

export class Human extends Enemy {
	private static readonly _deathSound = new Audio("Sounds/human_death.mp3");
	private static readonly _frames = {
		Walk: (function () {
			const images: HTMLImageElement[] = [];

			for (let i = 0; i < 4; i++) {
				const img = new Image();
				img.src = `Images/Player_${i}.png`;
				images.push(img);
			}

			return images;
		})(),
		Sit: (function () {
			const images: HTMLImageElement[] = [];

			for (let i = 0; i < 4; i++) {
				const img = new Image();
				img.src = `Images/Player_sit_${i}.png`;
				images.push(img);
			}

			return images;
		})(),
	};

	private _angle = 0;
	private _shootCooldown = 0;

	constructor(x: number, y: number) {
		super(100, 200, 1, 100);

		this._x = x;
		this._y = y;

		this._collider = new Rectangle(
			this._x,
			this._y,
			this._width - 50,
			this._height
		);
	}

	override Update(dt: number): void {
		super.Update(dt);
		if (!this.IsSpotPlayer()) return;


		const plrPos = Scene.Current.Player.GetPosition();
		const plrSize = Scene.Current.Player.GetCollider();

		this._angle = (() => {
			const angle = -Math.atan2(
				plrPos.Y +
					plrSize.Height * 0.9 -
					(this._y + this._height * 0.75),
				plrPos.X + plrSize.Width / 2 - (this._x + this._width / 2)
			);

			if (this._direction == 1)
				return -Math.clamp(
					angle,
					-Math.PI / 2 + 0.4,
					Math.PI / 2 - 0.4
				);
			else
				return angle < 0
					? -Math.clamp(angle, -Math.PI, -Math.PI / 2 - 0.4)
					: -Math.clamp(angle, Math.PI / 2 + 0.4, Math.PI);
		})();

		if (this._shootCooldown <= 0) {
			if (this.IsSpotPlayer()) this.Shoot();
		} else this._shootCooldown -= dt;
	}

	override Render(): void {
		if (this._direction === 1) {
			Canvas.DrawImage(
				Human._frames.Walk[0],
				new Rectangle(
					this._x - Scene.Current.GetLevelPosition(),
					this._y,
					this._width,
					this._height
				)
			);

			// Canvas.DrawImageWithAngle(
			// 	Player._AK,
			// 	new Rectangle(
			// 		this._x +
			// 			this._width / 2 -
			// 			Scene.Current.GetLevelPosition(),
			// 		this._y + this._height * 0.75,
			// 		52 * 3.125,
			// 		16 * 3.125
			// 	),
			// 	this._angle,
			// 	-12,
			// 	16 * 2.4
			// );
		} else {
			Canvas.DrawImageFlipped(
				Human._frames.Walk[0],
				new Rectangle(
					this._x - Scene.Current.GetLevelPosition(),
					this._y,
					this._width,
					this._height
				)
			);

			// Canvas.DrawImageWithAngleVFlipped(
			// 	Player._AK,
			// 	new Rectangle(
			// 		this._x +
			// 			this._width / 2 -
			// 			Scene.Current.GetLevelPosition(),
			// 		this._y + this._height * 0.75,
			// 		52 * 3.125,
			// 		16 * 3.125
			// 	),
			// 	-this._angle,
			// 	-12,
			// 	16 * 2.4
			// );
		}
	}

	override IsSpotPlayer(): boolean {
		const plrPos = Scene.Current.Player.GetPosition();
		const plrSize = Scene.Current.Player.GetCollider();

		const hits = Scene.Current.Raycast(
			new Vector2(
				this._x + this._width / 2,
				this._y + this._height * 0.75
			),
			new Vector2(
				plrPos.X - this._x,
				plrPos.Y +
					plrSize.Height * 0.9 -
					(this._y + this._height * 0.75)
			),
			1000,
			Tag.Player | Tag.Wall
		);

		return hits !== undefined && hits[0].instance instanceof Player;
	}

	override TakeDamage(damage: number): void {
		super.TakeDamage(damage);

		if (this._health <= 0) {
			this.Destroy();

			const s = Human._deathSound.cloneNode() as HTMLAudioElement;
			s.volume = 0.25;
			s.play();
		}
	}

	private Shoot() {
		const plrPos = Scene.Current.Player.GetPosition();
		const plrSize = Scene.Current.Player.GetCollider();

		Scene.Current.Instantiate(
			new Bullet(
				this._x + this._width / 2,
				this._y + this._height * 0.75,
				Math.sqrt(
					(this._x +
						this._width / 2 -
						(plrPos.X + plrSize.Width / 2)) **
						2 +
						(this._y +
							this._height * 0.75 -
							(plrPos.Y + plrSize.Height * 0.9)) **
							2
				),

				-this._angle
			)
		);

		Scene.Current.Player.TakeDamage(1);

		// sounds.Shoot.Play(0.5);

		this._shootCooldown = 200;
	}
}
