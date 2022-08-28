
const {ccclass, property} = cc._decorator;
enum OpcState {
    default,
    people,
    debris,
    prop,
    prop2,
    decorate
}
const OpcGroup = cc.Class({
    name: "OpcGroupM",
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
interface OpcGroupInter {
    peopleOpc: cc.Prefab
    debrisOpc: cc.Prefab
    propOpc: cc.Prefab
    prop2Opc: cc.Prefab
    decorateOpc: cc.Prefab
}
@ccclass
export default class NewClass extends cc.Component {

    @property(OpcGroup)
    opcGroup: OpcGroupInter = null


    start () {

    }
    openOpc(type: OpcState, data, noDouble: boolean = false) {
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
        opcScript.changeNode(data, type)
        node.addChild(opc);

    }

}
