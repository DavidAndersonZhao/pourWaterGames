// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;
import KeelReplaceSkin from './challengeScripts/keelReplaceSkin'
import SetCom from './utils/setCom';
import ModalHandle from './challengeScripts/ModalHandle'
import RankListScroll from './rankListScroll'
const dragonBonesGroup = cc.Class({
    name: 'dragonBonesGroup',
    properties: {
        dbAsset: {
            default: null,
            type: dragonBones.DragonBonesAsset
        },
        dbAtlas: {
            default: null,
            type: dragonBones.DragonBonesAtlasAsset
        }
    }
})
const cardGroup = cc.Class({
    name: 'cardGroup',
    properties: {
        noParty: {
            default: null,
            type: cc.Prefab
        },
        party: {
            default: null,
            type: cc.Prefab
        }
    }
})
interface dragonBonesGroupInter {
    dbAsset: dragonBones.DragonBonesAsset
    dbAtlas: dragonBones.DragonBonesAtlasAsset
}
interface CardGroupInter {
    noParty: cc.Prefab
    party: cc.Prefab
}
interface rankItemInter {
    headImg: string | cc.SpriteFrame
    nick: string
    num: number
    time?: string
}
function renderRankList(num = 10): rankItemInter[] {
    let arr = []
    let urls = [
        'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/active/one.jpg',
        'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/active/two.jpg',
        'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/active/three.jpg',
        'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/active/four.jpg',
        'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/active/five.jpg',
        'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/active/six.jpg'
    ]

    for (let i = 0; i < num; i++) {
        let ran = ~~(Math.random() * urls.length)
        let headImg = urls[ran];
        let nick = Math.random().toString(36)
        let num = i + 1
        arr.push({
            headImg,
            nick,
            num,
            time: "00分1秒",
        })
    }
    return arr
}
@ccclass
export default class Ranking extends cc.Component {

    @property(cc.RichText)
    label: cc.RichText = null;

