import { Scene } from "../../Scene.js";
import { Interactable } from "../GameObject.js";
export class Character extends Interactable {
    _completedQuests = 0;
    _isTalked = false;
    GetDialog() {
        this._isTalked = true;
        return;
    }
    IsTalked() {
        return this._isTalked;
    }
    GetInteractives() {
        return ["говорить"];
    }
    OnInteractSelected(id) {
        switch (id) {
            case 0:
                Scene.Player.SpeakWith(this);
                break;
        }
    }
    GetCompletedQuestsCount() {
        return this._completedQuests;
    }
    GetName() {
        return "НЕКТО";
    }
}
//# sourceMappingURL=Character.js.map