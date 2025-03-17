import { Canvas } from "../../Context.js";
import { GetSound, GetSprite } from "../../AssetsLoader.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scenes/Scene.js";
import { Rectangle } from "../../Utilites.js";
import { Character } from "./Character.js";
import { ItemRegistry } from "../../Assets/Items/ItemRegistry.js";
export class Trader extends Character {
    constructor(x, y) {
        super(x, y, GetSprite("Trader"));
    }
    Render() {
        Canvas.DrawImage(GetSprite("Trader"), new Rectangle(this._x, this._y, this.Width, this.Height));
    }
    GetDialog() {
        super.GetDialog();
        const active = Scene.Current.Player.GetQuestsBy(this);
        if (active.length > 0) {
            if (active[0].GetTasks().length >= 2) {
                this._completedQuests++;
                return {
                    Messages: [
                        "Ну, что вот твои крысы.",
                        "ООО, спасибо тебе большое! Удачи тебе в\nтвоих похождениях.",
                        "ЭЭЭ, ты не чего не забыл? А как же моя\nнаграда?",
                        "А, да точно! Чуть не забыл, вот возми.",
                    ],
                    Voices: [GetSound("Dialog_7_0"), GetSound("Dialog_7_1"), GetSound("Dialog_7_2"), GetSound("Dialog_7_3")],
                    Owner: this,
                    OwnerFirst: false,
                    AfterAction: () => {
                        Scene.Current.Player.RemoveQuest(active[0]);
                        Scene.Current.Player.TakeItem("RatTail", 6);
                        Scene.Current.Player.GiveQuestItem(ItemRegistry.GetById("RifleBullet", 30));
                        Scene.Current.Player.GiveQuestItem(ItemRegistry.GetById("RifleBullet", 30));
                    },
                };
            }
            return {
                Messages: ["Ну что?\nГде там мои крысы?\nНе забудь, что ты\nобещал их принести.", "Да, помню, помню."],
                Voices: [GetSound("Dialog_6_0"), GetSound("Dialog_6_1")],
                Owner: this,
                OwnerFirst: true,
            };
        }
        switch (this._completedQuests) {
            case 0:
                return {
                    Messages: [
                        "Короче, Меченый, у меня к тебе есть одно\nпредложение: выполнишь для меня задание — за\nнебольшой приз в виде двух батонов и пяти\nпуль. Заодно посмотрим, как быстро у тебя\nбашка соображает.",
                        "Да, что собственно вообще нужно?",
                        "Надо убить шестерых крыс и принести их\nмне. Ну, там для дел, тебе не нужно знать.\nНу, что? Как ты, в деле?",
                        "Хорошо, договорились.",
                    ],
                    Voices: [GetSound("Dialog_5_0"), GetSound("Dialog_5_1"), GetSound("Dialog_5_2"), GetSound("Dialog_5_3")],
                    AfterAction: () => {
                        Scene.Current.Player.PushQuest(new Quest("Шкурки", this).AddHasItemsTask("Добыть 6 хвостов крыс", { Id: "RatTail", Count: 6 }).AddTalkTask("Вернуться к Торгашу", this));
                    },
                    Owner: this,
                    OwnerFirst: true,
                };
            default:
                return {
                    Messages: ["Cпасибо."],
                    Voices: [GetSound("Dialog_8")],
                    Owner: this,
                    OwnerFirst: true,
                };
        }
    }
    GetAvatar() {
        return GetSprite("Trader_Avatar");
    }
    GetName() {
        return "Торгаш";
    }
}
//# sourceMappingURL=Trader.js.map