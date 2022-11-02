// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { timeConversion } from "./com";
import ProgressBar from "../challengeScripts/progressBar";
import Stars from "../challengeScripts/stars";
import Challenge from "../challenge";
const { ccclass, property, help } = cc._decorator;
enum PauseStatus {
    ready,
    have,
    no
}

@ccclass
export default class NewClass extends cc.Component {


    @property
    time: number = 10;
    @property
    count: number = 3;
    @property
    pauseTime: number = 3;
    @property(cc.Label)
    timeLabel: cc.Label = null
    @property(cc.Node)
    TakeTimeNode: cc.Node = null
    @property(ProgressBar)//进度条组件
    carom: ProgressBar = null
    @property(Stars)//星星组件
    stars: Stars = null

    private TakeTime = 0
    private timer = null
    private initData = {
        oldTime: 0,
        oldCount: 0
    }
    private timeDown = 0
    private pauseState = false//暂停状态
    // LIFE-CYCLE CALLBACKS:=
    setTimeLabel() {
        let { hours, minute, second } = timeConversion(this.time)
        this.timeLabel.string = this.timeDown + ''
        let takeTimeLabel = this.TakeTimeNode.getComponent(cc.Label)
        let { minute: taskMin, second: taskSec } = timeConversion(this.TakeTime)
        takeTimeLabel.string = `${hours + ':' + taskMin + ':' + taskSec}`
    }

    public get _overTime() {
        let { minute, second } = timeConversion(this.TakeTime)
        return { minute, second }
    }
    // 计时器
    timeEvent() {
        this.timer = setInterval(() => {

            if (!this.count) {
                clearInterval(this.timer)
                console.log('游戏结束');
                this.time = 0
                this.setTimeLabel()
                cc.find('Canvas')?.getComponent(Challenge).resurrectionHandle()
                // this.challengeScript.resurrectionHandle()
                return
            }
            if (!this.time) {
                // if (!this.count) {
                //     clearInterval(this.timer)
                //     console.log('游戏结束');
                // } else {
                this.count--

                this.stars.delStars()
                // this.countLabel.string = this.count + ''
                this.time = this.initData.oldTime
                // }

            } else {
                this.TakeTime++
                if (!this.pauseState) this.time--
            }
            if (this.timeDown-- <= 0) {
                this.timeDown = 0
            }
            this.setTimeLabel()
        }, 1000)
    }
    onLoad() {
        
        this.initData.oldTime = this.time
        this.initData.oldCount = this.count
        if (!this.time) return
        this.addTime()
        // this.timeEvent()
    }
    // 暂停
    pauseGame() {
        this.carom.changeState(false)
        this.clearTimer()
    }
    // 恢复
    resumeGame() {
        this.carom.changeState(true)
        this.addTime(true)
    }
    // +时间
    addTime(recover?) {

        // this.clearTimer()
        this.time = this.initData.oldTime
        if (!recover) {
            this.timeDown = this.initData.oldTime
            this.carom.resetTime()
        }
        this.setTimeLabel()
        if (!this.timer) {
            this.timeEvent()
            return
        }
    }
    resurrectionFn() {
        this.time = this.initData.oldTime
        this.count = this.initData.oldCount
        this.stars.starsNumber = 3
        this.stars.init()
        // this.addTime()
    }
    start() {

    }
    onDestroy() {
        console.log('销毁节点');

        if (this.timer) {
            this.clearTimer()
        }
    }
    clearTimer() {
        clearInterval(this.timer)
        this.timer = null
    }

    pauseTimeHandle() {
        // this.clearTimer()
        this.pauseState = true
        setTimeout(() => {
            this.pauseState = false
            // this.addTime(true)
        }, this.pauseTime * 1000);
    }
    // update (dt) {}
}
