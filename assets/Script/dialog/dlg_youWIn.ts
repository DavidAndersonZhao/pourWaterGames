import SetCom from "../utils/setCom";
import { BaseDialog } from "./base_dialog";

const { ccclass, property } = cc._decorator;

@ccclass
export class DlgYouWin extends BaseDialog {
    @property(cc.Label)
    title: cc.Label = null
    @property(cc.Label)
    next_num: cc.Label = null
    @property(cc.Label)
    label: cc.Label = null
    @property(cc.Label)
    content: cc.Label = null
    @property(cc.Node)
    text_node: cc.Node = null
    @property(cc.Prefab)
    physicalOpc: cc.Prefab = null

    private toNext: Function = null;
    initView(toNext: Function) {
        this.toNext = toNext;
    }
    start(): void {
        SetCom.bannerShow('gridAd', 'show')

        let _lv = cc.sys.localStorage.getItem('level')
        let element = cc.instantiate(SetCom.getSomeSpin(_lv, "noGame"));
        if (element) element.y = 760.63
        cc.find("Canvas/bgSprite/spin")?.addChild(element);
        let { cur_level, next_num, next_level, content } = SetCom.getTitleOrJson(_lv)
        if (this.title) this.title.string = cur_level
        if (this.label) this.label.string = next_level
        if (this.content) this.content.string = content
        if (this.next_num) this.next_num.string = next_num + ''

        if ((!cur_level || !next_level) && this.text_node) {
            this.text_node.active = false
        }
    }
    exitView() {

    }

    toButton_Next() {
        this.dismiss(true);
        if (this.toNext) {
            this.toNext();
        }
    }
    physicalOpacityFunction() {
        let homeScript = this.node.getComponent('home')
        let opacity = cc.instantiate(this.physicalOpc)
        opacity.active = true;
        let canvas = cc.find("Canvas");
        let _handle = opacity.getChildByName("handle");
        _handle.getChildByName("btn")?.on("click", (e) => {
            SetCom.advertisement(
                {
                    success: (_res) => {
                        SetCom.addPower(5)
                        if (homeScript) homeScript._updateSpirit()
                        opacity.destroy()
                    },
                    fail: () => {
                        SetCom.shareFriend(
                            {
                                success: (_res) => {
                                    SetCom.addPower(5)
                                    if (homeScript) homeScript._updateSpirit()
                                    opacity.destroy()
                                },
                            })
                    }
                })

        })
        _handle.getChildByName("label")?.once("click", () => {
            opacity.destroy()
        })

        canvas.addChild(opacity);
    }
    onScene(e, name) {
        switch (name) {
            case "game":
                if (SetCom.reducePower()) {
                    cc.director.loadScene(name);
                } else {
                    this.physicalOpacityFunction()

                }
                break;

            default:
                cc.director.loadScene(name);

                break;
        }

    }
    static show(toNext) {
        DlgYouWin.create("prefabs/dialog_youWIn", toNext)
    }
}