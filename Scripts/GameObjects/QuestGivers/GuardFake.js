import { Tag } from "../../Enums.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Character } from "./Character.js";
export class GuardFake extends Character {
    constructor(x, y) {
        super(50, 100);
        this.Tag = Tag.NPC;
        this._x = x;
        this._y = y;
    }
    GetDialog() {
        super.GetDialog();
        return {
            Messages: ["Стой кто идет покажи руки есть оружие?", "Тихо, тихо, убираю.", "Пойдем к нашему старосте он задаст тебе пару\nвопросов."],
            AfterAction: () => {
                Scene.Player.PushQuest(new Quest("Разговор", this).AddPlaceholderTask("Поговорить со старостой"));
                this._completedQuests++;
            },
            Owner: this,
            OwnerFirst: true,
        };
    }
    GetName() {
        return "Охранник";
    }
}
