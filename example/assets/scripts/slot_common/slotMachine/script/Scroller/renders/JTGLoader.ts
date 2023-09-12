import { GData } from "../../../../common/utils/GData";
import SlotGameManager from "../../SlotManager/SlotGameManager";

/**
 * 资源类型
 */
export enum JTGLoaderAssetType {
    /**
     *图片
     */
    SpriteFrame,
    /**
     * 序列帧
     */
    Clip,
    /**
     * 骨骼
     */
    Skeleton,
    /**
     * 龙骨
     */
    DragonBones
}

/**
 * 图片参数
 */
export interface JTGLoaderSpriteFrameParam {
    /**
     * 图片地址(如果是图集中的图，配合“SpriteAtlasUrl”使用，填图集下精灵图片名;否则填图片路径)
     */
    spriteFrameUrl: string,
    /**
     * 图集地址
     */
    SpriteAtlasUrl: string
}

export interface JTGLoaderClipParam {
    /** 图集地址 */
    SpriteAtlasUrl: string | string[],
    /**  动画的帧速率。 */
    sample: number,
    /**   动画的播放速度。 */
    speed: number,
    clipName: string,
    /**缩放大小 */
    scale: number
}

export interface JTGLoaderSkeletonParam {
    /**
    * 骨骼地址
    */
    url: string,
    /**
     * 预乘
     */
    premultipliedAlpha: boolean,
    /**
     * 默认皮肤名
     */
    defaultSkinName?: string,
    /**
     * 默认动作名
     */
    defautAniName: string | string[],
    /** 渲染模式(0:实时渲染；  1：共享缓存；  2：私有缓存)*/
    animationCacheMode: number;
}

export interface JTGLoaderDragonBonesParam {
    /**
    * 数据地址
    */
    assetUrl: string,
    /**
     * 图片地址
     */
    atlasAssetUrl: string,
    /**
     * armature名
     */
    armature,
    /**
     * 动作名
     */
    animation,
    /**
     * 预乘
     */
    premultipliedAlpha: boolean,

}

export interface JTGLoaderParam {
    assetType: JTGLoaderAssetType,
    sprite: JTGLoaderSpriteFrameParam,
    clip: JTGLoaderClipParam,
    skeleton: JTGLoaderSkeletonParam,
    dragonBones: JTGLoaderDragonBonesParam,
    /**加载完成的回调 */
    finishLoadCallback?: Function,
    /**加载完成的回调 */
    playCallback?: Function
    /**动作是否循环播放（为空默认是：循环） */
    loop: boolean,
}
/*
* name;
*/
export default class JTGLoader extends cc.Node {
    private _url: string;  //资源地址
    private _container1: cc.Node;  //图片资源节点
    private _container2: cc.Node;  //帧动画资源节点
    private _container3: cc.Node;  //spin动画资源节点
    private _container4: cc.Node;  //龙骨动画资源节点


    private _containerMask: cc.Node; //格子遮罩层;

    private _content1: cc.Sprite;  //图片组件
    private _content2: cc.Animation;  //帧动画组件
    private _content3: sp.Skeleton;  //spin动画组件
    private _content4: dragonBones.ArmatureDisplay;

    private _contentMask: cc.Sprite;

