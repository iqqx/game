import { GUI } from "../../Context.js";
import { GetSound } from "../../Game.js";
import { Scene } from "../../Scene.js";
import { Color } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";

export class Button extends GUIBase {
	protected _hovered = false;
	protected _pressed = false;
	protected _onClicked: () => void;
	private readonly _hoverSound = GetSound("GUI_Hover");
	private readonly _clickSound = GetSound("Play");

	constructor(x: number, y: number, width: number, height: number) {
		super(width, height);

		this._x = x;
		this._y = y;
	}

	public override Update(): void {
		const mouse = Scene.Current.GetMousePosition();
		const buttons = Scene.Current.GetMouseButtons();

		const lastHovered = this._hovered;
		this._hovered =
			mouse.X > this._x - this.Width / 2 &&
			mouse.X <= this._x + this.Width / 2 &&
			GUI.Height - mouse.Y > this._y - this.Height / 2 &&
			GUI.Height - mouse.Y <= this._y + this.Height / 2;

		if (this._hovered) {
			if (lastHovered === false) this._hoverSound.Play(0.1);

			if (!this._pressed) {
				if (buttons.Left) {
					if (this._onClicked !== undefined) {
						this._onClicked();
						this._clickSound.PlayOriginal();
					}
					this._pressed = true;
				}
			} else if (!buttons.Left) this._pressed = false;
		}
	}

	public override Render() {
		GUI.SetFillColor(this._hovered ? new Color(50, 50, 50) : new Color(70, 70, 70));
		GUI.SetStroke(new Color(155, 155, 155), 1);
		GUI.DrawRectangle(this._x - this.Width / 2, this._y - this.Height / 2, this.Width, this.Height);
	}

	public SetOnClicked(callback: () => void) {
		this._onClicked = callback;
		return this;
	}
}
