import { EnemyType } from "./Enums.js";
import { Scene } from "./Scene.js";
export class Quest {
    Title;
    Giver;
    Tasks;
    constructor(Title, Giver, ...Tasks) {
        this.Title = Title;
        this.Giver = Giver;
        this.Tasks = Tasks;
    }
    OnKilled(type) {
        for (const task of this.Tasks)
            if (task instanceof KillTask && task.EnemyType === type)
                task.Count();
    }
    IsCompleted() {
        return this.Tasks.every((x) => x.IsCompleted());
    }
}
class Task {
}
export class KillTask extends Task {
    EnemyType;
    _last;
    constructor(enemyType, last) {
        super();
        this.EnemyType = enemyType;
        this._last = last;
    }
    Count() {
        this._last--;
        return this._last <= 0;
    }
    IsCompleted() {
        return this._last <= 0;
    }
    toString() {
        return `Убей ${this._last} ${EnemyType[this.EnemyType]}`;
    }
}
export class HasItemTask extends Task {
    NeededItems;
    constructor(...items) {
        super();
        this.NeededItems = items;
    }
    IsCompleted() {
        const playerItems = Scene.Current.Player.GetItems();
        var has = true;
        for (const item of this.NeededItems) {
            if (playerItems.some((x) => x instanceof item) === false) {
                has = false;
                break;
            }
        }
        return has;
    }
    toString() {
        return this.IsCompleted() ? "Возвращайся к Моршу" : `Получи ${this.NeededItems.join(", ")}`;
    }
}
export class PickupBackpackTask extends Task {
    IsCompleted() {
        return Scene.Current.Player.HasBackpack;
    }
    toString() {
        return this.IsCompleted() ? "Отдай рюкзак Моршу" : "Подбери рюкзак";
    }
}
export class TalkTask extends Task {
    _with;
    constructor(With) {
        super();
        this._with = With;
    }
    IsCompleted() {
        return this._with.IsTalked();
    }
    toString() {
        return this.IsCompleted() ? "Меня не должно быть видно" : "Поговори с Моршу";
    }
}