    private _clipName: string;  //动画文件
    private _clip: cc.AnimationClip; // 动画帧
    private _playing: boolean;  //是否播放动画
    private _touchable: boolean;  //触摸状态
    private _resType: resType;   //资源类型
    /**如果为数组形式，表示多个动作叠加表现 */
    private _aniName: string | string[];//sk动作名
    private useKey: string;
    private ccType: any = null;
    private isShowAni: boolean = false;
    private _playTaskCall: Function = null;//自定义播放动画任务
    private preLoadUrl: string = "";
    constructor() {
        super();
        this.name = "GLoader";
        this._playing = true;
        this._touchable = true;
        this._url = "";
        this.isShowAni = false;
        this._container1 = new cc.Node("Image");  //图片节点
        this.addChild(this._container1);

        this._container2 = new cc.Node("Animation");  //动画节点
        this.addChild(this._container2);

        this._container3 = new cc.Node("Skeleton");  //动画节点
        this.addChild(this._container3);

        this._container4 = new cc.Node("dragonBones");  //动画节点
        this.addChild(this._container4);

        this._content4 = this._container4.addComponent(dragonBones.ArmatureDisplay);
        this._content4.premultipliedAlpha = false;

        this._containerMask = new cc.Node("Mask");

        this.addChild(this._containerMask);

        this._content1 = this._container1.addComponent(cc.Sprite);  //添加sorite组件

        //添加动画组件，同时必须添加sprite组件
        let sprite = this._container2.addComponent(cc.Sprite);
        sprite.type = cc.Sprite.Type.SIMPLE;
        sprite.sizeMode = cc.Sprite.SizeMode.RAW;
        sprite.trim = false;
        this._content2 = this._container2.addComponent(cc.Animation);

        this._content3 = this._container3.addComponent(sp.Skeleton);
        this._content3.setAnimationCacheMode(sp.Skeleton.AnimationCacheMode.SHARED_CACHE);
        this._content3.premultipliedAlpha = false;

        this._content3.setCompleteListener(() => {
            // console.log("play Skeleton  (" + this._content3.defaultAnimation + ") Complete cb ")
            if (this.param && this.param.playCallback) {
                let playCallback = this.param.playCallback;
                this.param.playCallback = null;
                playCallback();
            }
        });

        this._content2.on("finished", () => {
            // console.log("play clib (" + this._content2.currentClip.name + ") finished cb")
            if (this.param && this.param.playCallback) {
                let playCallback = this.param.playCallback;
                this.param.playCallback = null;
                playCallback();
            }
        })

        this._contentMask = this._containerMask.addComponent(cc.Sprite);
    }

    /**
     * 销毁节点
     */
    public dispose(): void {
        this.removeChild(this._container1);
        this.removeChild(this._container2);
        this.removeChild(this._containerMask);
        this.isShowAni = false;
        this._container1.destroy();
        this._container2.destroy();
        this._containerMask.destroy();
        game.ResLoader.getInstance().releaseAsset(this.ccType, this.useKey);
        if (this.parent) {
            this.parent.removeChild(this);
        }
        this.destroy();
    }

    public set playTaskCall(call: Function) {
        this._playTaskCall = call;
    }

    public get playTaskCall(): Function {
        return this._playTaskCall;
    }

    /**
     * 加载地址，赋值为空时清除资源,骨骼动画固定在cardAni文件夹下，序列帧固定在aniFrame或cardFrame文件夹下
     * 如不放指定路径下，用loadResource()方法并传入指定加载资源的类型
     */
    public get url(): string {
        return this._url;
    }

    private param: JTGLoaderParam = null;
    public setAsset(param: JTGLoaderParam): void {
        let url;
        let ccType;
        this.param = param;
        this._playing = false;
        switch (param.assetType) {
            case JTGLoaderAssetType.Clip:
                url = param.clip.SpriteAtlasUrl;
                ccType = cc.SpriteAtlas;
                this._url = url;
                this.loadRes(ccType);
                break;
            case JTGLoaderAssetType.DragonBones:
                break;
            case JTGLoaderAssetType.Skeleton:
                url = param.skeleton.url;
                ccType = sp.SkeletonData;
                if (url == this._url) {// && this._aniName != param.skeleton.defautAniName) {
                    this._aniName = param.skeleton.defautAniName;
                    if (this.param && this.param.skeleton && this.param.skeleton.defaultSkinName)
                        this.loadRes(ccType);
                    else
                        this.playing = true;
                    return;
                }
                this._aniName = param.skeleton.defautAniName;
                this._url = url;
                this.loadRes(ccType);
                break;
            case JTGLoaderAssetType.SpriteFrame:
                url = param.sprite.spriteFrameUrl;
                ccType = cc.SpriteFrame;
                this._url = url;
                this.loadRes(ccType);
                break;
        }
    }

