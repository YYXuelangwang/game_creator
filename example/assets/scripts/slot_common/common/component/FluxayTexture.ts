const { ccclass, property } = cc._decorator;

@ccclass
export default class FluxayTexture extends cc.Component {

    private _speed: number = 1;
    private _time: number = 0;
    private _material: cc.Material;

    onLoad() {
        // 获取材质
        this._material = this.node.getComponent(cc.Sprite).getMaterial(0);
    }

    update(dt) {
        if (this._time > 2) {
            this._time = 0;
        }

        this._material.setProperty("u_time", this._time);
        this._time += dt * this._speed;
    }
}