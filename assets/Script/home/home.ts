// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import Draw from "./Draw";
import Sign from "./sign";
import Task from "./ScrollView";
import SetCom from "../utils/setCom";
enum OpcState {
    default,
    people,
    debris,
    prop,
    prop2,
    decorate
}
interface OpcGroupInter {
    peopleOpc: cc.Prefab
    debrisOpc: cc.Prefab
    propOpc: cc.Prefab
    prop2Opc: cc.Prefab
    decorateOpc: cc.Prefab
}
const OpcGroup = cc.Class({
    name: "OpcGroup",
    properties: {
        peopleOpc: {
            default: null,
            type: cc.Prefab,
        },
        debrisOpc: {
            default: null,
            type: cc.Prefab,
        },
        propOpc: {
            default: null,
            type: cc.Prefab,
        },
        prop2Opc: {
            default: null,
            type: cc.Prefab,
        },
        decorateOpc: {
            default: null,
            type: cc.Prefab,
        }
    },
});
@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Label)
    spirit: cc.Label = null//体力

    @property(cc.Prefab)
    resources: cc.Prefab = null;

    @property(cc.SpriteFrame)
    btns: cc.SpriteFrame[] = [];

    @property(cc.AudioSource)
    audioSource: cc.AudioSource = null;

    @property(Draw)
    drawOpc: Draw = null;

    @property(Sign)
    signOpc: Sign = null;

    @property(Task)
    taskOpc: Task = null;

    @property(OpcGroup)
    opcGroup: OpcGroupInter = null

    @property(Number)
    power: number = 5

    @property(cc.Label)
    next_num: cc.Label = null
    @property(cc.Label)
    label: cc.Label = null
    @property(cc.Node)
    text_node: cc.Node = null
    @property(cc.Node)
    task_icon_node: cc.Node = null
    @property(cc.Node)
    sign_node: cc.Node = null
    private _musicPlay: boolean = true
    private _shockPlay: boolean = true

    public get musicPlay(): boolean {
        return this._musicPlay
    }

    public set musicPlay(bool: boolean) {
        this._musicPlay = bool;
    }

    public get shockPlay(): boolean {
        return this._shockPlay
    }

    public set shockPlay(bool: boolean) {
        this._shockPlay = bool;
    }

    openOpc(type: OpcState, data, noDouble: boolean = false, frame?: cc.SpriteFrame, label?: string, scale?: number) {
        let opc: cc.Node
        switch (type) {
            case OpcState.people:
                opc = cc.instantiate(this.opcGroup.peopleOpc)
                break;
            case OpcState.debris:
                opc = cc.instantiate(this.opcGroup.debrisOpc)
                break;
            case OpcState.prop:
                opc = cc.instantiate(this.opcGroup.propOpc)
                break;
            case OpcState.prop2:
                opc = cc.instantiate(this.opcGroup.prop2Opc)
                break;
            case OpcState.decorate:
                opc = cc.instantiate(this.opcGroup.decorateOpc)
                break;
            default:
                break;
        }
        opc.active = true;
        let node = cc.find("Canvas");
        let opcScript = opc.getComponent('modal')
        if (noDouble) opc.getChildByName('handle').getChildByName('btn').active = false
        opcScript.changeNode(data, type, this.show.bind(this))
        node.addChild(opc);
        if (frame) opcScript.changeBtnImg(frame)
        if (label) opcScript.changeLabel(label)
        if (scale) opcScript.scaleFn(scale)
    }

    getLevel() {

        let _level = cc.sys.localStorage.getItem('level')
        let { cur_level, next_num, next_level } = SetCom.getTitleOrJson(_level)
        if (this.label) this.label.string = next_level
        if (this.next_num) this.next_num.string = next_num + ''
        if (!cur_level || !next_level) {
            this.text_node.active = false
        }
    }

    setTaskFn() {
        let taskList = this.taskOpc.getTaskListFn() || []
        let taskNum = taskList.filter(item => item.taskState != 4).length
        if (taskNum) {
            this.setTaskNum(taskNum)
        } else {
            this.task_icon_node.active = false
        }
    }

    setTaskNum(taskNum) {
        let tashNode = this.task_icon_node.getChildByName('label')
        tashNode.getComponent(cc.Label).string = taskNum
    }

    public setSignState(bool) {
        this.sign_node.active = bool
    }
    onLoad(): void {
        console.log('onLoad');

        SetCom.loadCache()
        this.show()

        this.setTaskFn()

        this.setSignState(this.signOpc.getSignOrRepair())
        this.getLevel()
        cc.resources.loadDir("prefabs/animationJson", function (err, assets: cc.Prefab[]) {
            let spin_assets = {
                game: assets.filter(item => item.name.indexOf("game") > -1),
                home: assets.filter(item => item.name.indexOf("home") > -1),
                noGame: assets.filter(item => item.name.indexOf("noGame") > -1),
            }
            SetCom.spin = spin_assets

            let node = cc.instantiate(SetCom.getSomeSpin(cc.sys.localStorage.getItem('level'), "home"));
            cc.find("Canvas/bgImg").addChild(node);
        })
    }
    show() {
        this._updateSpirit()
    }

    _updateSpirit() {
        this.spirit.string = `${SetCom.global_prop.physicalStrength}/10`
    }
    setClick() {
        let setOpc = cc.instantiate(this.resources);
        setOpc.active = true;
        this.switchStateFn(setOpc);

        setOpc.getChildByName("opcBg")?.on("click", () => setOpc.destroy());
        let node = cc.find("Canvas");
        node.addChild(setOpc);
    }

    switchStateFn(setOpc) {
        let col = setOpc.getChildByName("bayBg").getChildByName("col");
        let colBot = setOpc.getChildByName("bayBg").getChildByName("colBot");
        for (let item of [
            { node: col, status: this.musicPlay, name: "_musicPlay" },
            { node: colBot, status: this.shockPlay, name: "_shockPlay" },
        ]) {
            let switch_my = item.node.getChildByName("switch");
            this.setImg(switch_my, SetCom.audioSet[item.name]);
            switch_my.on("click", () => {
                this[item.name] = !this[item.name]
                SetCom.audioSet[item.name] = this[item.name]
                this.setImg(switch_my, this[item.name]);
            });
        }
    }
    setImg(node, set) {
        node.getComponent(cc.Sprite).spriteFrame = this.btns[Number(set)];
    }

    drawOpcShow(e, name: string) {
        switch (name) {
            case 'draw':
                this.drawOpc.opcOpen()

                break;
            case 'sign':
                this.signOpc.opcOpen()

                break;
            case 'task':
                this.taskOpc.opcOpen()

                break;
            default:
                break;
        }
    }

    addPower() {
        let winScript = this.node.getComponent('dlg_youWIn')
        winScript.physicalOpcFn()

    }
    start() {

    }

}