    public set url(value: string) {
        if (this._url == value) return;
        this._url = value;
        this.maskFade = false;
        if (this._url == null) {
            this.clearContent();
            return;
        }
        this.playing = false;

        this.param = null;

        var [tempUrl, tagging] = value.split("#");
        value = tempUrl;

        var index = value.lastIndexOf("/");
        var name = value.slice(index + 1);
        var sp = SlotGameManager.instance.getCardByName(name);
        if (sp) {           //判断为图片时候 直接取图集资源
            // clearTimeout(this.setTime);
            this._resType = resType.img;
            this._content1.spriteFrame = sp;
            this._contentMask.node.width = sp.getRect().width;
            this._contentMask.node.height = sp.getRect().height;

            this.activeControl(true);
            this.preLoadUrl = this._url;
        } else {            //判断为动画时 
            // clearTimeout(this.setTime);
            this.loadRes();
        }
        this.maskFade = tagging == "fadeMask";
    }

    /**
     * 
     */
    public set spriteTrim(v: boolean) {
        this._content1.trim = v;
        if (v) {
            this._content1.sizeMode = cc.Sprite.SizeMode.TRIMMED;
        } else {
            this._content1.sizeMode = cc.Sprite.SizeMode.RAW
        }
    }

    public get touchable(): boolean {
        return this._touchable;
    }

    public set touchable(value: boolean) {
        if (this._touchable != value) {
            this._touchable = value;
            if (value == true) {
                let block: cc.BlockInputEvents = this.getComponent(cc.BlockInputEvents);
                if (block) {
                    this.removeComponent(block);
                }
            }
            else {
                this.addComponent(cc.BlockInputEvents);
            }
        }
    }

    public get playing(): boolean {
        return this._playing;
    }

    public set playing(value: boolean) {
        //if (this._playing == value) return;
        this._playing = value;
        if (this._resType == resType.frame) {
            if (value == true) {
                this._content2.play(this._clipName);
            }
            else {
                this._content2.stop();
            }
        } else if (this._resType == resType.spine) {
            if (value == true) {
                if (this._content3) {
                    if (this._playTaskCall) {
                        this._playTaskCall.call(this, this._content3);
                    } else {
                        let isLoop = true;
                        if (this._aniName instanceof Array) {
                            if (this.param) {
                                this._content3.setAnimationCacheMode(this.param.skeleton.animationCacheMode);
                                isLoop = this.param.loop == undefined ? true : this.param.loop;
                            }
                            for (let index = 0; index < this._aniName.length; index++) {
                                const element = this._aniName[index];
                                this._content3.setAnimation(index, element, isLoop);
                            }
                        }
                        else {

                            if (this.param) {
                                if (this.param.skeleton && this.param.skeleton.defaultSkinName) {
                                    this._content3.setAnimationCacheMode(this.param.skeleton.animationCacheMode);
                                    this._content3.setSkin(this.param.skeleton.defaultSkinName);
                                }
                                isLoop = this.param.loop == undefined ? true : this.param.loop;
                            }
                            this._content3.setAnimation(0, this._aniName || "animation", isLoop);
                        }
                        let premultipliedAlpha = false;
                        if (this.param && this.param.skeleton && this.param.skeleton.premultipliedAlpha) {
                            premultipliedAlpha = this.param.skeleton.premultipliedAlpha;
                        }
                        this._content3.premultipliedAlpha = premultipliedAlpha;
                    }
                }
            }
            else {
                if (this._content3) {
                    this.playTaskCall = null;
                    if (!this._content3.isAnimationCached()) {
                        this._content3.clearTrack(0);
                    }

                }

            }
        }
    }

    public stop() {
        // this._playing = false;
        // this._content2.stop();
        this.playing = false;
    }

    /**
     * sk动作名
     */
    public set aniName(name: string) {
        this._aniName = name;
    }

    public get clipName(): string {
        return this._clipName;
    }

    public set clipName(name: string) {
        this._clipName = name;
    }

    public get texture(): cc.SpriteFrame {
        return this._content1.spriteFrame;
    }

    public set texture(value: cc.SpriteFrame) {
        this.url = null;

        this._content1.spriteFrame = value;
        this._content1.type = cc.Sprite.Type.SIMPLE;
        this._content1.sizeMode = cc.Sprite.SizeMode.RAW;
    }

    public get spriteNode(): cc.Node {
        return this._container1;
    }

    public get clipNode(): cc.Node {
        return this._container2;
    }

    public get skeletonNode(): cc.Node {
        return this._container3;
    }

    public get maskContaNode(): cc.Node {
        return this._containerMask;
    }


