import { Radio } from "../../Assets/Items/Item.js";
import { Canvas } from "../../Context.js";
import { Tag } from "../../Enums.js";
import { GetSprite } from "../../Game.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Rectangle } from "../../Utilites.js";
import { Character } from "./Character.js";
export class Artem extends Character {
    _timeFromStartEnd = -1;
    constructor(x, y) {
        super(50, 100);
        this.Tag = Tag.NPC;
        this._x = x;
        this._y = y;
    }
    Render() {
        Canvas.DrawImage(GetSprite("Artem"), new Rectangle(this._x + (this._timeFromStartEnd >= 0 ? 800 * Math.min(1, (Scene.Time - this._timeFromStartEnd) / 7000) : 0) - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
    }
    GetDialog() {
        super.GetDialog();
        if (Scene.Player.GetQuestsBy(this).length > 0)
            return {
                Messages: ["Ну что там с выходом?", "Ещё не нашел.", "Ну так ищи быстрее."],
                Owner: this,
                OwnerFirst: true,
            };
        switch (this._completedQuests) {
            case 0:
                return {
                    Messages: [
                        "Стой ты кто, что произошло?",
                        "Я Артем, искал выход из этого чертового\nметро.",
                        "Ну и как успехи?",
                        "Все завалено не пройти.",
                        "Эх жаль, я тоже ищу выход. Не знаешь что с\nдругими станциями?",
                        "Cлышал, что на соседней станции люди\nпостроили себе убежище, а про другие знать\nне знаю. Слушай давай ты поможешь мне, а я\nтебе. Если вдруг найдешь выход, то свяжись\nсо мной, а я тебе, если вдруг найду, тоже\nтебе сообщу.\nВот возьми рацию, частота 102,75.",
                        "Хорошо договорились.",
                    ],
                    AfterAction: () => {
                        Scene.Player.GiveQuestItem(new Radio());
                        Scene.Player.PushQuest(new Quest("Поиск людей", this).AddMoveTask(21700, "Лагерь"));
                    },
                    Owner: this,
                    OwnerFirst: false,
                };
            default:
                return {
                    Messages: ["Cпасибо."],
                    Owner: this,
                    OwnerFirst: true,
                };
        }
    }
    GetName() {
        return "Артём";
    }
    IsEnd() {
        return this._timeFromStartEnd > 0 && Scene.Time - this._timeFromStartEnd >= 7000;
    }
    StartEnd() {
        this._timeFromStartEnd = Scene.Time;
        this._x = 32600;
    }
}
//# sourceMappingURL=Artem.js.map