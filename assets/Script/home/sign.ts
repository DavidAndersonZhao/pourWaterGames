// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UtilAudio } from "../utils/audio_util";
import SetCom from "../utils/setCom";
import Home from "./home";

const { ccclass, property } = cc._decorator;

function isThisWeek(past) {
    const pastTime = past
    const today = new Date(new Date().toLocaleDateString())
    let day = today.getDay()
    day = day == 0 ? 7 : day
    const oneDayTime = 60 * 60 * 24 * 1000
    const monday = new Date(today.getTime() - (oneDayTime * (day - 1)))
    const nextMonday = new Date(today.getTime() + (oneDayTime * (8 - day)))
    if (monday.getTime() <= pastTime && nextMonday.getTime() > pastTime) {
        return true
    } else {
        return false
    }
}

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Component)
    homeCom: cc.Component = null;

    @property(cc.SpriteFrame)
    imgs: cc.SpriteFrame[] = []

    @property(cc.SpriteFrame)
    repairImgs: cc.SpriteFrame[] = []

    @property(cc.JsonAsset)
    private signCfg: cc.JsonAsset = null;
    private sign_datas = []
    private current_num = 0
    private allReceived = false

    private doubleState = false
    get_sign_datas() {
        this.current_num = (new Date().getDay() || 7) - 1
        let storageData: any = localStorage.getItem('signCfg');
        this.sign_datas = this.signCfg.json.data
        if (storageData) {
            storageData = JSON.parse(storageData)
            // console.log(storageData.time)
            // console.log(isThisWeek(storageData.time))
            if (isThisWeek(storageData.time)) {
                this.sign_datas = storageData.data
            }
        }
    }
    onLoad() {
        SetCom.bannerShow('bannerAd', 'show')
        SetCom.bannerShow('gridAd', 'show')
        this.init()
    }

    private recordData() {
        let data = {
            data: this.sign_datas,
            time: new Date().getTime()
        }
        localStorage.setItem('signCfg', JSON.stringify(data))

    }
    start() {
    }

    data_init() {
        
        if (!this.sign_datas.length) return true
        for (let item of this.sign_datas) {
            item.isToday = false
        }
        // console.log(this.sign_datas,this.current_num);

        if (!this.sign_datas[this.current_num]?.isReceived) this.sign_datas[this.current_num].isToday = true
        for (let i = 0; i < this.current_num; i++) {
            const item = this.sign_datas[i];
            if (!item.isReceived) {
                item.isRepair = true
            }
        }
        return this.sign_datas[this.current_num].isToday
    }

    getSignBool() {
        return this.sign_datas.filter(item => !item.isReceived).length <= 1
    }
    getSignOrRepair() {
        this.get_sign_datas()
        this.data_init()
        let list = JSON.parse(JSON.stringify(this.sign_datas || []))
        list.length = (new Date().getDay() || 7);
        return list.filter(item => item.isToday || !item.isReceived).length > 0
    }

    opcOpen() {
        this.node.active = true
    }
    handleClick(e, name) {
        if (window?.wx) {
            wx.requestSubscribeMessage({
                tmplIds: ['OqKAG6eg1EDoi6HiwBCWcJDQveM2ATmFSeKajYcHrgM'],
                success(res) {
                    console.log(res)
                    res === {
                        errMsg: "requestSubscribeMessage:ok",
                        "zun-LzcQyW-edafCVvzPkK4de2Rllr1fFpw2A_x0oXE": "accept"
                    }
                }
            })
        }
        if (!this.sign_datas[this.current_num].isToday) {
            return
        }
        UtilAudio.btnAudioClick()
        switch (name) {
            case 'double':
                this.doubleState = true

                SetCom.advertisement(
                    {
                        success: (_res) => {
                            this.handleReceiveClick(e, name)
                        },
                        fail: () => {
                            SetCom.shareFriend(
                                {
                                    success: (_res) => {
                                        this.handleReceiveClick(e, name)
                                    },
                                })
                        },
                        cancel: () => {
                            this.doubleState = false
                        }
                    })
                break;
            default:
                this.handleReceiveClick(e, name)
                break;
        }

    }
    handleReceiveClick(e, name: string) {
        UtilAudio.modalAudioClick()
        this.sign_datas[this.current_num].isToday = false
        this.sign_datas[this.current_num].isReceived = true
        if (this.getSignBool()) {
            this.receiveClickFull()
            this.resOpenModal(this.sign_datas[this.current_num], this.imgs[this.sign_datas[this.current_num].rewardIcon - 1])
        } else {
            this.resOpenModal(this.sign_datas[this.current_num], this.imgs[this.sign_datas[this.current_num].rewardIcon - 1])
        }
        let layout_childs = this.node.getChildByName('layout').children

        const mask = layout_childs[this.current_num].getChildByName('mask')
        const border = layout_childs[this.current_num].getChildByName('border')
        mask.active = true
        this.receiveClick(layout_childs[this.current_num])
        this.recordData()
        mask.getChildByName('yes').active = true
        border.active = false
        this.doubleState = false
        this.showButton()
    }

    isAllReceived() {
        const layout = this.node.getChildByName('layout')
        const dallyBg = layout.getChildByName('dallyBg')
        const border = dallyBg.getChildByName('border')
        border.active = this.sign_datas.filter(item => !item.isReceived).length <= 2

    }

    calClick() {
        this.node.parent.getComponent('home').setSignState(this.getSignOrRepair())
        this.node.active = false
    }
    receiveClickFull() {
        const layout = this.node.getChildByName('layout')
        const dallyBg = layout.getChildByName('dallyBg')
        const mask = dallyBg.getChildByName('mask')
        const border = dallyBg.getChildByName('border')
        this.sign_datas[7].isReceived = true

        mask.active = true
        mask.getChildByName('yes').active = true
        border.active = false
        this.resOpenModal(this.sign_datas[7], this.imgs[this.sign_datas[7].rewardIcon - 1], this.imgs[this.sign_datas[7].rewardIcon2 - 1], true)
    }
    showButton() {
        if (!this.sign_datas[this.current_num].isToday) {
            this.node.getChildByName('btnlayout').active = false
        }
    }
    init() {
        this.get_sign_datas()
        this.data_init()

        let sign_node_datas = this.node.getChildByName('layout').children.filter(item => item.name == 'sbg')

        for (let i = 0; i < sign_node_datas.length; i++) {
            const item = sign_node_datas[i];
            const sign_data = this.sign_datas[i];
            const dayLabel = item.getChildByName('day')
            const reward = item.getChildByName('reward')
            const mask = item.getChildByName('mask')
            const border = item.getChildByName('border')

            dayLabel.getComponent(cc.Label).string = `第${i + 1}天`
            reward.getChildByName('label').getComponent(cc.Label).string = sign_data.text
            reward.getChildByName('icon').getComponent(cc.Sprite).spriteFrame = this.imgs[sign_data.rewardIcon - 1]


            if (sign_data.isReceived || sign_data.isRepair) {
                mask.active = true
                if (sign_data.isReceived) {
                    mask.getChildByName('yes').active = true
                    mask.getChildByName('repairSignBtn').active = false
                } else {
                    mask.getChildByName('repairSignBtn').active = true
                    mask.getChildByName('repairSignBtn').getComponent(cc.Sprite).spriteFrame = this.repairImgs[(sign_data.stateRepair || 1) - 1]
                    mask.getChildByName('repairSignBtn').on('click', () => {
                        if (wx) {
                            wx.requestSubscribeMessage({
                                tmplIds: ['OqKAG6eg1EDoi6HiwBCWcJDQveM2ATmFSeKajYcHrgM'],
                                success(res) {
                                    console.log(res)
                                    res === {
                                        errMsg: "requestSubscribeMessage:ok",
                                        "zun-LzcQyW-edafCVvzPkK4de2Rllr1fFpw2A_x0oXE": "accept"
                                    }
                                }
                            })
                        }
                        UtilAudio.btnAudioClick()

                        const resFn = (_res?) => {
                            UtilAudio.modalAudioClick()
                            mask.getChildByName('repairSignBtn').active = true
                            mask.getChildByName('yes').active = true
                            mask.getChildByName('repairSignBtn').active = false
                            this.resOpenModal(sign_data, this.imgs[sign_data.rewardIcon - 1])
                            sign_data.isReceived = true
                            this.isAllReceived()
                            if (this.getSignBool()) {
                                this.receiveClickFull()
                            }
                            this.recordData()
                        }
                        let shareFn = () => {
                            SetCom.shareFriend(
                                {
                                    success: (_res) => {
                                        resFn(_res)
                                    },
                                })
                        }
                        // 分享
                        if (sign_data.stateRepair == 2) {
                            shareFn()
                            return
                        }
                        SetCom.advertisement({
                            success: () => {
                                resFn()
                            },
                            fail: () => {
                                shareFn()
                            },
                        })
                    })
                }
            }
            border.active = sign_data.isToday
        }
        const layout = this.node.getChildByName('layout')
        const dallyBg = layout.getChildByName('dallyBg')
        const mask = dallyBg.getChildByName('mask')
        const border = dallyBg.getChildByName('border')
        this.showButton()
        this.isAllReceived()
        if (this.sign_datas[7].isReceived) {
            mask.active = true
            border.active = false
            mask.getChildByName('yes').active = true
        };
    }
    resOpenModal(data, img: cc.SpriteFrame, img2?: cc.SpriteFrame, doubleProp?: boolean) {
        let num: number = (+this.doubleState) + 1
        this.doubleState = false
        if (doubleProp) {
            let obj = {
                "rewardIcon": img,
                "rewardIcon2": img2,
                "rewardNum": data.rewardNum * num,
                "rewardNum2": data.rewardNum2 * num,
                "name": data.text.replaceAll(`x${data.rewardNum}`, `x${data.rewardNum * num}`),
                "name2": data.text2.replaceAll(`x${data.rewardNum2}`, `x${data.rewardNum2 * num}`),
                "type": data.rewardIcon,
                "curState": data.rewardIcon,
                "curState2": data.rewardIcon2,
            }
            this.node.parent.getComponent('home').openOpc(4, obj, true, undefined, '收下了');
            return
        }
        let obj = {
            "rewardIcon": img,
            "rewardNum": data.rewardNum * num,
            "name": data.text.replaceAll(`x${data.rewardNum}`, `x${data.rewardNum * num}`),
            "type": data.rewardIcon,
            "curState": data.rewardIcon,
        }
        switch (data.rewardIcon) {
            case 1:
            case 2:
            case 3:
            case 5:
                this.node.parent.getComponent('home').openOpc(3, obj, true, undefined, '收下了');
                break;
            case 4:
                this.node.parent.getComponent('home').openOpc(2, obj, true, undefined, '收下了');
                break;
            default:
                break;
        }
    }

    receiveClick(data) {
        switch (data.rewardIcon) {
            case 1:
                SetCom.global_prop.backOff += data.rewardNum
                break;
            case 2:
                SetCom.global_prop.reset += data.rewardNum
                break;
            case 3:
                SetCom.global_prop.testTube += data.rewardNum
                break;
            case 4:
                SetCom.global_prop.fragment += data.rewardNum
                break;
            case 5:
                SetCom.global_prop.physicalStrength += data.rewardNum
                break;
            default:
                break;
        }

        this.homeCom.getComponent('home').show()
    }
}
