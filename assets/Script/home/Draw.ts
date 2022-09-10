// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import SetCom from "../utils/setCom";
enum GameState {
    Idle,
    Play
}
const { ccclass, property } = cc._decorator;

const label_list = [
    {
        "rewardNum": 1,
        "rewardIcon": 2,
        "text": "重置x1",
    },
    {
        "rewardNum": 1,
        "rewardIcon": 1,
        "text": "后退x1",
    },
    {
        "rewardNum": 1,
        "rewardIcon": 3,
        "text": "试管x1",
    },
    {
        "rewardNum": 2,
        "rewardIcon": 4,
        "text": "碎片x2",
    },
    {
        "rewardNum": 10,
        "rewardIcon": 5,
        "text": "体力x10",
    },
    {
        "rewardNum": 5,
        "rewardIcon": 4,
        "text": "碎片x5",
    },
    {
        "rewardNum": 2,
        "rewardIcon": 2,
        "text": "重置x2",
    },
    {
        "rewardNum": 2,
        "rewardIcon": 1,
        "text": "后退x2",
    },
    {
        "rewardNum": 2,
        "rewardIcon": 3,
        "text": "试管x2",
    },
]
@ccclass
export default class NewClass extends cc.Component {

    @property(cc.SpriteFrame)
    sprite_list: cc.SpriteFrame[] = [];

    @property(cc.Prefab)
    boxFab: cc.Prefab = null

    @property(cc.SpriteFrame)
    dobuleImg: cc.SpriteFrame = null

    @property
    text: string = 'hello';

    private _index: number = 0;
    private _count: number = 0;
    private _targetIndex: number[] = [];
    private _state: GameState = GameState.Idle;


    onLoad() {

    }
    init() {
        for (let i = 0; i < this.sprite_list.length; i++) {
            const spitre = this.sprite_list[i];
            const label = label_list[i].text;
            let cus = cc.instantiate(this.boxFab);
            cus.getComponent(cc.Sprite).spriteFrame = spitre
            cus.getChildByName('label').getComponent(cc.Label).string = label
            cus.parent = this.node.getChildByName('layout')
        }
    }
    /**
     * 抽奖
     * @param event 
     * @param data
     */
    onClick(event: any, data: string) {

        switch (data) {
            case 'start': {
                this.node.getChildByName('layout').resumeAllActions();
                if (this._state == GameState.Idle) {
                    SetCom.advertisement(
                        {
                            success: (_res) => {
                                this.startAni();
                            },
                            fail: () => {
                                SetCom.shareFriend(
                                    {
                                        success: (_res) => {
                                            this.startAni();
                                        },
                                    })
                            }
                        })
                }
                break;
            }
        }
    }
    /**
     * 不用
     * @param event 
     * @param data 
     */
    notNeed(event: any, data: string) {
        this.node.active = false
    }

    opcOpen() {
        let node_list = this.node.getChildByName('layout').children
        for (let item of node_list) {
            item.opacity = 255
        }
        this.node.active = true
    }
    start() {
        this.init()
    }
    /**
     * 随机数
     * @param min 最小
     * @param max 最大
     * @returns 随机
     */
    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    startAni() {
        let randomNum = this.getRandomIntInclusive(20, 50)
        this._targetIndex = [randomNum];
        this._count = 0;
        this._index = 0;
        this._state = GameState.Play;
        let node_list = this.node.getChildByName('layout').children
        let moveOnce = () => {
            let seq = cc.sequence(
                cc.callFunc(
                    () => {
                        for (let item of node_list) {
                            item.opacity = 63
                        }
                        node_list[this._index].opacity = 255
                        this._count++;
                        if (this._count > randomNum) {
                            for (let item of node_list) {
                                item.stopAllActions();
                            }
                            this._state = GameState.Idle
                            this.resOpenModal()
                            return
                        }
                        if (this._index == this._targetIndex[this._count]) {
                            node_list[this._index].stopAllActions();
                            let blink = cc.sequence(
                                cc.fadeOut(0.08),
                                cc.fadeIn(0.08),
                            ).repeat(1);
                            node_list[this._index].runAction(cc.sequence(
                                blink,
                                cc.callFunc(() => {
                                    if (this._count < this._targetIndex.length) {
                                        moveOnce();
                                    } else {
                                        this._state = GameState.Idle;
                                    }
                                })
                            ));
                        }
                        this._index = (this._index + 1) % node_list.length;
                    }
                ),
                cc.delayTime(0.08)
            )
            node_list[this._index].runAction(seq.repeatForever());
        }
        moveOnce();
    }
    resOpenModal() {
        let data = label_list[this._index]
        const spitre = this.sprite_list[this._index];
        let obj = {
            "rewardIcon": spitre,
            "rewardNum": data.rewardNum,
            "name": data.text,
            "type": data.rewardIcon,
            "curState": data.rewardIcon,
        }
        switch (data.rewardIcon) {
            case 1:
            case 2:
            case 3:
            case 5:
                this.node.parent.getComponent('home').openOpc(3, obj, undefined, this.dobuleImg, '收下了', 1);
                break;
            case 4:
                this.node.parent.getComponent('home').openOpc(2, obj, undefined, this.dobuleImg, '收下了', 1);
                break;
            default:
                break;
        }
    }
    receiveClick() {
        let data = label_list[this._index]
        switch (data.rewardIcon) {
            case 1:
                SetCom.global_prop.backOff += data.rewardNum
                break;
            case 2:
                SetCom.global_prop.reset += data.rewardNum
                break;
            case 3:
                SetCom.global_prop.testTube += data.rewardNum
                break;
            case 4:
                SetCom.global_prop.fragment += data.rewardNum
                break;
            case 5:
                SetCom.global_prop.physicalStrength += data.rewardNum
                break;
            default:
                break;
        }

        this.node.parent.getComponent('home').show()
    }
}
