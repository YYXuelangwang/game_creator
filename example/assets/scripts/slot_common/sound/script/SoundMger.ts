import { SOUND_NAME } from "../../common/enum/CommonEnum";
import { GData } from "../../common/utils/GData";
import SlotMachineView from "../../slotMachine/script/MainView/SlotMachineView";

/**
 * 声音管理类,封装了一些播放和暂停的方法函数
 */
export class SoundMger {
    private static _instance: SoundMger;
    //private bundleName: string = "resources";
    private path: string = "sounds/";
    private pathCom: string = "sound/sounds/";
    private path_slot_common: string = "slot_common/sound/sounds/";//
    private local: string = "local";
    static get instance(): SoundMger {
        if (!SoundMger._instance) {
            SoundMger._instance = new SoundMger();
        }
        return SoundMger._instance;
    }

    private effectVolume: number = 85;
    private voiceVolume: number = 100;
    private musicVolume: number = 80;

    get bundleName(): string {
        return GData.bundleName;
    }

    /**
     * 播放音效
     * @param effectName 音效路径，bundle的sounds文件夹下面
     * @param loop 是否循环
     * @param isSpecial (该字段实现逻辑已废弃) 是否特殊音乐（可能捕猎一些长音效） 
     * @param loadfinish 加载完成的回调
     * @param playHandle 播放完成的回调
     * @param volume 原始音量最大值,默认值100（0，100）
     * @returns 
     */
    public playEffect(effectName: string, loop: boolean = false, isSpecial?: boolean, loadfinish?: Function, playHandle?: Function, volume?: number): boolean {
        let canPlay = SlotMachineView.instance && SlotMachineView.instance.gameLayer && SlotMachineView.instance.gameLayer.checkCanPlayEffect();
        if (!effectName || !canPlay)
            return false;
        if (GData.getParameter('sound')[effectName] || (GData.getParameter('sound').Sctter && effectName.search(SOUND_NAME.Sctter) != -1)) {
            if (GData.getParameter('sound')[effectName] == "voice")
                game.SoundManager.getInstance().playEffect(this.path + effectName, loop, this.bundleName, loadfinish, playHandle, volume == null ? this.voiceVolume : volume);
            else
                game.SoundManager.getInstance().playEffect(this.path + effectName, loop, this.bundleName, loadfinish, playHandle, volume == null ? this.effectVolume : volume);
            return true
        }
        return false
    }
    /**
     * 强制播放音效
     * @param effectName 
     * @param loop 
     * @returns 
     */
    public enforcePlayEffect(effectName: string, loop: boolean = false) {
        if (!effectName)
            return;
        if (GData.getParameter('sound')[effectName] || (GData.getParameter('sound').Sctter && effectName.search(SOUND_NAME.Sctter) != -1)) {
            if (GData.getParameter('sound')[effectName] == "voice")
                game.SoundManager.getInstance().playEffect(this.path + effectName, loop, this.bundleName, null, null, this.voiceVolume);
            else
                game.SoundManager.getInstance().playEffect(this.path + effectName, loop, this.bundleName, null, null, this.effectVolume);
        }
    }
    /**
     * 设置指定单个音乐的音量大小
     * @param path 音效路径
     * @param volume 音量大小（值范围：[0,1]，当某个音乐不想被总开关控制，例如需要同步音轨，可以设置成game.SoundManager.IGNORE_VOLUME）
     */
    public setSingleMusicVolume(musicName: string, volume: number): void {
        game.SoundManager.getInstance().setSingleMusicVolume(this.path + musicName, volume);
    }
    /**
     * 设置指定单个音效的音量大小
     * @param path 音效资源名 （在"sounds/"文件夹下）
     * @param volume 音量大小（值范围：[0,1]，当某个音效不想被总开关控制，例如需要同步音轨，可以设置成game.SoundManager.IGNORE_VOLUME）
     */
    public setSingleEffectVolume(effectName: string, volume: number): void {
        game.SoundManager.getInstance().setSingleEffectVolume(this.path + effectName, volume);
    }
    /**
     * 播放公共音效
    * @param effectName — 音效名称，路径存放在sound下sound文件夹下面
    * @param loop — 是否循环
    * @param isSpecial — 是否特殊音乐（可能捕猎一些长音效）
    * @param playHandle — 加载完成的回调
    */
    public playEffectCommon(effectName: string, loop: boolean = false, loadfinish?: Function, playHandle?: Function): void {
        if (!effectName || !GData.getParameter('sound')[effectName])
            return;
        if (GData.getParameter('sound')[effectName] === this.local)
            game.SoundManager.getInstance().playEffect(this.path + effectName, loop, this.bundleName, loadfinish, playHandle);
        else
            game.SoundManager.getInstance().playEffect(this.pathCom + effectName, loop, 'slot', loadfinish, playHandle);
    }

    //播放slot_common里面的音效（翻倍和购买免费）
    public playEffectSlotCommon(effectName: string, loop: boolean = false, loadfinish?: Function, playHandle?: Function): void {
        if (!effectName || !GData.getParameter('sound_slot_common')[effectName])
            return;
        game.SoundManager.getInstance().playEffect(this.path_slot_common + effectName, loop, 'slot', loadfinish, playHandle);
    }
    public stopEffectSlotCommon(effectName: string): void {
        game.SoundManager.getInstance().stopEffect(this.path_slot_common + effectName);
    }

