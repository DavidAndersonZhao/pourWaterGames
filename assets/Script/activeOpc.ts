// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UtilAudio } from "./utils/audio_util";
import SetCom from "./utils/setCom";

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    activeModal: cc.Prefab = null//活动弹窗

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }
    deleteModal() {
        this.node.active = false
    }
    activeClick() {//活动按钮
        UtilAudio.btnAudioClick()
        SetCom.advertisement(
            {
                success: (_res) => {
                    let imgNode = cc.instantiate(this.activeModal)
                    this.node.addChild(imgNode);
                },
                fail: () => {
                    SetCom.shareFriend(
                        {
                            success: (_res) => {
                                let imgNode = cc.instantiate(this.activeModal)
                                this.node.addChild(imgNode);
                            },
                        })
                }
            })

    }
    // update (dt) {}
}
