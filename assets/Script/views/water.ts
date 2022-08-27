
const { ccclass, property, requireComponent, executeInEditMode, disallowMultiple, executionOrder } = cc._decorator;

export interface WaterInfo {
    colorId: number,
    color: cc.Color,
    height: number,
}

const MAX_ARR_LEN = 6;

enum PourAction {
    none,
    in,
    out,
}

@ccclass
@requireComponent(cc.Sprite)
@executeInEditMode
@disallowMultiple
@executionOrder(-100)
export default class Water extends cc.Component {
    private _action: PourAction = PourAction.none;
    private infos: WaterInfo[] = [];
    private stopIdx = -1;
    private curIdx = 0;

    private _ratio: number = 1;
    @property(cc.EffectAsset)
    private effect: cc.EffectAsset = null;
    @property private _skewAngle: number = 0;
    @property({ tooltip: CC_DEV && '旋转角度' })
    public get skewAngle() { return this._skewAngle; }
    public set skewAngle(value: number) {
        value = Math.round(value * 100) / 100;
        this._skewAngle = value;
        this.updateAngleHeight();
    }

    private material: cc.Material = null;
    
    protected onLoad() {
        let sp = this.node.getComponent(cc.Sprite);
        if (sp.spriteFrame) sp.spriteFrame.getTexture().packable = false;
        if (this.effect) {
            this.material = cc.Material.create(this.effect);
            sp.setMaterial(0, this.material);
        }
        this.material = sp.getMaterial(0)
        this._ratio = this.node.height / this.node.width;
    }

    public initInfos(infos: Array<WaterInfo>) {
        this.infos = infos;
        this.curIdx = this.infos.length - 1;

        this.initSizeColor();
        this.updateAngleHeight();
    }

    private addHeight = 0;
    public addInfo(info: WaterInfo) {
        let ainfo = this.infos[this.curIdx];
        if(ainfo && this.addHeight) ainfo.height = this.addHeight
        this.addHeight = info.height;
        info.height = 0;
        this.infos.push(info);
        this._action = PourAction.in;
        this.curIdx = this.infos.length - 1;

        this.initSizeColor();
    }

    private onOutStart: Function = null;
    private onOutFinish: Function = null;
    public setPourOutCallback(onOutStart: Function, onOutFinish: Function) {
        this.onOutStart = onOutStart;
        this.onOutFinish = onOutFinish;
    }

    private onInFInish: Function = null;
    public setPourInCallback(onInFInish: Function) {
        this.onInFInish = onInFInish;
    }


    public getPourStartAngle() {
        let _height = 0;
        for (let i = 0; i <= this.curIdx; i++) {
            _height += this.infos[i].height;
        }

        return this.getCriticalAngleWithHeight(_height);
    }


    public getPourEndAngle() {
        this.stopIdx = this.curIdx - this.getTopSameColorNum();

        let _height = 0;
        for (let i = 0; i <= this.stopIdx; i++) {
            _height += this.infos[i].height;
        }

        return this.getCriticalAngleWithHeight(_height);
    }

    private getCriticalAngleWithHeight(_height) {

        let ret = 0;
        if (_height == 0) {
            ret = 90;
            return ret;
        }

        if (_height < 0.5) {
            let tanVal = this._ratio / (_height * 2.0);
            ret = Math.atan(tanVal);
        } else {
            let tanVal = 2.0 * this._ratio * (1.0 - _height);
            ret = Math.atan(tanVal);
        }
        ret = radian2angle(ret);
        return ret;
    }

    private getTopSameColorNum() {
        let sameColorNum = 0;
        let colorId = null;
        for (let i = this.curIdx; i >= 0; i--) {
            if (colorId == null) {
                sameColorNum++;
                colorId = this.infos[i].colorId;
            } else if (this.infos[i].colorId == colorId) {
                sameColorNum++;
            } else {
                break;
            }
        }
        return sameColorNum
    }

    /**
     * 开始倒水
     * 一直倒水直到不同颜色的水到达瓶口，为当前最大能倾斜的角度
     * @returns 返回值为倾斜角度的绝对值 TODO: 可能需要调整 7/25
     */
    public onStartPour(num = this.getTopSameColorNum()) {
//TODO:水溢出的情况下会有问题
        
        this._action = PourAction.out;
        this.stopIdx = this.curIdx - num;
    }

    update() {
        if (this._action == PourAction.out) {
            this.pourStep();
        } else if (this._action == PourAction.in) {
            this.addStep()
        }
    }


    addStep() {
        if (this.curIdx < 0) {
            return;
        }
        let info = this.infos[this.curIdx];
        info.height = Math.round((info.height + 0.005) * 1000) / 1000;
        if (info.height >= this.addHeight) {
            info.height = this.addHeight;
            this._action = PourAction.none;
            if (this.onInFInish) {
                this.onInFInish();
                this.onInFInish = null;
            }
        }

        this.updateAngleHeight();
    }


