import { LoadImage } from "../../Utilites.js";
import { Weapon } from "../Weapons/Weapon.js";
export class Item {
    static Parse(raw) {
        switch (raw) {
            case "Bread":
                return new Bread();
            case "Vodka":
                return new Vodka();
            case "Sausage":
                return new Sausage();
            case "AidKit":
                return new AidKit();
            case "AK":
            case "Glock":
                return Weapon.Parse(raw);
            case "Radio":
                return new Radio();
            default:
                throw new Error("Предмет не удалось распарсить: " + raw);
        }
    }
}
export class Vodka extends Item {
    Icon = LoadImage("Images/Items/Vodka.png");
    static toString() {
        return "Водка";
    }
}
export class Radio extends Item {
    Icon = LoadImage("Images/Items/Radio.png");
    static toString() {
        return "Радио";
    }
}
export class AidKit extends Item {
    Icon = LoadImage("Images/Items/FirstAid.png");
    static toString() {
        return "Аптека";
    }
}
export class Sausage extends Item {
    Icon = LoadImage("Images/Items/MeatStick.png");
    static toString() {
        return "Колбаса";
    }
}
export class Adrenalin extends Item {
    Icon = LoadImage("Images/Items/Syringe.png");
    static toString() {
        return "Адреналин";
    }
}
export class Bread extends Item {
    Icon = LoadImage("Images/Items/Bread.png");
    static toString() {
        return "Хлеб";
    }
}
