// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.ProgressBar)
    private proBar: cc.ProgressBar = null

    @property
    private time = 10

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}
    state = true
    start() {


    }
    changeState(bool: boolean) {
        this.state = bool
    }
    resetTime() {
        this.proBar.progress = 1
    }
    update(dt) {
        if (this.proBar.progress > 0 && this.state) {
            this.proBar.progress -= 1 / (this.time * 60);
        }
    }
}
