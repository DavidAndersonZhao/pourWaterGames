import { AudioEnum, AudioUtil } from "../utils/audio_util";
import { createTexture } from "../utils/function";
import Water, { WaterInfo } from "./water";

const { ccclass, property } = cc._decorator;

/* 
export let WaterColors = [
    "#155DEF",
    "#F2C90F",
    "#BD2656",
    "#F0791F",
    "#454574",
    "#FE2D26",
    "#BCA6E3",
    "#E4584F",
    "#00B38A",
    "#DD2E44",
    "#E5C69A",
    "#65DC8E",
    "#B068F0",
    "#F010BF",
    "#538849",
]

*/
export let WaterColors = [
    "#BB72FF",
    "#FFD0E9",
    "#B50C9D",
    "#FF995F",
    "#65F3AC",
    "#FF4E87",
    "#5D298E",
    "#1473E7",
    "#FF61F6",
    "#30D4FD",
    "#2C2F68",
    "#FF582E",
    "#48B43C",
    "#A35A31",
    "#FEEEBB",
]


const HEIGHT_FACTOR = 0.9;


export interface _CupInfo {
    colorIds: Array<number>;
}

const SPLIT_COUNT = 4;

@ccclass
export default class Cup extends cc.Component {
    @property(Water)
    private water: Water = null;

    private onClick: (c: Cup) => void = null;

    onBtn_click() {
        if (this.isPouring()) {
            return;
        }
        if (this.onClick) {
            this.onClick(this);
        }
    }

    public isPouring() {
        return Math.abs(this.node.angle) > 1.0;
    }

    initWater() {
        const info = this.info;
        let arr = [];
        for (let i = SPLIT_COUNT - 1; i >= 0; i--) {
            let colorId = info.colorIds[i];
            if (colorId == 0) {
                continue;
            }
            let lastObj = arr[arr.length - 1];
            if (!lastObj || lastObj != colorId) {
                arr.push({
                    height: 1 / SPLIT_COUNT,
                    colorId: colorId
                });
            } else {
                lastObj.height += 1 / SPLIT_COUNT;
            }
        }
        arr.forEach(function (obj) {
            let hex = WaterColors[obj.colorId] || "#538849"
            obj.color = new cc.Color().fromHEX(hex);
            obj.height *= HEIGHT_FACTOR;
        })

        this.water.initInfos(arr);
    }
    public dstTopNum: Number = 0;

    private info: _CupInfo = null;
    setCupInfo(info: _CupInfo, onClick: (c: Cup) => void) {
        this.info = info;
        this.onClick = onClick;

        this.initWater();

        this.reset();
    }

    update() {
        if (CC_EDITOR) {
            return;
        }
        if (this.water.skewAngle == this.node.angle) {
            return;
        }
        this.water.skewAngle = this.node.angle;
    }

    private setPourOutCallback(pourStart, pourEnd) {

        const _onStart = function () {
            if (pourStart) {
                pourStart(this)
            }

        }
        const _onFinish = function () {
            if (this.tween) {
                this.tween.stop();
                this.tween = null;
            }
            if (pourEnd) {
                pourEnd(this)
            }
        }
        this.water.setPourOutCallback(_onStart.bind(this), _onFinish.bind(this));
    }

    private setPourInCallback(onFinish) {
        const _onFinish = function () {
            let isFinished = this.checkIsFinshed();
            if (onFinish) {
                onFinish(this, isFinished)
            }
            if (isFinished) {
                AudioUtil.playEffect(AudioEnum.finishOne, 0.4)
            }
        }
        this.water?.setPourInCallback(_onFinish.bind(this));
    }

    checkIsFinshed() {
        let isFinished = true;
        let colorIds = this.info.colorIds;
        let tmpId = null;
        let empTyNum = 0;
        for (let i = 0; i < SPLIT_COUNT; i++) {
            if (tmpId == null) {
                tmpId = colorIds[i]
            }
            if (tmpId != colorIds[i]) {
                isFinished = false;
                break;
            } else if (colorIds[i] == 0) {
                empTyNum++;
            }
        }
        if (empTyNum == SPLIT_COUNT) {
            isFinished = true;
        }
        return isFinished;
    }

    private tween: cc.Tween = null;
    /**
     * 移动至目标点、旋转试管-倒水
     * @param isRight 倾斜角度，左为正，右为负
     * @param onPourStart 水开始从瓶口流出
     * @param onPourEnd 本次水倒完毕
     */
    moveToPour(dstPt: cc.Vec2, isRight: boolean, onPourStart: (c: Cup) => void, onPourEnd: (c: Cup) => void, num?: number,dst?:Cup) {
        this.setPourOutCallback(onPourStart, onPourEnd);
        let startAngle = this.water.getPourStartAngle()
        let endAngle = this.water.getPourEndAngle()
        let dstEveOnrZero = dst?.info.colorIds.every(item=>item==0)
        console.log('dstEveOnrZero',dstEveOnrZero);
        console.log('num',num);
        
        this.water.onStartPour(num);//TODO: 可能需要调整 7/25
        if (isRight) {
            startAngle *= -1;
            endAngle *= -1;
        }

        let moveDur = 0.1;
        let pourDur = 0.4;

        this.tween = cc.tween(this.node)
            .set({ angle: 0 })
            .to(moveDur, { x: dstPt.x, y: dstPt.y, angle: startAngle })
            .to(pourDur, { angle: endAngle })
            .call(() => {
                this.tween = null;
            }).start();

        let top = this.getTop();
        let colorIds = this.info.colorIds;
        let cur = 0
        for (let i = 0; i < SPLIT_COUNT; i++) {
            let _id = colorIds[i]
            if (_id == 0) {
                continue;
            } else if (top.topColorId == _id) {

                if (num && cur < num) {
                    colorIds[i] = 0
                    ++cur
                }else if(!num){
                    colorIds[i] = 0
                }
            } else {
                break;
            }
        }
    }

