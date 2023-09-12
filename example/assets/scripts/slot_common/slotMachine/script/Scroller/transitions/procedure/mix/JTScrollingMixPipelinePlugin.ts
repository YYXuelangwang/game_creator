import BaseSpinSlotView from "../../../../MainView/BaseSpinSlotView";
import { SDictionary } from "../../../../SlotData/SDictionary";
import { SlotOrientation } from "../../../../SlotDefinitions/SlotEnum";
import JTContainer from "../../../com/base/JTContainer";
import JTScroller from "../../../com/JTScroller";
import JTScrollerGroup from "../../../com/JTScrollerGroup";
import JTScrollingMixPipeline from "./JTScrollingMixPipeline";

export default class JTScrollingMixPipelinePlugin extends JTContainer {

    private static _librarys: SDictionary = new SDictionary();

    private timer: cc.Scheduler = cc.director.getScheduler();
    private scrollerGroup: JTScrollerGroup = null;
    private container: JTContainer = null;

    private imageIndex: number = 0;

    private isDataReady: boolean = false;
    public isPending: boolean = false;
    private changedTimes: number = 0;

    private isTogether: boolean = false;

    private runningCount: number = 0;

    private runnnigs: JTScroller[] = [];

    private pendingList: JTScroller[] = [];

    constructor() {
        super();
        this.timer = cc.director.getScheduler();
    }

    public static getMixPipelinePlugin(id: number, scrollerGroup: JTScrollerGroup): JTScrollingMixPipelinePlugin {
        let plugin = this._librarys.get(id) as JTScrollingMixPipelinePlugin;
        if (!plugin) {
            plugin = new JTScrollingMixPipelinePlugin();
            plugin.scrollerGroup = scrollerGroup;
            plugin.container = scrollerGroup.pluginContainer;
            this._librarys.set(id, plugin)
        }
        return plugin;
    }


    public start(index: number): void {
        this.runningCount++;
        if (index == this.scrollerGroup.config.col - 1) {
            this.setItemsToMixLayer();
        }
    }


    public running(index: number): void {
        let s = this.scrollerGroup;
        this.runnnigs.push(s.items[index] as JTScroller);
        if (index == s.config.col - 1) {
            s.time += s.endDelay;
            this.isTogether = true;
            this.timer.schedule(this.onEnterFrame, this, 0);
        }
    }


    private setItemsToMixLayer(): void {
        this.scrollerGroup.pluginContainer.y = 0;
        for (let s of this.scrollerGroup.items as JTScroller[]) {
            for (let r of s.items) {
                r.removeFromParent();
                r.x = s.x + r.width * 0.5;
                this.scrollerGroup.pluginContainer.addChild(r);
            }
        }
        let scrollers = this.scrollerGroup.items as JTScroller[];
        let c = this.scrollerGroup.config;
        for (let col = 0; col < scrollers.length; col++) {
            let scroller = scrollers[col];
            let items = scroller.items as BaseSpinSlotView[];
            for (let row = 0; row < items.length; row++) {
                let r = items[row];
                let gapX = c.gapX < 0 ? c.gapX : 0;
                let isHide = false;
                let curLeftX = r.x - r.width * 0.5 - gapX * 0.5;
                for (let i = 0; i < col; i++) {
                    let s = scrollers[i];
                    let renders = s.items as BaseSpinSlotView[];
                    for (let rd of renders) {
                        let rightX = rd.x + rd.width * 0.5 - 1 + gapX * 0.5;//避免小数精度问题
                        if (rd.active && rightX > curLeftX && r.y > rd.y - rd.height * 0.5 && r.y < rd.y + rd.height * 0.5) {
                            isHide = true;
                            break;
                        }
                    }
                }

                r.active = !isHide;
            }
        }
    }

    public continue(index: number): void {
        if (index == this.scrollerGroup.config.col - 1) {
            this.isPending = false;
        }
    }

    public dataStandby(index: number): void {
        if (index == this.scrollerGroup.config.col - 1) {
            this.isDataReady = true;
        }
    }

