import { GUI } from "../Context.js";
import { GetSound } from "../Game.js";
import { Scene } from "../Scene.js";
import { Color } from "../Utilites.js";
import { GameObject } from "./GameObject.js";

export class IntroCutscene extends GameObject {
	private readonly _introSound = GetSound("Intro");
	private readonly _mainSceneSource: string;
	private _timeFromIntro = 0;
	private _spaceDowned = false;
	private _spaceDownedTime = 0;

	constructor(mainScene: string) {
		super(0, 0);

		this._mainSceneSource = mainScene;

		this._introSound.Volume = 0.35;
		this._introSound.Apply();
		this._introSound.PlayOriginal();

		addEventListener("keydown", (e) => {
			if (e.code === "Space" && this._spaceDowned === false) {
				this._spaceDowned = true;
				this._spaceDownedTime = 0;
			}
		});

		addEventListener("keyup", () => {
			this._spaceDowned = false;
		});
	}

	public override Update(dt: number): void {
		this._timeFromIntro += dt;

		if (this._spaceDowned) this._spaceDownedTime += dt;

		if (this._timeFromIntro >= 19000 || this._spaceDownedTime > 1000) {
			if (this._spaceDownedTime > 1000) this._introSound.StopOriginal();

			Scene.LoadFromFile(this._mainSceneSource);
		}
	}

	public override Render(): void {
		GUI.SetFillColor(Color.Black);
		GUI.DrawRectangle(0, 0, GUI.Width, GUI.Height);

		const cn = "ПЕНТАГОН";
		const nt = "ПРЕДСТАВЛЯЕТ";
		const gn = "SUBWAY INFERNO";

		GUI.SetFillColor(Color.White);
		if (this._timeFromIntro < 7000 && this._timeFromIntro > 1000) {
			GUI.SetFont(72);

			if (this._timeFromIntro < 6000) {
				GUI.DrawTextCenter(cn.slice(0, Math.round(cn.length * ((this._timeFromIntro - 1000) / 2500))), 0, 0, GUI.Width, GUI.Height);

				if (this._timeFromIntro > 4000) {
					GUI.SetFont(24);
					GUI.DrawTextCenter(nt.slice(0, Math.round(nt.length * ((this._timeFromIntro - 4000) / 1000))), 0, GUI.Height / 2 + 100, GUI.Width);
				}
			} else {
				GUI.DrawTextCenter(cn.slice(0, Math.max(0, cn.length - Math.round(cn.length * ((this._timeFromIntro - 6000) / 800)))), 0, 0, GUI.Width, GUI.Height);

				GUI.SetFont(24);
				GUI.DrawTextCenter(nt.slice(0, Math.max(0, nt.length - Math.round(nt.length * ((this._timeFromIntro - 6000) / 800)))), 0, GUI.Height / 2 + 100, GUI.Width);
			}
		} else if (this._timeFromIntro > 8000) {
			GUI.SetFont(92);
			if (this._timeFromIntro < 16000) GUI.DrawTextCenter(gn.slice(0, Math.ceil(nt.length * ((this._timeFromIntro - 8000) / 3000))), 0, 0, GUI.Width, GUI.Height);
			else GUI.DrawTextCenter(gn.slice(0, -Math.ceil(nt.length * ((this._timeFromIntro - 16000) / 2500))), 0, 0, GUI.Width, GUI.Height);
		}
	}
}
