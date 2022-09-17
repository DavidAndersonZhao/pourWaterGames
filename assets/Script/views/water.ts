
const { ccclass, property, requireComponent, executeInEditMode, disallowMultiple, executionOrder } = cc._decorator;

export interface WaterInformation {
    colorId: number,
    color: cc.Color,
    height: number,
}

const MAX_ARRAY_LENGTH = 6;

enum PourMotion {
    empty,
    enter,
    leave,
}

@ccclass
@requireComponent(cc.Sprite)
@executeInEditMode
@disallowMultiple
@executionOrder(-100)
export default class Water extends cc.Component {
    private _motion: PourMotion = PourMotion.empty;
    private informations: WaterInformation[] = [];
    private stopIndex = -1;
    private currentIndex = 0;
    private upHeight: number

    private _proportion: number = 1;
    @property(cc.EffectAsset)
    private effect: cc.EffectAsset = null;
    @property private _skewAngle: number = 0;
    @property({ tooltip: CC_DEV && '旋转角度' })
    public get skewAngle() { return this._skewAngle; }
    public set skewAngle(value: number) {
        value = Math.round(value * 100) / 100;
        this._skewAngle = value;
        this.replaceHornH();
    }

    private stock: cc.Material = null;

    protected onLoad() {
        let sprite = this.node.getComponent(cc.Sprite);
        if (sprite.spriteFrame) sprite.spriteFrame.getTexture().packable = false;
        if (this.effect) {
            this.stock = cc.Material.create(this.effect);
            sprite.setMaterial(0, this.stock);
        }
        this.stock = sprite.getMaterial(0)
        this._proportion = this.node.height / this.node.width;
    }

    public initializeInformations(informations: Array<WaterInformation>) {
        this.informations = informations;
        this.currentIndex = this.informations.length - 1;

        this.initialZoomColor();
        this.replaceHornH();
    }

    private raiseHeight = 0;
    private raiseHeightCopy = 0;
    public raiseInformation(information: WaterInformation, num: number) {//TODO:涨水有点问题
        let raiseInformation = this.informations[this.currentIndex];
        // console.log(raiseInformation, this.raiseHeight);
        // 处理多个试管一起倒水问题
        if (raiseInformation && this.raiseHeight) raiseInformation.height = this.raiseHeight
        this.raiseHeight = information.height;
        this.raiseHeightCopy += information.height
        information.height = 0;
        this.informations.push(information);
        this._motion = PourMotion.enter;

        this.currentIndex = this.informations.length - 1;

        this.initialZoomColor();
    }

    private onLeaveBegin: Function = null;
    private onLeaveComplete: Function = null;
    public setPourOutCallback(onOutStart: Function, onOutFinish: Function) {
        this.onLeaveBegin = onOutStart;
        this.onLeaveComplete = onOutFinish;
    }

    private onInsideComplete: Function = null;
    public setPourInCallback(onInFInish: Function) {
        this.onInsideComplete = onInFInish;
    }


    public getPourBeginHorn() {
        let _h = 0;
        for (let i = 0; i <= this.currentIndex; i++) {
            _h += this.informations[i].height;
        }

        return this.getCriticismHornWithH(_h);
    }


    public getPourFinishHorn() {

        this.stopIndex = this.currentIndex - this.getUpIdenticalColorNum();

        let _h = 0;
        for (let i = 0; i <= this.stopIndex; i++) {
            _h += this.informations[i].height;
        }

        return this.getCriticismHornWithH(_h);
    }

    private getCriticismHornWithH(_h) {

        let ret = 0;
        if (_h == 0) {
            ret = 90;
            return ret;
        }

        if (_h < 0.5) {
            let tanVal = this._proportion / (_h * 2.0);
            ret = Math.atan(tanVal);
        } else {
            let tanVal = 2.0 * this._proportion * (1.0 - _h);
            ret = Math.atan(tanVal);
        }
        ret = radian2angle(ret);
        return ret;
    }

    private getUpIdenticalColorNum() {
        let identicalColorNum = 0;
        let _id = null;
        for (let i = this.currentIndex; i >= 0; i--) {
            if (_id == null) {
                identicalColorNum++;
                _id = this.informations[i].colorId;
            } else if (this.informations[i].colorId == _id) {
                identicalColorNum++;
            } else {
                break;
            }
        }
        return identicalColorNum
    }

