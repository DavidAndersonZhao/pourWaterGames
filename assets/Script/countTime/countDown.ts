// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { timeConversion } from "./com";

const { ccclass, property, help } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    @property
    time: number = 10;
    @property
    count: number = 3;
    @property(cc.Label)
    countLabel: cc.Label = null
    @property(cc.Label)
    timeLabel: cc.Label = null
    @property(cc.Node)
    TakeTimeNode: cc.Node = null
    private TakeTime = 0
    private timer = null
    private oldTime = 0
    // LIFE-CYCLE CALLBACKS:
    setTimeLabel() {
        let { minute, second } = timeConversion(this.time)
        this.timeLabel.string = minute + ':' + second
        let takeTimeLabel = this.TakeTimeNode.getComponent(cc.Label)
        let { minute: taskMin, second: taskSec } = timeConversion(this.TakeTime)
        takeTimeLabel.string = `花费时间为：${taskMin + ':' + taskSec}`
    }

    public get _overTime() {
        let { minute, second } = timeConversion(this.TakeTime)
        return { minute, second }
    }

    onLoad() {
        this.oldTime = this.time
        if (!this.time) return
        this.timer = setInterval(() => {
            if (!this.count) {
                clearInterval(this.timer)
                console.log('游戏结束');
                this.time = 0
                this.setTimeLabel()
                return
            }
            if (!this.time) {
                // if (!this.count) {
                //     clearInterval(this.timer)
                //     console.log('游戏结束');
                // } else {
                this.count--
                this.countLabel.string = this.count + ''
                this.time = this.oldTime
                // }

            } else {
                this.TakeTime++
                this.time--
            }
            this.setTimeLabel()

        }, 1000)
    }
    addTime() {
        if (!this.time) return
        this.time = this.oldTime
        this.setTimeLabel()
    }
    start() {

    }
    onDestroy() {
        console.log('销毁节点');

        if (this.timer) {
            clearInterval(this.timer)
        }
    }
    // update (dt) {}
}
