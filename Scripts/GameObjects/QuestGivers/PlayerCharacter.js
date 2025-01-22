import { GetSprite } from "../../AssetsLoader.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Artem } from "./Artem.js";
import { Character } from "./Character.js";
import { Elder } from "./Elder.js";
export class PlayerCharacter extends Character {
    constructor() {
        super(0, 0, GetSprite("Elder"));
    }
    GetDialog() {
        super.GetDialog();
        switch (this._completedQuests) {
            case 0:
                return {
                    Messages: ["Где это я? Как же болит голова.", "Нужно побыстрее выбираться.\nКажется в левой части тоннеля был выход."],
                    Owner: this,
                    AfterAction: () => {
                        Scene.Player.PushQuest(new Quest("Свет в конце тоннеля", this, () => {
                            this._completedQuests++;
                        })
                            .AddTalkTask("Узнать где выход", Scene.Current.GetByType(Artem)[0])
                            .AddMoveTask(4000, "Выход")
                            .AddCompletedQuestsTask("Узнать где выход", Scene.Current.GetByType(Elder)[0], 1)
                            .AddMoveTask(34200, "Выход"));
                    },
                    OwnerFirst: true,
                };
            case 1:
                return {
                    Messages: ["Ну вот и все я его нашел, осталось только\nподняться.", "А точно, Артем хотел чтобы я сообщил по\nрации, что нашел выход."],
                    Owner: this,
                    OwnerFirst: false,
                };
        }
    }
    GetAvatar() {
        return null;
    }
    GetName() {
        return "Мысли";
    }
}
//# sourceMappingURL=PlayerCharacter.js.map