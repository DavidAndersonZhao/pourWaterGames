// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

import ListViewCtrl from "./listViewCtrl";
@ccclass
export default class SwitchProp extends cc.Component {

    @property(cc.SpriteFrame)
    prop_check: cc.SpriteFrame[] = [];
    @property(cc.SpriteFrame)
    prop_noCheck: cc.SpriteFrame[] = [];

    @property(ListViewCtrl)
    listViewCtrl: ListViewCtrl = null

    onLoad() {
        this.listViewCtrl.initialize();

    }
    taskClick(e, index) {
        for (let i = 0; i < this.node.children.length; i++) {
            const element = this.node.children[i];
            element.getComponent(cc.Sprite).spriteFrame = this.prop_noCheck[i]
        }
        e.target.getComponent(cc.Sprite).spriteFrame = this.prop_check[+index]
        this.listViewCtrl.initialize(+index ? 'peoples' : 'props');
    }



    start() {

    }

}
