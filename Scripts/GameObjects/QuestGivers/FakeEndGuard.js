import { GetSprite } from "../../Game.js";
import { Scene } from "../../Scene.js";
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
                    Messages: ["Стой, кто идет? Проход закрыт.\nПриблизишься на шаг - стреляем."],
                    Owner: this,
                    OwnerFirst: true,
                };
            case 1:
                return {
                    Messages: [
                        "Стой, кто идет? Проход закрыт.\nПриблизишься на шаг - стреляем.",
                        "Я от Старосты, он должен был передать.",
                        "А ну проходи, только быстро, чтобы никто не\nвидел.",
                    ],
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