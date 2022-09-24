// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import SetCom from "../utils/setCom";
import cg from './logic'

const tipText = ''
@ccclass
export default class CountDownTime extends cc.Component {



    @property(cc.Label)
    powerCount: cc.Label = null;

    @property(cc.Label)
    timeDisplay: cc.Label = null;


    private clickTime = 0
    private timeLimit = 600
    private currentTime = 0 || this.timeLimit
    private timeCount: number = this.timeLimit;
    private minute: number = Math.floor(this.timeLimit / 60);
    private second: number = this.timeLimit % 60;
    getPowerAndTime() {
        let hisTime = SetCom.global_prop.time
        let upTime = SetCom.global_prop.upTime

        if (!hisTime || !upTime) return
        let current_time = new Date().getTime()
        let time = (current_time - hisTime) / 1000
        let _utime = (current_time - upTime) / 1000
        let power = ~~(_utime / this.timeLimit)
        let surplus_time = ~~(time % this.timeLimit)
        if (power >= 10) {
            SetCom.global_prop.physicalStrength = 10
            this.powerCount.string = SetCom.global_prop.physicalStrength + " /10";
            return
        }
        if (surplus_time) {

            this.timeCount = this.timeLimit - surplus_time

            let { minute, second } = this.timeStampToMinuteAndSecond(this.timeCount)
            this.setMinuteAndSecond(minute, second);
        }
        if (power > 0 && power <= 10 - SetCom.global_prop.physicalStrength) {
            SetCom.global_prop.physicalStrength += power
            this.powerCount.string = SetCom.global_prop.physicalStrength + " /10";

        }
    }
    protected onLoad(): void {
        this.power_click()
        cc.game.addPersistRootNode(this.node);
        if (typeof (wx) !== "undefined") {
            wx.onShow(() => {
                this.getPowerAndTime()
            })
        } else {
            this.getPowerAndTime()

        }

        this.node.active = true
    }
    start() {

    }
    protected onDestroy(): void {
        if (this.timeCount && SetCom.global_prop.physicalStrength < 9) {
            if (this.timeCount <= 600 && this.timeCount >= 590) {
            } else {
                SetCom.lostTime = this.timeCount
            }
        } else {
            SetCom.lostTime = 0
        }
    }
    timeStampToMinuteAndSecond(timeStamp: number) {
        let minute = Math.floor(timeStamp / 60);
        let second = timeStamp % 60;
        return { minute, second };
    }
    setMinuteAndSecond(minute: number, second: number) {
        this.minute = minute;
        this.second = second;
    }
    power_click() {
        cg.power.setTime();
        this.clickTime = cg.power.getTime();
        this.powerCount.string = SetCom.global_prop.physicalStrength + " /10";

        this.schedule(function () {
            if (this.timeCount != this.timeLimit) {
                if (this.second < 10) {
                    this.timeDisplay.string = "0" + this.minute + ":" + "0" + this.second + tipText;
                } else {
                    this.timeDisplay.string = "0" + this.minute + ":" + this.second + tipText;
                }
            }

            if (SetCom.global_prop.physicalStrength < 10) {
                if (this.clickTime < cg.power.getNextTime()) {
                    this.clickTime++;
                    this.timeCount--;
                    if (this.timeCount != this.timeLimit) {
                        if (this.second <= 0) {
                            if (this.minute <= 0) {
                                SetCom.global_prop.physicalStrength++;
                                let { minute, second } = this.timeStampToMinuteAndSecond(this.timeLimit)
                                this.setMinuteAndSecond(minute, second);
                            } else {
                                this.minute--;
                                this.second = 60;
                            }
                        } else if (this.second < 10) {

                            this.timeDisplay.string = "0" + this.minute + ":" + "0" + this.second + tipText;
                        } else {
                            this.timeDisplay.string = "0" + this.minute + ":" + this.second + tipText;
                        }
                        this.second--;
                    }
                    this.powerCount.string = SetCom.global_prop.physicalStrength + " /10";
                } else {
                    SetCom.global_prop.physicalStrength++;
                    this.clickTime = this.clickTime - this.timeLimit;
                    this.powerCount.string = SetCom.global_prop.physicalStrength + " /10";
                    this.timeCount = this.timeLimit;
                    let { minute, second } = this.timeStampToMinuteAndSecond(this.timeLimit)
                    this.setMinuteAndSecond(minute, second);
                    if (this.timeCount != this.timeLicurrentTimemit) {
                        if (this.second == 0) {
                            if (this.minute == 0) {
                                let { minute, second } = this.timeStampToMinuteAndSecond(this.timeLimit)
                                this.setMinuteAndSecond(minute, second);
                            } else {
                                this.minute--;
                                this.second = 60;
                            }
                        } else if (this.second < 10) {
                            this.timeDisplay.string = "0" + this.minute + ":" + "0" + this.second + tipText;
                        } else {
                            this.timeDisplay.string = "0" + this.minute + ":" + this.second + tipText;
                        }
                    }
                }
            } else if (SetCom.global_prop.physicalStrength >= 10) {
                this.clickTime = this.clickTime - this.timeLimit;
                this.powerCount.string = SetCom.global_prop.physicalStrength + " /10";
                this.timeDisplay.string = "";
                return;
            }
        }, 1);
    }
}
