import { GUI } from "../../Context.js";
import { Color } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";

export class FPSCounter extends GameObject {
	private _delta = 0;

	constructor() {
		super(40, 20);
	}

	public Update(dt: number): void {
		this._delta = dt;
	}

	public Render(): void {
		GUI.ClearStroke();
		GUI.SetFillColor(Color.Green);
		GUI.DrawRectangle(GUI.Width - this.Width, 0, this.Width, this.Height);
		GUI.SetFillColor(Color.White);
		GUI.SetFont(12);
		GUI.DrawTextCenter(Math.round(1000 / this._delta).toString(), GUI.Width - this.Width, 0, this.Width, this.Height);
	}
}
