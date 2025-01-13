import { Animation } from "../Animation.js";
import { Backpack } from "../Assets/Containers/Backpack.js";
import { Container } from "../Assets/Containers/Containers.js";
import { DogTag, Item, PistolBullet, Radio, RatTail, RifleBullet } from "../Assets/Items/Item.js";
import { AK, Weapon } from "../Assets/Weapons/Weapon.js";
import { Canvas, GUI } from "../Context.js";
import { Tag, EnemyType } from "../Enums.js";
import { GetSound, GetSprite } from "../Game.js";
import { Quest } from "../Quest.js";
import { Scene } from "../Scene.js";
import { Rectangle, Vector2, Color, Sprite } from "../Utilites.js";
import { Blood } from "./Blood.js";
import { Enemy } from "./Enemies/Enemy.js";
import { Entity } from "./Entity.js";
import { Interactable } from "./GameObject.js";
import { ItemDrop } from "./ItemDrop.js";
import { Artem } from "./QuestGivers/Artem.js";
import { Character, Dialog } from "./QuestGivers/Character.js";
import { Elder } from "./QuestGivers/Elder.js";
import { GuardFake } from "./QuestGivers/GuardFake.js";
import { PlayerCharacter } from "./QuestGivers/PlayerCharacter.js";

export class Player extends Entity {
	private _timeToNextFrame = 0;
	private _frameIndex = 0;
	private _LMBPressed = false;
	private _sit = false;
	private _angle = 1;
	private _needDrawAntiVegnitte = 0;
	private _needDrawRedVegnitte = 0;
	private _selectedHand: 0 | 1 = 0;
	private _inventory: [Item | null, Item | null] = [null, null];
	private _backpack: Backpack | null = null;
	private _weapon: Weapon | null = null;
	private readonly _quests: Quest[];
	private _armHeight: 0.5 | 0.65 = 0.65;
	private _dialog: Dialog | null = null;
	private _dialogState = 0;
	private _chars = 0;
	private _timeToNextChar = 0;
	private _timeFromDeath: number = 0;
	private _openedContainer: Container | null = null;
	private _draggedItem: Item | null = null;
	private _hoveredObject: Interactable | null = null;
	private _selectedInteraction: number = 0;
	private _timeToWalkSound = 0;
	private _timeToNextPunch = 0;
	private _timeToPunch = 0;
	private _mainHand = true;
	private _timeFromSpawn = 0;
	private _timeFromEnd = -1;
	private _running = false;
	private _speaked = false;
	private _speaked2 = false;
	private _timeFromShootArtem = -1;
	private _timeFromGoodEnd = 0;
	private _animations = {
		Walk: new Animation(100, 0, -0.1, 0, 0.2, 0.1, 0),
	};
	private _currentAnimation: Animation | null = null;
	private _artem: Artem;
	private _lastPressedKeys = "";
	private _cheatCodes: [string, () => void][] = [
		[
			"hesoyam",
			() => {
				GetSound("Easter").PlayOriginal();

				this._tpActivated = true;
				this._health = 1000000000;
				this._frames.Walk = GetSprite("Easter_Player_Walk");
				this._frames.Sit = GetSprite("Easter_Player_Sit");
			},
		],
		[
			"dota",
			() => {
				GetSound("DotaCheat").PlayOriginal();
				Player._name = "Рома";
				this._avatar = GetSprite("Player_Avatar");
			},
		],
	];
	private _tpActivated = false;

	private _avatar: Sprite | null = null;
	private static _name = "Макс";
	private static readonly _speed = 5;
	private static readonly _animationFrameDuration = 50;
	private static readonly _sitHeightModifier = 0.85;
	private static readonly _sitSpeedModifier = 0.75;
	private static readonly _runningSpeedModifier = 1.5;
	private readonly _frames = {
		Walk: GetSprite("Player_Walk") as Sprite[],
		Sit: GetSprite("Player_Crouch") as Sprite[],
		Ladder: GetSprite("Player_Ladder") as Sprite[],
		Death: GetSprite("Player_Death") as Sprite[],
		Spawn: GetSprite("Player_Spawn") as Sprite[],
		Hands: {
			Straight: GetSprite("Player_Arm_Straight") as Sprite,
			Bend: GetSprite("Player_Arm_Bend") as Sprite,
		},
		Backpack: GetSprite("Player_Backpack") as Sprite,
	};

