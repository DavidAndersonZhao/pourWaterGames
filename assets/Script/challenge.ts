

import { UtilAudio } from "./utils/audio_util";
import SetCom from "./utils/setCom";
import { CupMgr } from "./views/cupMgr";
import CountDown from "./countTime/countDown";
import Transition from "./challengeScripts/transition";
import ModalHandle from './challengeScripts/ModalHandle'
import KeelReplaceSkin from './challengeScripts/keelReplaceSkin'
const { ccclass, property } = cc._decorator;
enum PropState {
    Video,
    Have,
    No
}
interface OpcGroupInter {
    failModal: cc.Prefab
    successModal: cc.Prefab
    backModal: cc.Prefab
    resurrectionModal: cc.Prefab
    pauseModal: cc.Prefab
}
interface dragonBonesGroupInter {
    dbAsset: dragonBones.DragonBonesAsset
    dbAtlas: dragonBones.DragonBonesAtlasAsset
}
// @property(dragonBones.ArmatureDisplay)
/*  */
const dragonBonesGroup = cc.Class({
    name: 'dragonBonesGroup',
    properties: {
        dbAsset: {
            default: null,
            type: dragonBones.DragonBonesAsset
        },
        dbAtlas: {
            default: null,
            type: dragonBones.DragonBonesAtlasAsset
        }
    }
})
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
        },
        failModal: {//失敗
            default: null,
            type: cc.Prefab,
        },
        successModal: {//成功
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
    @property([dragonBonesGroup])
    skins: dragonBonesGroupInter[] = []
    @property(cc.Prefab)
    private exitModal: cc.Prefab = null;
    @property(cc.Node)
    private timeParseNode: cc.Node = null;//暂停弹窗
    @property(cc.Prefab)
    private tipModal: cc.Prefab = null;//t弹窗过渡
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
        ModalNode.getComponent(ModalHandle).resetFn = this.init

        ModalNode.getComponent(ModalHandle).endFn = this.endEventFn

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

                this.onpenToast()
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
                // this.countDown.pauseTimeHandle();
                this.timeParseNode.active = true
                setTimeout(() => {
                    this.timeParseNode.active = false
                }, 3000);
                this.countDown.pauseGame()
                this.countDown.pauseStateAll = true
                break;
            case PropState.No:
                this.onpenToast()

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
                    this.onpenToast()

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
    onpenToast() {
        if (CC_WECHATGAME) {
            wx.showToast({
                title: '挑战模式道具只能用一次',
                icon: 'none'
            })
        }
    }
    endEventFn = () => {
        let ModalNode: cc.Node = cc.instantiate(this.modalSetting.failModal)
        this.node.addChild(ModalNode)
        this.countDown.clearTimer()
    }
    // 复活
    resurrectionHandle() {
        if (this.prop.resurrection === PropState.No) {
            this.endEventFn()
            return
        }
        this.createModal('resurrectionModal', () => {
            this.prop.resurrection = PropState.No
            this.countDown.resurrectionFn()
        })
    }
    private skinNum
    onLoad() {
        this.skinNum = ~~(Math.random() * this.skins.length)
        this.init()
        // 换皮肤
    }
    init() {
        this.handleActionBtn(0, 'reset')
        this.handleActionBtn(0, 'back')
        SetCom.isChallenge = true
        this.replaceSpin()
    }
    /* async replaceSpin() {
        let _lv = cc.sys.localStorage.getItem('level')
        let spin_name = SetCom.getDJSpinName(_lv)
        let resouceArr = await this.replaceSkin.dynamicCreate('全人物DJ动画') as any[]
        let dbAsset = resouceArr.find(item => item._name == spin_name + "_ske")
        let dbAtlas = resouceArr.find(item => item._name == spin_name + "_tex")
        
        // ske tex
        this.replaceSkin.getComponent(KeelReplaceSkin).replaceSkin(dbAsset, dbAtlas)
    } */
    async replaceSpin() {
        let { dbAsset, dbAtlas } = this.skins[this.skinNum]
        this.replaceSkin.getComponent(KeelReplaceSkin).replaceSkin(dbAsset, dbAtlas)
    }
    protected onDestroy(): void {
        // SetCom.isChallenge = false

    }
    successFn() {
        let ModalNode: cc.Node = cc.instantiate(this.modalSetting.successModal)
        let modalScript = ModalNode.getComponent(ModalHandle)
        this.countDown.clearTimer()
        SetCom.addRankingList({
            passTime: this.countDown.TakeTime,
            passTimeShow: this.countDown.takeTimeShow
        }).then(async (res) => {
            let { serviceTime, currentData } = await SetCom.getRankingList()
            let { avatarUrl, _lv, shop_people, rankingNum } = currentData || {}
            // TODO: 找挑战时间
            modalScript.setSuccessModal({
                date: SetCom.serviceTime,
                challengeTime: `挑战用时${this.countDown.takeTimeShow}`,
                rank: `第${rankingNum}名`,
                headerImgUrl: avatarUrl
            })
            modalScript.replaceSpin(_lv, shop_people)
            this.node.addChild(ModalNode)
        })

    }
    backBtn() {
        this.countDown.pauseGame()
        let ModalNode: cc.Node = cc.instantiate(this.exitModal)
        let modalScript = ModalNode.getComponent(ModalHandle)
        modalScript.calFn = () => this.countDown.resumeGame()
        if (this.prop.resurrection === PropState.No) {
            modalScript.cancelResurrectionLabel()
            return
        }
        this.node.addChild(ModalNode)
    }
    showTipModal(num: number) {
        let ModalNode: cc.Node = cc.instantiate(this.tipModal)
        let modalScript = ModalNode.getComponent(Transition)
        modalScript.setSprite(num)
        this.node.addChild(ModalNode)
    }

    // destroy(): boolean {
    //     SetCom.isChallenge = false
    // }
    // update (dt) {}
}
