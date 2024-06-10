import { EnemyType } from "../../Enums.js";
import { KillTask, Quest } from "../../Quest.js";
import { GameObject } from "../../Utilites.js";
import { Morshu } from "./Morshu.js";
export class Character extends GameObject {
    _dialogLength = -1;
    _dialogState = 0;
    Talk() {
        return "Янемой";
    }
    Continue() {
        this._dialogState++;
        if (this._dialogState > this._dialogLength) {
            this._dialogState = null;
            return new Quest("Убить боба", Morshu, new KillTask(EnemyType.Green, 1));
        }
        return true;
    }
}
