
import { setupColorSpriteFrame } from "./function";

export class LayerColor extends cc.Node {
    private sprite: cc.Sprite = null;
    constructor(color = cc.color(255, 255, 255)) {
        super();
        this.sprite = this.addComponent(cc.Sprite);
        this.sprite.spriteFrame = setupColorSpriteFrame();
        this.color = color;
    }

    myStopAction(): void {
        this.stopAllActions();
    }
    fadeTo(_t: number, _opc: number, _from_opacity = null) {
        if (_from_opacity) {
            this.opacity = _from_opacity;
        }
        this.runAction(cc.fadeTo(_t, _opc))
    }

    fadeIn(_t: number) {
        this.myStopAction()
        this.runAction(cc.fadeIn(_t))
    }

    fadeOut(_t: number) {
        this.myStopAction()
        this.runAction(cc.fadeOut(_t))
    }
}