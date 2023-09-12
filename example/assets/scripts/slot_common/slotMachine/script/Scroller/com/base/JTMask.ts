import JTProduct from "../../lines/JTProduct";
import JTScrollerGroup from "../JTScrollerGroup";
import JTContainer from "./JTContainer";
import JTGComponent from "./JTGComponent";

export default class JTMask extends JTGComponent {
    public mask: cc.Mask;

    constructor() {
        super();
        this.mask = this.addComponent(cc.Mask);//cocos
    }

    public launch(s: JTScrollerGroup): void {

    }
    public redraw(s: JTScrollerGroup, x: number, y: number, width: number, height: number): void {
        throw new Error("Method not implemented.");
    }
    public changed(s: JTScrollerGroup): void {
        throw new Error("Method not implemented.");
    }

    public clear(): void {
        throw new Error("Method not implemented.");
    }
    public addContainer(child: JTContainer): number {
        throw new Error("Method not implemented.");
    }
    public removeContainerAt(index: number): JTContainer {
        throw new Error("Method not implemented.");
    }
    public removeContainer(child: JTContainer): JTContainer {
        throw new Error("Method not implemented.");
    }
    getContainerByIndex(index: number): JTContainer {
        throw new Error("Method not implemented.");
    }
}