    private onEnterFrame(dt: number): void {
        let s = this.scrollerGroup;

        if (this.isDataReady && !this.isPending) {
            s.runningTime += dt * 1000;
        }
        if (s.config.orientation == SlotOrientation.Portrait) {
            s.speed > 0 ? this.scrollingDown() : this.scrollingUp();
        } else {

        }
        if (s.runningTime < s.time) {
            return;
        } else {
            if (this.isTogether) {
                this.isTogether = false;
                this.readyToComplete();
            }
        }
    }

    private scrollingUp(): void {
        let s = this.scrollerGroup;
        let c = s.config;
        let t = this.container;

        let sources = this.scrollerGroup.sources;
        let scrollers = this.scrollerGroup.items as JTScroller[];
        if (this.isTogether) {
            t.y -= s.speed;
            this.fixImageIndex()
            for (let col = 0; col < scrollers.length; col++) {
                let scroller = scrollers[col];
                let items = scroller.items as BaseSpinSlotView[];
                let source = sources[col];

                let bottomItem = items[items.length - 1];

                let bottomItemY = bottomItem.y - bottomItem.height * 0.5;
                if (bottomItemY + t.y > -c.getHeight()) {
                    let r = items.shift();
                    items.push(r);
                    let data = source[this.imageIndex];
                    r.data = data;
                    r.gotoAndStop(BaseSpinSlotView.STATE_ROLLING);
                    r.x = scroller.x + r.width * 0.5;
                    r.y = bottomItem.y - bottomItem.height * 0.5 - c.gapY - r.height * 0.5;
                    let m = c.getMixElementConfig(data);
                    if (col > 0 && sources[col - 1][this.imageIndex] == data && m && m.column > 1) {
                        r.active = false;
                    } else {
                        r.active = true;
                    }
                }
            }
            for (let col = 0; col < scrollers.length; col++) {
                let scroller = scrollers[col];
                let items = scroller.items as BaseSpinSlotView[];
                for (let r of items) {
                    r.y += c.gapHeight;
                }
            }

            t.y -= c.gapHeight;
            //}
        } else {
            let isPreScatterRunning = false;
            for (let col = 0; col < scrollers.length; col++) {
                let scroller = scrollers[col];
                let items = scroller.items as BaseSpinSlotView[];
                let st = (scroller.pipeline as JTScrollingMixPipeline).scatterRule;
                let isChangedTime = true;
                if (!scroller.isRunning) {
                    continue;
                }
                if (!this.runnnigs.includes(scroller)) {
                    continue;
                }
                if (st && st.onRunningSpeedUp(scroller)) {
                    isPreScatterRunning = true;
                    continue;
                }
                scroller.y -= scroller.speed;

                let bottomItem = items[items.length - 1];

                let bottomY = bottomItem.y + bottomItem.height * 0.5;
                if (bottomY + scroller.y > -c.getHeight()) {
                    let r = items.shift();
                    items.push(r);
                    scroller.imageIndex--;
                    let data = scroller.sources[scroller.imageIndex];
                    r.data = data;
                    r.gotoAndStop(BaseSpinSlotView.STATE_ROLLING);
                    r.x = r.width * 0.5;
                    r.y = bottomItem.y - bottomItem.height * 0.5 - c.gapY - r.height * 0.5;
                    let m = c.getMixElementConfig(data);
                    let gapX = c.gapX < 0 ? c.gapX : 0;
                    let isHide = false;
                    let curLeftX = r.x + scroller.x - r.width * 0.5 - gapX * 0.5;
                    for (let i = 0; i < col; i++) {
                        let s = scrollers[i];
                        let renders = s.items as BaseSpinSlotView[];
                        for (let rd of renders) {
                            let rightX = rd.x + s.x + rd.width * 0.5 - 1 + gapX * 0.5;//避免小数精度问题
                            if (rd.active && rightX > curLeftX && r.y + scroller.y > rd.y + s.y - rd.height * 0.5 && r.y + scroller.y < rd.y + s.y + rd.height * 0.5) {
                                isHide = true;
                                break;
                            }
                        }
                    }
                    r.active = !isHide;
                    if (m && m.row > 1) {
                        scroller.imageIndex -= m.row - 1;
                    }

                    for (let r of items) {
                        r.y += c.gapHeight;
                    }
                    scroller.y -= c.gapHeight;

                    if (this.pendingList.includes(scroller)) {
                        if (scroller.imageIndex < 0) {
                            scroller.imageIndex = scroller.sources.length;
                        }
                        continue;
                    }
                    if (st && !st.updateScatterTime(scroller)) {
                        isChangedTime = false;
                        if (scroller.imageIndex < 0) {
                            scroller.imageIndex = scroller.sources.length;
                        }
                    }
                    if (!isChangedTime) {
                        isPreScatterRunning = true;
                        continue;
                    }
                    if (st && st.onRunningSlowdown(scroller)) {
                        isPreScatterRunning = true;
                        continue;
                    }

                    if (isPreScatterRunning) {
                        if (scroller.imageIndex < 0) {
                            scroller.imageIndex = scroller.sources.length;
                        }
                        continue;
                    }

                    if (st && st.getScatterInfo(scroller.index)) {
                        if (scroller.changedTimes == 0) {
                            scroller.changedTimes++;
                            scroller.imageIndex = scroller.sources.length;

                            for (let i = scroller.index + 1; i < scrollers.length; i++) {
                                let next = scrollers[i];
                                if (!st.getScatterInfo(i)) {
                                    next.imageIndex = (c.row + 2) + i * c.row;
                                }
                            }
                        }
                    }

                    if (scroller.changedTimes == 0 && scroller.imageIndex != 0) {
                        continue;
                    }

                    if (scroller.imageIndex == 0) {
                        scroller.changedTimes = 0;
                        scroller.imageIndex = scroller.sources.length;
                    }

                    if (scroller.imageIndex <= scroller.sources.length) {
                        let isRender = this.setRenderBeforeComplete(r, scroller);
                        isRender && r.active && r.beforeRollComplete();
                        scroller.changedTimes++;
                    }
                    if (scroller.imageIndex <= scroller.sources.length - 1 - (c.row + 2)) {
                        let d = - scroller.y;
                        for (let r of items) {
                            r.y -= d;
                        }
                        scroller.y += d;
                        let index = this.runnnigs.indexOf(scroller);
                        this.runnnigs.splice(index, 1);
                        for (let j = col + 1; j < scrollers.length; j++) {
                            let next = scrollers[j];
                            let n = this.pendingList.indexOf(next);
                            if (n != -1) {
                                this.pendingList.splice(n, 1);
                                next.imageIndex = (c.row) * 3;
                            } else {
                                break;
                            }
                        }
                        scroller.pipeline.getCurrentTask().complete();
                    }
                }
            }
        }
    }

