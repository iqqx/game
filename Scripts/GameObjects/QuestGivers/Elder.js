import { DogTag } from "../../Assets/Items/Item.js";
import { GetSprite } from "../../Game.js";
import { Quest } from "../../Quest.js";
import { Scene } from "../../Scene.js";
import { Character } from "./Character.js";
export class Elder extends Character {
    constructor(x, y) {
        super(x, y, GetSprite("Elder"));
    }
    GetDialog() {
        super.GetDialog();
        const active = Scene.Player.GetQuestsBy(this);
        if (active.length > 0) {
            if (active[0].IsCompleted()) {
                this._completedQuests++;
                Scene.Player.RemoveItem(DogTag);
                Scene.Player.RemoveItem(DogTag);
                Scene.Player.RemoveQuest(active[0]);
                return {
                    Messages: [
                        "Ну я нашел ваших пропавших людей, но они не\nмного мертвые.",
                        "Что случилось? Как так произошло?",
                        "На них напали крысы, но я с ними разобрался.",
                        "Очень жаль наших людей, но не чего не\nподелаешь, это жизнь, вот тебе награда и\nспасибо за помощь. Может все таки останешься\nс нами на станции?",
                        "Спасибо, но нет, у меня свои цели.",
                        "Слушай, может тебе это поможет, но я слышал\nчто после станции в конце туннеля есть выход\nна верх, но там стоит охрана.",
                        "Очень интересно, как раз его то я и искал.\nНо как быть с охраной?",
                        "Ладно я помогу тебе. Один из охранников мой\nдруг, подойди к нему и скажи что от меня,\nон тебя пропустит.",
                        "Ладно, хорошо, спасибо большое.",
                        "Удачи.",
                    ],
                    Owner: this,
                    OwnerFirst: false,
                };
            }
            return {
                Messages: ["Ну что? Ты еще здесь?", "Да, вот станцию осматриваю.", "Давай уже иди за моими людьми, надо их найти.", "Сейчас, сейчас."],
                Owner: this,
                OwnerFirst: true,
            };
        }
        switch (this._completedQuests) {
            case 0:
                return {
                    Messages: [
                        "Так и кто это к нам пожаловал?\nДокументы есть?",
                        "Я Артем, вот документы.",
                        "Ого военный, оставайся у нас, нам такие\nнужны в довольствие не обидим.",
                        "Нет, спасибо, у меня другая цель.",
                        "Ну ладно так уж и быть тогда не хочешь\nуслужить нам за вознаграждение?",
                        "Ну слушаю, что надо?",
                        "Мы хотели узнать, что там на другой станции.\nСлышали, что там есть люди, и отправили туда\nлюдей, но потеряли с ними связь. Не мог бы\nты сходить туда и узнать, что случилось?",
                        "Ладно договорилась.",
                    ],
                    AfterAction: () => {
                        Scene.Player.PushQuest(new Quest("Соседи", this)
                            .AddFakeMoveTask(27500, "Станция", 30500)
                            .AddHasItemsTask("Собрать жетоны с трупов", [DogTag, 2])
                            .AddTalkTask("Вернуться к Старосте", this));
                    },
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
        return "Староста";
    }
}
//# sourceMappingURL=Elder.js.map