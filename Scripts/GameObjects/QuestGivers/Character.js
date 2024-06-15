import { Scene } from "../../Scene.js";
import { Interactable } from "../../Utilites.js";
export class Character extends Interactable {
    GetDialog() {
        return;
    }
    static IsTalked() {
        return false;
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
}