    private scrollingDown(): void {
        let s = this.scrollerGroup;
        let c = s.config;
        let t = this.container;

        let sources = this.scrollerGroup.sources;
        let scrollers = this.scrollerGroup.items as JTScroller[];
        if (this.isTogether) {
            t.y -= s.speed;
            this.fixImageIndex()
            for (let col = 0; col < scrollers.length; col++) {
                let scroller = scrollers[col];
                let items = scroller.items as BaseSpinSlotView[];
                let source = sources[col];

                let topItem = items[0];

                let topItemY = topItem.y + topItem.height * 0.5;
                if (topItemY + t.y < 0) {
                    let r = items.pop();
                    items.unshift(r);
                    let data = source[this.imageIndex];
                    r.data = data;
                    r.gotoAndStop(BaseSpinSlotView.STATE_ROLLING);
                    r.x = scroller.x + r.width * 0.5;
                    r.y = topItem.y + topItem.height * 0.5 + c.gapY + r.height * 0.5;
                    let m = c.getMixElementConfig(data);
                    if (col > 0 && sources[col - 1][this.imageIndex] == data && m && m.column > 1) {
                        r.active = false;
                    } else {
                        r.active = true;
                    }
                }
            }

            for (let col = 0; col < scrollers.length; col++) {
                let scroller = scrollers[col];
                let items = scroller.items as BaseSpinSlotView[];
                for (let r of items) {
                    r.y -= c.gapHeight;
                }
            }
            t.y += c.gapHeight;
            //}
        } else {
            let isPreScatterRunning = false;
            for (let col = 0; col < scrollers.length; col++) {
                let scroller = scrollers[col];
                let items = scroller.items as BaseSpinSlotView[];
                let st = (scroller.pipeline as JTScrollingMixPipeline).scatterRule;
                let isChangedTime = true;
                if (!scroller.isRunning) {
                    continue;
                }
                if (!this.runnnigs.includes(scroller)) {
                    continue;
                }
                if (st && st.onRunningSpeedUp(scroller)) {
                    isPreScatterRunning = true;
                    continue;
                }
                scroller.y -= scroller.speed;

                let topItem = items[0];

                let topItemY = topItem.y + topItem.height * 0.5;
                if (topItemY + scroller.y < 0) {
                    let r = items.pop();
                    items.unshift(r);
                    scroller.imageIndex++;
                    let data = scroller.sources[scroller.imageIndex];
                    r.data = data;
                    r.gotoAndStop(BaseSpinSlotView.STATE_ROLLING);
                    r.x = r.width * 0.5;
                    r.y = topItem.y + topItem.height * 0.5 + c.gapY + r.height * 0.5;
                    let d = r.y + r.height - scroller.y;
                    let m = c.getMixElementConfig(data);
                    let gapX = c.gapX < 0 ? c.gapX : 0;
                    let isHide = false;
                    let curLeftX = r.x + scroller.x - r.width * 0.5 - gapX * 0.5;
                    for (let i = 0; i < col; i++) {
                        let s = scrollers[i];
                        let renders = s.items as BaseSpinSlotView[];
                        for (let rd of renders) {
                            let p = rd.parent;
                            let rightX = rd.x + p.x + rd.width * 0.5 - 1 + gapX * 0.5;//避免小数精度问题
                            if (rd.active && rightX > curLeftX && r.y + scroller.y > rd.y + p.y - rd.height * 0.5 && r.y + scroller.y < rd.y + p.y + rd.height * 0.5) {
                                isHide = true;
                                break;
                            }
                        }
                    }
                    r.active = !isHide;
                    if (m && m.row > 1) {
                        scroller.imageIndex += m.row - 1;
                    }

                    for (let rd of items) {
                        rd.y -= d;
                    }
                    scroller.y += d;

                    if (this.pendingList.includes(scroller)) {
                        if (scroller.imageIndex >= scroller.sources.length) {
                            scroller.imageIndex = 0;
                        }
                        continue;
                    }
                    if (st && !st.updateScatterTime(scroller)) {
                        isChangedTime = false;
                        if (scroller.imageIndex >= scroller.sources.length) {
                            scroller.imageIndex = 0;
                        }
                    }
                    if (!isChangedTime) {
                        isPreScatterRunning = true;
                        continue;
                    }
                    if (st && st.onRunningSlowdown(scroller)) {
                        isPreScatterRunning = true;
                        continue;
                    }

                    if (isPreScatterRunning) {
                        if (scroller.imageIndex >= scroller.sources.length) {
                            scroller.imageIndex = 0;
                        }
                        continue;
                    }

                    if (st && st.getScatterInfo(scroller.index)) {
                        if (scroller.changedTimes == 0) {
                            scroller.changedTimes++;
                            scroller.imageIndex = scroller.sources.length - 1 - (c.row + 2);

                            for (let i = scroller.index + 1; i < scrollers.length; i++) {
                                let next = scrollers[i];
                                if (!st.getScatterInfo(i)) {
                                    next.imageIndex = next.sources.length - 1 - (c.row + 2) - i * c.row;
                                }
                            }
                        }
                    }

                    if (scroller.imageIndex == scroller.sources.length - (c.row + 2)) {
                        scroller.changedTimes = 0;
                    }

                    if (scroller.imageIndex >= scroller.sources.length - (c.row + 2)) {
                        let isRender = this.setRenderBeforeComplete(r, scroller);
                        isRender && r.active && r.beforeRollComplete();
                        scroller.changedTimes++;
                    }
                    if (scroller.imageIndex >= scroller.sources.length - 1) {
                        let d = - scroller.y;
                        for (let r of items) {
                            r.y -= d;
                        }
                        scroller.y += d;
                        let index = this.runnnigs.indexOf(scroller);
                        this.runnnigs.splice(index, 1);
                        for (let j = col + 1; j < scrollers.length; j++) {
                            let next = scrollers[j];
                            let n = this.pendingList.indexOf(next);
                            if (n != -1) {
                                this.pendingList.splice(n, 1);
                                next.imageIndex = next.sources.length - 1 - (c.row) * 3;
                            } else {
                                break;
                            }
                        }
                        scroller.pipeline.getCurrentTask().complete();
                    }
                }
            }
        }
    }

