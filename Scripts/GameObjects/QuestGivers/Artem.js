import { ItemRegistry } from "../../Assets/Items/ItemRegistry.js";
import { Throwable } from "../../Assets/Throwable.js";
import { GetSprite, GetSound } from "../../AssetsLoader.js";
import { Canvas } from "../../Context.js";
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
            Canvas.DrawImage(GetSprite("Artem"), new Rectangle(this._x, this._y, this.Width, this.Height));
        else {
            if (this._timeFromShoot > 0 && Scene.Time - this._timeFromShoot < 500)
                Canvas.DrawImage(GetSprite("Artem_Shoot"), new Rectangle(this._x + (this._timeFromStartEnd >= 0 ? 800 * Math.min(1, (Scene.Time - this._timeFromStartEnd) / 7000) : 0), 149, this.Width, this.Height));
            else if (this.IsEnd())
                Canvas.DrawImage(GetSprite("Artem_Walk")[0], new Rectangle(this._x + (this._timeFromStartEnd >= 0 ? 800 * Math.min(1, (Scene.Time - this._timeFromStartEnd) / 7000) : 0), 149, this.Width, this.Height));
            else
                Canvas.DrawImage(GetSprite("Artem_Walk")[Math.floor(((Scene.Time - this._timeFromStartEnd) / 100) % 4)], new Rectangle(this._x + (this._timeFromStartEnd >= 0 ? 800 * Math.min(1, (Scene.Time - this._timeFromStartEnd) / 7000) : 0), 149, this.Width, this.Height));
        }
    }
    GetDialog() {
        super.GetDialog();
        switch (this._completedQuests) {
            case 0:
                this._completedQuests++;
                return {
                    Messages: [
                        "Стой!\nТы кто?\nЧто произошло?",
                        "Я - Артём, искал выход из этого чертового\nметро.",
                        "Ну и как успехи?",
                        "Все завалено, нельзя пройти.",
                        "Эх... жаль. Я тоже ищу выход, но с другой\nстороны живет монстр. Не знаешь, что с\nдругими станциями?",
                        "Cлышал, что на соседней станции люди\nпостроили себе убежище, а про другие знать\nне знаю. Слушай, давай ты поможешь мне, а я -\nтебе. Если вдруг найдешь выход, то свяжись\nсо мной, а я тебе, если вдруг найду, тоже\nтебе сообщу.\nВот, возьми рацию, частота 102,75.",
                        "А как я пройду через монстра?",
                        "Вот это должно помочь.",
                        "Хорошо, договорились.",
                    ],
                    Voices: [
                        GetSound("Dialog_1_0"),
                        GetSound("Dialog_1_1"),
                        GetSound("Dialog_1_2"),
                        GetSound("Dialog_1_3"),
                        GetSound("Dialog_1_4"),
                        GetSound("Dialog_1_5"),
                        GetSound("Dialog_1_6"),
                        GetSound("Dialog_1_7"),
                        GetSound("Dialog_1_8"),
                    ],
                    AfterAction: () => {
                        Scene.Player.GiveQuestItem(ItemRegistry.GetById("Radio"));
                        Scene.Player.GiveQuestItem(Throwable.GetById("RGN"));
                        Scene.Player.PushQuest(new Quest("Поиск людей", this).AddMoveTask(20850, "Лагерь"));
                    },
                    Owner: this,
                    OwnerFirst: false,
                };
            case 1:
                return {
                    Messages: ["Ну, что там с выходом?", "Ещё не нашёл.", "Ну так ищи быстрее."],
                    Voices: [GetSound("Dialog_2_0"), GetSound("Dialog_2_1"), GetSound("Dialog_2_2")],
                    Owner: this,
                    OwnerFirst: true,
                };
            case 2:
                this._completedQuests++;
                return {
                    Messages: ["Артём, приём! Я его нашёл, нашёл выход,\nон находится, не доходя до центральной\nветки.", "Принял. Не мог бы ты подождать меня у него?", "Хорошо."],
                    Voices: [GetSound("Dialog_13_0"), GetSound("Dialog_13_1"), GetSound("Dialog_13_2")],
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
                    Voices: [GetSound("Dialog_14")],
                    Owner: this,
                    AfterAction: () => {
                        Scene.Current.GetByType(Artem)[0].Shoot();
                    },
                    OwnerFirst: true,
                };
            case 4:
                return {
                    Messages: ["Эх, Максим, Максим, как так то? Ведь это я\nтот выход завалил. Чтобы никто не поки..."],
                    Voices: [GetSound("Dialog_16")],
                    Owner: this,
                    OwnerFirst: true,
                };
            default:
                return {
                    Messages: ["Cпасибо."],
                    Voices: [GetSound("Dialog_15")],
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