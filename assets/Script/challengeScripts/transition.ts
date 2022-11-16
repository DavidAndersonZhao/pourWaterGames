// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    tipNode: cc.Node = null;

    @property([cc.SpriteFrame])
    tipSprites= [] 
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        setTimeout(() => {
            this.node.destroy()
        }, 1000);
    }
    setSprite(i){
        this.tipNode.getComponent(cc.Sprite).spriteFrame = this.tipSprites[i]
    }
    start () {

    }

    // update (dt) {}
}