    /**
     * 
     * @param url 加载的url 
     * @param resType 加载资源类型，cc.SpriteAtlas、sp.SkeletonData、cc.SpriteFrame，其中cc.SpriteAtlas为序列帧的图集
     * 
     */
    public loadResource(url: string, resType: typeof cc.Asset): void {

        this.playing = false;
        this._url = url;
        if (this.preLoadUrl == url || url == "") {
            return;
        }
        this.param = null;
        this.preLoadUrl = this._url;
        this.isShowAni = false;
        this.useKey = "@JTGLoader" + game.ResLoader.getInstance().nextUseKey();

        game.ResLoader.getInstance().loadRes(url, resType, (err: Error, comp: cc.Asset) => {
            this.analysisAssetType(comp, url);
        }, GData.bundleName, this.useKey);
    }

    /**
     * load资源
     */
    protected loadRes(assetType?: cc.Asset): void {
        if (!this._url) return;
        if (!assetType) {
            this.ccType = null;
            if (this._url.indexOf("cardAni") != -1) //骨骼动画固定装cardAni文件夹
                this.ccType = sp.SkeletonData;
            else if (this._url.indexOf("cardFrame") != -1 || this._url.indexOf("aniFrame") != -1) //帧动画固定装cardFrame文件夹
                this.ccType = cc.SpriteAtlas;
            else
                this.ccType = cc.SpriteFrame;
        } else
            this.ccType = assetType;

        this.useKey = "@JTGLoader" + game.ResLoader.getInstance().nextUseKey();
        this.isShowAni = false;

        if (this.preLoadUrl == this._url)
            return;
        this.preLoadUrl = this._url;
        let url = this._url;
        game.ResLoader.getInstance().loadRes(url, this.ccType, (err: Error, comp: cc.Asset) => {
            this.playing = false;
            this.analysisAssetType(comp, url);
        }, GData.bundleName, this.useKey);
    }

    /**
     * 解析加载的资源是图片还是帧动画
     * @param component 返回的资源
     */
    private analysisAssetType(component: any, url: string): void {
        if (this._url == "" || this.url == null)  //url被清空说明在加载的时候该节点的有效期已经过去
            return;

        if (url != this.url)
            return;

        if (component) {
            this.clearContent();
            if (component instanceof cc.SpriteFrame) {//cc.Texture2D) {
                this._content1.spriteFrame = component;//new cc.SpriteFrame(component);;
                this._resType = resType.img;
                this.activeControl(true);
            }
            else if (component instanceof cc.SpriteAtlas) {
                let index = this._url.lastIndexOf("/");
                let clipName = this._url.slice(index + 1);

                if (this.param && this.param.clip && this.param && this.param.clip.clipName)
                    clipName = this.param.clip.clipName;
                //加载动画图集生成
                let frames: cc.SpriteFrame[] = component.getSpriteFrames();
                let sample = frames.length;
                let speed = 0.5;
                if (this.param && this.param.clip) {
                    if (this.param.clip.sample != undefined)
                        sample = this.param.clip.sample;
                    if (this.param.clip.speed != undefined)
                        speed = this.param.clip.speed;
                }
                this.sorSpriteFrames(frames);
                var clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
                clip.name = clipName;

                if (this.param) {
                    clip.wrapMode = this.param.loop ? cc.WrapMode.Loop : cc.WrapMode.Normal;
                } else
                    clip.wrapMode = cc.WrapMode.Loop;

                //设置设置sample属性没效果 所以注释
                // clip.sample = sample;
                clip.speed = speed;

                this._clip = clip;
                this._content2.addClip(clip);
                this._clipName = clip.name;
                this._resType = resType.frame;
                this.activeControl(false);
                this.playing = true;
                this.isShowAni = true;

            }
            else if (component instanceof sp.SkeletonData) {
                if (this._content3 == null)
                    this._content3 = this._container3.addComponent(sp.Skeleton);
                else
                    this._content3.enabled = true;
                this._content3.skeletonData = component;

                if (this.param && this.param.skeleton && this.param.skeleton.defaultSkinName) {
                    this._content3.setSkin(this.param.skeleton.defaultSkinName);
                    this._content3.loop = this.param.loop;
                }

                this._resType = resType.spine;
                this.activeControl(false);
                this.playing = true;
                this.isShowAni = true;
            } else if (component instanceof Array && component[0] instanceof cc.SpriteAtlas) {
                for (let i = 0; i < this._url.length; i++) {
                    let u = this._url[i];
                    var index = u.lastIndexOf("/");
                    var clipName = u.slice(index + 1);
                    let c = component[i];
                    //加载动画图集生成
                    let frames: cc.SpriteFrame[] = c.getSpriteFrames();
                    let sample = frames.length;
                    let speed = 0.5;
                    //如果参数没有传动画名 默认播放数组为0的动画
                    if (i == 0) {
                        this._clipName = clipName;
                    }
                    if (this.param && this.param.clip) {
                        if (this.param.clip.sample != undefined)
                            sample = this.param.clip.sample;
                        if (this.param.clip.speed != undefined)
                            speed = this.param.clip.speed;
                    }
                    this.sorSpriteFrames(frames);
                    var clip = cc.AnimationClip.createWithSpriteFrames(frames, sample);
                    clip.name = clipName;
                    clip.wrapMode = cc.WrapMode.Loop;   // 默认循环

                    if (this.param && this.param.clip) {
                        sample = this.param.clip.sample;
                        speed = this.param.clip.speed;
                    }
                    if (this.param && this.param.loop === false) {
                        clip.wrapMode = cc.WrapMode.Normal;
                    }
                    //设置设置sample属性没效果 所以注释
                    // clip.sample = sample;
                    clip.speed = speed;

                    this._clip = clip;
                    if (this.param && this.param.clip && this.param.clip.scale) {
                        this._container2.scale = this.param.clip.scale;
                    }
                    this._content2.addClip(clip);
                    this._resType = resType.frame;
                    this.activeControl(false);
                    this.isShowAni = true;
                }
                if (this.param && this.param.clip && this.param.clip.clipName) {
                    this.clipName = this.param.clip.clipName;
                }
                this.playing = true;
            }
            else {
                console.log("error: not SpriteFrame or AnimationClip type!");
            }
            if (this.param && this.param.finishLoadCallback) {
                this.param.finishLoadCallback();
                this.param.finishLoadCallback = null;
            }

        }
        else {
            console.log("error: can not load ant asset!");
        }
    }

