import { Scene } from "./Scene.js";
import { GetEnemyTypeName } from "./Utilites.js";
export class Quest {
    Title;
    Giver;
    Tasks = [];
    _afterComplete;
    _completed = false;
    _stage = 1;
    constructor(Title, Giver, afterComplete) {
        this.Title = Title;
        this.Giver = Giver;
        this._afterComplete = afterComplete;
    }
    Update() {
        for (const task of this.Tasks.slice(0, this._stage))
            if (task instanceof MoveTask || task instanceof FakeMoveTask || task instanceof CompletedQuestsTask)
                task.Check();
        if (this.IsCompleted() && !this._completed) {
            this._completed = true;
            if (this._afterComplete !== undefined)
                this._afterComplete();
        }
    }
    InventoryChanged() {
        for (const task of this.Tasks.slice(0, this._stage))
            if (task instanceof HasItemTask)
                task.Check();
        if (this.IsCompleted() && !this._completed) {
            this._completed = true;
            if (this._afterComplete !== undefined)
                this._afterComplete();
        }
    }
    OnTalked(giver) {
        for (const task of this.Tasks.slice(0, this._stage))
            if (task instanceof TalkTask && task.Subject === giver)
                task.Count();
        if (this.IsCompleted() && !this._completed) {
            this._completed = true;
            if (this._afterComplete !== undefined)
                this._afterComplete();
        }
    }
    OnKilled(type) {
        for (const task of this.Tasks)
            if (task instanceof KillTask && task.EnemyType === type)
                task.Count();
        if (this.IsCompleted() && !this._completed) {
            this._completed = true;
            if (this._afterComplete !== undefined)
                this._afterComplete();
        }
    }
    IsCompleted() {
        return this._stage > this.Tasks.length;
    }
    GetTasks() {
        return this.Tasks.slice(0, this._stage);
    }
    AddKillTask(enemyType, count, absolute = false, mask) {
        this.Tasks.push(new KillTask(this, enemyType, count, absolute, () => this._stage++, mask));
        return this;
    }
    AddMoveTask(to, location) {
        this.Tasks.push(new MoveTask(this, () => this._stage++, location, to));
        return this;
    }
    AddFakeMoveTask(to, location, fakeTo) {
        this.Tasks.push(new FakeMoveTask(this, () => this._stage++, location, to, fakeTo));
        return this;
    }
    AddTalkTask(text, subject) {
        this.Tasks.push(new TalkTask(this, () => this._stage++, text, subject));
        return this;
    }
    AddCompletedQuestsTask(text, giver, goal) {
        this.Tasks.push(new CompletedQuestsTask(this, () => this._stage++, giver, goal, text));
        return this;
    }
    AddHasItemsTask(mask, ...items) {
        const currentTasks = this.Tasks.length + 1;
        const task = new HasItemTask(this, () => {
            if (this._stage >= currentTasks)
                this._stage++;
        }, () => (this._stage = currentTasks), mask, items);
        this.Tasks.push(task);
        task.Check();
        return this;
    }
}
class Task {
    _quest;
    _onComplete;
    _completed = false;
    constructor(quest, onComplete) {
        this._quest = quest;
        this._onComplete = onComplete;
    }
    Check() {
        return false;
    }
}
class KillTask extends Task {
    EnemyType;
    _last;
    _mask;
    constructor(quest, enemyType, last, absolute, onComplete, mask) {
        super(quest, onComplete);
        this.EnemyType = enemyType;
        this._last = last;
        this._mask = mask;
    }
    Count() {
        this._last--;
        return this._last <= 0;
    }
    Check() {
        return this._last <= 0;
    }
    toString() {
        return `Убей ${this._last} ${GetEnemyTypeName(this.EnemyType)}`;
    }
}
class TalkTask extends Task {
    _text;
    Subject;
    constructor(quest, onComplete, placeholder, subject) {
        super(quest, onComplete);
        this._text = placeholder;
        this.Subject = subject;
    }
    Check() {
        return this._completed;
    }
    Count() {
        this._completed = true;
        this._onComplete();
    }
    toString() {
        return this._text;
    }
}
class MoveTask extends Task {
    _name;
    _to;
    constructor(quest, onComplete, locationName, to) {
        super(quest, onComplete);
        this._name = locationName;
        this._to = to;
    }
    Check() {
        if (this._completed)
            return true;
        if (Math.abs(Scene.Player.GetCenter().X - this._to) < 500) {
            this._completed = true;
            this._onComplete();
            return true;
        }
    }
    toString() {
        const player = Scene.Player.GetCenter().X;
        const distance = Math.abs(Math.round((player - this._to) * 0.1));
        return this.Check()
            ? "Вы прибыли"
            : `${this._name}: ${distance > 1000 ? (distance / 1000).toFixed(1) : distance} ${distance > 1000 ? "кило" : ""}метров в${player - this._to > 0 ? "лево" : "право"}`;
    }
}
class FakeMoveTask extends Task {
    _name;
    _to;
    _fakeTo;
    constructor(quest, onComplete, locationName, to, fakeTo) {
        super(quest, onComplete);
        this._name = locationName;
        this._to = to;
        this._fakeTo = fakeTo;
    }
    Check() {
        if (this._completed)
            return true;
        if (Math.abs(Scene.Player.GetCenter().X - this._to) < 500) {
            this._completed = true;
            this._onComplete();
            return true;
        }
        return false;
    }
    toString() {
        const player = Scene.Player.GetCenter().X;
        const distance = Math.abs(Math.round((player - this._fakeTo) * 0.1));
        return this._completed
            ? "Вы прибыли"
            : `${this._name}: ${distance > 1000 ? (distance / 1000).toFixed(1) : distance} ${distance > 1000 ? "кило" : ""}метров в${player - this._to > 0 ? "лево" : "право"}`;
    }
}
class HasItemTask extends Task {
    NeededItems;
    _mask;
    _onFail;
    constructor(quest, onComplete, onFail, mask, items) {
        super(quest, onComplete);
        this.NeededItems = items;
        this._mask = mask;
        this._onFail = onFail;
    }
    Check() {
        const m = new Map();
        for (const pitem of Scene.Current.Player.GetItems())
            if (m.has(pitem.constructor.name))
                m.set(pitem.constructor.name, m.get(pitem.constructor.name) + 1);
            else
                m.set(pitem.constructor.name, 1);
        for (const item of this.NeededItems)
            if (m.get(item[0].name) === undefined || m.get(item[0].name) < item[1]) {
                if (this._completed === true)
                    this._onFail();
                this._completed = false;
                return false;
            }
        if (this._completed === false)
            this._onComplete();
        this._completed = true;
        return true;
    }
    toString() {
        return this._mask;
    }
}
class CompletedQuestsTask extends Task {
    _goal;
    _questGiver;
    _mask;
    constructor(quest, onComplete, giver, goal, mask) {
        super(quest, onComplete);
        this._mask = mask;
        this._goal = goal;
        this._questGiver = giver;
    }
    Check() {
        if (!this._completed && this._questGiver.GetCompletedQuestsCount() >= this._goal) {
            this._completed = true;
            this._onComplete();
        }
        return this._completed;
    }
    toString() {
        return this._mask;
    }
}
//# sourceMappingURL=Quest.js.map