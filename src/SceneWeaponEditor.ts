import { Weapon } from "./Assets/Weapons/Weapon.js";
import { Canvas, GUI } from "./Context.js";
import { Vector2, Color, Rectangle } from "./Utilites.js";

export class SceneWeaponEditor {
	private readonly _weapon: Weapon;
	private readonly _fillColors = [Color.Pink, Color.Black, Color.White, Color.Red];
	private _curFillColor = 0;
	private _scale = 8;
	private _selectedParameter = 0;
	private readonly _offsets = {
		Grip: new Vector2(0, 0),
		Muzzle: new Vector2(0, 0),
		Clip: new Vector2(0, 0),
	};

	private _mousePosition = new Vector2(0, 0);

	constructor(weapon: Weapon) {
		this._weapon = weapon;

		this._offsets.Grip = Vector2.Div(weapon.GripOffset, weapon.Sprites.Image.Scale);
		this._offsets.Muzzle = Vector2.Div(weapon.MuzzleOffset, weapon.Sprites.Image.Scale);
		this._offsets.Clip = Vector2.Div(weapon.ClipOffset, weapon.Sprites.Clip.Scale);

		addEventListener("keydown", (e) => {
			switch (e.code) {
				case "Digit1":
					this._curFillColor = (this._curFillColor + 1) % this._fillColors.length;
					break;
				case "Digit2":
					this._curFillColor = this._curFillColor === 0 ? this._fillColors.length - 1 : this._curFillColor - 1;
					break;
				case "KeyA":
					break;
				case "KeyD":
					break;
				case "ShiftLeft":
					break;
				case "ArrowUp":
					this._offsets[Object.keys(this._offsets)[this._selectedParameter]].Y++;
					break;
				case "ArrowDown":
					this._offsets[Object.keys(this._offsets)[this._selectedParameter]].Y--;
					break;
				case "ArrowRight":
					this._offsets[Object.keys(this._offsets)[this._selectedParameter]].X++;
					break;
				case "ArrowLeft":
					this._offsets[Object.keys(this._offsets)[this._selectedParameter]].X--;
					break;
				case "KeyX":
					this._selectedParameter = (this._selectedParameter + 1) % 3;
					break;
				case "KeyC":
					break;
			}
		});

		addEventListener("keyup", (e) => {
			switch (e.code) {
				case "KeyA":
					break;
				case "KeyD":
					break;
				case "ShiftLeft":
					break;
			}
		});

		addEventListener("mousedown", (e) => {
			this._mousePosition = new Vector2(e.x - Canvas.GetClientRectangle().left, Canvas.GetClientRectangle().height - e.y + Canvas.GetClientRectangle().top);

			if (e.button !== 0) return;
		});

		addEventListener("mouseup", (e) => {
			this._mousePosition = new Vector2(e.offsetX, Canvas.GetClientRectangle().height - e.offsetY);

			if (e.button !== 0) return;
		});

		addEventListener("mousemove", (e) => {
			this._mousePosition = new Vector2(Math.round(e.offsetX), Math.round(Canvas.GetClientRectangle().height - e.offsetY));
		});

		addEventListener("wheel", (e) => {
			this._scale = Math.clamp(this._scale - Math.sign(e.deltaY), 1, 100);
		});
	}

	public static async LoadFromFile(weapon: Weapon) {
		return new SceneWeaponEditor(weapon);
	}

	public Update(time: number) {}

	public Render() {
		Canvas.ClearStroke();
		Canvas.SetFillColor(this._fillColors[this._curFillColor]);
		Canvas.DrawRectangle(0, 0, GUI.Width, GUI.Height);

		Canvas.DrawImage(
			this._weapon.Sprites.Image,
			new Rectangle(
				GUI.Width / 2 - (this._weapon.Sprites.Image.BoundingBox.Width * this._scale) / 2,
				GUI.Height / 2 - (this._weapon.Sprites.Image.BoundingBox.Height * this._scale) / 2,
				this._weapon.Sprites.Image.BoundingBox.Width * this._scale,
				this._weapon.Sprites.Image.BoundingBox.Height * this._scale
			)
		);
	}

	public RenderOverlay() {
		GUI.SetBaselineTop();
		GUI.ClearStroke();
		GUI.SetFont(16);

		GUI.SetFillColor(Color.White);
		GUI.DrawCircle(
			GUI.Width / 2 + (-this._weapon.Sprites.Image.BoundingBox.Width / 2 + this._offsets.Grip.X) * this._scale,
			GUI.Height / 2 + (this._weapon.Sprites.Image.BoundingBox.Height / 2 - this._offsets.Grip.Y) * this._scale,
			4
		);

		if (this._selectedParameter === 0)
			GUI.DrawText2CenterLineBreaked(
				GUI.Width / 2 + (-this._weapon.Sprites.Image.BoundingBox.Width / 2 + this._offsets.Grip.X) * this._scale,
				GUI.Height / 2 + (this._weapon.Sprites.Image.BoundingBox.Height / 2 - this._offsets.Grip.Y) * this._scale + 10,
				"Рукоять"
			);

		GUI.SetFillColor(Color.White);
		GUI.DrawCircle(
			GUI.Width / 2 + (-this._weapon.Sprites.Image.BoundingBox.Width / 2 + this._offsets.Muzzle.X) * this._scale,
			GUI.Height / 2 + (this._weapon.Sprites.Image.BoundingBox.Height / 2 - this._offsets.Muzzle.Y) * this._scale,
			4
		);

		if (this._selectedParameter === 1)
			GUI.DrawText2CenterLineBreaked(
				GUI.Width / 2 + (-this._weapon.Sprites.Image.BoundingBox.Width / 2 + this._offsets.Muzzle.X) * this._scale,
				GUI.Height / 2 + (this._weapon.Sprites.Image.BoundingBox.Height / 2 - this._offsets.Muzzle.Y) * this._scale + 10,
				"Дуло"
			);

		GUI.SetFillColor(Color.White);
		GUI.DrawCircle(
			GUI.Width / 2 + (-this._weapon.Sprites.Image.BoundingBox.Width / 2 + this._offsets.Clip.X) * this._scale,
			GUI.Height / 2 + (this._weapon.Sprites.Image.BoundingBox.Height / 2 - this._offsets.Clip.Y) * this._scale,
			4
		);

		if (this._selectedParameter === 2)
			GUI.DrawText2CenterLineBreaked(
				GUI.Width / 2 + (-this._weapon.Sprites.Image.BoundingBox.Width / 2 + this._offsets.Clip.X) * this._scale,
				GUI.Height / 2 + (this._weapon.Sprites.Image.BoundingBox.Height / 2 - this._offsets.Clip.Y) * this._scale + 20,
				"Шахта\nмагазина"
			);

		GUI.DrawRectangle(25, 50 + this._selectedParameter * 20, 16, 16);

		GUI.DrawText(50, 50, `Рукоять: ${this._offsets.Grip.X} | ${this._offsets.Grip.Y}`);
		GUI.DrawText(50, 70, `Дуло: ${this._offsets.Muzzle.X} | ${this._offsets.Muzzle.Y}`);
		GUI.DrawText(50, 90, `Шахта магазина: ${this._offsets.Clip.X} | ${this._offsets.Clip.Y}`);

		Canvas.SetFillColor(Color.White);
		Canvas.DrawCircle(this._mousePosition.X, this._mousePosition.Y, 2);
		GUI.SetBaselineDefault();
	}
}
