
import { DlgSetting } from "./dialog/dlg_setting";
// import { DlgYouWin } from "./dialog/dlg_youWIn";
import { AudioEnum, UtilAudio } from "./utils/audio_util";
import SetCom from "./utils/setCom";
import { CupMgr } from "./views/cupMgr";


const { ccclass, property } = cc._decorator;

@ccclass
export default class PlayScene extends cc.Component {
    @property(CupMgr)
    private cupMgr: CupMgr = null;
    @property(cc.Label)
    private text_level: cc.Label = null;
    @property(cc.Label)
    private text_actionNum: cc.Label = null;

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
    onLoad() {
        this.cupMgr.node.on("level_finish", this.onFinishOneLevel, this);
        this.cupMgr.node.on("do_pour", this.onPourAction, this);
        this.handleActionBtn(SetCom.global_prop.reset, 'reset')
        this.handleActionBtn(SetCom.global_prop.backOff, 'back')
        this.handleActionBtn(SetCom.global_prop.testTube, 'add')

        cc.find('Canvas/bg/bgImg/btns/add')?.on("click", () => this.addCur())
    }

    onDestroy() {
        this.cupMgr.node?.off("level_finish", this.onFinishOneLevel, this);
        this.cupMgr.node?.off("do_pour", this.onPourAction, this);
    }

    start() {
        this.text_level.string = this.cupMgr.getLevel() + ''

    }

    onFinishOneLevel() {
        UtilAudio.effect_play(AudioEnum.youWin);
        // DlgYouWin.show(() => {
        //     this.cupMgr.nextLevel()
        //     this.text_level.string = this.cupMgr.getLevel() + ''

        // })
    }

    onPourAction() {

    }

    onBtn_restart() {
        if (this.cupMgr.haveAnimationPlay) return

        if (SetCom.global_prop.reset) {
            this.handleActionBtn(--SetCom.global_prop.reset, 'reset')
        } else {

            SetCom.advertisement(
                {
                    success: (_res) => {
                        this.handleActionBtn(++SetCom.global_prop.reset, 'reset')
                    },
                    fail: () => {
                        SetCom.shareFriend(
                            {
                                success: (_res) => {
                                    this.handleActionBtn(++SetCom.global_prop.reset, 'reset')
                                },
                            })
                    }
                })
            return
        }
        cc.director.loadScene("game");
        this.cupMgr.nextLevel();

    }


    onBtn_recover() {
        this.cupMgr.undoAction(() => {
            if (SetCom.global_prop.backOff) {
                this.handleActionBtn(--SetCom.global_prop.backOff, 'back')
            } else {

                SetCom.advertisement(
                    {
                        success: (_res) => {
                            this.handleActionBtn(++SetCom.global_prop.backOff, 'back')
                        },
                        fail: () => {
                            SetCom.shareFriend(
                                {
                                    success: (_res) => {
                                        this.handleActionBtn(++SetCom.global_prop.backOff, 'back')
                                    },
                                })
                        }
                    })
                return
            }
            return true
        });

    }
    addCur() {
        if (this.addCurDone) return
        if (SetCom.global_prop.testTube) {
            this.handleActionBtn(--SetCom.global_prop.testTube, 'add')
            this.cupMgr.addcur()
            this.addCurDone = true
        } else {
            SetCom.advertisement(
                {
                    success: (_res) => {
                        this.handleActionBtn(++SetCom.global_prop.testTube, 'add')
                    },
                    fail: () => {
                        SetCom.shareFriend(
                            {
                                success: (_res) => {
                                    this.handleActionBtn(++SetCom.global_prop.testTube, 'add')
                                },
                            })
                    }
                })
            return
        }
        return true
    }
    onBtn_tip() {

    }

    onBtn_setting() {
        DlgSetting.show();
    }

    nextToLevel() {
        let level = cc.sys.localStorage.getItem('level')
        cc.sys.localStorage.setItem("level", level >= 999 ? 999 : ++level);
        cc.director.loadScene('victory');
    }

}