    //播放slot_common里面的音乐（翻倍和购买免费）
    public playMusicSlotCommon(musicName: string, loop: boolean = true, endFunc?: Function, loadFunc?: Function, isStopPrev: boolean = true): void {
        if (!musicName || !GData.getParameter('sound_slot_common')[musicName])
            return;
        let path = this.path_slot_common + musicName;
        game.SoundManager.getInstance().playMusic(path, loop, "slot", endFunc, loadFunc, this.musicVolume, isStopPrev);
    }

    public stopMusicSlotCommon(musicName: string): void {
        if (!musicName || !GData.getParameter('sound_slot_common')[musicName])
            return;
        let path = this.path_slot_common + musicName;
        game.SoundManager.getInstance().stopMusic(path);
    }

    /**
    * 播放背景音乐
    * @param musicName 音乐名称，路径存放在resources下sounds文件夹下面
    * @param loop 是否循环播放
    * @param endFunc 播放结束后的回调 可选
    * @param loadFunc 加载完成的回调  可选
    * @param isStopPrev 是否停止之前的背景音乐（默认停止，只有一个背景音乐）
    */
    public playMusic(musicName: string, loop: boolean = true, endFunc?: Function, loadFunc?: Function, isStopPrev: boolean = true): void {
        if (!musicName) return;
        if (GData.getParameter('sound')[musicName]) {
            let path = this.path + musicName;
            game.SoundManager.getInstance().playMusic(path, loop, this.bundleName, endFunc, loadFunc, this.musicVolume, isStopPrev);
        }
    }

    /**
     * 停止背景音乐 停止后会自动切换之前的bgm
     * @param musicName bgm名称
     */
    public stopMusic(musicName: string): void {
        if (!musicName) return;
        let path = this.path + musicName;
        game.SoundManager.getInstance().stopMusic(path);
    }

    /**
    * 播放背景音乐
    * @param musicName 音乐名称，路径存放在resources下sounds文件夹下面
    * @param loop 是否循环播放
    * @param endFunc 播放结束后的回调 可选
    * @param loadFunc 加载完成的回调  可选
    * @param isStopPrev 是否停止之前的背景音乐（默认停止，只有一个背景音乐）
    */
    public playMusicCommon(musicName: string, loop: boolean = true, endFunc?: Function, loadFunc?: Function, isStopPrev: boolean = true): void {
        if (!musicName) return;
        let path = this.pathCom + musicName;
        game.SoundManager.getInstance().playMusic(path, loop, "slot", endFunc, loadFunc, this.musicVolume, isStopPrev);
    }

    /**
     * 停止背景音乐 停止后会自动切换之前的bgm
     * @param musicName bgm名称
     */
    public stopMusicCommon(musicName: string): void {
        let path = this.pathCom + musicName;
        game.SoundManager.getInstance().stopMusic(path);
    }

    /**
     * 暂停当前背景音乐
     */
    public pauseCurMusic(): void {
        game.SoundManager.getInstance().pauseMusic();
    }

    /**
     * 恢复当前背景音乐
     */
    public resumeCurMusic(): void {
        game.SoundManager.getInstance().resumeMusic();
    }

    /**
    * 暂停背景音乐
    * @param musicName 音乐名称，路径存放在resources下sounds文件夹下面
    */
    public pauseMusic(musicName?: string): void {
        if (musicName)
            game.SoundManager.getInstance().pauseMusic(this.path + musicName);
        else
            game.SoundManager.getInstance().pauseMusic();
    }

    /**
    * 恢复背景音乐
    * @param musicName 音乐名称，路径存放在resources下sounds文件夹下面
    */
    public resumeMusic(musicName?: string): void {
        if (musicName)
            game.SoundManager.getInstance().resumeMusic(this.path + musicName);
        else
            game.SoundManager.getInstance().resumeMusic();
    }

    /**
     * 停止某个音效
     * @param effectName 音效名称，路径存放在resources下sounds文件夹下面
     */
    public stopEffect(effectName: string): void {
        game.SoundManager.getInstance().stopEffect(this.path + effectName);
    }

    /**
    * 停止某个公共音效
    * @param effectName 音效名称，路径存放在sound下sound文件夹下面
    */
    public stopEffectCommon(effectName: string): void {
        game.SoundManager.getInstance().stopEffect(this.pathCom + effectName);
    }

    /**
     * 暂停某个音效
     * @param effectName 音效名称，路径存放在resources下sounds文件夹下面
     */
    public pauseEffect(effectName: string): void {
        game.SoundManager.getInstance().pauseEffect(this.path + effectName);
    }

    /**
     * 恢复某个音效
     * @param effectName 音效名称，路径存放在resources下sounds文件夹下面
     */
    public resumeEffect(effectName: string): void {
        game.SoundManager.getInstance().resumeEffect(this.path + effectName);
    }

    /**
     * 暂停所有背景音乐
     */
    public pauseAllMusic(): void {
        game.SoundManager.getInstance().pauseAllMusic();
    }

    /**
     * 恢复所有背景音乐
     */
    public resumeAllMusic(): void {
        game.SoundManager.getInstance().resumeAllMusic();
    }

    /**
     * 暂停所有音效
     */
    public pauseAllEffect(): void {
        game.SoundManager.getInstance().pauseAllEffect();
    }

    /**
     * 恢复所有音效
     */
    public resumeAllEffect(): void {
        game.SoundManager.getInstance().resumeAllEffect();
    }

    /**
     * 暂停所有音效和背景音乐
     */
    public pauseAll(): void {
        game.SoundManager.getInstance().pauseAll();
    }

    /**
     * 恢复所有音效和背景音乐
     */
    public resumeAll(): void {
        game.SoundManager.getInstance().resumeAll();
    }
}