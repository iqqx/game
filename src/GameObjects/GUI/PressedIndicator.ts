import { Canvas, GUI } from "../../Context.js";
import { Color, IsMobile } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";

export class PressedIndicator extends GUIBase {
	private readonly _delay: number;
	private _pressed = false;
	private _pressedTime = 0;
	private _deadlineTime;
	private readonly _actions: (() => void)[];
	private readonly _onkeyDown: (e: KeyboardEvent) => void;
	private readonly _onkeyUp: (e: KeyboardEvent) => void;

	constructor(key: string, delay: number, deadline: number, actions: (() => void)[]) {
		super();

		this._actions = actions;
		this._delay = delay;
		this._deadlineTime = deadline;
		this.Width = this.Height = 20;

		if (IsMobile()) {
		} else {
			this._onkeyDown = (e) => {
				if (e.code === key && this._pressed === false) {
					this._pressed = true;
					this._pressedTime = 0;
				}
			};

			this._onkeyUp = (e) => {
				if (e.code === key) {
					this._pressed = false;
					this._pressedTime = 0;
				}
			};

			Canvas.HTML.addEventListener("keydown", this._onkeyDown);
			Canvas.HTML.addEventListener("keyup", this._onkeyUp);
		}
	}

	public Update(dt: number): void {
		this._deadlineTime -= dt;

		if (this._deadlineTime <= 0)
			for (const action of this._actions) {
				action.call(this);
			}
		else if (this._pressed) {
			this._pressedTime += dt;

			if (this._pressedTime >= this._delay) {
				for (const action of this._actions) {
					action.call(this);
				}
			}
		}
	}

	public Render(): void {
		GUI.SetFillColor(Color.White);
		GUI.DrawSector(this.X - this.Width, this.Y - this.Height * 0.25, this.Width * 0.5, Math.PI * 2 * (this._pressedTime / this._delay));
	}

	public override OnDestroy(): void {
		Canvas.HTML.removeEventListener("keydown", this._onkeyDown);
		Canvas.HTML.removeEventListener("keyup", this._onkeyUp);
	}
}
