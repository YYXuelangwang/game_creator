
const {ccclass, property} = cc._decorator;

//跑马灯运行方向
enum MarqDirection{
    LEFT_RIGHT = 1,
    BOTTOM_TOP = 2,
    RIGHT_LEFT = 3,
    TOP_BOTTOM = 4
}

/**
 * 跑马灯参数
 */
 interface IMarqueenOption{
    // duration?: number;        //从 起点/终点 到中心的时间 单位：秒
    // waitDuration?: number;        //停在中间展示的时间
    // repeat?: number;          //重复次数， 默认-1为无线循环
    direction?: MarqDirection;           //跑马灯方向
    callBackBefore?: Function;          //位移前回调
    callBackLater?: Function;            //位移后回调
}

@ccclass
export default class Marqueen extends cc.Component {

    @property({type: cc.Node, tooltip: '跑马灯遮罩 默认为this.node.parent'})
    mask: cc.Node = null;

    @property({type: cc.Node, tooltip: '要移动的节点 默认为this.node'})
    target: cc.Node = null;

    @property({type: cc.Enum(MarqDirection), tooltip: '跑马灯方向'})
    direction: MarqDirection = MarqDirection.BOTTOM_TOP;

    @property({tooltip: '从 起点/终点 到中心的时间 单位：秒'})
    duration: number = 1;

    @property({tooltip: '停在中间展示的时间'})
    waitDuration: number = 2;

    @property({tooltip: '重复次数， 默认-1为无线循环'})
    repeat: number = -1;


    callBackBefore: Function = null;    //单次缓动前回调
    callBackLater: Function = null;    //单次缓动后回调
    
    private startPos: cc.Vec3 = cc.v3(0, 0, 0);  //运动起始点
    private endPos: cc.Vec3 = cc.v3(0, 0, 0);    //运动终点
    private tween: cc.Tween = null;     //缓动对象

    onLoad(){
        this.mask = this.mask || this.node.parent;
        this.target = this.target || this.node;
        this.tween = this.createTween();
    }

    onEnable(){
        this.startMarqueen();
    }

    onDisable(){
        this.stopMarqueen();
    }

    /**
     * 开始运行
     */
     startMarqueen(){
        this.tween && this.tween.start();
    }
    
    stopMarqueen(){
        this.tween && this.tween.stop();
    }

    /**
     * 重新设置相关参数
     * @param option 参数选项
     */
    setParams(option: IMarqueenOption){
        if(option.direction !== undefined) this.direction = option.direction;
        if(option.callBackBefore) this.callBackBefore = option.callBackBefore;
        if(option.callBackLater) this.callBackLater = option.callBackLater;
    }

    //初始化运动起始点,如果回调中可能影响相关尺寸 需要更新起始位置
    private updatePosition(){
        let diffX = this.mask.width / 2 + this.target.width / 2,
            diffY = this.mask.height / 2 + this.target.height / 2;
        switch(this.direction){
            case MarqDirection.LEFT_RIGHT:
                this.startPos.x = -diffX;
                this.endPos.x = diffX;
            break;
            case MarqDirection.BOTTOM_TOP:
                this.startPos.y = -diffY;
                this.endPos.y = diffY;
            break;
            case MarqDirection.RIGHT_LEFT:
                this.startPos.x = diffX;
                this.endPos.x = -diffX;
            break;
            case MarqDirection.TOP_BOTTOM:
                this.startPos.y = diffY;
                this.endPos.y = -diffY;
            break;
        }
    }
    
    //生成缓动对象
    private createTween(): cc.Tween{
        let tween: cc.Tween;
        let tw = cc.tween(this.target)
        .call(this.cbBefore.bind(this))
        .set({position: this.startPos})
        .to(this.duration, {x: 0, y: 0})
        .delay(this.waitDuration)
        .to(this.duration, {position: this.endPos})
        .set({position: this.endPos})
        .call(this.cbLater.bind(this))
        tween = this.repeat < 0 ? cc.tween(this.target).repeatForever(tw) : cc.tween(this.target).repeat(this.repeat, tw);
        return tween;
    }

    private cbBefore(){
        this.updatePosition();
        this.callBackBefore && this.callBackBefore()
    }

    private cbLater(){
        this.callBackLater && this.callBackLater()
    }
    

}
