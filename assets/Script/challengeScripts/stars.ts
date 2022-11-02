// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {


    // @property(cc.SpriteFrame)
    // starsSprite = null
    // @property(cc.SpriteFrame)
    // starsSprite_no = null
    @property(cc.Prefab)
    starsPre:cc.Prefab = null
    @property
    starsNumber: number = 3;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.init()
        // setInterval(() => {
        //     this.delStars()
        // }, 3000);
    }
    init() {
        this.node.destroyAllChildren()
        for (let i = 0; i < this.starsNumber; i++) {
            let starsPre = cc.instantiate(this.starsPre)
            this.node.addChild(starsPre)
        }
    }
    delStars() {
        if (--this.starsNumber > -1) {
            let node = this.node.children[this.starsNumber]
            node.getComponent(dragonBones.ArmatureDisplay).playAnimation('newAnimation', 1)
        }
    }
    start() {

    }

    // update (dt) {}
}
