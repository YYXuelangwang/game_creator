import { GData } from "./GData";

const { ccclass, property } = cc._decorator;

/**实现播放替换贴图的骨骼动画效果 */
@ccclass
export default class ReplaceSkeletonTex {

    /**
     * 替换骨骼新贴图并播放
     * @param sk 要替换的骨骼
     * @param url 新贴图路径
     * @param aniName 待播放的骨骼动画
     * @param loop 是否循环
     * @param bundle 新贴图所在bundle的名
     */
    public static replaceNewAniTex(sk: sp.Skeleton, url: string, aniName: string, loop: boolean, bundle = GData.bundleName) {
        sk.enabled = false;
        sk.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.REALTIME);
        let usekey = "@Property" + game.ResLoader.getInstance().nextUseKey();
        game.ResLoader.getInstance().loadRes(url, cc.Texture2D, null, (err, asset: any) => {
            if (!err) {
                let arr = url.split('/');
                asset.name = arr[arr.length - 1];
                this.changeSkin(sk, asset);
            }
            sk.setAnimation(0, aniName, loop);
            sk.enabled = true;
        }, bundle, usekey);
    }
    /**
     * 用外部图片换装(原理：替换骨骼的skin和slots的贴图)
     * @param sk   骨骼动画
     * @param texture   外部图片(替换骨骼里对应的同名贴图)
     */
    public static changeSkin(sk: sp.Skeleton, texture: cc.Texture2D) {
        //替换掉skin里面的多语言贴图
        if (sk["attachUtil"]._skeleton.skin) {
            for (const iterator of sk["attachUtil"]._skeleton.skin.attachments) {
                for (const key in iterator) {
                    let att: sp.spine.RegionAttachment = iterator[key];
                    this.updateRegion(att, texture);
                }
            }
        }
        //替换掉slot里面的多语言贴图
        if (sk["attachUtil"]._skeleton.slots) {
            for (let index = 0; index < sk["attachUtil"]._skeleton.slots.length; index++) {
                const slot: sp.spine.Slot = sk["attachUtil"]._skeleton.slots[index];
                //获取挂件
                let att: sp.spine.RegionAttachment = slot.getAttachment() as sp.spine.RegionAttachment;
                this.updateRegion(att, texture);
            }
        }
    }

    /**  
     * @param att  需要替换的RegionAttachment
     * @param texture   外部图片
     */
    private static updateRegion(att: sp.spine.RegionAttachment, texture: cc.Texture2D) {
        if (att instanceof sp.spine.RegionAttachment) {
            if (att.region["page"].name.split('.')[0] === texture.name) {
                //创建region
                let skeletonTexture = new sp.SkeletonTexture();
                skeletonTexture.setRealTexture(texture);
                let page = new sp.spine.TextureAtlasPage();
                page.name = texture.name;
                page.uWrap = sp.spine.TextureWrap.ClampToEdge;
                page.vWrap = sp.spine.TextureWrap.ClampToEdge;
                page.texture = skeletonTexture;
                page.texture.setWraps(page.uWrap, page.vWrap);
                page.width = texture.width;
                page.height = texture.height;

                //创建region
                let region = new sp.spine.TextureAtlasRegion();
                region.page = page;
                region.width = texture.width;
                region.height = texture.height;
                region.originalWidth = texture.width;
                region.originalHeight = texture.height;

                region.rotate = att.region.rotate;
                region.u = att.region.u;
                region.v = att.region.v;
                region.u2 = att.region.u2;
                region.v2 = att.region.v2;
                region.texture = skeletonTexture;
                //替换region
                att.region = region;
                att.setRegion(region);
                att.updateOffset();
            }
        }
    }
}
