import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";

export class PressedIndicator extends GUIBase {
	private readonly _key: string;
	private readonly _delay: number;
	private _spaceDowned = false;
	private _spaceDownedTime = 0;

	constructor(x: number, y: number, key: string, delay: number) {
		super(20, 20);

		this._x = x;
		this._y = y;

		this._key = key;
		this._delay = delay;

		addEventListener("keydown", (e) => {
			if (e.code === key && this._spaceDowned === false) {
				this._spaceDowned = true;
				this._spaceDownedTime = 0;
			}
		});

		addEventListener("keyup", () => {
			this._spaceDowned = false;
			this._spaceDownedTime = 0;
		});
	}

	public Update(dt: number): void {
		if (this._spaceDowned) this._spaceDownedTime += dt;
	}

	public Render(): void {
		GUI.SetFillColor(Color.White);
		GUI.DrawSector(this._x + this.Width / 2, this._y + 3, 10, Math.PI * 2 * (this._spaceDownedTime / this._delay));
	}
}
