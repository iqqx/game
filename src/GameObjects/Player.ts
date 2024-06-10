import { EnemyType, Tag } from "../Enums.js";
import { Scene } from "../Scene.js";
import { Canvas } from "../Context.js";
import {
	Rectangle,
	Color,
	Vector2,
	LoadImage,
	GameObject,
} from "../Utilites.js";
import { Entity } from "./Entity.js";
import { AK } from "../Assets/Weapons/AK.js";
import { M4A1 } from "../Assets/Weapons/M4A1.js";
import { Weapon } from "../Weapon.js";
import { Character } from "./QuestGivers/Character.js";
import { Quest } from "../Quest.js";

export class Player extends Entity {
	private _timeToNextFrame = 0;
	private _frameIndex = 0;
	private _LMBPressed = false;
	private _sit = false;
	private _angle = 1;
	private _needDrawAntiVegnitte = 0;
	private _needDrawRedVegnitte = 0;
	private _selectedSlot: 0 | 1 | 2 | 3 | 4 | 5 | null = null;
	private _inventory: [
		Weapon?,
		Weapon?,
		GameObject?,
		GameObject?,
		GameObject?,
		GameObject?
	] = [new AK(), new M4A1()];
	private _weapon: Weapon | null = null;
	private _hasInteraction: Character | null = null;
	private _interacting: Character | null = null;
	private _im = true;
	private _quests: Quest[] = [];

