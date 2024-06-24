import { GUI } from "../../Context.js";
import { Scene } from "../../Scene.js";
import { Color } from "../../Utilites.js";
import { GameObject } from "../GameObject.js";

export class Titles extends GameObject {
	private static readonly _texts = [
		"РУКОВОДИТЕЛИ ПРОЕКТА",
		"Лебедев Арсений",
		"Катаева Вероника",
		"",
		"АРХИТЕКТОРЫ",
		"Катаева Вероника",
		"Кузнецова Анна",
		"Лебедев Арсений",
		"",
		"СЦЕНАРИСТЫ",
		"Кузнецова Анна",
		"Лебедев Арсений",
		"",
		"ПОСТАНОВЩИКИ",
		"Кузнецова Анна",
		"Лебедев Арсений",
		"Левинский Михаил",
		"",
		"СТАРШИЕ ПРОГРАММИСТЫ",
		"Левинский Михаил",
		"",
		"МЛАДШИЕ ПРОГРАММИСТЫ",
		"Курнышев Андрей",
		"Левинский Михаил",
		"",
		"ТЕХНИЧЕСКИЕ КОНСУЛЬТАНТЫ",
		"Левинский Михаил",
		"",
		"СТАРШИЕ ВЕРСТАЛЬЩИКИ",
		"Даниловский Иван",
		"",
		"МЛАДШИЕ ВЕРСТАЛЬЩИКИ",
		"Даниловский Иван",
		"Ерохин Даниил",
		"",
		"СТАРШИЕ ДИЗАЙНЕРЫ",
		"Белолипецкий Владимир",
		"",
		"МЛАДШИЕ ДИЗАЙНЕРЫ",
		"Белолипецкий Владимир",
		"Исаков Кирилл",
		"Левинский Михаил",
		"Коряковский Владислав",
		"",
		"ПРОЕКТИРОВЩИКИ УРОВНЕЙ",
		"Лушков Даниил",
		"",
		"СТАРШИЕ ЗВУКОРЕЖИССЕРЫ",
		"Даниловский Иван",
		"",
		"РАЗРАБОТЧИКИ АНИМАЦИЙ",
		"Левинский Михаил",
		"",
		"СТАРШИЕ ТЕСТИРОВЩИКИ",
		"Даниловский Иван",
		"Левинский Михаил",
		"",
		"МЛАДШИЕ ТЕСТИРОВЩИКИ",
		"Левинский Михаил",
		"Лебедев Арсений",
		"",
		"",
		"",
		"",
		"",
		"ИСПОЛЬЗУЕМЫЕ ТЕХНОЛОГИИ",
		"TypeScript",
		"MicEngine",
		"",
		"",
		"",
		"",
		"",
		"",
		"",
		"",
		"",
		"Subway Inferno",
		"© 2024 PENTAGON. Все права защищены.",
	];

	private _pressed = false;

	constructor() {
		super(GUI.Width, GUI.Height);

		this._y = 450;

		addEventListener("keydown", (e) => {
			if (e.code === "Space") this._pressed = true;
		});

		addEventListener("keyup", (e) => {
			if (e.code === "Space") this._pressed = false;
		});
	}

	public Update(dt: number): void {
		this._y -= dt * (this._pressed ? 0.5 : 0.05);

		if (this._y < Titles._texts.length * -50 - 300) Scene.LoadFromFile("Assets/Scenes/Menu.json");
	}

	public Render(): void {
		GUI.SetFillColor(Color.White);
		GUI.ClearStroke();

		GUI.SetFont(32);
		for (let i = 0; i < Titles._texts.length; i++) GUI.DrawTextCenter(Titles._texts[i], 0, Math.round(this._y) + i * 32 * 1.5, this.Width, this.Height);

		GUI.SetFont(72);
		GUI.DrawTextCenter("СПАСИБО ЗА ИГРУ", 0, Math.max(Math.round(this._y), Titles._texts.length * -50) + Titles._texts.length * 50, this.Width, this.Height);
	}
}
