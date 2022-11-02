// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import SetCom from "../utils/setCom";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    public okFn = null
    public calFn = null

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    getRewards() {
        SetCom.advertisement(
            {
                success: (_res) => {
                    if (this.okFn) this.okFn()
                    this.destoryBtn()
                },
                fail: () => {
                    SetCom.shareFriend(
                        {
                            success: (_res) => {
                                if (this.okFn) this.okFn()
                                this.destoryBtn()
                            },
                        })
                }
            })
    }
    destoryBtn() {
        this.node.destroy()
        if (this.calFn) this.calFn()
    }
    start() {

    }

}