// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import SetCom from "../utils/setCom";
import KeelReplaceSkin from './keelReplaceSkin'

const { ccclass, property } = cc._decorator;
const successModalSetting = cc.Class({
    name: 'successModalSetting',
    properties: {
        date: {
            default: null,
            type: cc.Label
        },
        challengeTime: {
            default: null,
            type: cc.Label
        },
        rank: {
            default: null,
            type: cc.Label
        },
        headerImg: {
            default: null,
            type: cc.Sprite
        },
        headerImgNode: {
            default: null,
            type: cc.Node
        }
    }
})
const partyModalSetting = cc.Class({
    name: 'partyModalSetting',
    properties: {
        headerImg: {
            default: null,
            type: cc.Sprite
        },
        headerImgNode: {
            default: null,
            type: cc.Node
        },
        nick: {
            default: null,
            type: cc.Label
        },
        date: {
            default: null,
            type: cc.Label
        },
        dateNode: {
            default: null,
            type: cc.Node
        },
        frequency: {
            default: null,
            type: cc.RichText
        },
        rank: {
            default: null,
            type: cc.Label
        }
    }
})
const platformPeopleModalSetting = cc.Class({
    name: 'platformPeopleModalSetting',
    properties: {
        headerImg: {
            default: null,
            type: cc.Sprite
        },
        headerImgNode: {
            default: null,
            type: cc.Node
        },
        nick: {
            default: null,
            type: cc.Label
        },
        needTime: {
            default: null,
            type: cc.RichText
        },
        people_animation: {
            default: null,
            type: KeelReplaceSkin
        }
    }
})
interface ISuccessModal {
    date: cc.Label;
    challengeTime: cc.Label;
    rank: cc.Label;
    headerImg: cc.Sprite;
    headerImgNode: cc.Node;
}
interface IPartyModal {
    headerImg: cc.Sprite;
    headerImgNode: cc.Node;
    nick: cc.Label;
    date: cc.Label;
    dateNode?: cc.Node;
    frequency: cc.RichText;
    rank: cc.Label;
}
interface IPlatformPeopleModalSetting {
    headerImg: cc.Sprite;
    headerImgNode: cc.Node;
    nick: cc.Label;
    needTime: cc.RichText;
    people_animation: KeelReplaceSkin;
}

interface ISuccessSetting {
    date: string;
    challengeTime: string;
    rank: string;
    headerImgUrl: string;
}
interface IPartySetting {
    nick: string;
    date: string;
    frequency: number;
    rank: string;
    headerImgUrl: cc.SpriteFrame;
}
interface IPlatformSetting {
    nick: string;
    time: string;
    headerImgUrl: string | cc.SpriteFrame;
}
@ccclass
export default class NewClass extends cc.Component {

    public okFn = null
    public calFn = null
    public resetFn = null
    public endFn = null


    @property(cc.Prefab)
    shareModal: cc.Prefab = null
    @property(successModalSetting)
    successModal: ISuccessModal = null
    @property(partyModalSetting)
    partyModal: IPartyModal = null
    @property(platformPeopleModalSetting)
    platformPeopleModal: IPlatformPeopleModalSetting = null
    // LIFE-CYCLE CALLBACKS:

    @property(KeelReplaceSkin)
    private replaceSkin: KeelReplaceSkin = null;
    @property(cc.Node)
    haveResurrectionNode: cc.Node = null
    onLoad() {
        // if (this.replaceSkin) {
        //     this.replaceSpin()
        // }
    }

    getRewards() {
        SetCom.advertisement(
            {
                success: (_res) => {
                    if (this.okFn) this.okFn()
                    this.destoryBtn()
                },
                fail: () => {
                    SetCom.shareFriend(
                        {
                            success: (_res) => {
                                if (this.okFn) this.okFn()
                                this.destoryBtn()
                            },
                        })
                }
            })
    }
    destoryBtn() {
        this.node.destroy()
        if (this.calFn) this.calFn()
    }

