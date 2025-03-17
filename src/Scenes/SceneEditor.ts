import { Canvas, GUI } from "../Context.js";
import { Vector2, Sprite, Color, Rectangle, IScene } from "../Utilites.js";
import { GetSprite } from "../AssetsLoader.js";
import { SceneError } from "./SceneError.js";

enum ObjectType {
	Wall,
	Platform,
	Player,
	Boombox,
	Box,
	Spikes,
	Ladder,
	Artem,
	Elder,
	Trader,
	Backpack,
	HumanCorpse,
	Human,
	Rat,
}

export class SceneEditor implements IScene {
	private readonly _gameObjects: [ObjectType, Rectangle][];
	private readonly _background?: Sprite;
	private readonly _backgroundName?: string;

	private _movingRight = false;
	private _movingLeft = false;
	private _shiftPressed = false;
	private _movingSpeed: number;
	private _levelPosition = 0;
	private _mousePosition = new Vector2(0, 0);

	private _drawingRectangle: Rectangle | null = null;
	private _selectedType: ObjectType | -1 = -1;
	private _selectedRectangle: number | null = null;
	private _startRectangle: Vector2 | null = null;

	public static Time = 0;

	constructor(background: Sprite, init: [ObjectType, Rectangle][], backName?: string) {
		this._background = background;
		this._backgroundName = backName;

		this._gameObjects = init;

		addEventListener("keydown", (e) => {
			switch (e.code) {
				case "Digit1":
					this._selectedType = -1;
					break;
				case "KeyA":
					this._movingLeft = true;
					break;
				case "KeyD":
					this._movingRight = true;
					break;
				case "ShiftLeft":
					this._shiftPressed = true;
					break;
				case "ArrowUp":
					if (this._selectedRectangle !== null) {
						if (this._shiftPressed)
							this._gameObjects[this._selectedRectangle][1] = new Rectangle(
								this._gameObjects[this._selectedRectangle][1].X,
								this._gameObjects[this._selectedRectangle][1].Y,
								this._gameObjects[this._selectedRectangle][1].Width,
								this._gameObjects[this._selectedRectangle][1].Height + 1
							);
						else
							this._gameObjects[this._selectedRectangle][1] = new Rectangle(
								this._gameObjects[this._selectedRectangle][1].X,
								this._gameObjects[this._selectedRectangle][1].Y + 1,
								this._gameObjects[this._selectedRectangle][1].Width,
								this._gameObjects[this._selectedRectangle][1].Height
							);
					}
					break;
				case "ArrowDown":
					if (this._selectedRectangle !== null) {
						if (this._shiftPressed)
							this._gameObjects[this._selectedRectangle][1] = new Rectangle(
								this._gameObjects[this._selectedRectangle][1].X,
								this._gameObjects[this._selectedRectangle][1].Y,
								this._gameObjects[this._selectedRectangle][1].Width,
								this._gameObjects[this._selectedRectangle][1].Height - 1
							);
						else
							this._gameObjects[this._selectedRectangle][1] = new Rectangle(
								this._gameObjects[this._selectedRectangle][1].X,
								this._gameObjects[this._selectedRectangle][1].Y - 1,
								this._gameObjects[this._selectedRectangle][1].Width,
								this._gameObjects[this._selectedRectangle][1].Height
							);
					}
					break;
				case "ArrowRight":
					if (this._selectedRectangle !== null) {
						if (this._shiftPressed)
							this._gameObjects[this._selectedRectangle][1] = new Rectangle(
								this._gameObjects[this._selectedRectangle][1].X,
								this._gameObjects[this._selectedRectangle][1].Y,
								this._gameObjects[this._selectedRectangle][1].Width + 1,
								this._gameObjects[this._selectedRectangle][1].Height
							);
						else
							this._gameObjects[this._selectedRectangle][1] = new Rectangle(
								this._gameObjects[this._selectedRectangle][1].X + 1,
								this._gameObjects[this._selectedRectangle][1].Y,
								this._gameObjects[this._selectedRectangle][1].Width,
								this._gameObjects[this._selectedRectangle][1].Height
							);
					}
					break;
				case "ArrowLeft":
					if (this._selectedRectangle !== null) {
						if (this._shiftPressed)
							this._gameObjects[this._selectedRectangle][1] = new Rectangle(
								this._gameObjects[this._selectedRectangle][1].X,
								this._gameObjects[this._selectedRectangle][1].Y,
								this._gameObjects[this._selectedRectangle][1].Width - 1,
								this._gameObjects[this._selectedRectangle][1].Height
							);
						else
							this._gameObjects[this._selectedRectangle][1] = new Rectangle(
								this._gameObjects[this._selectedRectangle][1].X - 1,
								this._gameObjects[this._selectedRectangle][1].Y,
								this._gameObjects[this._selectedRectangle][1].Width,
								this._gameObjects[this._selectedRectangle][1].Height
							);
					}
					break;
				case "KeyX":
					if (this._selectedRectangle !== null) {
						this._gameObjects.splice(this._selectedRectangle, 1);
						this._selectedRectangle = null;
					}
					break;
				case "KeyC":
					this.DownloadJson();
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
				case "ShiftLeft":
					this._shiftPressed = false;
					break;
			}
		});

		addEventListener("mousedown", (e) => {
			this._mousePosition = new Vector2(e.x - Canvas.GetClientRectangle().left, Canvas.GetClientRectangle().height - e.y + Canvas.GetClientRectangle().top);

			if (e.button !== 0) return;

			this._selectedRectangle = null;

			if (this._selectedType === -1) {
				for (let i = 0; i < this._gameObjects.length; i++) {
					if (
						this._mousePosition.X + this._levelPosition >= this._gameObjects[i][1].X &&
						this._mousePosition.X + this._levelPosition < this._gameObjects[i][1].X + this._gameObjects[i][1].Width &&
						this._mousePosition.Y >= this._gameObjects[i][1].Y &&
						this._mousePosition.Y < this._gameObjects[i][1].Y + this._gameObjects[i][1].Height
					)
						this._selectedRectangle = i;
				}
			} else if (!this.IsObjectForcedSize(this._selectedType)) this._startRectangle = new Vector2(this._mousePosition.X + this._levelPosition, this._mousePosition.Y);
		});

		addEventListener("mouseup", (e) => {
			this._mousePosition = new Vector2(e.offsetX, Canvas.GetClientRectangle().height - e.offsetY);

			if (e.button !== 0) return;

			if (this._selectedType !== -1 && this._drawingRectangle !== null) {
				if (this._startRectangle !== null) {
					this._startRectangle.X,
						this._startRectangle.Y,
						this.GetObjectSize(this._selectedType)[0] ?? this._mousePosition.X - this._startRectangle.X + this._levelPosition,
						this.GetObjectSize(this._selectedType)[1] ?? this._mousePosition.Y - this._startRectangle.Y;
				}

				if (this._drawingRectangle.Width < 0)
					this._drawingRectangle = new Rectangle(
						this._drawingRectangle.X + this._drawingRectangle.Width,
						this._drawingRectangle.Y,
						-this._drawingRectangle.Width,
						this._drawingRectangle.Height
					);
				if (this._drawingRectangle.Height < 0)
					this._drawingRectangle = new Rectangle(
						this._drawingRectangle.X,
						this._drawingRectangle.Y + this._drawingRectangle.Height,
						this._drawingRectangle.Width,
						-this._drawingRectangle.Height
					);

				if (this._drawingRectangle.Width > 3 && this._drawingRectangle.Height > 3) this._selectedRectangle = this._gameObjects.push([this._selectedType, this._drawingRectangle]) - 1;

				this._startRectangle = null;
				this._drawingRectangle = null;
			}
		});

		addEventListener("mousemove", (e) => {
			this._mousePosition = new Vector2(Math.round(e.offsetX), Math.round(Canvas.GetClientRectangle().height - e.offsetY));

			if (this._selectedType === -1) return;

			const sizes = this.GetObjectSize(this._selectedType);

			if (!this.IsObjectForcedSize(this._selectedType)) {
				if ((e.target as HTMLElement).tagName !== "CANVAS") return;

				if (this._startRectangle !== null) {
					this._drawingRectangle = new Rectangle(
						this._startRectangle.X,
						this._startRectangle.Y,
						this.GetObjectSize(this._selectedType)[0] ?? this._mousePosition.X - this._startRectangle.X + this._levelPosition,
						this.GetObjectSize(this._selectedType)[1] ?? this._mousePosition.Y - this._startRectangle.Y
					);
				}
			} else
				this._drawingRectangle = new Rectangle(
					this._mousePosition.X - sizes[0] / 2 + this._levelPosition,
					this._mousePosition.Y - sizes[1] / 2,
					this.GetObjectSize(this._selectedType)[0],
					this.GetObjectSize(this._selectedType)[1]
				);
		});

		addEventListener("wheel", (e) => {
			this._selectedType = Math.clamp(this._selectedType - Math.sign(e.deltaY), -1, 13) as ObjectType | -1;

			if (this._selectedType !== -1) {
				const sizes = this.GetObjectSize(this._selectedType);
				this._drawingRectangle = new Rectangle(
					this._mousePosition.X - sizes[0] / 2 + this._levelPosition,
					this._mousePosition.Y - sizes[1] / 2,
					this.GetObjectSize(this._selectedType)[0],
					this.GetObjectSize(this._selectedType)[1]
				);
			}
		});
	}

