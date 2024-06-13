import { LoadImage } from "../../Utilites.js";
export class Item {
}
export class Vodka extends Item {
    Icon = LoadImage("Images/Items/Vodka.png");
    static toString() {
        return "Водка";
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
