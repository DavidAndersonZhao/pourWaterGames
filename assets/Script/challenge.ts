// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UtilAudio } from "./utils/audio_util";
import SetCom from "./utils/setCom";
import { CupMgr } from "./views/cupMgr";
const { ccclass, property } = cc._decorator;
enum PropState {
    Video,
    Have,
    No
}
@ccclass
export default class NewClass extends cc.Component {
    @property(CupMgr)
    private cupMgr: CupMgr = null;
    private prop = {
        reset: PropState.Video,
        backOff: PropState.Video
    }
    private addCurDone = false

    handleActionBtn(num: number, name: string) {
        let btns = cc.find("Canvas/bg/bgImg/btns")
        let node = btns.getChildByName(name)
        let playNode = node.getChildByName('icon').getChildByName('play')
        let numNode = node.getChildByName('icon').getChildByName('num')
        if (num) {
            playNode.active = false
            numNode.active = true
            numNode.getComponent(cc.Label).string = num + ''
        } else {
            playNode.active = true
            numNode.active = false
        }
    }

    // 重置
    onBtn_restart() {
        if (this.cupMgr.haveAnimationPlay) return
        UtilAudio.btnAudioClick()
        switch (this.prop.reset) {
            case PropState.Have:
                this.handleActionBtn(0, 'reset')
                this.prop.reset = PropState.No
                // cc.director.loadScene("game");
                this.cupMgr.nextLevel();
                break;
            case PropState.No:
                console.log('挑战模式道具只能用一次');

                break;
            case PropState.Video:
                SetCom.advertisement(
                    {
                        success: (_res) => {
                            this.handleActionBtn(1, 'reset')
                            this.prop.reset = PropState.Have
                        },
                        fail: () => {
                            SetCom.shareFriend(
                                {
                                    success: (_res) => {
                                        this.handleActionBtn(1, 'reset')
                                        this.prop.reset = PropState.Have
                                    },
                                })
                        }
                    })
                break;
            default:
                break;
        }


    }

    //撤回
    onBtn_recover() {
        if (this.cupMgr.haveAnimationPlay) return
        this.cupMgr.undoAction(() => {
            UtilAudio.btnAudioClick()
            switch (this.prop.backOff) {
                case PropState.Have:
                    this.handleActionBtn(0, 'back')
                    this.prop.backOff = PropState.No
                    return true
                case PropState.No:
                    console.log('挑战模式道具只能用一次');

                    break;
                case PropState.Video:
                    SetCom.advertisement(
                        {
                            success: (_res) => {
                                this.handleActionBtn(1, 'back')
                                this.prop.backOff = PropState.Have
                            },
                            fail: () => {
                                SetCom.shareFriend(
                                    {
                                        success: (_res) => {
                                            this.handleActionBtn(1, 'back')
                                            this.prop.backOff = PropState.Have
                                        },
                                    })
                            }
                        })
                    break;
                default:
                    break;
            }
            // if (SetCom.global_prop.backOff) {
            //     this.handleActionBtn(--SetCom.global_prop.backOff, 'back')
            // } else {

            //     SetCom.advertisement(
            //         {
            //             success: (_res) => {
            //                 this.handleActionBtn(++SetCom.global_prop.backOff, 'back')
            //             },
            //             fail: () => {
            //                 SetCom.shareFriend(
            //                     {
            //                         success: (_res) => {
            //                             this.handleActionBtn(++SetCom.global_prop.backOff, 'back')
            //                         },
            //                     })
            //             }
            //         })
            //     return
            // }
        });

    }
    onLoad() {
        this.handleActionBtn(0, 'reset')
        this.handleActionBtn(0, 'back')
        SetCom.isChallenge = true
    }
    protected onDestroy(): void {
        // SetCom.isChallenge = false

    }
    // update (dt) {}
}