	public static async LoadFromFile(src: string) {
		const scene = await fetch(src);
		if (!scene.ok) return new SceneError("Сцена не найдена: " + src);

		const sceneData = await scene.json();

		return new SceneEditor(
			sceneData.Background === undefined ? null : (GetSprite(sceneData.Background) as Sprite),
			sceneData.GameObjects.map((x: unknown) => this.ParseObject(x)),
			sceneData.Background
		);
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	private static ParseObject(x: any): [ObjectType, Rectangle] | never {
		switch (x.Type) {
			case "Wall":
				return [ObjectType.Wall, new Rectangle(...(x.Arguments as [number, number, number, number]))];
			case "Platform":
				return [ObjectType.Platform, new Rectangle(...(x.Arguments as [number, number, number]), 5)];
			case "Player":
				return [ObjectType.Player, new Rectangle(...(x.Arguments as [number, number]), 40, 100)];
			case "Boombox":
				return [ObjectType.Boombox, new Rectangle(x.Arguments[0] as number, x.Arguments[1] as number, 100, 50)];
			case "Box":
				return [ObjectType.Box, new Rectangle(...(x.Arguments as [number, number]), 50, 50)];
			case "Spikes":
				return [ObjectType.Spikes, new Rectangle(...(x.Arguments as [number, number, number, number]))];
			case "Ladder":
				return [ObjectType.Ladder, new Rectangle(x.Arguments[0], x.Arguments[1], 50, x.Arguments[2])];
			case "Artem":
				return [ObjectType.Artem, new Rectangle(...(x.Arguments as [number, number]), 50, 100)];
			case "Elder":
				return [ObjectType.Elder, new Rectangle(...(x.Arguments as [number, number]), 50, 100)];
			case "Trader":
				return [ObjectType.Trader, new Rectangle(...(x.Arguments as [number, number]), 50, 100)];
			case "Backpack":
				return [ObjectType.Backpack, new Rectangle(...(x.Arguments as [number, number]), 50, 35)];
			case "HumanCorpse":
				return [ObjectType.HumanCorpse, new Rectangle(...(x.Arguments as [number, number]), 32 * 3, 9 * 3)];
			case "Human":
				return [ObjectType.Human, new Rectangle(...(x.Arguments as [number, number]), 50, 100)];
			case "Rat":
				return [ObjectType.Rat, new Rectangle(...(x.Arguments as [number, number]), 100, 50)];
			default:
				console.error("Не удалось распарсить: " + x.Type);
		}
	}

	public Update(time: number) {
		if (this._shiftPressed) this._movingSpeed = 50;
		else this._movingSpeed = 10;

		const move = Math.max(0.5, Math.round(((time - SceneEditor.Time) * 0.1) / 0.5) * 0.5);

		if (this._movingLeft || this._movingRight) this._levelPosition += (this._movingLeft ? -this._movingSpeed : this._movingSpeed) * move;

		SceneEditor.Time = time;

        this.Render()
        this.RenderOverlay();
	}

	public Render() {
		Canvas.ClearStroke();
		Canvas.SetFillColor(new Color(200, 250, 100));
		Canvas.DrawRectangle(0, 0, Canvas.Width, Canvas.Height);

		if (this._background !== undefined && this._background !== null) Canvas.DrawBackground(this._background);

		for (let i = 0; i < this._gameObjects.length; i++) {
			const obj = this._gameObjects[i];

			Canvas.SetStroke(this._selectedRectangle === i ? Color.White : Color.Black, 2);
			Canvas.SetFillColor(this.GetObjectColor(obj[0]));
			Canvas.DrawRectangleEx(new Rectangle(obj[1].X - this._levelPosition, obj[1].Y, obj[1].Width, obj[1].Height));

			GUI.SetFont(16);
			GUI.SetFillColor(Color.White);
			GUI.DrawText(obj[1].X - this._levelPosition + 10, GUI.Height - obj[1].Y - obj[1].Height + 16, ObjectType[obj[0]]);
		}

		Canvas.SetFillColor(new Color(255, 0, 0, 100));
		if (this._drawingRectangle !== null)
			Canvas.DrawRectangle(this._drawingRectangle.X - this._levelPosition, this._drawingRectangle.Y, this._drawingRectangle.Width, this._drawingRectangle.Height);
	}

	public GetObjectColor(obj: ObjectType) {
		switch (obj) {
			case ObjectType.Wall:
				return new Color(100, 100, 100, 100);
			case ObjectType.Platform:
				return new Color(100, 100, 100, 100);
			case ObjectType.Player:
				return new Color(100, 100, 100, 100);
			case ObjectType.Boombox:
				return new Color(100, 100, 100, 100);
			case ObjectType.Box:
				return new Color(100, 100, 100, 100);
			case ObjectType.Spikes:
				return new Color(100, 100, 100, 100);
			case ObjectType.Ladder:
				return new Color(100, 100, 100, 100);
			case ObjectType.Artem:
				return new Color(100, 100, 100, 100);
			case ObjectType.Elder:
				return new Color(100, 100, 100, 100);
			case ObjectType.Trader:
				return new Color(100, 100, 100, 100);
			case ObjectType.Backpack:
				return new Color(100, 100, 100, 100);
			case ObjectType.HumanCorpse:
				return new Color(100, 100, 100, 100);
			case ObjectType.Human:
				return new Color(100, 100, 100, 100);
			case ObjectType.Rat:
				return new Color(100, 100, 100, 100);
		}
	}

	public GetObjectSize(obj: ObjectType): [number | undefined, number | undefined] {
		switch (obj) {
			case ObjectType.Platform:
				return [undefined, 5];
			case ObjectType.Spikes:
			case ObjectType.Wall:
				return [undefined, undefined];
			case ObjectType.Player:
				return [40, 100];
			case ObjectType.Boombox:
				return [100, 50];
			case ObjectType.Box:
				return [50, 50];
			case ObjectType.Ladder:
				return [50, undefined];
			case ObjectType.Elder:
			case ObjectType.Trader:
			case ObjectType.Human:
			case ObjectType.Artem:
				return [50, 100];
			case ObjectType.Backpack:
				return [50, 35];
			case ObjectType.HumanCorpse:
				return [32 * 3, 9 * 3];
			case ObjectType.Rat:
				return [100, 50];
		}
	}

	public IsObjectForcedSize(obj: ObjectType) {
		const sizes = this.GetObjectSize(obj);

		return sizes[0] !== undefined && sizes[1] !== undefined;
	}

	public RenderOverlay() {
		GUI.ClearStroke();
		Canvas.SetFillColor(new Color(0, 0, 0, 100));
		GUI.DrawRectangle(0, 0, GUI.Width, 50);

		Canvas.SetFillColor(Color.White);
		GUI.SetFont(16);
		GUI.DrawText(5, 20, this._selectedType === -1 ? "Режим выбора" : ObjectType[this._selectedType]);

		if (this._selectedRectangle !== null) {
			GUI.DrawText(5, 35, `Выбран: ${ObjectType[this._gameObjects[this._selectedRectangle][0]]}`);
			GUI.DrawText(250, 35, "x: удалить");

			if (this._shiftPressed) GUI.DrawText(250, 20, "Стрелочки: изменить размер");
			else GUI.DrawText(250, 20, "Стрелочки: изменить положение");
		}

		GUI.DrawText(750, 20, "AD: движение");
		GUI.DrawText(750, 35, "C: сохранить");
		GUI.DrawText(950, 20, "Shift: альтернативный режим");

		Canvas.SetFillColor(Color.White);
		Canvas.DrawCircle(this._mousePosition.X - 1, this._mousePosition.Y - 1, 2);
	}

	DownloadJson() {
		let json = `{"Background": "${this._backgroundName}", "GameObjects": [`;

		for (const obj of this._gameObjects) {
			json += "{";
			json += `"Type": "${ObjectType[obj[0]]}", "Arguments": [${obj[1].X}, ${obj[1].Y}`;

			const size = this.GetObjectSize(obj[0]);

			if (size[0] === undefined) json += `, ${obj[1].Width}`;
			if (size[1] === undefined) json += `, ${obj[1].Height}`;

			json += "]}";

			if (this._gameObjects.indexOf(obj) < this._gameObjects.length - 1) json += ",";
		}
		json += "]}";

		const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json);
		const downloadAnchorNode = document.createElement("a");
		downloadAnchorNode.setAttribute("href", dataStr);
		downloadAnchorNode.setAttribute("download", "scene.json");
		document.body.appendChild(downloadAnchorNode); // required for firefox
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}
}
