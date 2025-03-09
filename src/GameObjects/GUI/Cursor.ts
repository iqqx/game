import { Canvas, GUI } from "../../Context.js";
import { Color, IsMobile } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";

export class Cursor extends GUIBase {
	private readonly _radius: number;
	private readonly _onMouseMove: (e: MouseEvent) => void;

	constructor(radius = 2) {
		super();

		if (IsMobile()) this._radius = 0;
		else {
			this._radius = radius;

			this._onMouseMove = (e) => {
				this.X = e.x;
				this.Y = e.y;
			};

			Canvas.HTML.addEventListener("mousemove", this._onMouseMove);
		}
	}

	public override Update(dt: number): void {}

	public override Render() {
		GUI.SetFillColor(Color.White);
		GUI.ClearStroke();
		GUI.DrawCircle(this.X, this.Y, this._radius);
	}

	public override OnDestroy(): void {
		Canvas.HTML.removeEventListener("mousemove", this._onMouseMove);
	}
}