	constructor(x: number, y: number) {
		super(40, 100, Player._speed, 100);

		this._x = x;
		this._y = y;
		this._xTarget = GUI.Width / 2;
		this._yTarget = 750 / 2;
		this.Tag = Tag.Player;
		this._collider = new Rectangle(0, 0, this.Width, this.Height);
		this._quests = [];

		GetSound("Walk_2").Speed = 1.6;
		GetSound("Walk_2").Apply();

		addEventListener("keydown", (e) => {
			if (this._timeFromDeath > 0 || this._timeFromSpawn < 5000) return;

			if (this._cheatCodes.length > 0 && e.code.startsWith("Key")) {
				if (this._lastPressedKeys.length >= 100) this._lastPressedKeys = "";
				this._lastPressedKeys += e.code[e.code.length - 1].toLowerCase();
				this.CheckForEaster();
			}

			switch (e.code) {
				case "KeyC":
					if (this._sit === false) {
						this._frameIndex = 0;
						this._sit = true;
						this._timeToWalkSound -= 200;
						this._armHeight = 0.5;
						this._animations.Walk.SetDuration(300);

						this._collider = new Rectangle(0, 0, this.Width, this.Height * Player._sitHeightModifier);

						this._speed = Player._speed * Player._sitSpeedModifier;
					} else {
						this._collider = new Rectangle(0, 0, this.Width, this.Height);

						if (Scene.Current.IsCollide(this, Tag.Wall) !== false) {
							this._collider = new Rectangle(0, 0, this.Width, this.Height * Player._sitHeightModifier);
						} else {
							this._sit = false;
							this._animations.Walk.SetDuration(this._running ? 100 : 200);
							this._armHeight = 0.65;
							this._speed = Player._speed * (this._running ? Player._runningSpeedModifier : 1);
						}
					}

					break;
				case "Space":
					if (!this._sit) {
						this._onLadder = null;
						this.Jump();
					}
					break;
				case "Digit1":
					this.ChangeActiveHand(0);
					break;
				case "Digit2":
					this.ChangeActiveHand(1);
					break;
				case "KeyW":
					this._movingUp = true;

					if (this._onLadder === null) {
						const offsets = Scene.Current.GetCollide(this, Tag.Ladder);

						if (offsets !== false) {
							this._verticalAcceleration = 0;
							this._onLadder = offsets.instance;
							this._frameIndex = 0;
						}
					}
					break;
				case "KeyA":
					this._movingLeft = true;
					this._currentAnimation = this._animations.Walk;
					break;
				case "KeyF":
					if (this._tpActivated) {
						this._x = this._xTarget + Scene.Current.GetLevelPosition();
						this._y = this._yTarget;
					}
					break;
				case "KeyS":
					this._movingDown = true;

					if (this._onLadder === null) {
						const offsets = Scene.Current.GetCollide(this, Tag.Ladder);

						if (offsets !== false) {
							this._verticalAcceleration = 0;
							this._onLadder = offsets.instance;
							this._frameIndex = 0;
						}
					}
					break;
				case "KeyD":
					this._movingRight = true;
					this._currentAnimation = this._animations.Walk;
					break;
				case "KeyR":
					if (this.CanTarget() && this._weapon !== null) {
						const neededAmmo = this._weapon instanceof AK ? RifleBullet : PistolBullet;
						let findedAmmo = 0;

						for (let i = 0; i < this.GetItemsState().length; i++) {
							const item = this.GetItemsState()[i];

							if (item instanceof neededAmmo) {
								const toTake = Math.min(this._weapon.MaxAmmoClip - this._weapon.GetLoadedAmmo() + Math.sign(this._weapon.GetLoadedAmmo()) - findedAmmo, item.GetCount());
								findedAmmo += toTake;

								item.Take(toTake);
								if (item.GetCount() <= 0) this.TakeItemFrom(i);

								if (findedAmmo >= this._weapon.MaxAmmoClip) break;
							}
						}

						this._weapon.Reload(findedAmmo);
					}
					break;
				case "KeyE":
					if (this._openedContainer !== null) {
						if (this._draggedItem !== null) {
							this._openedContainer.TryPushItem(this._draggedItem);
							this._draggedItem = null;
						}

						this._openedContainer = null;
					} else if (this._dialog !== null) {
						this.ContinueDialog();
					} else if (this._hoveredObject !== null) this._hoveredObject.OnInteractSelected(this._selectedInteraction);

					break;
				case "KeyQ":
					if (this._inventory[this._selectedHand] !== null && this._grounded) {
						Scene.Current.Instantiate(new ItemDrop(this._x, this._y, this._inventory[this._selectedHand]));

						if (this._inventory[this._selectedHand] === this._weapon) this._weapon = null;

						this._inventory[this._selectedHand] = null;
					}

					break;
				case "ShiftLeft":
					if (this._sit) return;

					this._running = true;
					this._weapon = null;
					this._animations.Walk.SetDuration(100);
					this._speed = Player._speed * Player._runningSpeedModifier;
					break;
				default:
					break;
			}
		});

		addEventListener("keyup", (e) => {
			switch (e.code) {
				case "KeyW":
					this._movingUp = false;
					break;
				case "KeyA":
					this._movingLeft = false;
					this._currentAnimation = null;
					break;
				case "KeyS":
					this._movingDown = false;
					break;
				case "KeyD":
					this._movingRight = false;
					this._currentAnimation = null;
					break;
				case "ShiftLeft":
					this._running = false;
					if (this._inventory[this._selectedHand] instanceof Weapon) this._weapon = this._inventory[this._selectedHand] as Weapon;
					this._speed = Player._speed;
					this._animations.Walk.SetDuration(200);
					break;
				default:
					break;
			}
		});

		addEventListener("mousedown", (e) => {
			if ((e.target as HTMLElement).tagName !== "CANVAS") return;

			if (this._timeFromDeath > 0 || this._timeFromSpawn < 5000) return;

			if (this._hoveredObject !== null) {
				if (e.offsetX > this._xTarget - 75 && e.offsetX < this._xTarget - 75 + 150)
					if (e.offsetY > 750 - this._yTarget + 50 && e.offsetY < 750 - this._yTarget + 50 + 25 * this._hoveredObject.GetInteractives().length) {
						const cell = Math.floor((e.offsetY - (750 - this._yTarget + 50)) / 25);

						if (cell >= 0 && cell < this._hoveredObject.GetInteractives().length) {
							this._hoveredObject.OnInteractSelected(cell);

							return;
						}
					}
			}

			this.Direction = e.x > this._x + this.Width / 2 - Scene.Current.GetLevelPosition() ? 1 : -1;

			if (e.button === 0) {
				const lastHover = this._hoveredObject;
				this._hoveredObject = Scene.Current.GetInteractiveAt(this._xTarget + Scene.Current.GetLevelPosition(), this._yTarget);
				if (lastHover === null && this._hoveredObject !== null) this._selectedInteraction = 0;

				if (this._openedContainer !== null) {
					const hotbarY = GUI.Height / 2 + (this._openedContainer.SlotsSize.Y * 55 + 5) / 2 + 10;

					if (this._yTarget < GUI.Height - hotbarY + 10) {
						// Тык В инвентарь

						if (this._backpack !== null) {
							const firstXOffset = GUI.Width / 2 - 55 * 3;

							const xCell = Math.floor((this._xTarget - (firstXOffset + (this._xTarget > firstXOffset + 2 * 55 ? 5 : 0))) / 55);
							const yCell = Math.floor((750 - this._yTarget - hotbarY) / 55);

							if (yCell === 0 && xCell >= 0) {
								if (e.shiftKey && this.GetItemAt(xCell) !== null) {
									if (!this._openedContainer.TryPushItem(this.GetItemAt(xCell))) this._draggedItem = this.GetItemAt(xCell);
									else this.TakeItemFrom(xCell);
								} else if (xCell <= 5) this.SwapItemAt(xCell);

								this._quests.forEach((quest) => quest.InventoryChanged());
							}
						} else {
							const firstXOffset = GUI.Width / 2 - 52.5;

							const xCell = Math.floor((this._xTarget - firstXOffset) / 55);
							const yCell = Math.floor((750 - this._yTarget - hotbarY) / 55);

							if (yCell === 0 && xCell >= 0 && xCell < 2) {
								if (e.shiftKey && this.GetItemAt(xCell) !== null) {
									if (!this._openedContainer.TryPushItem(this.GetItemAt(xCell))) this._draggedItem = this.GetItemAt(xCell);
									else this.TakeItemFrom(xCell);
								} else this.SwapItemAt(xCell);

								this._quests.forEach((quest) => quest.InventoryChanged());
							}
						}
					} else {
						// Тык В коробку

						const firstXOffset =
							GUI.Width / 2 -
							(this._openedContainer.SlotsSize.X % 2 === 1
								? Math.floor(this._openedContainer.SlotsSize.X / 2) * 55 + 25
								: Math.floor(this._openedContainer.SlotsSize.X / 2) * 52.5);
						const firstYOffset = GUI.Height / 2 - Math.floor(this._openedContainer.SlotsSize.Y / 2) * 55 - 25;

						const xCell = Math.floor((this._xTarget - firstXOffset) / 55);
						const yCell = Math.floor((750 - this._yTarget - firstYOffset) / 55);

						if (this._openedContainer.CellInContainer(xCell, yCell)) {
							if (e.shiftKey && this.TryPushItem(this._openedContainer.GetItemAt(xCell, yCell))) this._openedContainer.TakeItemFrom(xCell, yCell);
							else this._draggedItem = this._openedContainer.SwapItem(xCell, yCell, this._draggedItem);

							this._quests.forEach((quest) => quest.InventoryChanged());
						}
					}
				}

				const firstXOffset = this._backpack === null ? GUI.Width / 2 - 52.5 : GUI.Width / 2 - 55 * 3;
				const firstYOffset = 5;

				const xCell = Math.floor((this._xTarget - (firstXOffset + (this._xTarget > firstXOffset + 2 * 55 ? 5 : 0))) / 55);
				const yCell = Math.floor((this._yTarget - firstYOffset) / 50);

				if (yCell === 0 && xCell >= 0 && (xCell < 2 || (this._backpack !== null && xCell <= 5))) {
					if (!(this._inventory[this._selectedHand] instanceof Item) || !this._inventory[this._selectedHand].IsUsing()) this.SwapItemAt(xCell);
				} else if (this.CanTarget()) {
					this._LMBPressed = true;

					this.Shoot();
				}
			}
		});

		addEventListener("mouseup", (e) => {
			if ((e.target as HTMLElement).tagName !== "CANVAS") return;

			if (e.button === 0) {
				this._LMBPressed = false;
			}
		});

		addEventListener("mousemove", (e) => {
			if ((e.target as HTMLElement).tagName !== "CANVAS") return;

			if (this._timeFromDeath > 0 || this._timeFromSpawn < 5000) return;

			this.Direction = e.x > this._x + this.Width / 2 - Scene.Current.GetLevelPosition() ? 1 : -1;
		});

		addEventListener("wheel", (e) => {
			if (this._hoveredObject !== null) {
				this._selectedInteraction = Math.clamp(this._selectedInteraction + Math.sign(e.deltaY), 0, this._hoveredObject.GetInteractives().length - 1);
			} else {
				this.ChangeActiveHand(((this._selectedHand + 1) % 2) as 0 | 1);
			}
		});
	}

