import JTAdvanceSkinnable from "./base/JTAdvanceSkinnable";
import JTRenderMode from "../JTRenderMode";
import JTLineRender from "../JTLineRender";
import JTLineScrollerGroup from "../../extensions/JTLineScrollerGroup";

/*
* name;线的数字按钮皮肤扩展器
*/
export default class JTSkinnableLineButtonRender extends JTAdvanceSkinnable 
{
    public imgNodes:any[] = null;
    constructor()
    {
        super();
        this.imgNodes = [];
    }   

    /**
     * 创建完成
     * @param bounds 
     */
    public createComplete(data?:any):void
    {
        let lineRender:JTLineRender = this._owner as JTLineRender;
        let scroller:JTLineScrollerGroup = lineRender.scroller;
        /**
         * laya修改cocos
         */
        let component:cc.Node = scroller.buttonsComponent;
        if(!component)return;
        let lineId:number = lineRender.lineId;
        // let btn_number:cc.Component = component.getChildByName("img_" + lineId).getComponent("Button");
        let img_number:cc.Node = component.getChildByName("img_" + lineId);
        for (let i = 0; i < img_number.children.length; i++) {
            this.imgNodes.push(img_number.children[i]);
            img_number.children[i].children[1].active = false;//[1]是中奖状态，初始隐藏
        }
        lineRender.skinnables.push(this);
    }

    /**
     * 获取渲染器模式
     */
    public getRenderMode():number
    {
        return JTRenderMode.MODE_QUALITY_PRIORITY;
    }
}