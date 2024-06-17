import { GUI } from "../../Context.js";
import { Color, Vector2 } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";

export class GUISpotLight extends GUIBase {
	private readonly _dots: { Position: Vector2; lifeTime: number }[] = [];
	private _timeToNextSpawn = 200;

	constructor() {
		super(100, 100);
	}

	public Update(dt: number): void {
		if (this._timeToNextSpawn > 0) {
			this._timeToNextSpawn -= dt;

			if (this._timeToNextSpawn <= 0) {
				this._timeToNextSpawn = 3000;

				this._dots.push({ Position: new Vector2(Math.random() * GUI.Width, Math.random() * GUI.Height), lifeTime: 10000 });
			}
		}

		for (const dot of this._dots) {
			dot.lifeTime -= dt;

			if (dot.lifeTime <= 0) this._dots.splice(this._dots.indexOf(dot), 1);
		}
	}

	public Render(): void {
		for (const dot of this._dots) GUI.DrawCircleWithGradient(dot.Position.X, dot.Position.Y, 1000, new Color(255, 255, 255, 25 * Math.sin(dot.lifeTime / 3000)), Color.Transparent);
	}
}