	public override Update(dt: number) {
		if (this._timeFromSpawn < 5000) {
			this._timeFromSpawn += dt;

			this.ApplyVForce(dt);

			if (this._timeFromSpawn >= 5000) this.SpeakWith(new PlayerCharacter());
			this._artem = Scene.Current.GetByType(Artem)[0] as Artem;

			return;
		}

		this._xTarget = Scene.Current.GetMousePosition().X;
		this._yTarget = Scene.Current.GetMousePosition().Y;

		if (this._inventory[this._selectedHand] instanceof Item)
			this._inventory[this._selectedHand].Update(
				dt,
				new Vector2(this._x + this.Width / 2, this._y + this.Height * this._armHeight),
				this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0)
			);

		this._currentAnimation?.Update(dt);

		if (this._timeFromGoodEnd > 0) {
			this._timeFromGoodEnd += dt;

			if (this._timeFromGoodEnd >= 2500) Scene.LoadFromFile("Assets/Scenes/Prolog.json");

			return;
		}

		if (this._health <= 0) {
			this._timeFromDeath += dt;

			if (this._timeFromDeath > 5000 && this._timeFromEnd === -1) Scene.LoadFromFile("Assets/Scenes/Main.json");
		}

		if (this._timeToPunch > 0) this._timeToPunch -= dt;

		if (this._timeFromEnd > -1) {
			this._timeFromEnd += dt;

			if (this._artem.IsEnd() && !this._speaked) {
				this._speaked = true;
				this.SpeakWith(this._artem);
			}

			if (this._timeFromShootArtem > 0 && Scene.Time - this._timeFromShootArtem > 1000 && !this._speaked2) {
				this._speaked2 = true;
				this.SpeakWith(this._artem);
			}
		}

		if (this._x > 33500 && this._y > 800 && this._onLadder !== null) this._timeFromGoodEnd = dt;

		if (this._dialog !== null && this._timeToNextChar > 0) {
			this._timeToNextChar -= dt;

			if (this._timeToNextChar <= 0) {
				this._chars++;

				GetSound("Dialog").Play(0.05);

				if (this._chars < this._dialog.Messages[this._dialogState].length) this._timeToNextChar = 50;
			}
		}

		this._quests.forEach((quest, i) => {
			quest.Update();

			if (quest.IsCompleted()) {
				if (quest.Giver.constructor.name === PlayerCharacter.name && this._artem.IsTalked()) {
					this._timeFromEnd = 0;
					this._artem.End();
					this.SpeakWith(quest.Giver as Character);
				}

				this._quests.splice(i, 1);
			} else if (
				i === 0 &&
				quest.Giver.constructor.name === PlayerCharacter.name &&
				!this._artem.IsTalked() &&
				(Scene.Current.GetByType(Elder)[0] as Elder).GetCompletedQuestsCount() > 0
			) {
				quest.SetStage(3);
			}
		});

		if (this._onLadder !== null) {
			const pos = this._onLadder.GetPosition();
			const size = this._onLadder.GetCollider();

			const prevY = this._y;
			const prevX = this._x;

			if (this._movingUp) {
				if (this._y + this._collider.Height < pos.Y + size.Height) this.MoveUp(dt);
			} else if (this._movingDown) this.MoveDown(dt);

			if (this._movingLeft) this.MoveLeft(dt);
			else if (this._movingRight) this.MoveRight(dt);

			if (!Scene.Current.IsCollide(this, Tag.Ladder)) this._onLadder = null;

			if (prevY !== this._y || prevX !== this._x) {
				this._timeToNextFrame -= dt;

				if (this._timeToNextFrame <= 0) {
					this._timeToNextFrame = 150;

					this._frameIndex = (this._frameIndex + 1) % this._frames.Ladder.length;
				}
			}

			return;
		}

		this.ApplyVForce(dt);

