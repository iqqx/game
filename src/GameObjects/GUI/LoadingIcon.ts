import { GetSprite } from "../../AssetsLoader.js";
import { GUI } from "../../Context.js";
import { Sprite } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";

export class LoadingIcon extends GUIBase {
	private readonly _icon: Sprite;
	private _angle = 0;
	private _timeToAction: number;
	private readonly _actions: (() => void)[];

	constructor(timeToAction: number, actions: (() => void)[]) {
		super();

		this.Width = 50;
		this.Height = 50;
		this._actions = actions;
		this._timeToAction = timeToAction;

		this._icon = GetSprite("Loading_Icon") as Sprite;
	}

	public override Update(dt: number): void {
		this._angle += dt / 400;

		if (this._timeToAction !== undefined && this._timeToAction > 0) {
			this._timeToAction -= dt;

			if (this._timeToAction <= 0) {
				this._timeToAction = undefined;

				for (const action of this._actions) {
					action.call(this);
				}
			}
		}
	}

	public override Render() {
		GUI.DrawImageWithAngle(this._icon, this.X, this.Y, this.Width, this.Height, this._angle);
	}
}