    /**
     * 开始倒水
     * 一直倒水直到不同颜色的水到达瓶口，为当前最大能倾斜的角度
     * @returns 返回值为倾斜角度的绝对值 TODO: 可能需要调整 7/25
     */
    public onBeginPour(num = this.getUpIdenticalColorNum(), upHeight) {
        // 赋值为倒水状态
        this._motion = PourMotion.leave;
        // 拟定一个值为stopIndex 初始值为currentIndex
        let stopIndex = this.currentIndex
        // 计数器 倒序迭代
        let i = this.informations.length
        while (i--) {
            // 如果高度系数大于0
            if (upHeight > 0) {
                // 从后往前减 直到小于等于0迭代结束
                upHeight -= this.informations[i].height
                // 递减
                stopIndex--
            } else {
                break
            }
        }
        // if (upHeight) {

        // }

        this.stopIndex = stopIndex == -1 ? this.currentIndex - num : stopIndex
        // this.stopIndex = this.currentIndex-num
        this.upHeight = upHeight
    }
    private randomNum: string = Math.random().toString(36)
    update() {
        if (this._motion == PourMotion.leave) {
            this.pourPace();
        } else if (this._motion == PourMotion.enter) {
            this.additionPace()
        }
    }


    additionPace() {

        if (this.currentIndex < 0) {
            this._motion = PourMotion.empty;
            return;
        }
        let infomation = this.informations[this.currentIndex];
        infomation.height = Math.round((infomation.height + 0.005) * 1000) / 1000;

        if (infomation.height >= this.raiseHeight) {
            infomation.height = this.raiseHeight;
            // 由于有多个试管同时倒水，所以这里一定别忘了清零  很重要！！！！！
            this.raiseHeight = 0
            this._motion = PourMotion.empty;
            if (this.onInsideComplete) {
                this.onInsideComplete();
                this.onInsideComplete = null;
            }
        }

        this.replaceHornH();
    }


    pourPace() {
        if (this.currentIndex < 0) {
            this._motion = PourMotion.empty;
            return;
        }
        let _h = 0;
        for (let i = 0; i <= this.currentIndex; i++) {
            _h += this.informations[i].height;
        }
        let is_up = false;
        let ang = (this.skewAngle % 360) * Math.PI / 180.0
        let _t = Math.abs(Math.tan(ang));
        if (_h < 0.5) {
            is_up = _t > (this._proportion) / (_h * 2.0);
        } else {
            is_up = _t > 2.0 * this._proportion * (1.0 - _h);
        }

        let info = this.informations[this.currentIndex];
        if (!is_up) {
            if (info.height < 0.05) {

            } else {
                return;
            }
        }
        if (this.onLeaveBegin) {
            this.onLeaveBegin();
            this.onLeaveBegin = null;
        }

        info.height = Math.round((info.height - 0.005) * 1000) / 1000;
        if (info.height < 0.01) {
            console.log(info.height, this.raiseHeight, [...this.informations], this.currentIndex, 'del', this.randomNum);
            info.height = 0;

            this.currentIndex--;
            this.informations.pop();
            // console.log(this.currentIndex, this.stopIndex);

            if (this.currentIndex == this.stopIndex) {
                if (this.onLeaveComplete) {
                    this.onLeaveComplete();
                    this.onLeaveComplete = null;
                }
                this._motion = PourMotion.empty;
            }
        }
        this.replaceHornH();
    }

    private initialZoomColor() {
        let colours = new Float32Array(MAX_ARRAY_LENGTH * 4);
        for (let i = 0; i < this.informations.length; i++) {
            const color = this.informations[i].color;
            colours[i * 4] = color.r / 255;
            colours[i * 4 + 1] = color.g / 255;
            colours[i * 4 + 2] = color.b / 255;
            colours[i * 4 + 3] = 1.0;
        }
        this.stock.setProperty('colors', colours);
        this.stock.setProperty('iResolution', cc.v2(this.node.width, this.node.height));
        this.stock.setProperty('waveType', 0);
    }

    private replaceHornH() {
        let _h = new Float32Array(MAX_ARRAY_LENGTH * 4);
        for (let i = 0; i < this.informations.length; i++) {
            _h[i * 4] = this.informations[i].height;
            _h[i * 4 + 1] = 0;
            _h[i * 4 + 2] = 0;
            _h[i * 4 + 3] = 0;
        }
        this.stock.setProperty('heights', _h);
        this.stock.setProperty('skewAngle', this._skewAngle);

        let rippleMold = 0.0;
        if (this._motion == PourMotion.enter) {
            rippleMold = 1.0;
        } else if (this._motion == PourMotion.leave) {
            rippleMold = 2.0;
        }
        this.stock.setProperty('waveType', rippleMold);

    }


}

function radian2angle(radian: number) {
    return radian / Math.PI * 180;
}