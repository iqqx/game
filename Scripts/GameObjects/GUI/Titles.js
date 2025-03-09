import { GetSound } from "../../AssetsLoader.js";
import { Canvas, GUI } from "../../Context.js";
import { Scene } from "../../Scene.js";
import { Color, IsMobile } from "../../Utilites.js";
import { GUIBase } from "./GUIBase.js";
export class Titles extends GUIBase {
    static _texts = [
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
        "СПЕЦИАЛИСТЫ ПО ОЗВУЧКЕ",
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
        "СПЕЦИАЛИСТ ПО ПОВЕСТКЕ",
        "Даниловский Иван",
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
        "© 2025 PENTAGON. Все права защищены.",
    ];
    _progress = 0;
    _pressed = false;
    _onkeyDown;
    _onkeyUp;
    _sound = GetSound("Titles_Background");
    constructor() {
        super();
        this.Width = GUI.Width;
        this.Height = GUI.Height;
        this._progress = this.Height + 100;
        // this._progress = Titles._texts.length * -50 - 300;
        // this._progress = Titles._texts.length * -50 - 300 + 1000;
        this._sound.Volume = 0.1;
        this._sound.Apply();
        this._sound.PlayOriginal();
        if (IsMobile()) {
        }
        else {
            this._onkeyDown = (e) => {
                if (e.code === "Space") {
                    this._pressed = true;
                }
            };
            this._onkeyUp = (e) => {
                if (e.code === "Space") {
                    this._pressed = false;
                }
            };
            Canvas.HTML.addEventListener("keydown", this._onkeyDown);
            Canvas.HTML.addEventListener("keyup", this._onkeyUp);
        }
    }
    Update(dt) {
        this._progress -= dt * (this._pressed ? 0.5 : 0.05);
        if (this._progress < Titles._texts.length * -50 - 300) {
            GetSound("Titles_Background").StopOriginal();
            Scene.LoadFromFile("Assets/Scenes/Menu.json");
        }
        if (this._progress < Titles._texts.length * -50 && 1 - (Titles._texts.length * -50 - this._progress) / 300 >= 0 && 1 - (Titles._texts.length * -50 - this._progress) / 300 <= 1) {
            this._sound.Volume = (1 - (Titles._texts.length * -50 - this._progress) / 300) * 0.1;
            this._sound.Apply();
        }
    }
    Render() {
        GUI.SetFillColor(Color.White);
        GUI.ClearStroke();
        GUI.SetFont(32);
        for (let i = 0; i < Titles._texts.length; i++)
            GUI.DrawTextCenter(Titles._texts[i], 0, Math.round(this._progress) + i * 32 * 1.5, this.Width, 0);
        if (this._progress < Titles._texts.length * -45 + 500) {
            GUI.SetFont(72);
            const startAt = Titles._texts.length * -49 - 100;
            const endAt = Titles._texts.length * -50 - 290;
            const length = Math.abs(endAt - startAt);
            const text = "СПАСИБО ЗА ИГРУ";
            GUI.SetFillColor(Color.White);
            if (this._progress > endAt) {
                GUI.DrawText2CenterLineBreaked(GUI.Width * 0.5, Math.max(Math.round(this._progress), Titles._texts.length * -49) + Titles._texts.length * 55, text.substring(0, Math.max(0, Math.round((-(endAt - this._progress) / length) * text.length))).padEnd(text.length));
            }
        }
    }
    OnDestroy() {
        Canvas.HTML.removeEventListener("keydown", this._onkeyDown);
        Canvas.HTML.removeEventListener("keyup", this._onkeyUp);
    }
}
//# sourceMappingURL=Titles.js.map