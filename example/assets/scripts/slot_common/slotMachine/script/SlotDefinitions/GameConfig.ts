import { GameMode } from "./SlotEnum";

/**
 * GameConfig
 */

export default class GameConfig {
    constructor() {

    }

    /**
     * 游戏ID（打包时有用)
     */
    public gameId: number;

    /**
     * 是否启用资源版本管理(发布版会对资源的版本进行管理)
     */
    public resVersionAvailable: boolean = false;

    /**
     * 游戏的模式（DEBUG, RELEASE）
     */
    public mode: GameMode = GameMode.Release;

    /**
     * 测试token
     */
    public testToken: string = "1F3F53AE5C6689FD";

}
