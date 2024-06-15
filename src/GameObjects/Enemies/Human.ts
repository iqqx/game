import { EnemyType, Tag } from "../../Enums.js";
import { Scene } from "../../Scene.js";
import { Canvas } from "../../Context.js";
import { LoadImage, Rectangle, Vector2 } from "../../Utilites.js";
import { Player } from "../Player.js";
import { Enemy } from "./Enemy.js";
import { AK } from "../../Assets/Weapons/AK.js";

export class Human extends Enemy {
	private static readonly _deathSound = new Audio("Sounds/human_death.mp3");
	private static readonly _frames = {
		Walk: [
			LoadImage(`Images/Player/Walk/0.png`, new Rectangle(0, 2, 20, 30), 3),
			LoadImage(`Images/Player/Walk/1.png`, new Rectangle(1, 2, 19, 30), 3),
			LoadImage(`Images/Player/Walk/2.png`, new Rectangle(7, 2, 11, 30), 3),
			LoadImage(`Images/Player/Walk/3.png`, new Rectangle(7, 2, 11, 30), 3),
			LoadImage(`Images/Player/Walk/4.png`, new Rectangle(7, 2, 11, 30), 3),
			LoadImage(`Images/Player/Walk/5.png`, new Rectangle(1, 2, 18, 30), 3),
		],
		Sit: [LoadImage(`Images/Player/Crouch/3.png`, new Rectangle(0, 6, 22, 26), 3)],
		Hands: {
			Left: LoadImage("Images/Player/Arm_left.png", new Rectangle(4, 14, 20, 4), 3),
			Right: LoadImage("Images/Player/Arm_right.png", new Rectangle(4, 14, 11, 8), 3),
		},
	};
	private readonly _weapon = new AK();
	private static readonly _visibleDistance = 500;

	private _angle = 0;

	constructor(x: number, y: number, type: EnemyType) {
		super(50, 100, 1, 100, type);

		this._x = x;
		this._y = y;

		this._collider = new Rectangle(this._x, this._y, this.Width, this.Height);
	}

