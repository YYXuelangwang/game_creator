import JTScrollerGroup from "../com/JTScrollerGroup";
import SpinManager from "../../SlotManager/SpinManager";
import { SlotOrientation } from "../../SlotDefinitions/SlotEnum";
import { GData } from "../../../../common/utils/GData";
import { GameEventNames } from "../../SlotConfigs/GameEventNames";

/*
* name;带鼠标键盘控制的滚轴组-以后可以扩展成插件形式
*/
export default class JTControlScrollerGroup extends JTScrollerGroup {
    /**
     * 发送回调
     */
    protected _sendCall: Function = null;
    /**
     * 停止回调
     */
    protected _stopCall: Function = null;
    /**
     * 是否鼠标按下
     */
    public _isMouseDown: boolean = false;
    /**
     * 起始坐标点
     */
    public startPoint: cc.Vec2 = new cc.Vec2();

    private polygon:cc.Vec2[] = [];
    constructor() {
        super();
    }
    
    /**
     * 设置遮罩多边形
     * @param points 
     */
    public setupMaskPolygon(points:cc.Vec2[]):void{
        this.polygon = points;
    }

    get maskPolygon():cc.Vec2[]{
        return this.polygon;
    }

    /**
     * 注册鼠标控制函数
     * @param stopCall 滚轴停止的函数
     * @param sendCall 滚轴运行的函数
     */
    public registerControl(stopCall: Function, sendCall: Function, clckRect: cc.Node): void {
        if (!this._stopCall && stopCall) {
            this._stopCall = stopCall;
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, (event) => {
                this.onKeypressHandler(event);
            });

        }
        if (!this._sendCall && sendCall) {
            this._sendCall = sendCall;
            clckRect = this._scrollerGroupMask;
            if (clckRect) {
                clckRect.on(cc.Node.EventType.TOUCH_START, this.onMouseDownHandler, this);
                clckRect.on(cc.Node.EventType.TOUCH_END, this.onMouseUpHandler, this);
            }
            else {
                this.on(cc.Node.EventType.MOUSE_DOWN, this.onMouseDownHandler, this);
            }
        }
    }

    /**
     * 鼠标弹起函数
     * @param e 
     */
    public onMouseUpHandler(e: cc.Event.EventTouch): void {

        if (!SpinManager.instance.spinTouchEnable) {
            return;
        }

        if(!this.checkTouchPolygon(e)){
            return;
        }

        if (!this._isMouseDown) {
            return;
        }
        if(!this.enabled){
            return;
        }
        if(this.config.orientation == SlotOrientation.Portrait){
            if (e.getLocationY() > this.startPoint.y)//cocosevent
            {
                this.direction = JTScrollerGroup.SCROLLINGUP;
            }
            else if (e.getLocationY() < this.startPoint.y) {
                this.direction = JTScrollerGroup.SCROLLINGDOWN;
            }
            else {
                if (!this.isRunning) {
                    this._isMouseDown = false;
                    return;
                }
            }
        }else{
            if (e.getLocationX() > this.startPoint.x)//cocosevent
            {
                this.direction = JTScrollerGroup.SCROLLINGRIGHT;
            }
            else if (e.getLocationX() < this.startPoint.x) {
                this.direction = JTScrollerGroup.SCROLLINGLEFT;
            }
            else {
                if (!this.isRunning) {
                    this._isMouseDown = false;
                    return;
                }
            }     
        }

        this._isMouseDown = false;
        if (this.isRunning) {
            this.onMouseClickHandler(e);
            return;
        }
        this._sendCall && this._sendCall.apply(this.caller, [null]);
        e.stopPropagation();
    }


    /**
     * 鼠标按下
     * @param e 
     */
    public onMouseDownHandler(e: cc.Event.EventTouch): void {
        if (!SpinManager.instance.spinTouchEnable) {
            return;
        }
        if(!this.enabled){
            return;
        }
        if(!this.checkTouchPolygon(e)){
            return;
        }
        this._isMouseDown = true;
        this.startPoint = new cc.Vec2(e.getLocationX(), e.getLocationY());//cocosevent
        e.stopPropagation();
    }

    /**
     * 鼠标单击的函数
     * @param e 
     */
    public onMouseClickHandler(e: cc.Event.EventTouch): void {

        if (!SpinManager.instance.spinTouchEnable) {
            return;
        }

        if(!this.enabled){
            return;
        }

        if (this._isMouseDown || !this.isRunning) return;
        this._isMouseDown = false;
        this._stopCall && this._stopCall.apply(this.caller, [null]);
        e.stopPropagation();
    }

    /**
     * 键盘按下函数
     * @param e 
     */
    public onKeypressHandler(e: cc.Event.EventKeyboard): void {
        //部分弹框弹出时 禁用键盘事件
        let style = GData.getParameter('main').style;//系列1，2，3的配置
        if(style == 1){//如果是9罐黄金系列1的项目，就把空格键屏蔽掉---6.9liuting
            return;
        }
        if (game.UIManager.getInstance().preventKeyboard) return;
        if (!SpinManager.instance.spinTouchEnable) {
            return;
        }
        if(!this.enabled){
            return;
        }
        console.log("on key press");
        if (e.keyCode != cc.macro.KEY.space) {
            return;
        }
        game.EventManager.getInstance().raiseEvent(GameEventNames.EVENT_MOUSE_DOWN_ROLLER)
        // if (!this.isRunning) {
        //     this._sendCall && this._sendCall.apply(this.caller, [null]);
        // }
        // else {
        //     this._stopCall && this._stopCall.apply(this.caller, [null]);
        // }
    }

    public checkTouchPolygon(e: cc.Event.EventTouch):boolean{
        if(!this.polygon||this.polygon.length==0){
            return true;
        }

        let touchLocation = e.getLocation();
        let target = e.getCurrentTarget();
        let pos = target.convertToNodeSpaceAR(touchLocation);
        let hit = cc.Intersection.pointInPolygon(pos,this.polygon);
        return hit;
    }
}