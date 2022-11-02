// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { UtilAudio } from "./utils/audio_util";
import SetCom from "./utils/setCom";
import { CupMgr } from "./views/cupMgr";
import CountDown from "./countTime/countDown";
import ModalHandle from './challengeScripts/ModalHandle'
import KeelReplaceSkin from './challengeScripts/keelReplaceSkin'
const { ccclass, property } = cc._decorator;
enum PropState {
    Video,
    Have,
    No
}
interface OpcGroupInter {
    backModal: cc.Prefab
    resurrectionModal: cc.Prefab
    pauseModal: cc.Prefab
}
const ModalGroup = cc.Class({
    name: "ModalGroups",
    properties: {
        backModal: {//撤回
            default: null,
            type: cc.Prefab,
        },
        resurrectionModal: {//复活
            default: null,
            type: cc.Prefab,
        },
        pauseModal: {//暂停
            default: null,
            type: cc.Prefab,
        }
    },
});
@ccclass
export default class Challenge extends cc.Component {
    @property(ModalGroup)
    private modalSetting: OpcGroupInter = null
    @property(CupMgr)
    private cupMgr: CupMgr = null;
    @property(CountDown)
    private countDown: CountDown = null;

    @property(KeelReplaceSkin)
    private replaceSkin: KeelReplaceSkin = null;
    private prop = {
        reset: PropState.Video,
        backOff: PropState.Video,
        pause: PropState.Video,
        resurrection: PropState.Video
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

    createModal(str: string, okCb, calCb?) {
        let ModalNode: cc.Node = null
        this.countDown.pauseGame();

        switch (str) {
            case 'backModal':
                ModalNode = cc.instantiate(this.modalSetting.backModal)
                break;
            case 'resurrectionModal':
                ModalNode = cc.instantiate(this.modalSetting.resurrectionModal)
                break;
            case 'pauseModal':
                ModalNode = cc.instantiate(this.modalSetting.pauseModal)
                break;

            default:
                break;
        }
        // let ModalNode: cc.Node = cc.instantiate(this.modalSetting[name])
        ModalNode.getComponent(ModalHandle).okFn = okCb
        if (calCb) {
            ModalNode.getComponent(ModalHandle).calFn = calCb
        } else {
            ModalNode.getComponent(ModalHandle).calFn = () => this.countDown.resumeGame()

        }
        this.node.addChild(ModalNode)
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
                this.createModal('pauseModal', () => {
                    this.handleActionBtn(1, 'reset')
                    this.prop.pause = PropState.Have
                })
                break;
            default:
                break;
        }


    }

    // 时间静止
    onBtn_pause() {
        if (this.cupMgr.haveAnimationPlay) return
        UtilAudio.btnAudioClick()
        switch (this.prop.pause) {
            case PropState.Have:
                this.handleActionBtn(0, 'reset')
                this.prop.pause = PropState.No
                // cc.director.loadScene("game");
                this.countDown.pauseTimeHandle();
                break;
            case PropState.No:
                console.log('挑战模式道具只能用一次');

                break;
            case PropState.Video:
                this.createModal('pauseModal', () => {
                    this.handleActionBtn(1, 'reset')
                    this.prop.pause = PropState.Have
                })
                // SetCom.advertisement(
                //     {
                //         success: (_res) => {
                //             this.handleActionBtn(1, 'reset')
                //             this.prop.pause = PropState.Have
                //         },
                //         fail: () => {
                //             SetCom.shareFriend(
                //                 {
                //                     success: (_res) => {
                //                         this.handleActionBtn(1, 'reset')
                //                         this.prop.pause = PropState.Have
                //                     },
                //                 })
                //         }
                //     })
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
                    this.createModal('backModal', () => {
                        this.handleActionBtn(1, 'back')
                        this.prop.backOff = PropState.Have
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
    // 复活
    resurrectionHandle() {
        if (this.prop.resurrection === PropState.No) {
            // TODO:真结束了
            return
        }
        this.createModal('resurrectionModal', () => {
            this.prop.resurrection = PropState.No
            this.countDown.resurrectionFn()
        })
    }
    onLoad() {
        this.handleActionBtn(0, 'reset')
        this.handleActionBtn(0, 'back')
        SetCom.isChallenge = true
        // let resouceArr = await this.dynamicCreate('spin/全人物动作json')
        // keel.getComponent(KeelReplaceSkin).replaceSkin(resouceArr[8], resouceArr[10])

        this.replaceSpin()
        // 换皮肤
        // this.replaceSkin.dynamicCreate()
    }
    async replaceSpin() {
        let _lv = cc.sys.localStorage.getItem('level')
        let spin_name = SetCom.getDJSpinName(_lv)
        let resouceArr = await this.replaceSkin.dynamicCreate('/Challenge_img/全人物DJ动画')
        debugger
        // this.replaceSkin.getComponent(KeelReplaceSkin).replaceSkin(resouceArr[8], resouceArr[10])
    }
    protected onDestroy(): void {
        // SetCom.isChallenge = false

    }
    // update (dt) {}
}
