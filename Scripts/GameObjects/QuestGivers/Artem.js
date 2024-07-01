import { Radio } from "../../Assets/Items/Item.js";
import { Canvas } from "../../Context.js";
import { GetSound, GetSprite } from "../../Game.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Rectangle } from "../../Utilites.js";
import { Character } from "./Character.js";
export class Artem extends Character {
    _timeFromStartEnd = -1;
    _timeFromShoot = -1;
    constructor(x, y) {
        super(x, y, GetSprite("Artem"));
        this.Width = 100;
    }
    Render() {
        if (this._timeFromStartEnd == -1)
            Canvas.DrawImage(GetSprite("Artem"), new Rectangle(this._x - Scene.Current.GetLevelPosition(), this._y, this.Width, this.Height));
        else {
            if (this._timeFromShoot > 0 && Scene.Time - this._timeFromShoot < 500)
                Canvas.DrawImage(GetSprite("Artem_Shoot"), new Rectangle(this._x + (this._timeFromStartEnd >= 0 ? 800 * Math.min(1, (Scene.Time - this._timeFromStartEnd) / 7000) : 0) - Scene.Current.GetLevelPosition(), 149, this.Width, this.Height));
            else if (this.IsEnd())
                Canvas.DrawImage(GetSprite("Artem_Walk")[0], new Rectangle(this._x + (this._timeFromStartEnd >= 0 ? 800 * Math.min(1, (Scene.Time - this._timeFromStartEnd) / 7000) : 0) - Scene.Current.GetLevelPosition(), 149, this.Width, this.Height));
            else
                Canvas.DrawImage(GetSprite("Artem_Walk")[Math.floor(((Scene.Time - this._timeFromStartEnd) / 100) % 4)], new Rectangle(this._x + (this._timeFromStartEnd >= 0 ? 800 * Math.min(1, (Scene.Time - this._timeFromStartEnd) / 7000) : 0) - Scene.Current.GetLevelPosition(), 149, this.Width, this.Height));
        }
    }
    GetDialog() {
        super.GetDialog();
        switch (this._completedQuests) {
            case 0:
                this._completedQuests++;
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
            case 1:
                return {
                    Messages: ["Ну что там с выходом?", "Ещё не нашел.", "Ну так ищи быстрее."],
                    Owner: this,
                    OwnerFirst: true,
                };
            case 2:
                this._completedQuests++;
                return {
                    Messages: ["Артем, прием, я его нашел, нашел выход,\nон находится, не доходя до центральной\nветки.", "Принял, не мог бы ты подождать меня у него?", "Хорошо."],
                    Owner: this,
                    AfterAction: () => {
                        Scene.Current.GetByType(Artem)[0].StartEnd();
                    },
                    OwnerFirst: false,
                };
            case 3:
                this._completedQuests++;
                return {
                    Messages: ["Вот спасибо тебе большое, услужил."],
                    Owner: this,
                    AfterAction: () => {
                        Scene.Current.GetByType(Artem)[0].Shoot();
                    },
                    OwnerFirst: true,
                };
            case 4:
                return {
                    Messages: ["Эх, Максим, Максим, как так то, ведь это я\nтот выход завалил. Что бы никто не поки..."],
                    Owner: this,
                    OwnerFirst: true,
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
    Shoot() {
        this._timeFromShoot = Scene.Time;
        GetSound("Shoot_3").Play(0.5);
        Scene.Player.TakeDamage(500);
    }
    GetAvatar() {
        return GetSprite("Artem_Avatar");
    }
    End() {
        this._completedQuests++;
    }
}
//# sourceMappingURL=Artem.js.map