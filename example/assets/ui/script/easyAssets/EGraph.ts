import EBase from "./EBase";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EGraph extends EBase {

    @property(cc.Graphics)
    LineGraph: cc.Graphics = null;

    public callback: () => string | void | number;
    positions:any[]=[];
    _x = 100;
    _y = 18;
    _points = 10;
    _limit = 60;


    updateData(data:number){
        const length = this.positions.length;
        if(length>= this._points){
            this.positions.shift()
        }
        this.positions.push(data);
        this.drawLine();
    }

    init(name: string, cb?: () => string | void | number,limit=60,points= 10) {
        this.node.name = name;
        this.NameLable.string = name;
        cb && (this.callback = cb);
        const size = this.LineGraph.node.getContentSize();
        this._x = size.width;
        this._y = size.height*0.85;
        this._limit = limit;
        this._points = Math.max(Math.floor(points),3);
    }

    drawLine(){
        const length = this.positions.length;
        if(length<2) return;
        this.LineGraph.clear();
        const x = this._x*0.5;
        const y = this._y*0.5;
        const height = this._y;
        const offset = this._x/(this._points-1); 
        for(var i=0;i<length;i++){
            const scale = Math.min(this.positions[i]/this._limit,1.05);
            const _y = height *scale-y;
            const _x = i*offset-x;
            if(i==0){
                this.LineGraph.moveTo(_x, _y);
            }else{

                this.LineGraph.lineTo(_x, _y);
            }
        }
        this.LineGraph.stroke();
    }

    onEnable(): void {
        super.onEnable();
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    onDisable(): void {
        super.onDisable();
        this.node.off(cc.Node.EventType.TOUCH_END, this.onClick, this);
    }

    onClick() {
        if (!this.callback) return;
        const result = this.callback();
        if (result) {
            this.NameLable.string = String(result) || this.NameLable.string;
        }
    }
}