    @property(cc.Node)
    podium: cc.Node = null
    @property(cc.Prefab)
    headImg: cc.Prefab = null
    // LIFE-CYCLE CALLBACKS:
    // 名片弹窗
    @property(cardGroup)
    myCard: CardGroupInter = null
    // 排行榜弹窗
    @property(cc.Prefab)
    rankListModal: cc.Prefab = null
    // 台上三个人弹窗
    @property(cc.Prefab)
    platformPeople: cc.Prefab = null
    @property([dragonBonesGroup])
    skins: dragonBonesGroupInter[] = []
    @property(KeelReplaceSkin)
    private replaceSkin: KeelReplaceSkin = null;
    @property(cc.Node)
    myNode: cc.Node = null
    @property(cc.Node)
    challengeNode: cc.Node = null
    @property(cc.SpriteFrame)
    challengeSpriteFrame: cc.SpriteFrame = null
    @property(cc.Node)
    blockMask: cc.Node = null
    @property(cc.AudioSource)
    private audio: cc.AudioSource = null;//音乐
    private kingList = []
    private peopleList = []
    private rankList = []
    private loadingState = false
    private currentData
    private _frequency = 0
    private creatTimeShow
    async onLoad() {
        if (!SetCom.audioSet._musicPlay) this.audio.mute = true;
        SetCom.bannerShow('bannerAd', 'hide')
        setTimeout(() => {
            SetCom.bannerShow('gridAd', 'hide')

        }, 1000);
        if (window.wx){
            wx?.showLoading()
        }else return
        let { serviceTime, data, currentData, frequency, creatTimeShow } = await SetCom.getRankingList()
        this._frequency = frequency
        this.creatTimeShow = creatTimeShow
        this.rankList = [...data]

        if (data?.length) {
            this.initArr()
        } else {
            this.maskCancel()

        }
        if (Array.isArray(currentData)) {
            currentData = {}
        } else {
            this.currentData = currentData
            this.challengeNode.getComponent(cc.Sprite).spriteFrame = this.challengeSpriteFrame
        }
        this.setMyHeadImg(currentData)

    }
    maskCancel() {
        this.loadingState = false
        this.blockMask.active = false
        if (window.wx) wx?.hideLoading()
    }
    /* 设置我的名次及头像 */
    async setMyHeadImg({ avatarUrl, rankingNum }) {
        if (!rankingNum) {
            return
        }
        // 头像
        this.myNode.active = true
        let headImgNode = this.myNode.getChildByName('headImg')
        if (avatarUrl) headImgNode.getComponent(cc.Sprite).spriteFrame = await this.setImg(avatarUrl)
        headImgNode.rotation = 0
        // 名称
        let ranking = this.myNode.getChildByName('labels').getChildByName('ranking')
        ranking.getComponent(cc.Label).string = `第${rankingNum}名`
    }
    async initArr() {
        // let arr = renderRankList(100)
        this.loadingState = true
        this.blockMask.active = true
        for (let item of this.rankList) {
            item.headImg = await this.setImg(item.avatarUrl)
        }
        this.maskCancel()
        // this.rankList = arr
        this.kingList = this.rankList.filter((item, i) => i < 3)
        this.peopleList = this.rankList.filter((item, i) => i >= 3)
        this.setPlatform()
        this.setOthers()
        this.setOthers('top20')
    }
    /** 台上三个人弹窗 */
    openPlatformPeopleModal(item, i: number) {
        if (this.loadingState) {
            // alert('还没加载完！')
            return
        }
        let ModalNode: cc.Node
        ModalNode = cc.instantiate(this.platformPeople)
        let modalScript = ModalNode.getComponent(ModalHandle)
        modalScript.setPlatformPeopleModal({
            nick: item.nickName,
            time: item.passTimeShow,
            headerImgUrl: item.headImg
        })
        modalScript.only_replaceSpin(this.skins[i].dbAsset, this.skins[i].dbAtlas)
        this.node.addChild(ModalNode)
    }
    /** 打开名片弹窗 */
    async openCardModal() {
        if (this.loadingState) {
            // alert('还没加载完！')
            return
        }
        let ModalNode: cc.Node
        ModalNode = cc.instantiate(this.myCard.party)
        let { creatTimeShow, nickName, passTimeShow, avatarUrl, rankingNum, _lv, shop_people, } = this.currentData || {}
        let isNoParty
        if (this.currentData) {
            ModalNode = cc.instantiate(this.myCard.party)
            isNoParty = false
        } else {
            ModalNode = cc.instantiate(this.myCard.noParty)
            isNoParty = true
        }
        avatarUrl ||= SetCom.userInfo?.avatarUrl
        nickName ||= SetCom.userInfo?.nickName
        let modalScript = ModalNode.getComponent(ModalHandle)
        let img = await this.setImg(avatarUrl)
        modalScript.setPartyModal({
            nick: nickName,
            date: this.creatTimeShow,
            frequency: this._frequency,
            rank: `第${rankingNum}名`,
            headerImgUrl: img
        }, isNoParty)
        modalScript.replaceSpin(_lv, shop_people)
        this.node.addChild(ModalNode)
    }
    /** 打开排行榜弹窗 */
    async openRankListModal() {
        if (this.loadingState) {
            // alert('还没加载完！')
            return
        }
        let ModalNode: cc.Node
        ModalNode = cc.instantiate(this.rankListModal)
        let scrollViewNode = ModalNode.getChildByName('bg').getChildByName('scrollView')
        let scrollViewScript = scrollViewNode.getComponent(RankListScroll)
        this.node.addChild(ModalNode)

        scrollViewScript.setTotalNum(this.rankList.length)
        scrollViewScript.initialize(this.rankList)
        // setTimeout(() => {
        let { creatTimeShow, nickName, passTimeShow, avatarUrl, rankingNum } = this.currentData || {}
        if (!avatarUrl) return
        avatarUrl = await this.setImg(avatarUrl)
        scrollViewScript.setCurrentRank({ num: rankingNum, headImg: avatarUrl, nickName, passTimeShow })
        // }, 10000);
        // RankListScroll
    }
    /** 设置讲台人物 */
    setPlatform() {
        let anima_name = ['灵魂舞者', '明星大咖', '永恒王者']
        let animations = this.podium.getChildByName('animation')
        let plant = this.podium.getChildByName('plant')
        // 讲台三个人
        for (let i = animations.children.length - 1; i >= 0; i--) {
            const item = animations.children[i];

            const rankItem = this.kingList[i == 1 ? 1 : (i ^ 2)];
            if (!rankItem) return
            item.active = true
            plant.children[i].active = true
            item.on("click", () => this.openPlatformPeopleModal(rankItem, i))
            let itemArmature: any = item.getComponent(dragonBones.ArmatureDisplay)
            let attachUtil = itemArmature.attachUtil;
            let boneNodes = attachUtil.generateAttachedNodes(`${anima_name[i]}-头部`);
            let boneNode = boneNodes[0];

            let imgNode: cc.Node = cc.instantiate(this.headImg)
            imgNode.getComponent(cc.Sprite).spriteFrame = rankItem.headImg
            imgNode.rotation = 90
            imgNode.x = 220
            boneNode.addChild(imgNode)
            // 换皮肤
            // item.getComponent(KeelReplaceSkin).replaceSkin(this.skins.dbAsset,this.skins.dbAtlas)
        }
    }
    /** 设置讲台外 1- 10 */
    async setOthers(name = 'top10') {
        let others = this.node.getChildByName(name)
        // 前10
        let _lv = cc.sys.localStorage.getItem('level') || 0
        let resouceArr = await this.replaceSkin.dynamicCreate('全人物DJ动画') as any[]
        let rankList = name == 'top20' ? this.peopleList.filter((item, i) => i >= 10) : this.peopleList
        if (!rankList.length) return
        others.getChildByName('brand').active = true
        for (let i = 0; i < others.children.length; i++) {
            const item = others.children[i];

            if (item.name == 'brand') continue
            const rankItem = name == 'top20' ? this.peopleList[i + 10] : this.peopleList[i];
            if (!rankItem) return
            item.active = true
            let { _lv, shop_people } = rankItem
            let spin_name = SetCom.getDJSpinName(_lv, shop_people)
            let dbAsset = resouceArr.find(item => item._name == spin_name + "_ske")
            let dbAtlas = resouceArr.find(item => item._name == spin_name + "_tex")
            item.getComponent(KeelReplaceSkin)?.replaceSkin(dbAsset, dbAtlas)
            
            let itemArmature: any = item.getComponent(dragonBones.ArmatureDisplay)
            // if (!itemArmature) return
            let attachUtil = itemArmature.attachUtil;
            item.getComponent(dragonBones.ArmatureDisplay).timeScale = 1
            //生成挂点
            attachUtil.generateAllAttachedNodes();

            let boneNodes = attachUtil.generateAttachedNodes(`爱神斯坦-头部`);
            let boneNode = boneNodes[0];

            let imgNode: cc.Node = cc.instantiate(this.headImg)
            imgNode.getComponent(cc.Sprite).spriteFrame = rankItem.headImg
            imgNode.rotation = 90
            imgNode.x = 150
            boneNode.addChild(imgNode)
        }
    }
    /**
     * 加载图片
     * @param url 远程图片资源url
     * @param node 节点
     * @returns 
     */
    setImg(url, node?: cc.Node) {
        return new Promise<cc.SpriteFrame>((resolve, reject) => {
            cc.loader.load({ url, type: 'jpg' }, (err, texture) => {
                if (err) {
                    reject(err)
                }
                var frame = new cc.SpriteFrame(texture);
                let { width, height } = frame.getOriginalSize()
                if (node) {
                    let scale = node.width / width
                    node.getComponent(cc.Sprite).spriteFrame = frame
                }

                // node.scale = scale
                resolve(frame)
                // this.headImg.sizeMode = SizeMode
                // Use texture to create sprite frame
            });
        })
    }
    loadImg(url) {
        return new Promise<cc.SpriteFrame>((resolve, reject) => {
            cc.loader.load({ url, type: 'jpg' }, (err, texture) => {
                if (err) {
                    reject(err)
                }
                var frame = new cc.SpriteFrame(texture);
                let { width, height } = frame.getOriginalSize()

                // node.scale = scale
                resolve(frame)
                // this.headImg.sizeMode = SizeMode
                // Use texture to create sprite frame
            });
        })

        // cc.assetManager.loadRemote(path, (err: Error | null, asset: cc.Asset) => {
        //     debugger

        //  });
    }
    start() {
        // this.label.string = `<color=#715f9a>请点击</c><color=#f53e00>下方按钮</c><color=#715f9a>兑换</c><color=#f53e00>金币</c>`
    }
    loadScenceChallenge() {
        if (this.loadingState) {
            // alert('还没加载完！')
            return
        }
        cc.director.loadScene('challenge');
    }
    // update (dt) {}
}
