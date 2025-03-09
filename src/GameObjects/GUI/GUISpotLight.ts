import { GUI } from "../../Context.js";
import { Scene } from "../../Scene.js";
import { Color, Vector2 } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";

export class GUISpotLight extends GUIBase {
	private readonly _stars: { Position: Vector2; seed: number; Radius: number }[] = [];
	private readonly _dots: { Position: Vector2; lifeTime: number; Color: Color }[] = [];
	private readonly _lifeTime = 10000;
	private _timeToNextSpawn = 1000;
	private readonly _palette = [Color.White, Color.Red, Color.Blue];
	private _nextColor = 0;

	constructor() {
		super();

		for (let i = 0; i < 200; ++i) {
			this._stars.push({
				Position: new Vector2(Math.random() * GUI.Width, Math.random() * GUI.Height),
				seed: Math.random() * 1000,
				Radius: 1 + Math.random(),
			});
		}
	}

	public Update(dt: number): void {
		if (this._timeToNextSpawn > 0) {
			this._timeToNextSpawn -= dt;

			if (this._timeToNextSpawn <= 0) {
				this._timeToNextSpawn = 1000;

				this._dots.push({
					Position: new Vector2(Math.random() * GUI.Width, Math.random() * GUI.Height),
					lifeTime: 0,
					// Color: this._palette[this._nextColor],
					Color: Color.Red,
				});

				this._nextColor = (this._nextColor + 1) % this._palette.length;
			}
		}

		for (const dot of this._dots) {
			dot.lifeTime += dt;

			if (dot.lifeTime > this._lifeTime) this._dots.splice(this._dots.indexOf(dot), 1);
		}
	}

	public Render(): void {
		GUI.ClearStroke();

		for (const star of this._stars) {
			const s = Math.sin(star.seed + Scene.Time / 2000) + 1;

			GUI.SetFillColor(new Color(255, 255, 255, 10 + 50 * s));
			GUI.DrawCircle(star.Position.X + 2 * (s - 1), star.Position.Y + 2 * (s - 1), star.Radius * Math.min(s, 1));
		}

		GUI.ClearFillColor();

		for (const dot of this._dots)
			GUI.DrawCircleWithGradient(
				dot.Position.X,
				dot.Position.Y,
				500 * (dot.lifeTime / (this._lifeTime * 0.5)),
				new Color(
					dot.Color.R,
					dot.Color.G,
					dot.Color.B,
					dot.lifeTime < this._lifeTime * 0.5 ? 25 * (dot.lifeTime / (this._lifeTime * 0.5)) : 25 * (1 - (dot.lifeTime - this._lifeTime * 0.5) / (this._lifeTime * 0.5))
				),
				Color.Transparent
			);
	}
}