    public setRenderBeforeComplete(render: BaseSpinSlotView, s: JTScroller): boolean {
        if (s.changedTimes != 0 && s.changedTimes != s.items.length - 1) {
            let index = s.speed > 0 ? s.config.row - s.changedTimes : s.changedTimes - 1;
            render.index = s.indexs[index];
            return true;
        } else {
            return false;
        }
    }

    public getExtraElement(col: number, index: number): number {
        let sources = this.scrollerGroup.sources;
        let source = sources[col];
        return source[index];
    }

    public resetRenderParent(): void {
        let items = this.scrollerGroup.items as JTScroller[];
        let t = this.container;
        for (let i = 0; i < items.length; i++) {
            let s = items[i];
            for (let r of s.items) {
                if (r.parent == t) {
                    r.removeFromParent();
                    s.addChild(r);
                    r.y = t.y + r.y - s.y;
                    r.x = r.width / 2;
                }
            }
        }
    }

    private readyToComplete(): void {
        let items = this.scrollerGroup.items as JTScroller[];
        let o = this.scrollerGroup;
        let t = this.container;
        this.resetRenderParent();
        let c = this.scrollerGroup.config;
        let dataList = this.scrollerGroup.dataList;
        let d = 0;
        for (let col = 0; col < dataList.length; col++) {
            let list = dataList[col];
            let s = items[col];
            let p = s.pipeline as JTScrollingMixPipeline;
            let st = p.scatterRule;

            let isEndWithPreCol = false;
            for (let row = 1; row < list.length; row++) {
                let data = list[row];
                let m = c.getMixElementConfig(data);
                if (m && p.isMixAcrossColumnGrid(data, row, m.column)) {
                    isEndWithPreCol = true;
                    break;
                }
            }

            if (st && st.isRunning && p.isMixAcrossColumnScroller()) {
                st.removeIndexs([col]);
                if (!this.pendingList.includes(s)) {
                    let isPreScatterRunning = false;
                    for (let i = 0; i < col; i++) {
                        if (st.getScatterInfo(i)) {
                            isPreScatterRunning = true;
                            break;
                        }
                    }
                    if (isPreScatterRunning) {
                        this.pendingList.push(s)
                    }
                }
            }

            if (o.speed > 0) {
                if (!isEndWithPreCol) {
                    d += s.endDelay > 0 ? c.row * 2 : 0;
                }
                s.imageIndex = s.sources.length - 1 - (c.row + 2) - d;
            } else {
                if (!isEndWithPreCol) {
                    d += s.endDelay > 0 ? c.row * 2 : 0;
                }
                s.imageIndex = (c.row + 2) + d;
            }
        }
    }

