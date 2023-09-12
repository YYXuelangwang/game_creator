import JTLayerSortContainer from "./JTLayerSortContainer";
import JTItemSkinLoader from "../com/base/JTItemSkinLoader";
import JTControlScrollerGroup from "../extensions/JTControlScrollerGroup";

/*
* 带遮罩的元素容器
*/
export default class JTLayerSortMaskContainer extends JTLayerSortContainer
{
    private mask:cc.Mask = null;
    constructor()
    {
        super();
        this.mask = this.addComponent(cc.Mask);
        this.anchorX = 0;
        this.anchorY = 1;
    }

    /**
     * 更新改变子显示对象列表层级
     * @param childs 显示对象列表 
     * @param isUpdate 是否马上更新
     */
    public updateChangedChildsLayer(childs:JTItemSkinLoader[], isUpdate:boolean = false):void
    {
            super.updateChangedChildsLayer(childs, isUpdate);
            this.mask.enabled = true
    }

    /**
     * 设置排序层级的遮罩的宽高
     */
    public setupMask(width:number,height:number):void
    {
        let scroller:JTControlScrollerGroup = this.owner as JTControlScrollerGroup;
        
        if(scroller.maskPolygon&&scroller.maskPolygon.length>3){
            this.drawPolygon();
        }else{
            this.width = width;
            this.height= height;
        }
    }

    public drawPolygon():void{
        let mask = this.getComponent(cc.Mask);
        let points = (this.owner as JTControlScrollerGroup).maskPolygon;
        //@ts-ignore
        mask._updateGraphics = () => {
            //@ts-ignore
            let graphics = mask._graphics as cc.Graphics;
            if(!graphics){
                return;
            }
            graphics.clear();
            for (let i: number = 0; i < points.length; i++) {
                let p: cc.Vec2 = points[i];
                if (i == 0) {
                    graphics.moveTo(p.x, p.y);
                }
                else {
                    graphics.lineTo(p.x, p.y);
                }
            }
            graphics.close();
            if (cc.game.renderType === cc.game.RENDER_TYPE_CANVAS) {
                graphics.stroke();
            }
            else {
                graphics.fill();
            }
        }
        //@ts-ignore
        mask._updateGraphics();

    }

   /**
     * 恢复默认层级排序
     */
    public resetLayerSort():void
    {
         super.resetLayerSort();
         this.mask.enabled = false;

    }
}