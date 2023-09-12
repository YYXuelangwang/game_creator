/*
 * @Date: 2022-06-01 16:01:20
 * @LastEditors: qtdog
 * @LastEditTime: 2022-06-01 16:59:00
 * @FilePath: \slot\assets\slot\slot_common\common\utils\Property.ts
 */
import { GData } from "./GData";

export class Property {


    /**
     * 设置精灵资源图片和属性
     * @param spr 渲染精灵
     * @param data 属性数据{atlas:"",spriteFrame:""}
     * @param bundleName 
     */
    public static setSpriteProperty(spr: cc.Sprite, data: any, bundleName?: string, complete?: Function): void {
        if (!bundleName) {
            bundleName = GData.bundleName;
        }
        if (!data) {
            return;
        }
        let usekey = "@Property" + game.ResLoader.getInstance().nextUseKey();
        if (data.atlas) {
            game.ResLoader.getInstance().loadRes(data.atlas, cc.SpriteAtlas, null, (err, atlas: cc.SpriteAtlas) => {
                if (!err) {
                    spr.spriteFrame = atlas.getSpriteFrame(data.spriteFrame);
                    if (complete) complete.call(this, spr);
                } else {
                    return err;
                }
            }, bundleName, usekey);

        }
        else if (data.spriteFrame) {
            game.ResLoader.getInstance().loadRes(data.spriteFrame, cc.SpriteFrame, (err, sprFrame: cc.SpriteFrame) => {
                if (!err) {
                    spr.spriteFrame = sprFrame;
                    if (complete) complete.call(this, spr);
                } else {
                    return err;
                }
            }, bundleName, usekey);
        }
    }

    /**
     * 设置文本属性
     * @param label 文本
     * @param data 属性数据
     */
    public static setLabelProperty(label: cc.Label, data: any): void {
        if (!data) {
            return;
        }

        for (var key in data) {
            if (key == "font") {
                cc.loader.loadRes(data[key], cc.BitmapFont, (err: any, bitFont: cc.BitmapFont) => {
                    label.font = bitFont;
                })
            } else {
                if (label[key] != undefined) {
                    label[key] = data[key];
                }
            }

        }
    }


    /**
     * 设置骨骼资源和属性
     * @param sk Spine动画
     * @param data 属性数据 {json: string}
     * @param bundleName 
     */
     public static setSpProperty(sk: sp.Skeleton, data: { json: string }, bundleName?: string, complete?: (sk: sp.Skeleton) => void): void {
        if (!bundleName) {
            bundleName = GData.bundleName;
        }
        if (!data) {
            return;
        }
        let usekey = "@Property" + game.ResLoader.getInstance().nextUseKey();
        game.ResLoader.getInstance().loadRes(data.json, sp.SkeletonData, null, (err, json: any) => {
            if (!err) {
                sk.skeletonData = json;
                complete && complete(sk);
            } else {
                complete && complete(null);
            }
        }, bundleName, usekey);
    }
}