		if (this._inventory[this._selectedHand] instanceof Item)
			this._inventory[this._selectedHand].Update(
				dt,
				new Vector2(this._x + this.Width / 2, this._y + this.Height * this._armHeight),
				this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0)
			);

		if (this.CanTarget() && this._artem.GetCompletedQuestsCount() <= 2) {
			if (this._timeToNextPunch > 0) this._timeToNextPunch -= dt;

			const prevX = this._x;

			if (this._movingLeft) {
				if (this._timeFromEnd === -1 || this._x > 33500) this.MoveLeft(dt);
			} else if (this._movingRight) this.MoveRight(dt);

			this.Direction = this._xTarget > this._x + this.Width / 2 - Scene.Current.GetLevelPosition() ? 1 : -1;

			if (prevX != this._x) {
				this._timeToNextFrame -= dt;
				this._timeToWalkSound -= dt;

				if (this._timeToNextFrame < 0) {
					this._frameIndex = (this._frameIndex + 1) % (this._sit ? this._frames.Sit.length : this._frames.Walk.length);
					this._timeToNextFrame = Player._animationFrameDuration * (this._sit ? 1.7 : this._running ? 0.5 : 1);
				}

				if (this._timeToWalkSound <= 0 && this._grounded) {
					GetSound("Walk_2").Play(0.5);
					this._timeToWalkSound = this._sit ? 500 : this._running ? 150 : 300;
				}
			} else {
				this._frameIndex = 0;
			}

			this._angle = (() => {
				const angle = -Math.atan2(this._yTarget - (this._y + this.Height * this._armHeight), this._xTarget + Scene.Current.GetLevelPosition() - (this._x + this.Width / 2));

				if (this.Direction == 1) return Math.clamp(angle, -Math.PI / 2 + 0.4, Math.PI / 2 - 0.4);
				else return angle < 0 ? Math.clamp(angle, -Math.PI, -Math.PI / 2 - 0.4) : Math.clamp(angle, Math.PI / 2 + 0.4, Math.PI);
			})();

			const lastHover = this._hoveredObject;
			this._hoveredObject = Scene.Current.GetInteractiveAt(this._xTarget + Scene.Current.GetLevelPosition(), this._yTarget);
			if (lastHover === null && this._hoveredObject !== null) this._selectedInteraction = 0;

			if (this._LMBPressed && this._weapon !== null && this._weapon.Automatic) this.Shoot();
		} else if (this._artem.GetCompletedQuestsCount() > 2) {
			this._angle = (() => {
				const angle = -Math.atan2(this._yTarget - (this._y + this.Height * this._armHeight), this._xTarget + Scene.Current.GetLevelPosition() - (this._x + this.Width / 2));

				if (this.Direction == 1) return Math.clamp(angle, -Math.PI / 2 + 0.4, Math.PI / 2 - 0.4);
				else return angle < 0 ? Math.clamp(angle, -Math.PI, -Math.PI / 2 - 0.4) : Math.clamp(angle, Math.PI / 2 + 0.4, Math.PI);
			})();

			this._frameIndex = 0;
		}
	}

	public override Render() {
		if (this._timeFromSpawn < 5000) {
			const framesPack = this._frames.Spawn;

			const scale = this.Height / framesPack[0].BoundingBox.Height;
			const scaledWidth = framesPack[0].BoundingBox.Width * scale;
			const widthOffset = (scaledWidth - this.Width) / 2;

			Canvas.DrawImage(
				framesPack[Math.clamp(Math.floor((this._timeFromSpawn - 4000) / 900), 0, 1)],
				new Rectangle(this._x - Scene.Current.GetLevelPosition() - widthOffset, this._y, scaledWidth, this.Height)
			);

			return;
		} else if (this._timeFromDeath > 0) {
			const framesPack = this._frames.Death;

			const scale = this.Height / framesPack[0].BoundingBox.Height;
			const scaledWidth = framesPack[0].BoundingBox.Width * scale;
			const widthOffset = (scaledWidth - this.Width) / 2;

			Canvas.DrawImage(
				framesPack[Math.clamp(Math.floor(this._timeFromDeath / 500), 0, 1)],
				new Rectangle(this._x - Scene.Current.GetLevelPosition() - widthOffset, this._y, scaledWidth, this.Height)
			);

			return;
		}

		const framesPack = this._sit ? this._frames.Sit : this._frames.Walk;
		const scale = this.Height / framesPack[0].BoundingBox.Height;
		const scaledWidth = framesPack[0].BoundingBox.Width * scale;
		const widthOffset = (scaledWidth - this.Width) / 2;

		if (this._onLadder !== null) {
			Canvas.DrawImage(this._frames.Ladder[this._frameIndex], new Rectangle(this._x - Scene.Current.GetLevelPosition() - widthOffset, this._y, scaledWidth, this.Height));
		} else if (this.Direction == 1) {
			if (this._weapon === null) {
				if (this._timeToPunch > 0 && !this._mainHand) {
					Canvas.DrawImageWithAngle(
						this._frames.Hands.Straight,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Straight.BoundingBox.Width * scale,
							this._frames.Hands.Straight.BoundingBox.Height * scale
						),
						this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Straight.BoundingBox.Height - 2) * scale
					);
				} else
					Canvas.DrawImageWithAngle(
						this._frames.Hands.Bend,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Bend.BoundingBox.Width * scale,
							this._frames.Hands.Bend.BoundingBox.Height * scale
						),
						this._angle - Math.PI / 4 + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Bend.BoundingBox.Height - 2) * scale
					);
			} else if (this._weapon.Heavy)
				Canvas.DrawImageWithAngle(
					this._frames.Hands.Straight,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * this._armHeight,
						this._frames.Hands.Straight.BoundingBox.Width * scale,
						this._frames.Hands.Straight.BoundingBox.Height * scale
					),
					this._angle + 0.05 + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
					-2 * scale,
					(this._frames.Hands.Straight.BoundingBox.Height - 2) * scale
				);

			Canvas.DrawImage(framesPack[this._frameIndex], new Rectangle(this._x - Scene.Current.GetLevelPosition() - widthOffset, this._y, scaledWidth, this.Height));

			if (this._backpack !== null)
				Canvas.DrawImage(this._frames.Backpack, new Rectangle(this._x - Scene.Current.GetLevelPosition() - widthOffset, this._y - (this._sit ? 14 : 0), scaledWidth, this.Height));

			if (this._weapon === null) {
				if (this._inventory[this._selectedHand] !== null && !(this._inventory[this._selectedHand] instanceof Weapon)) {
					if (this._inventory[this._selectedHand].Big)
						this._inventory[this._selectedHand].Render(
							new Vector2(
								this._x - Scene.Current.GetLevelPosition() + this.Width / 2 + 23 * Math.cos(Math.PI / 2),
								this._y + this.Height * this._armHeight - 23 * Math.sin(Math.PI / 2 + 0.2)
							),
							0
						);
					else
						this._inventory[this._selectedHand].Render(
							new Vector2(
								this._x - Scene.Current.GetLevelPosition() + this.Width / 2 + 23 * Math.cos(this._angle),
								this._y + this.Height * this._armHeight - 23 * Math.sin(this._angle + 0.2)
							),
							this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0)
						);

					Canvas.DrawImageWithAngle(
						this._frames.Hands.Bend,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Bend.BoundingBox.Width * scale,
							this._frames.Hands.Bend.BoundingBox.Height * scale
						),
						(this._inventory[this._selectedHand].Big ? Math.PI / 2 : this._angle) + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Bend.BoundingBox.Height - 2) * scale
					);
				} else if (this._timeToPunch > 0 && this._mainHand) {
					Canvas.DrawImageWithAngle(
						this._frames.Hands.Straight,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Straight.BoundingBox.Width * scale,
							this._frames.Hands.Straight.BoundingBox.Height * scale
						),
						this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Straight.BoundingBox.Height - 2) * scale
					);
				} else
					Canvas.DrawImageWithAngle(
						this._frames.Hands.Bend,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Bend.BoundingBox.Width * scale,
							this._frames.Hands.Bend.BoundingBox.Height * scale
						),
						this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Bend.BoundingBox.Height - 2) * scale
					);
			} else {
				this._weapon.Render();

				if (this._weapon.Heavy)
					Canvas.DrawImageWithAngle(
						this._frames.Hands.Bend,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Bend.BoundingBox.Width * scale,
							this._frames.Hands.Bend.BoundingBox.Height * scale
						),
						this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Bend.BoundingBox.Height - 2) * scale
					);
				else
					Canvas.DrawImageWithAngle(
						this._frames.Hands.Straight,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Straight.BoundingBox.Width * scale,
							this._frames.Hands.Straight.BoundingBox.Height * scale
						),
						this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Straight.BoundingBox.Height - 2) * scale
					);
			}
		} else {
			if (this._weapon === null) {
				if (this._timeToPunch > 0 && this._mainHand)
					Canvas.DrawImageWithAngleVFlipped(
						this._frames.Hands.Straight,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Straight.BoundingBox.Width * scale,
							this._frames.Hands.Straight.BoundingBox.Height * scale
						),
						this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Straight.BoundingBox.Height - 2) * scale
					);
				else
					Canvas.DrawImageWithAngleVFlipped(
						this._frames.Hands.Bend,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Bend.BoundingBox.Width * scale,
							this._frames.Hands.Bend.BoundingBox.Height * scale
						),
						this._angle + Math.PI / 4 + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Bend.BoundingBox.Height - 2) * scale
					);
			} else {
				if (this._weapon.Heavy)
					Canvas.DrawImageWithAngleVFlipped(
						this._frames.Hands.Bend,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Bend.BoundingBox.Width * scale,
							this._frames.Hands.Bend.BoundingBox.Height * scale
						),
						this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Bend.BoundingBox.Height - 2) * scale
					);
			}

			Canvas.DrawImageFlipped(framesPack[this._frameIndex], new Rectangle(this._x - Scene.Current.GetLevelPosition() - widthOffset, this._y, scaledWidth, this.Height));

			if (this._backpack !== null)
				Canvas.DrawImageFlipped(
					this._frames.Backpack,
					new Rectangle(this._x - Scene.Current.GetLevelPosition() - widthOffset, this._y - (this._sit ? 14 : 0), scaledWidth, this.Height)
				);

			if (this._weapon === null) {
				if (this._inventory[this._selectedHand] !== null && !(this._inventory[this._selectedHand] instanceof Weapon)) {
					if (this._inventory[this._selectedHand].Big)
						this._inventory[this._selectedHand].Render(
							new Vector2(
								this._x - Scene.Current.GetLevelPosition() + this.Width / 2 + 23 * Math.cos(Math.PI / 2),
								this._y + this.Height * this._armHeight - 23 * Math.sin(Math.PI / 2 + 0.2)
							),
							0
						);
					else
						this._inventory[this._selectedHand].Render(
							new Vector2(
								this._x - Scene.Current.GetLevelPosition() + this.Width / 2 + 23 * Math.cos(this._angle),
								this._y + this.Height * this._armHeight - 23 * Math.sin(this._angle + 0.2)
							),
							this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0)
						);

					Canvas.DrawImageWithAngleVFlipped(
						this._frames.Hands.Bend,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Bend.BoundingBox.Width * scale,
							this._frames.Hands.Bend.BoundingBox.Height * scale
						),
						this._inventory[this._selectedHand].Big ? Math.PI / 2 : this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Bend.BoundingBox.Height - 2) * scale
					);
				} else if (this._timeToPunch > 0 && !this._mainHand)
					Canvas.DrawImageWithAngleVFlipped(
						this._frames.Hands.Straight,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Straight.BoundingBox.Width * scale,
							this._frames.Hands.Straight.BoundingBox.Height * scale
						),
						this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Straight.BoundingBox.Height - 2) * scale
					);
				else
					Canvas.DrawImageWithAngleVFlipped(
						this._frames.Hands.Bend,
						new Rectangle(
							this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
							this._y + this.Height * this._armHeight,
							this._frames.Hands.Bend.BoundingBox.Width * scale,
							this._frames.Hands.Bend.BoundingBox.Height * scale
						),
						this._angle + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
						-2 * scale,
						(this._frames.Hands.Bend.BoundingBox.Height - 2) * scale
					);
			} else {
				this._weapon.Render();

				Canvas.DrawImageWithAngleVFlipped(
					this._frames.Hands.Straight,
					new Rectangle(
						this._x + this.Width / 2 - Scene.Current.GetLevelPosition(),
						this._y + this.Height * this._armHeight,
						this._frames.Hands.Straight.BoundingBox.Width * scale,
						this._frames.Hands.Straight.BoundingBox.Height * scale
					),
					this._angle - 0.05 + (this._currentAnimation !== null ? this._currentAnimation.GetCurrent() : 0),
					-2 * scale,
					(this._frames.Hands.Straight.BoundingBox.Height - 2) * scale
				);
			}
		}
	}

	public RenderOverlay() {
		if (this._timeFromSpawn < 5000) {
			GUI.DrawVignette(Color.Black, this._timeFromSpawn / 11111, 1 - this._timeFromSpawn / 5000, 1 - this._timeFromSpawn / 10000);

			return;
		}

		if (this._timeFromGoodEnd > 0) {
			GUI.DrawVignette(Color.Black, Math.max(0, 0.5 - this._timeFromGoodEnd / 4000), Math.min(1, this._timeFromGoodEnd / 2000), Math.max(1, 0.5 + this._timeFromGoodEnd / 5000));

			return;
		}

		if (this._health > 0) GUI.DrawVignette(new Color(255 * (1 - this._health / this._maxHealth), 0, 0), 0.45, 0, 0.5);
		else {
			if (this._timeFromEnd === -1) {
				GUI.DrawVignette(Color.Red, 0.45, this._timeFromDeath / 4000, 0.5 + this._timeFromDeath / 3000);

				return;
			} else {
				const sdt = Scene.Time - this._timeFromShootArtem;

				if (sdt < 5000) GUI.DrawVignette(new Color(255, 0, 0), 0.45, 0.3, 1);
				else {
					const r = 255 * Math.clamp(1 - (sdt - 5000) / 8000, 0, 1);
					const startRadius = 0.45 - Math.clamp((sdt - 5000) / 8000, 0, 0.45);
					const startAlpha = 0.3 + Math.clamp((sdt - 5000) / 8000, 0, 0.7);

					GUI.DrawVignette(new Color(r, 0, 0), startRadius, startAlpha, 1);

					if (sdt > 5000 + 8000) Scene.LoadFromFile("Assets/Scenes/Prolog.json");
					else if (sdt > 5000 + 6000) this.ContinueDialog();
				}
			}
		}

		if (this._dialog === null) {
			if (this._artem.GetCompletedQuestsCount() > 2) return;

			const y = this._openedContainer === null ? GUI.Height - 10 - 50 : GUI.Height / 2 + (this._openedContainer.SlotsSize.Y * 55 + 5) / 2 + 10;

			if (this._backpack !== null) {
				const firstXOffset = GUI.Width / 2 - 55 * 3;

				GUI.SetFillColor(new Color(70, 70, 70));
				GUI.SetStroke(new Color(155, 155, 155), 1);
				GUI.DrawRectangle(firstXOffset - 5, y - 5, 6 * 55 + 10, 55 + 5);

				GUI.ClearStroke();
				GUI.SetFillColor(new Color(100, 100, 100));
				GUI.DrawRectangle(firstXOffset + 2 * 55 - 1, y - 4, 2, 58);

				const xCell = Math.floor((this._xTarget - (firstXOffset + (this._xTarget > firstXOffset + 2 * 55 ? 5 : 0))) / 55);
				const yCell = Math.floor((750 - this._yTarget - y) / 55);

				for (let i = 0; i < 6; i++) {
					if (i == this._selectedHand) GUI.SetFillColor(new Color(50, 50, 50));
					else GUI.SetFillColor(new Color(30, 30, 30));

					if (yCell === 0 && xCell == i) GUI.SetStroke(new Color(200, 200, 200), 2);
					else GUI.SetStroke(new Color(155, 155, 155), 1);

					GUI.DrawRectangle(firstXOffset + i * 55 + (i > 1 ? 5 : 0), y, 50, 50);

					if (i < 2 && this._inventory[i] !== null) {
						GUI.DrawImageScaled(this._inventory[i].Icon, firstXOffset + i * 55 + 2, y + 2, 50 - 4, 50 - 4);

						if (this._inventory[i] instanceof Weapon) {
							const loaded = (this._inventory[i] as Weapon).GetLoadedAmmo();
							const loadedRatio = (this._inventory[i] as Weapon).GetFillClipRatio();

							const displayAmmo = (() => {
								if ((this._inventory[i] as Weapon).IsReloading()) return "~";
								else if (loadedRatio > 1) return loaded.toString();
								else if (loaded === 0) return "0";
								else if (loadedRatio > 0.75) return "~3/4";
								else if (loadedRatio > 0.4) return "~1/2";
								else if (loadedRatio > 0.2) return "~1/4";
								else if (loadedRatio <= 0.2) return "<1/4";
							})();

							GUI.SetFillColor(Color.White);
							GUI.SetFont(12);
							GUI.DrawText(firstXOffset + i * 55 + 42 + 2 - displayAmmo.length * 7, y + 46 + 2, displayAmmo);
						} else if (this._inventory[i].GetCount() > 1) {
							GUI.SetFillColor(Color.White);
							GUI.SetFont(12);
							GUI.DrawText(firstXOffset + i * 55 + 42 + 4 - this._inventory[i].GetCount().toString().length * 7, y + 46 + 2, this._inventory[i].GetCount().toString());
						}
					} else if (i >= 2) {
						const item = this._backpack.GetItemAt(i - 2, 0);

						if (item !== null) {
							GUI.DrawImageScaled(item.Icon, firstXOffset + i * 55 + (i > 1 ? 5 : 0) + 2, y + 2, 50 - 4, 50 - 4);

							const count = item.GetCount();
							if (count > 1) {
								GUI.SetFillColor(Color.White);
								GUI.SetFont(12);
								GUI.DrawText(firstXOffset + i * 55 + 42 + 4 - count.toString().length * 7, y + 46 + 2, count.toString());
							}
						}
					}
				}
			} else {
				const firstXOffset = GUI.Width / 2 - 52.5;

				GUI.SetFillColor(new Color(70, 70, 70));
				GUI.SetStroke(new Color(155, 155, 155), 1);
				GUI.DrawRectangle(firstXOffset - 5, y - 5, 2 * 55 + 5, 55 + 5);

				GUI.SetFillColor(new Color(30, 30, 30));
				for (let i = 0; i < 2; i++) {
					const xCell = Math.floor((this._xTarget - firstXOffset) / 55);
					const yCell = Math.floor((750 - this._yTarget - y) / 55);

					if (yCell === 0 && xCell == i) GUI.SetStroke(new Color(200, 200, 200), 2);
					else GUI.SetStroke(new Color(155, 155, 155), 1);

					if (i == this._selectedHand) GUI.SetFillColor(new Color(50, 50, 50));
					else GUI.SetFillColor(new Color(30, 30, 30));

					GUI.DrawRectangle(firstXOffset + i * 55, y, 50, 50);

					if (this._inventory[i] !== null) {
						GUI.DrawImageScaled(this._inventory[i].Icon, firstXOffset + i * 55 + 2, y + 2, 50 - 4, 50 - 4);

						if (this._inventory[i] instanceof Weapon) {
							const loaded = (this._inventory[i] as Weapon).GetLoadedAmmo();
							const loadedRatio = (this._inventory[i] as Weapon).GetFillClipRatio();

							const displayAmmo = (() => {
								if ((this._inventory[i] as Weapon).IsReloading()) return "~";
								else if (loadedRatio > 1) return loaded.toString();
								else if (loaded === 0) return "0";
								else if (loadedRatio > 0.75) return "~3/4";
								else if (loadedRatio > 0.4) return "~1/2";
								else if (loadedRatio > 0.2) return "~1/4";
								else if (loadedRatio <= 0.2) return "<1/4";
							})();

							GUI.SetFillColor(Color.White);
							GUI.SetFont(12);
							GUI.DrawText(firstXOffset + i * 55 + 42 + 2 - displayAmmo.length * 7, y + 46 + 2, displayAmmo);
						} else if (this._inventory[i].GetCount() > 1) {
							GUI.SetFillColor(Color.White);
							GUI.SetFont(12);
							GUI.DrawText(firstXOffset + i * 55 + 42 + 4 - this._inventory[i].GetCount().toString().length * 7, y + 46 + 2, this._inventory[i].GetCount().toString());
						}
					}
				}
			}

			if (this._openedContainer !== null) {
				const firstXOffset =
					GUI.Width / 2 -
					(this._openedContainer.SlotsSize.X % 2 === 1 ? Math.floor(this._openedContainer.SlotsSize.X / 2) * 55 + 25 : Math.floor(this._openedContainer.SlotsSize.X / 2) * 52.5);
				const firstYOffset =
					GUI.Height / 2 -
					(this._openedContainer.SlotsSize.Y % 2 === 1 ? Math.floor(this._openedContainer.SlotsSize.Y / 2) * 55 + 25 : Math.floor(this._openedContainer.SlotsSize.Y / 2) * 52.5);

				GUI.SetStroke(new Color(155, 155, 155), 1);
				GUI.SetFillColor(new Color(70, 70, 70, 200));
				GUI.DrawRectangle(firstXOffset - 5, firstYOffset - 5, this._openedContainer.SlotsSize.X * 55 + 5, this._openedContainer.SlotsSize.Y * 55 + 5);

				const xCell = Math.floor((this._xTarget - firstXOffset) / 55);
				const yCell = Math.floor((750 - this._yTarget - firstYOffset) / 55);

				for (let y = 0; y < this._openedContainer.SlotsSize.Y; y++)
					for (let x = 0; x < this._openedContainer.SlotsSize.X; x++) {
						if (xCell == x && yCell == y) GUI.SetStroke(new Color(200, 200, 200), 2);
						else GUI.SetStroke(new Color(100, 100, 100), 1);
						GUI.SetFillColor(new Color(30, 30, 30));

						GUI.DrawRectangle(firstXOffset + 55 * x, firstYOffset + 55 * y, 50, 50);

						const item = this._openedContainer.GetItemAt(x as 0 | 1 | 2, y as 0 | 1 | 2);
						if (item !== null) {
							GUI.DrawImageScaled(item.Icon, firstXOffset + 55 * x + 2, firstYOffset + 55 * y + 2, 50 - 4, 50 - 4);

							if (item.GetCount() > 1) {
								GUI.SetFillColor(Color.White);
								GUI.SetFont(12);
								GUI.DrawText(firstXOffset + x * 55 + 42 + 4 - item.GetCount().toString().length * 7, firstYOffset + 55 * y + 2 + 46, item.GetCount().toString());
							}
						}
					}
			}
		} else {
			GUI.SetStroke(new Color(100, 100, 100), 2);
			GUI.SetFillColor(new Color(0, 0, 0, 150));
			GUI.DrawRectangle(GUI.Width / 2 - 500 / 2, GUI.Height - 200 - 100, 500, 200);

			GUI.ClearStroke();
			GUI.SetFillColor(new Color(100, 100, 100));
			GUI.DrawRectangle(GUI.Width / 2 - 500 / 2, GUI.Height - 200 - 100, 500, 35);

			const avatar = this._dialogState % 2 === (this._dialog.OwnerFirst ? 1 : 0) ? this._avatar : this._dialog.Owner.GetAvatar();
			GUI.SetFillColor(Color.White);
			GUI.SetFont(24);
			if (avatar !== null) {
				GUI.DrawImage(avatar, GUI.Width / 2 - 500 / 2 + 3, GUI.Height - 200 - 98, 30, 30);
				GUI.DrawText(GUI.Width / 2 - 500 / 2 + 40, GUI.Height - 200 - 75, this._dialogState % 2 === (this._dialog.OwnerFirst ? 1 : 0) ? Player._name : this._dialog.Owner.GetName());
			} else {
				GUI.DrawText(GUI.Width / 2 - 500 / 2 + 10, GUI.Height - 200 - 75, this._dialogState % 2 === (this._dialog.OwnerFirst ? 1 : 0) ? Player._name : this._dialog.Owner.GetName());
			}

			GUI.SetFont(16);
			GUI.DrawTextWithBreakes(this._dialog.Messages[this._dialogState].slice(0, this._chars), GUI.Width / 2 - 500 / 2 + 15, GUI.Height - 240);
		}

		if (this._draggedItem !== null) GUI.DrawImageScaled(this._draggedItem.Icon, this._xTarget - 25, 750 - this._yTarget - 25, 50, 50);

		if (this._timeFromEnd > -1) {
			Canvas.SetFillColor(Color.White);
			Canvas.DrawCircle(this._xTarget - 1, this._yTarget - 1, 2);

			return;
		}

		if (this._needDrawRedVegnitte > 0) {
			this._needDrawRedVegnitte--;
			Canvas.DrawVignette(Color.Red);
		}
		if (this._needDrawAntiVegnitte > 0) {
			this._needDrawAntiVegnitte--;
			Canvas.DrawVignette(new Color(100, 100, 100));
		}

		if (this._hoveredObject !== null && this._openedContainer === null && this.CanTarget()) {
			const items = this._hoveredObject.GetInteractives();

			GUI.SetFillColor(new Color(70, 70, 70));
			GUI.SetStroke(new Color(100, 100, 100), 2);
			GUI.DrawRectangle(this._xTarget - 75, 750 - this._yTarget + 50, 150, 25 * items.length);
			GUI.ClearStroke();

			GUI.SetFillColor(Color.White);
			GUI.SetFont(20);
			for (let i = 0; i < items.length; i++) {
				if (i == this._selectedInteraction) {
					GUI.SetFillColor(new Color(100, 100, 100));
					GUI.DrawRectangle(this._xTarget - 75 + 3, 750 - this._yTarget + 50 + 3 + 25 * i, 150 - 6, 25 - 6);
					GUI.SetFillColor(Color.White);
				}

				GUI.DrawTextCenter(items[i], this._xTarget - 75, 750 - this._yTarget + 50 - 7 + 25 * (i + 1), 150);
			}
		}

		GUI.ClearStroke();
		GUI.DrawCircleWithGradient(0, 0, 300, Color.Black, Color.Transparent);
		let offset = 0;
		for (const quest of this._quests) {
			GUI.SetFillColor(Color.White);
			GUI.SetFont(24);
			GUI.DrawText(10, 30 + offset, quest.Title);
			offset += 30;

			GUI.SetStroke(Color.Yellow, 2);
			GUI.SetFont(16);

			const tasks = quest.GetTasks();

			if (tasks.length === 1) {
				GUI.DrawText(35, 30 + offset, tasks[tasks.length - 1].toString());
				GUI.SetFillColor(Color.Transparent);
				Canvas.DrawRectangleWithAngleAndStroke(20, 750 - 30 + 10 / 2 - offset, 10, 10, Math.PI / 4, -5, 5);
			} else {
				tasks.slice(0, -1).forEach((x) => {
					GUI.SetFillColor(Color.Yellow);
					Canvas.DrawRectangleWithAngleAndStroke(20, 750 - 30 + 10 / 2 - offset, 10, 10, Math.PI / 4, -5, 5);

					GUI.SetFillColor(Color.White);
					GUI.DrawText(35, 30 + offset, x.toString());

					offset += 30;
				});
				GUI.DrawText(35, 30 + offset, tasks[tasks.length - 1].toString());
				GUI.SetFillColor(Color.Transparent);
				Canvas.DrawRectangleWithAngleAndStroke(20, 750 - 30 + 10 / 2 - offset, 10, 10, Math.PI / 4, -5, 5);
			}
			offset += 30;
		}

		Canvas.SetFillColor(Color.White);
		Canvas.DrawCircle(this._xTarget - 1, this._yTarget - 1, 2);
	}

	public CheckForEaster() {
		for (let i = 0; i < this._cheatCodes.length; i++) if (this._lastPressedKeys.endsWith(this._cheatCodes[i][0])) this._cheatCodes.splice(i, 1)[0][1]();
	}

	public OnKilled(type: EnemyType) {
		this._quests.forEach((x) => x.OnKilled(type));
	}

	public TryPushItem(item: Item) {
		for (let x = 0; x < this._inventory.length; x++)
			if (this._inventory[x] === null) {
				this._inventory[x] = item;

				if (x === this._selectedHand)
					if (this._inventory[x] instanceof Weapon) this._weapon = this._inventory[x] as Weapon;
					else this._weapon = null;

				this._quests.forEach((quest) => {
					quest.InventoryChanged();
				});

				return true;
			}

		if (this._backpack !== null) {
			if (this._backpack.TryPushItem(item)) {
				this._quests.forEach((quest) => {
					quest.InventoryChanged();
				});

				return true;
			}
		} else return false;
	}

	public GiveQuestItem(item: Item) {
		if (!this.TryPushItem(item)) Scene.Current.Instantiate(new ItemDrop(this._x, this._y, item));
		else
			this._quests.forEach((quest) => {
				quest.InventoryChanged();
			});
	}

	public GetQuestsBy(by: Character | Player | typeof GuardFake) {
		return this._quests.filter((x) => x.Giver === by || (by === GuardFake && x.Giver instanceof (by as typeof GuardFake)));
	}

	public RemoveQuest(quest: Quest) {
		return this._quests.splice(this._quests.indexOf(quest), 1);
	}

	private SwapItemAt(x: number) {
		if (this._backpack !== null && x >= 2) {
			if (this._draggedItem !== null && this._backpack.GetItemAt(x - 2, 0) !== null && this._draggedItem.Icon === this._backpack.GetItemAt(x - 2, 0).Icon) {
				this._draggedItem.Take(this._backpack.GetItemAt(x - 2, 0).Add(this._draggedItem.GetCount()));
				if (this._draggedItem.GetCount() === 0) this._draggedItem = null;
			} else this._draggedItem = this._backpack.SwapItem(x - 2, 0, this._draggedItem);
		} else {
			if (this._draggedItem !== null && this._inventory[x] !== null && this._draggedItem.Icon === this._inventory[x].Icon && this._draggedItem.GetStack() > 1) {
				this._draggedItem.Take(this._inventory[x].Add(this._draggedItem.GetCount()));

				if (this._draggedItem.GetCount() === 0) this._draggedItem = null;
			} else [this._draggedItem, this._inventory[x]] = [this._inventory[x], this._draggedItem];

			if (x === this._selectedHand)
				if (this._inventory[x] instanceof Weapon) this._weapon = this._inventory[x] as Weapon;
				else this._weapon = null;
		}

		this._quests.forEach((quest) => quest.InventoryChanged());
	}

	public Heal(by: number) {
		if (by <= 0) return;

		this._health = Math.clamp(this._health + by, 0, this._maxHealth);
	}

	private GetItemAt(x: number): Item | null {
		if (x < 2) return this._inventory[x];
		else if (this._backpack !== null) return this._backpack.GetItemAt(x - 2, 0);
		else return null;
	}

	private TakeItemFrom(x: number) {
		if (x < 2) {
			this._inventory[x] = null;

			if (x === this._selectedHand) this._weapon = null;
		} else if (this._backpack !== null) return this._backpack.TakeItemFrom(x - 2, 0);
	}

	public SpeakWith(character: Character) {
		if (this._dialog !== null) return;

		this._quests.forEach((quest) => {
			quest.OnTalked(character);
		});

		this._dialogState = 0;
		this._chars = 0;
		this._timeToNextChar = 75;
		this._dialog = character.GetDialog();
	}

	public PushQuest(quest: Quest) {
		this._quests.push(quest);
	}

	private ContinueDialog() {
		if (this._dialog === null) return;

		if (this._chars < this._dialog.Messages[this._dialogState].length) {
			this._chars = this._dialog.Messages[this._dialogState].length;
		} else {
			this._dialogState++;

			if (this._dialog.Messages.length == this._dialogState) {
				if (this._dialog.AfterAction !== undefined) this._dialog.AfterAction();

				this._dialog = null;
			} else {
				this._chars = 0;
				this._timeToNextChar = 75;
			}
		}
	}

	public CanTarget() {
		return this._openedContainer === null && this._dialog === null;
	}

	public PutBackpack(backpack: Backpack) {
		this._backpack = backpack;
	}

	public HasBackpack() {
		return this._backpack !== null;
	}

	public GetItems() {
		const copy: Item[] = [];

		for (const item of this._inventory) if (item !== null) copy.push(item);
		if (this._backpack !== null) for (let i = 0; i < this._backpack.SlotsSize.X; i++) if (this._backpack.GetItemAt(i, 0) !== null) copy.push(this._backpack.GetItemAt(i, 0));

		return copy;
	}

	public GetItemsState() {
		const copy: (Item | null)[] = [];

		for (const item of this._inventory) copy.push(item);
		if (this._backpack !== null) for (let i = 0; i < this._backpack.SlotsSize.X; i++) copy.push(this._backpack.GetItemAt(i, 0));

		return copy;
	}

	public OpenContainer(container: Container) {
		this._openedContainer = container;
	}

	public override GetCenter() {
		return new Vector2(this._x + this._collider.X + this._collider.Width / 2, this._y + this._collider.Y + this._collider.Height / 2);
	}

	public GetPosition() {
		return new Vector2(this._x, this._y);
	}

	public RemoveItem(item: typeof Item) {
		for (let i = 0; i < this._inventory.length; i++) if (this._inventory[i] instanceof item) this._inventory[i] = null;
		if (this._backpack !== null) for (let i = 0; i < this._backpack.SlotsSize.X; i++) if (this._backpack.GetItemAt(i, 0) instanceof item) this._backpack.TakeItemFrom(i, 0);

		this._quests.forEach((quest) => {
			quest.InventoryChanged();
		});
	}

	private ChangeActiveHand(hand: 0 | 1) {
		if (this._inventory[this._selectedHand] instanceof Item && this._inventory[this._selectedHand].IsUsing()) return;

		this._selectedHand = hand;

		if (this._inventory[this._selectedHand] === null) {
			this._weapon = null;

			return;
		}

		if (this._inventory[this._selectedHand] instanceof Weapon && !this._running) this._weapon = this._inventory[this._selectedHand] as Weapon;
		else this._weapon = null;
	}

	public IsMoving(): 0 | 1 | 2 {
		if (this._movingLeft || this._movingRight) return this._sit ? 1 : 2;

		return 0;
	}

	private Shoot() {
		if (!this.CanTarget() || this._onLadder !== null) return;

		if (this._weapon === null) {
			if (this._inventory[this._selectedHand] instanceof Item) {
				if (this._inventory[this._selectedHand] instanceof Radio) {
					this.SpeakWith(this._artem);

					if (this._artem.GetCompletedQuestsCount() > 2) this._inventory[this._selectedHand] = null;
				} else
					this._inventory[this._selectedHand].Use(() => {
						this._inventory[this._selectedHand] = null;
					});
			} else if (this._timeToNextPunch <= 0) {
				this._timeToPunch = 100;
				this._timeToNextPunch = 250;
				this._mainHand = !this._mainHand;

				const enemy = Scene.Current.Raycast(this.GetCenter(), new Vector2(Math.cos(this._angle), -Math.sin(this._angle)), 50, Tag.Enemy);

				if (enemy.length > 0) {
					GetSound("PunchHit").Play(0.15);
					(enemy[0].instance as Enemy).TakeDamage(10);

					const bloodDir = new Vector2(Math.cos(this._angle), -Math.sin(this._angle));
					Scene.Current.Instantiate(new Blood(new Vector2(enemy[0].instance.GetCenter().X, enemy[0].instance.GetCenter().Y), new Vector2(bloodDir.X * 20, bloodDir.Y * 20)));
				} else GetSound("Punch").Play(0.15);
			}
		} else if (this._weapon.TryShoot()) this._needDrawAntiVegnitte = 2;
	}

	override TakeDamage(damage: number): void {
		if (this._health <= 0) return;

		this._health -= damage;
		this._needDrawRedVegnitte = 5;

		if (this._timeFromEnd > 0) {
			this._timeFromShootArtem = Scene.Time;

			return;
		}

		if (this._health <= 0) {
			this._timeFromDeath = 1;

			GetSound("Human_Death_1").Play();
		}
	}
}