    startAddWater(colorId: number, num: number, onComplete: (cup: Cup, isFInish: boolean) => void) {
        if (!this.info) {
            return;
        }
        this.setPourInCallback(onComplete);
        let acc = 0;
        for (let i = SPLIT_COUNT - 1; i >= 0; i--) {
            if (this.info.colorIds[i] != 0) {
                continue;
            }
            this.info.colorIds[i] = colorId;
            if (++acc == num) {
                break;
            }
        }
        let hex = WaterColors[colorId] || "#538849"
        this.water.addInfo({
            colorId: colorId,
            height: num / SPLIT_COUNT * HEIGHT_FACTOR,
            color: new cc.Color().fromHEX(hex)
        });
 
        AudioUtil.playPourWaterEffect(num / SPLIT_COUNT);
    }

    /**立刻加水 */
    addWaterImmediately(colorId: number, num: number) {
        let acc = 0;
        for (let i = SPLIT_COUNT - 1; i >= 0; i--) {
            if (this.info.colorIds[i] != 0) {
                continue;
            }
            this.info.colorIds[i] = colorId;
            if (++acc == num) {
                break;
            }
        }
        this.initWater();
    }

    removeTopWaterImmediately(num: number) {
        let acc = 0;
        let top = this.getTop();
        let colorIds = this.info.colorIds;
        for (let i = 0; i < SPLIT_COUNT; i++) {
            let _id = colorIds[i]
            if (_id == 0) {
                continue;
            } else if (top.topColorId == _id) {
                colorIds[i] = 0;
                if (++acc >= num) {
                    break
                }
            } else {
                break;
            }
        }
        this.initWater();
        return top;
    }

    getTop() {
        let colorIds = this.info.colorIds;
        let emptyNum = 0;
        let topColorId = 0;
        let topColorNum = 0;
        for (let i = 0; i < SPLIT_COUNT; i++) {
            if (colorIds[i] == 0) {
                emptyNum++;
                continue;
            }
            if (topColorId == 0 || topColorId == colorIds[i]) {
                topColorId = colorIds[i];
                topColorNum++;
            } else {
                break;
            }
        }
        return {
            emptyNum,
            topColorId,
            topColorNum,
            colorHex: WaterColors[topColorId] || "#538849"
        }
    }

    reset() {
        this.node.angle = 0;
        this.water.skewAngle = 0
    }

    public setPourAnchor(isRight: boolean) {
        let pt = cc.v2(3, 2);
        pt.x = isRight ? (this.node.width - pt.x) : pt.x;
        pt.y = this.node.height - pt.y;

        pt.x = pt.x / this.node.width;
        pt.y = pt.y / this.node.height;

        this.setAnchor(pt)
    }

    public setNormalAnchor() {
        this.setAnchor(cc.v2(0.5, 0.5))
    }

    private dot: cc.Node = null;
    private setAnchor(anchor: cc.Vec2) {


        let oldAnchor = this.node.getAnchorPoint();
        let selfPt = this.node.getPosition();

        let waterPt = this.water.node.getPosition();
        this.node.setAnchorPoint(anchor);
        let offsetAnchor = cc.v2(anchor.x - oldAnchor.x, anchor.y - oldAnchor.y)
        let offsetPt = cc.v2(offsetAnchor.x * this.node.width, offsetAnchor.y * this.node.height)
        offsetPt = rotatePt(offsetPt, this.node.angle)
        selfPt.x += offsetPt.x;
        selfPt.y += offsetPt.y;
        this.node.setPosition(selfPt);
        waterPt.x -= offsetAnchor.x * this.node.width;
        waterPt.y -= offsetAnchor.y * this.node.height;
        this.water.node.setPosition(waterPt);

    }

    getWaterSurfacePosY(needAdjust = false) {
        let top = this.getTop();
        let y = (SPLIT_COUNT - top.emptyNum) / SPLIT_COUNT;
        if (y < 0.02) {
            y = 0.02
        } else if (needAdjust) {
            y -= 1.0 / SPLIT_COUNT * HEIGHT_FACTOR;
        }
        y *= HEIGHT_FACTOR;
        y -= 0.5;
        let pt = cc.v2(0, this.water.node.height * y);
        pt = this.water.node.convertToWorldSpaceAR(pt)
        return pt.y
    }
}

function rotatePt(pt: cc.Vec2, angle: number) {
    let radian = angle2radian(angle);
    let ret = cc.v2();
    ret.x = pt.x * Math.cos(radian) - pt.y * Math.sin(radian);
    ret.y = pt.x * Math.sin(radian) + pt.y * Math.cos(radian);

    return ret;
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