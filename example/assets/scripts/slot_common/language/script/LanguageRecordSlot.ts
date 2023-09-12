
const { ccclass, property } = cc._decorator;
/**
 * 多语言数据脚本,用于有多语言的节点，需要挂载此脚本（仅支持label节点类型多语言）
 */
@ccclass
export default class LanguageRecordSlot extends game.LanguageComp {
    /**多语言限制 */
    private onlyInLanguages: string[] = ["zh", "en", "ja", "ko", "th", "vi", "pt"];
    onLoad(): void {
        super.onLoad();
        this.items.forEach(element => {
            if (game.LanguageManager.getInstance().getSrcPng(element.key)) {
                game.LanguageManager.getInstance().getSrcPng(element.key).onlyInLanguages = this.onlyInLanguages;
            }
        });
    }
}
