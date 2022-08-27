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

    private onNext: Function = null;
    initView(onNext: Function) {
        this.onNext = onNext;
    }
    start(): void {
        let _level = cc.sys.localStorage.getItem('level')
        let node = cc.instantiate(SetCom.getSomeSpin(_level, "noGame"));
        if (node) node.y = 760.63
        cc.find("Canvas/bgSprite/spin")?.addChild(node);
        let { cur_level, next_num, next_level, content } = SetCom.getTitleOrJson(_level)
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

    onBtn_Next() {
        this.dismiss(true);
        if (this.onNext) {
            this.onNext();
        }
    }
    physicalOpcFn() {
        let homeScript = this.node.getComponent('home')
        let opc = cc.instantiate(this.physicalOpc)
        opc.active = true;
        let node = cc.find("Canvas");
        let handle = opc.getChildByName("handle");
        handle.getChildByName("btn")?.on("click", (e) => {
            console.log('领取');

            SetCom.shareFriend(
                {
                    success: (_res) => {
                        SetCom.addPower(5)
                        if (homeScript) homeScript._updateSpirit()
                        opc.destroy()
                    },

                })

        })
        handle.getChildByName("label")?.once("click", () => {
            opc.destroy()
        })

        node.addChild(opc);
    }
    onScene(e, name) {
        switch (name) {
            case "game":
                if (SetCom.reducePower()) {
                    cc.director.loadScene(name);
                } else {
                    this.physicalOpcFn()

                }
                break;

            default:
                cc.director.loadScene(name);

                break;
        }

    }
    static show(onNext) {
        DlgYouWin.create("prefabs/dialog_youWIn", onNext)
    }
}