    private fixImageIndex(): void {
        let s = this.scrollerGroup;
        let sources = s.sources[0]
        if (s.runningTime >= s.time) {
            if (s.speed >= 0) {
                this.imageIndex += 1;
                if (this.imageIndex > sources.length - 1) {
                    this.imageIndex = 0;
                }
                if (this.changedTimes == 0) {
                    this.imageIndex = sources.length - (s.config.row + 2);
                }
            }
            else {
                this.imageIndex -= 1;
                if (this.imageIndex < 0) {
                    this.imageIndex = sources.length - 1;
                }
                if (this.changedTimes == 0) {
                    this.imageIndex = sources.length - 1;
                }
            }
            if (this.imageIndex > sources.length - 1) {
                this.imageIndex = 0;
            }
            this.changedTimes += 1;
        } else {
            this.imageIndex += 1;
            if (this.imageIndex > sources.length - 1) {
                this.imageIndex = 0;
            }
        }
    }


    public callClear(index: number): void {
        if (this.runningCount > 0) {
            this.runningCount--
        };
        if (this.runningCount == 0) {
            this.clear();
        }
    }

    public clear(): void {
        this.timer.unschedule(this.onEnterFrame, this);
        this.runnnigs = [];
        this.pendingList = [];
        this.imageIndex = 0;
        this.changedTimes = 0;
        this.isDataReady = false;
        this.isTogether = false;
        this.scrollerGroup.runningTime = 0;
    }
}

