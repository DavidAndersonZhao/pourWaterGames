// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    private boom: cc.Prefab = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let _boom = cc.instantiate(this.boom);
        _boom.zIndex = 9999
        // _boom.y = 167
        this.node.addChild(_boom)
    }

    start () {

    }

    // update (dt) {}
}