    /** 重开 */
    reset() {
        // this.resetFn?.()
        cc.director.loadScene("challenge");
    }
    /** 返回首页 */
    backHome() {
        cc.director.loadScene("rankList");//TODO：暂时不知道跳哪 先跳首页吧 排行榜页面还没做
        // cc.director.loadScene("rankList");
    }
    /** 分享 */
    shareClick() {
        SetCom.shareFriend(
            {
                success: (_res) => {
                },
            })
    }
    /* 打开分享弹窗 */
    openShareModal() {
        let ModalNode: cc.Node = cc.instantiate(this.shareModal)
        cc.find('Canvas').addChild(ModalNode)

    }
    /** 返回派对 */
    backParty() {
        cc.director.loadScene("rankList");
        return
    }
    /** 成功弹窗替换信息 */
    async setSuccessModal({ date, challengeTime, rank, headerImgUrl }: ISuccessSetting) {
        this.successModal.date.string = date
        this.successModal.challengeTime.string = challengeTime
        this.successModal.rank.string = rank
        await this.setImg(headerImgUrl, 'successModal')
        // this.successModal.headerImg.spriteFrame.url = 'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/img1.jpg?sign=4291a7ed6f41481c12fd7499412c6423&t=1667698080'
    }
    /** paty弹窗替换信息 */
    async setPartyModal(
        {
            nick,
            date,
            frequency,
            rank,
            headerImgUrl
        }: IPartySetting, isNoParty: boolean
    ) {
        this.partyModal.nick.string = nick
        if (date) {
            this.partyModal.date.string = `${date}参加了派对`
            if(this.partyModal.dateNode)this.partyModal.dateNode.active = true
        } 
        if (isNoParty) {
            this.partyModal.frequency.string = `参加派对次数${frequency}次`
        } else {
            this.partyModal.frequency.string = `<color=#ffffff>参加派对次数 </c><color=#F3D437>${frequency}</color>次</c>`
        }
        if (this.partyModal.rank) this.partyModal.rank.string = rank
        
        this.partyModal.headerImg.spriteFrame = headerImgUrl 
      
        // await this.setImg(headerImgUrl, 'partyModal', false)
        // this.successModal.headerImg.spriteFrame.url = 'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/img1.jpg?sign=4291a7ed6f41481c12fd7499412c6423&t=1667698080'
    }
    /** 台上三个人弹窗 */
    async setPlatformPeopleModal(
        {
            nick,
            time,
            headerImgUrl
        }: IPlatformSetting
    ) {
        // debugger
        this.platformPeopleModal.nick.string = nick
        // let time = '00分1秒'
        this.platformPeopleModal.needTime.string = `<color=#ffffff>仅用</c><size=50><color=#F3D437><b>${time}</b></color></size>通关</color>`
        // await this.setImg(headerImgUrl, 'platformPeopleModal')
        this.platformPeopleModal.headerImg.spriteFrame = headerImgUrl as cc.SpriteFrame
    }

    replaceplatformPeopleSpin(dbAsset, dbAtlas) {
        this.platformPeopleModal.people_animation.replaceSkin(dbAsset, dbAtlas)
        // this.replaceSkin.getComponent(KeelReplaceSkin).replaceSkin(dbAsset, dbAtlas)
    }
    /** 加载图片 */
    setImg(url, name: 'successModal' | 'partyModal' | 'platformPeopleModal', needScale = true) {
        return new Promise<void>((resolve, reject) => {
            cc.loader.load({ url, type: 'jpg' }, (err, texture) => {
                if (err) {
                    reject(err)
                }
                var frame = new cc.SpriteFrame(texture);
                let { width, height } = frame.getOriginalSize()
                let scale = this[name].headerImgNode.width / width
                this[name].headerImg.spriteFrame = frame
               
                if (needScale) this[name].headerImgNode.scale = scale
                resolve()
                // this.headImg.sizeMode = SizeMode
                // Use texture to create sprite frame
            });
        })

    }
    /** 换皮肤 */
    async replaceSpin(_lv?, shop_people?) {
        if(!this.replaceSkin) return;
        _lv ||= cc.sys.localStorage.getItem('level')
        let spin_name = SetCom.getDJSpinName(_lv, shop_people)
        let resouceArr = await this.replaceSkin.dynamicCreate('全人物DJ动画') as any[]
        let dbAsset = resouceArr.find(item => item._name == spin_name + "_ske")
        let dbAtlas = resouceArr.find(item => item._name == spin_name + "_tex")
        // ske tex
        this.replaceSkin.getComponent(KeelReplaceSkin).replaceSkin(dbAsset, dbAtlas)
    }
    /** 只是换皮肤 */
    async only_replaceSpin(dbAsset, dbAtlas) {
        this.replaceSkin.getComponent(KeelReplaceSkin).replaceSkin(dbAsset, dbAtlas)
    }
    /**
     * 没复活了 label取消
     */
    cancelResurrectionLabel(){
        this.haveResurrectionNode.active = false
    }
    endClick() {
        this.endFn?.()
    }
    start() {

    }

}