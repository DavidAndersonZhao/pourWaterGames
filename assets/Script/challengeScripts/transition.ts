// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Node)
    tipNode: cc.Node = null;

    @property([cc.SpriteFrame])
    tipSprites = []
    // LIFE-CYCLE CALLBACKS:

    resumeFn
    onLoad() {

        // 对单个 cc.AnimationState 注册回调
        var animState: any = this.node.getComponent(cc.Animation).getAnimationState('transitionModal');
        var duration = animState.duration;
        setTimeout(() => {
            this.node.destroy()
                if (this.resumeFn) this.resumeFn()
        }, duration*1000);
        
    }
    setSprite(i) {
        this.tipNode.getComponent(cc.Sprite).spriteFrame = this.tipSprites[i]
    }
    start() {

    }

    // update (dt) {}
}
