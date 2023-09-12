import { SDictionary } from "../../../SlotData/SDictionary";

/*
* name;
*/
export default class JTFactoryManager
{
    private factoryMap:SDictionary = null;
    constructor()
    {
        this.factoryMap = new SDictionary();
    }
}