	private static readonly _speed = 5;
	private static readonly _animationFrameDuration = 125;
	private static readonly _sitHeightModifier = 0.5;
	private static readonly _sitSpeedModifier = 0.75;
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
		Hands: {
			Left: {
				Weaponed: LoadImage("Images/Player_left_hand.png"),
				Empty: LoadImage("Images/Player_hand_empty.png"),
			},
			Right: {
				Weaponed: LoadImage("Images/Player_right_hand.png"),
				Empty: LoadImage("Images/Player_hand_empty.png"),
			},
		},
	};

	constructor() {
		super(50, 200, Player._speed, 100);

		this.Tag = Tag.Player;
		this._collider = new Rectangle(0, 0, this._width, this._height);

		addEventListener("keydown", (e) => {
			switch (e.code) {
				case "KeyC":
					if (this._sit === false) {
						this._sit = true;

						this._collider = new Rectangle(
							0,
							0,
							this._width,
							this._height * Player._sitHeightModifier
						);

						this._speed = Player._speed * Player._sitSpeedModifier;
					} else {
						this._collider = new Rectangle(
							0,
							0,
							this._width,
							this._height
						);

						if (Scene.Current.IsCollide(this, Tag.Wall) !== false)
							this._collider = new Rectangle(
								0,
								0,
								this._width,
								this._height * Player._sitHeightModifier
							);
						else {
							this._sit = false;
							this._speed = Player._speed;
						}
					}

					break;
				case "Space":
					this.Jump();
					break;
				case "Digit1":
					this.SelectSlot(0);
					break;
				case "Digit2":
					this.SelectSlot(1);
					break;
				case "Digit3":
					this.SelectSlot(2);
					break;
				case "Digit4":
					this.SelectSlot(3);
					break;
				case "Digit5":
					this.SelectSlot(4);
					break;
				case "Digit6":
					this.SelectSlot(5);
					break;
				case "KeyA":
					this._movingLeft = true;
					break;
				case "KeyS":
					this.TryDown();
					break;
				case "KeyE":
					if (this._interacting !== null) {
						const next = this._interacting.Continue();

						if (next !== true) {
							this._interacting = null;
							this._hasInteraction = null;

							this._quests.push(next);
						} else {
							this._im = !this._im;
						}
					} else if (this._hasInteraction !== null)
						this._interacting = this._hasInteraction;

					break;
				case "KeyD":
					this._movingRight = true;
					break;
				default:
					break;
			}
		});

		addEventListener("keyup", (e) => {
			switch (e.code) {
				case "KeyA":
					this._movingLeft = false;
					break;
				case "KeyD":
					this._movingRight = false;
					break;
				default:
					break;
			}
		});

		addEventListener("mousedown", (e) => {
			this._xTarget =
				e.x -
				Canvas.GetClientRectangle().left +
				Scene.Current.GetLevelPosition();
			this._yTarget = 750 - (e.y - Canvas.GetClientRectangle().top);
			this._direction =
				e.x >
				this._x + this._width / 2 - Scene.Current.GetLevelPosition()
					? 1
					: -1;

			if (e.button === 0) {
				this._LMBPressed = true;

				this.Shoot();
			}
		});

		addEventListener("mouseup", (e) => {
			if (e.button === 0) {
				this._LMBPressed = false;
			}
		});

		addEventListener("mousemove", (e) => {
			this._xTarget =
				e.x -
				Canvas.GetClientRectangle().left +
				Scene.Current.GetLevelPosition();
			this._yTarget = 750 - (e.y - Canvas.GetClientRectangle().top);

			this._direction =
				e.x >
				this._x + this._width / 2 - Scene.Current.GetLevelPosition()
					? 1
					: -1;
		});
	}

	public override Update(dt: number) {
		const prevX = this._x;

		super.Update(dt);

		if (prevX != this._x) {
			this._timeToNextFrame -= dt;

			if (this._timeToNextFrame <= 0) {
				this._frameIndex = (this._frameIndex + 1) % 4;
				this._timeToNextFrame = Player._animationFrameDuration;
			}
		} else {
			this._frameIndex = 0;
		}

		this._angle = (() => {
			const angle = -Math.atan2(
				this._yTarget -
					(this._y + this._height * (this._sit ? 0.25 : 0.75)),
				this._xTarget - (this._x + this._width / 2)
			);

			if (this._direction == 1)
				return Math.clamp(angle, -Math.PI / 2 + 0.4, Math.PI / 2 - 0.4);
			else
				return angle < 0
					? Math.clamp(angle, -Math.PI, -Math.PI / 2 - 0.4)
					: Math.clamp(angle, Math.PI / 2 + 0.4, Math.PI);
		})();

		this._weapon?.Update(
			dt,
			new Vector2(
				this._x + this._width / 2,
				this._y + this._height * (this._sit ? 0.25 : 0.75)
			),
			this._angle
		);

		if (this._interacting === null) {
			this._hasInteraction = null;

			Scene.Current.GetByTag(Tag.NPC).forEach((npc) => {
				const distance =
					(this._x +
						this._width / 2 -
						(npc.GetPosition().X + npc.GetSize().X / 2)) **
						2 +
					(this._y +
						this._height / 2 -
						(npc.GetPosition().Y + npc.GetSize().Y / 2)) **
						2;

				if (distance < 20000) this._hasInteraction = npc as Character;
			});
		}

		if (this._LMBPressed) this.Shoot();
	}

	public override Render() {
		if (this._direction == 1) {
			Canvas.DrawImageWithAngle(
				this._weapon === null
					? Player._frames.Hands.Left.Empty
					: Player._frames.Hands.Left.Weaponed,
				new Rectangle(
					this._x +
						this._width / 2 -
						Scene.Current.GetLevelPosition(),
					this._y + this._height * (this._sit ? 0.25 : 0.75),
					52 * 3.125,
					16 * 3.125
				),
				this._angle,
				-12,
				16 * 2.4
			);

			Canvas.DrawImage(
				(this._sit ? Player._frames.Sit : Player._frames.Walk)[
					this._frameIndex
				],
				new Rectangle(
					this._x - 25 - Scene.Current.GetLevelPosition(),
					this._y,
					this._width + 50,
					this._height
				)
			);

			this._weapon?.Render();

			Canvas.DrawImageWithAngle(
				this._weapon === null
					? Player._frames.Hands.Left.Empty
					: Player._frames.Hands.Right.Weaponed,
				new Rectangle(
					this._x +
						this._width / 2 -
						Scene.Current.GetLevelPosition(),
					this._y + this._height * (this._sit ? 0.25 : 0.75),
					52 * 3.125,
					16 * 3.125
				),
				this._angle - (this._weapon === null ? -Math.PI / 4 : 0),
				-12,
				16 * 2.4
			);
		} else {
			Canvas.DrawImageWithAngleVFlipped(
				this._weapon === null
					? Player._frames.Hands.Left.Empty
					: Player._frames.Hands.Right.Weaponed,
				new Rectangle(
					this._x +
						this._width / 2 -
						Scene.Current.GetLevelPosition(),
					this._y + this._height * (this._sit ? 0.25 : 0.75),
					52 * 3.125,
					16 * 3.125
				),
				this._angle,
				-12,
				16 * 2.4
			);

			Canvas.DrawImageFlipped(
				(this._sit ? Player._frames.Sit : Player._frames.Walk)[
					this._frameIndex
				],
				new Rectangle(
					this._x - 25 - Scene.Current.GetLevelPosition(),
					this._y,
					this._width + 50,
					this._height
				)
			);

			this._weapon?.Render();

			Canvas.DrawImageWithAngleVFlipped(
				this._weapon === null
					? Player._frames.Hands.Left.Empty
					: Player._frames.Hands.Left.Weaponed,
				new Rectangle(
					this._x +
						this._width / 2 -
						Scene.Current.GetLevelPosition(),
					this._y + this._height * (this._sit ? 0.25 : 0.75),
					52 * 3.125,
					16 * 3.125
				),
				this._angle - (this._weapon === null ? -Math.PI / 4 : 0),
				-12,
				16 * 2.4
			);
		}
	}

	public RenderOverlay() {
		Canvas.SetFillColor(new Color(70, 70, 70, 100));
		Canvas.DrawRectangle(1500 / 2 - 330 / 2 - 10, 750 - 5, 340, -60);

		Canvas.SetFillColor(new Color(30, 30, 30));
		for (let i = 0; i < 6; i++) {
			Canvas.SetStroke(new Color(155, 155, 155), 1);
			if (i == this._selectedSlot)
				Canvas.SetStroke(new Color(200, 200, 200), 2);

			Canvas.DrawRectangleEx(
				new Rectangle(
					1500 / 2 - 330 / 2 - 5 + i * 55 + (i > 1 ? 5 : 0),
					750 - 50 - 10,
					50,
					50
				)
			);

			if (this._inventory[i] !== undefined) {
				2;
				if (i < 2)
					Canvas.DrawImage(
						this._inventory[i as 0 | 1].Icon,
						new Rectangle(
							1500 / 2 -
								330 / 2 -
								5 +
								i * 55 +
								(i > 1 ? 5 : 0) +
								2,
							750 - 50 - 10 + 2,
							50 - 4,
							50 - 4
						)
					);
			}
		}

		if (this._hasInteraction) {
			Canvas.SetFillColor(new Color(70, 70, 70));
			Canvas.DrawRectangle(1500 / 2 - 200 / 2, 50, 200, 50);
			Canvas.SetFillColor(Color.White);
			Canvas.DrawTextEx(
				1500 / 2 - 200 / 2 + 5,
				750 - 70,
				"Поговорить с Моршу   [E]",
				16
			);
		}

		if (this._interacting !== null) {
			Canvas.SetFillColor(new Color(70, 70, 70));
			Canvas.DrawRectangle(1500 / 2 - 500 / 2, 50, 500, 150);
			Canvas.SetFillColor(Color.White);
			Canvas.DrawTextEx(
				1500 / 2 - 500 / 2 + 30,
				750 - 150 - 20,
				this._im ? "Я" : "Моршу",
				24
			);
			Canvas.DrawTextEx(
				1500 / 2 - 500 / 2 + 5,
				750 - 150 + 10,
				this._interacting.Talk(),
				16
			);
			Canvas.DrawTextEx(
				1500 / 2 - 500 / 2 + 5,
				750 - 60,
				"Продолжить   [E]",
				16
			);
		}

		this._quests.forEach((quest) => {
			Canvas.SetStroke(Color.Yellow, 5);
			Canvas.SetFillColor(
				quest.Tasks[0].IsCompleted() ? Color.Yellow : Color.Transparent
			);
			Canvas.DrawRectangleWithAngleAndStroke(
				20,
				750 - 350,
				20,
				20,
				Math.PI / 4,
				-10,
				0
			);

			Canvas.SetFillColor(Color.White);
			Canvas.DrawTextEx(
				50,
				350,
				quest.Tasks[0].IsCompleted()
					? "Возвращайтесь к Моршу"
					: quest.Tasks[0].toString(),
				24
			);
		});

		// POSTPROCCES
		if (this._needDrawRedVegnitte > 0) {
			this._needDrawRedVegnitte--;
			Canvas.DrawVignette(new Color(255, 0, 0));
		}
		if (this._needDrawAntiVegnitte > 0) {
			this._needDrawAntiVegnitte--;
			Canvas.DrawVignette(new Color(100, 100, 100));
			Canvas.SetFillColor(Color.Red);
		}
		Canvas.DrawVignette(
			new Color(255 * (1 - this._health / this._maxHealth), 0, 0)
		);

		// Canvas.SetFillColor(Color.Red);
		// if (this._health <= 0) Canvas.DrawRectangle(0, 0, 1500, 750);

		// Canvas.SetFillColor(new Color(50, 50, 50));
		// Canvas.DrawRectangle(0, 0, 1500, 750);
		// Canvas.SetFillColor(Color.Black);
		// Canvas.DrawTextEx(500,200,"STALKER 2",162)

		// Canvas.SetFillColor(new Color(25,25,25));
		// Canvas.DrawRectangle(300,200,300,150);
		// Canvas.SetFillColor(Color.White);
		// Canvas.DrawTextEx(400,500,"PLAY",32);

		Canvas.SetFillColor(Color.White);
		Canvas.DrawCircle(
			this._xTarget - 1 - Scene.Current.GetLevelPosition(),
			this._yTarget - 1,
			2
		);
	}

	public OnKilled(type: EnemyType) {
		this._quests.forEach((x) => x.OnKilled(type));
	}

	public GetPosition() {
		return new Vector2(this._x, this._y);
	}

	private SelectSlot(slot: 0 | 1 | 2 | 3 | 4 | 5) {
		if (slot === this._selectedSlot) {
			this._selectedSlot = null;
			this._weapon = null;

			return;
		}

		if (slot <= 1) this._weapon = this._inventory[slot as 0 | 1];
		else this._weapon = null;

		this._selectedSlot = slot;
	}

	public override Jump() {
		if (!this._grounded || this._sit) return;

		this._verticalAcceleration = this._jumpForce;
	}

	private TryDown() {
		console.log(
			Scene.Current.Raycast(
				new Vector2(this._x, this._y),
				new Vector2(0, -1),
				1,
				Tag.Platform
			)
		);
	}

	private Shoot() {
		if (this._weapon !== undefined && this._weapon.TryShoot())
			this._needDrawAntiVegnitte = 2;
	}

	override TakeDamage(damage: number): void {
		this._health -= damage;
		this._needDrawRedVegnitte = 5;
	}
}
