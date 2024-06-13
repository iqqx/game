import { GameObject } from "../../Utilites.js";
export class Character extends GameObject {
    _dialogLength = -1;
    _dialogState = 0;
    GetDialog() {
        return;
    }
    static IsTalked() {
        return false;
    }
}