    pourStep() {
        if (this.curIdx < 0) {
            this._action = PourAction.none;
            return;
        }
        let _height = 0;
        for (let i = 0; i <= this.curIdx; i++) {
            _height += this.infos[i].height;
        }
        let is_top = false;
        let angle = (this.skewAngle % 360) * Math.PI / 180.0
        let _t = Math.abs(Math.tan(angle));
        if (_height < 0.5) {
            is_top = _t > (this._ratio) / (_height * 2.0);
        } else {
            is_top = _t > 2.0 * this._ratio * (1.0 - _height);
        }

        let info = this.infos[this.curIdx];
        if (!is_top) {
            if (info.height < 0.05) {

            } else {
                return;
            }
        }
        if (this.onOutStart) {
            this.onOutStart();
            this.onOutStart = null;
        }

        info.height = Math.round((info.height - 0.005) * 1000) / 1000;
        if (info.height < 0.01) {
            info.height = 0;
            console.log(this.infos);
            
            this.infos.pop();
            this.curIdx--;
            if (this.curIdx == this.stopIdx) {
                if (this.onOutFinish) {
                    this.onOutFinish();
                    this.onOutFinish = null;
                }
                this._action = PourAction.none;
            }
        }
        this.updateAngleHeight();
    }

    private initSizeColor() {
        let _colors = new Float32Array(MAX_ARR_LEN * 4);
        for (let i = 0; i < this.infos.length; i++) {
            const color = this.infos[i].color;
            _colors[i * 4] = color.r / 255;
            _colors[i * 4 + 1] = color.g / 255;
            _colors[i * 4 + 2] = color.b / 255;
            _colors[i * 4 + 3] = 1.0;
        }
        this.material.setProperty('colors', _colors);
        this.material.setProperty('iResolution', cc.v2(this.node.width, this.node.height));
        this.material.setProperty('waveType', 0);
    }

    private updateAngleHeight() {
        let _heights = new Float32Array(MAX_ARR_LEN * 4);
        for (let i = 0; i < this.infos.length; i++) {
            _heights[i * 4] = this.infos[i].height;
            _heights[i * 4 + 1] = 0;
            _heights[i * 4 + 2] = 0;
            _heights[i * 4 + 3] = 0;
        }
        this.material.setProperty('heights', _heights);
        this.material.setProperty('skewAngle', this._skewAngle);

        let waveType = 0.0;
        if (this._action == PourAction.in) {
            waveType = 1.0;
        } else if (this._action == PourAction.out) {
            waveType = 2.0;
        }
        this.material.setProperty('waveType', waveType);

    }

    private dot: cc.Node = null;
    private showDebugCenter() {
        if (CC_EDITOR) {
            return;
        }
        if (this.dot == null) {
            this.dot = new cc.Node();
            this.dot.parent = this.node;
            let label = this.dot.addComponent(cc.Label);
            label.string = "·";
            label.fontSize = 60;
            this.dot.color = cc.Color.RED;
        }

        let ratio = this.node.height / this.node.width;
        let angle = angle2radian(this.skewAngle);
        let _height = 0;
        for (let i = 0; i <= this.curIdx; i++) {
            _height += this.infos[i].height;
        }

        let toLeft = Math.sin(angle) >= 0.0;
        let center = cc.v2(0.5, 1.0 - _height);

        let _t = Math.abs(Math.tan(angle));
        if (_height <= 0.5) {
            let is_bottom = _t > ratio * 2.0 * _height;
            if (is_bottom) {
                center.x = Math.sqrt((2.0 * _height / _t) * ratio) / 2.0;
                center.y = 1.0 - Math.sqrt((2.0 * _height * _t) / ratio) / 2.0;

                let is_top = _t > (ratio) / (_height * 2.0);
                if (is_top) {
                    center.y = 0.5;
                    center.x = _height;
                }
            }
            if (!toLeft) {
                center.x = 1.0 - center.x;
            }
            if (Math.abs(center.x - 0.25) < 0.01) {
                let i = 0;
            }
        } else {
            let is_top = _t > 2.0 * ratio * (1.0 - _height);
            if (is_top) {
                center.x = Math.sqrt(2.0 * ratio * (1.0 - _height) / _t) / 2.0;
                center.y = Math.sqrt(2.0 * ratio * (1.0 - _height) * _t) / 2.0 / ratio;
                let is_bottom = _t > ratio / (2.0 * (1.0 - _height));
                if (is_bottom) {
                    center.y = 0.5;
                    center.x = 1.0 - _height;
                }
            } else {
            }

            if (toLeft) {
                center.x = 1.0 - center.x;
            }
        }
        center.x = center.x - 0.5;
        center.y = -center.y + 0.5;
        let pt = cc.v3(center.x * this.node.width, center.y * this.node.height);
        this.dot.position = pt;
    }
}

function angle2radian(angle: number) {
    while (angle > 360) {
        angle -= 360;
    }
    while (angle < -360) {
        angle += 360;
    }
    return (angle % 360) * Math.PI / 180.0;
}

function radian2angle(radian: number) {
    return radian / Math.PI * 180;
}