    /*按名字中的数字大小排序序列帧图片*/
    private sorSpriteFrames(frames: cc.SpriteFrame[]) {
        frames.sort((aName, bName) => {
            let aNum = Number(aName.name.replace(/[^\d]/g, ""));
            let bNum = Number(bName.name.replace(/[^\d]/g, ""));
            return aNum - bNum;
        })


    }

    /**
     * 节点控制
     * @param visible true显示图片节点，false显示帧动画
     */
    private activeControl(visible: boolean): void {
        this._container1.active = visible;
        this._container2.active = !visible && this._resType == resType.frame;
        this._container3.active = !visible && this._resType == resType.spine;
    }

    /**
     * load资源之前先清空原节点资源
     */
    private clearContent(): void {
        this.preLoadUrl = "";
        this._content1.spriteFrame = null;
        this.maskFade = false;
        // this._content2.stop();
        if (this._clip && this._clip.isValid) {
            this._content2.removeClip(this._clip, true);
            this._clip.destroy();
            this._container2.getComponent(cc.Sprite).spriteFrame = null;
        }

        let tempClips: cc.AnimationClip[] = this._content2.getClips();
        if (tempClips.length > 0) {
            for (let i: number = 0; i < tempClips.length; i++) {
                this._content2.removeClip(tempClips[i], true);

            }
        }
        if (this._content3 && this._content3.skeletonData) {
            this._content3.enabled = false;
            //this._content3.skeletonData = null;
        }
    }

    private set maskFade(flag: boolean) {
        if (flag) {
            this._contentMask.spriteFrame = this._content1.spriteFrame//SlotGameManager.instance.getCardByName("mask");
            this._containerMask.color = cc.Color.BLACK;
            this._containerMask.opacity = 140;
        } else {
            this._contentMask.spriteFrame = null;
        }

        this._containerMask.active = flag;


    }

}

export enum resType {
    img = 0,    //图片
    frame,      //帧动画
    spine,      //骨骼动画
}