	override Update(dt: number): void {
		super.Update(dt);

		this._weapon?.Update(dt, new Vector2(this._x + this.Width / 2, this._y + this.Height * 0.6), this._angle);

		const plrPos = Scene.Current.Player.GetPosition();
		const plrSize = Scene.Current.Player.GetCollider();

		if (
			Scene.Current.Player.IsMoving() === 2 &&
			Math.sign(plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2)) != this.Direction &&
			(plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2)) ** 2 + (plrPos.Y + plrSize.Height / 2 - (this._y + this.Height / 2)) < Human._visibleDistance ** 2
		)
			this.Direction *= -1;

		if (this.IsSpotPlayer()) {
			this._angle = (() => {
				const angle = -Math.atan2(plrPos.Y + plrSize.Height * 0.5 - (this._y + this.Height * 0.6), plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2));

				if (this.Direction == 1) return Math.clamp(angle, -Math.PI / 2 + 0.4, Math.PI / 2 - 0.4);
				else return angle < 0 ? Math.clamp(angle, -Math.PI, -Math.PI / 2 - 0.4) : Math.clamp(angle, Math.PI / 2 + 0.4, Math.PI);
			})();

			this._weapon.TryShoot(Tag.Player);
		}
	}

	override Render(): void {
		if (this.Direction == 1) {
			if (this._weapon === null)
				Canvas.DrawImageWithAngle(
					Human._frames.Hands.Right,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * 0.6,
						Human._frames.Hands.Right.BoundingBox.Width * Human._frames.Hands.Right.Scale,
						Human._frames.Hands.Right.BoundingBox.Height * Human._frames.Hands.Right.Scale
					),
					this._angle - Math.PI / 4,
					-(Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2,
					Human._frames.Hands.Right.BoundingBox.Height * Human._frames.Hands.Right.Scale - (Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2
				);
			else if (this._weapon.Heavy)
				Canvas.DrawImageWithAngle(
					Human._frames.Hands.Left,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * 0.6,
						Human._frames.Hands.Left.BoundingBox.Width * Human._frames.Hands.Left.Scale,
						Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale
					),
					this._angle,
					-(Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2,
					(Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2
				);

			if (this._movingLeft || this._movingRight)
				Canvas.DrawImage(Human._frames.Walk[0], new Rectangle(this._x - 25 - Scene.Current.GetLevelPosition() + 15, this._y, this.Width + 50, this.Height));
			else Canvas.DrawImage(Human._frames.Walk[0], new Rectangle(this._x - 25 - Scene.Current.GetLevelPosition() + 15, this._y, this.Width + 50, this.Height));

			if (this._weapon === null)
				Canvas.DrawImageWithAngle(
					Human._frames.Hands.Right,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * 0.6,
						Human._frames.Hands.Right.BoundingBox.Width * Human._frames.Hands.Right.Scale,
						Human._frames.Hands.Right.BoundingBox.Height * Human._frames.Hands.Right.Scale
					),
					this._angle,
					-(Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2,
					Human._frames.Hands.Right.BoundingBox.Height * Human._frames.Hands.Right.Scale - (Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2
				);
			else {
				this._weapon.Render();

				if (this._weapon.Heavy)
					Canvas.DrawImageWithAngle(
						Human._frames.Hands.Right,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * 0.6,
							Human._frames.Hands.Right.BoundingBox.Width * Human._frames.Hands.Right.Scale,
							Human._frames.Hands.Right.BoundingBox.Height * Human._frames.Hands.Right.Scale
						),
						this._angle,
						-(Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2,
						Human._frames.Hands.Right.BoundingBox.Height * Human._frames.Hands.Right.Scale - (Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2
					);
				else
					Canvas.DrawImageWithAngle(
						Human._frames.Hands.Left,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * 0.6,
							Human._frames.Hands.Left.BoundingBox.Width * Human._frames.Hands.Left.Scale,
							Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale
						),
						this._angle,
						-(Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2,
						(Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2
					);
			}
		} else {
			if (this._weapon === null)
				Canvas.DrawImageWithAngleVFlipped(
					Human._frames.Hands.Right,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * 0.6,
						Human._frames.Hands.Right.BoundingBox.Width * Human._frames.Hands.Right.Scale,
						Human._frames.Hands.Right.BoundingBox.Height * Human._frames.Hands.Right.Scale
					),
					this._angle + Math.PI / 4,
					-(Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2,
					Human._frames.Hands.Right.BoundingBox.Height * Human._frames.Hands.Right.Scale - (Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2
				);
			else if (this._weapon.Heavy)
				Canvas.DrawImageWithAngleVFlipped(
					Human._frames.Hands.Right,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * 0.6,
						Human._frames.Hands.Right.BoundingBox.Width * Human._frames.Hands.Right.Scale,
						Human._frames.Hands.Right.BoundingBox.Height * Human._frames.Hands.Right.Scale
					),
					this._angle,
					-(Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2,
					Human._frames.Hands.Right.BoundingBox.Height * Human._frames.Hands.Right.Scale - (Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2
				);

			if (this._movingLeft || this._movingRight)
				Canvas.DrawImageFlipped(Human._frames.Walk[0], new Rectangle(this._x - 25 - Scene.Current.GetLevelPosition() - 15, this._y, this.Width + 50, this.Height));
			else Canvas.DrawImageFlipped(Human._frames.Walk[0], new Rectangle(this._x - 25 - Scene.Current.GetLevelPosition() - 15, this._y, this.Width + 50, this.Height));

			if (this._weapon === null)
				Canvas.DrawImageWithAngleVFlipped(
					Human._frames.Hands.Right,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * 0.6,
						Human._frames.Hands.Right.BoundingBox.Width * Human._frames.Hands.Right.Scale,
						Human._frames.Hands.Right.BoundingBox.Height * Human._frames.Hands.Right.Scale
					),
					this._angle,
					-(Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2,
					Human._frames.Hands.Right.BoundingBox.Height * Human._frames.Hands.Right.Scale - (Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2
				);
			else {
				this._weapon.Render();

				Canvas.DrawImageWithAngleVFlipped(
					Human._frames.Hands.Left,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * 0.6,
						Human._frames.Hands.Left.BoundingBox.Width * Human._frames.Hands.Left.Scale,
						Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale
					),
					this._angle,
					-(Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2,
					(Human._frames.Hands.Left.BoundingBox.Height * Human._frames.Hands.Left.Scale) / 2
				);
			}
		}
	}

	override IsSpotPlayer(): boolean {
		const plrPos = Scene.Current.Player.GetPosition();
		const plrSize = Scene.Current.Player.GetCollider();

		if (Math.sign(plrPos.X + plrSize.Width / 2 - (this._x + this.Width / 2)) != this.Direction) return false;

		const hit = Scene.Current.Raycast(
			new Vector2(this._x + this.Width / 2, this._y + this.Height * 0.4),
			new Vector2(plrPos.X - this._x, plrPos.Y + plrSize.Height * 0.9 - (this._y + this.Height * 0.4)),
			1000,
			Tag.Player | Tag.Wall
		)[0];

		return hit !== undefined && hit.instance instanceof Player && hit.instance.IsAlive();
	}

	override TakeDamage(damage: number): void {
		super.TakeDamage(damage);

		if (this._health <= 0) {
			this.Destroy();

			Scene.Current.Player.OnKilled(this._type);

			const s = Human._deathSound.cloneNode() as HTMLAudioElement;
			s.volume = 0.25;
			s.play();
		}
	}
}
