import { GetSound, GetSprite } from "../../AssetsLoader.js";
import { Scene } from "../../Scenes/Scene.js";
import { Character } from "./Character.js";
import { Elder } from "./Elder.js";
export class FakeEndGuard extends Character {
    constructor() {
        super(0, 0, GetSprite("Elder"));
    }
    GetDialog() {
        super.GetDialog();
        switch (Scene.Current.GetByType(Elder)[0].GetCompletedQuestsCount()) {
            case 0:
                return {
                    Messages: ["Стой!\nКто идёт?\nПроход закрыт!\nПриблизишься на шаг - стреляем!"],
                    Voices: [GetSound("Dialog_11_0")],
                    Owner: this,
                    OwnerFirst: true,
                };
            case 1:
                return {
                    Messages: [
                        "Стой!\nКто идёт?\nПроход закрыт!\nПриблизишься на шаг - стреляем!",
                        "Я от Старосты!\nОн должен был передать.",
                        "А, ну проходи, только быстро!\nЧтобы никто не увидел.",
                    ],
                    Voices: [GetSound("Dialog_11_0"), GetSound("Dialog_11_1"), GetSound("Dialog_11_2")],
                    Owner: this,
                    OwnerFirst: true,
                };
        }
    }
    GetName() {
        return "Охранник";
    }
}
//# sourceMappingURL=FakeEndGuard.js.map