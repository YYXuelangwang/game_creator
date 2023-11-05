const { ccclass, property } = cc._decorator;

@ccclass
export default class TimeScale extends cc.Component {
    static scale = 1
    start () {
        // if (cc.director["tick"]) {
        //     const originalTick = cc.director.tick;
        //     cc.director.tick = (dt: number) => {
        //         dt *= TimeScale.scale;
        //         originalTick.call(director, dt);
        //     }
        // }else{
            //@ts-ignore
            const originalMainLoop = cc.director.mainLoop;
            //@ts-ignore
            cc.director.mainLoop = (dt:number, updateAnimate) => {
                dt *= TimeScale.scale;
                originalMainLoop.call(cc.director, dt, updateAnimate);
            }
        // }
    }
}