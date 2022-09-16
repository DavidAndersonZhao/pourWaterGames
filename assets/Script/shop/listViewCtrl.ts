// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:

import { UtilAudio } from "../utils/audio_util";
import SetCom from "../utils/setCom";

//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
enum Decorate {
    Dropper = '滴管',
    Beaker_small = '小烧杯',
    Microscope = '显微镜',
    robot = '小白机器人',
    grass = '聪明草',
    Beaker_big = '大烧瓶',
}
interface Prop_inter {
    btns: [cc.SpriteFrame],
    imgs: [cc.SpriteFrame],
}
interface People_inter {
    btns: [cc.SpriteFrame],
    imgs: [cc.SpriteFrame],
    groups: [cc.SpriteFrame],
}
const { ccclass, property } = cc._decorator;
const props = cc.Class({
    name: "props",
    properties: {
        btns: {
            default: [],
            type: [cc.SpriteFrame],
        },
        imgs: {
            default: [],
            type: [cc.SpriteFrame],
        }
    },
});
const peoples = cc.Class({
    name: "peoples",
    properties: {
        btns: {
            default: [],
            type: [cc.SpriteFrame],
        },
        imgs: {
            default: [],
            type: [cc.SpriteFrame],
        },
        groups: {
            default: [],
            type: [cc.SpriteFrame],
        },
    },
});
const peoples_no = cc.Class({
    name: "peoples_no",
    properties: {
        btns: {
            default: [],
            type: [cc.SpriteFrame],
        },
        imgs: {
            default: [],
            type: [cc.SpriteFrame],
        },
        groups: {
            default: [],
            type: [cc.SpriteFrame],
        },
    },
});
@ccclass
export default class NewClass extends cc.Component {

    @property(cc.JsonAsset)
    private levelCfg: cc.JsonAsset = null;

    @property(props)
    prop_list: Prop_inter = null;
    @property(peoples)
    people_list: People_inter = null;
    @property(peoples_no)
    people_list_no: People_inter = null;
    @property(cc.Prefab)
    private prop_pfb: cc.Prefab = null;
    @property(cc.Prefab)
    private people_pfb: cc.Prefab = null;
    @property(cc.Prefab)
    private peopleNo_pfb: cc.Prefab = null;
    @property(cc.ScrollView)
    scrollView: cc.ScrollView = null;
    @property(cc.Label)
    fragmentNum: cc.Label = null
    @property(cc.Label)
    content: cc.Label = null
    private check_peopleId: number | null = null

    start() {

    }
    handlePropState(list, index) {
        const element = list[index];
        this.resOpenModal({ ...element, type: 3 }, this.prop_list.imgs[element.imgNum - 1], undefined, () => { list[index].propsState = 1 })

    }
    /**
     * 创建道具资源
     * @param index 
     * @param list 
     * @param content 
     */
    propCreate(index, list, content, json) {
        content.height = Math.ceil(list.length / 2) * (this.prop_pfb.data.height + 30) + 30;
        const element = list[index];
        let _node = cc.instantiate(this.prop_pfb);
        let shop = _node.getChildByName("shop")
        let handleButton = _node.getChildByName("handleButton")
        let label = _node.getChildByName("label")
        shop.getComponent(cc.Sprite).spriteFrame = this.prop_list.imgs[element.imgNum - 1]
        handleButton.getComponent(cc.Sprite).spriteFrame = this.prop_list.btns[element.propsState - 1]
        label.getComponent(cc.Label).string = element.name
        handleButton.on('click', () => {
            UtilAudio.btnAudioClick()
            switch (element.propsState) {
                case 1:
                    element.propsState = 2
                    this.savePropState(element, true)
                    break;
                case 3:
                    SetCom.shareFriend(
                        {
                            success: (_res) => {
                                UtilAudio.modalAudioClick()
                                this.handlePropState(list, index)
                                handleButton.getComponent(cc.Sprite).spriteFrame = this.prop_list.btns[element.propsState - 1]
                                json.props = list
                                localStorage.setItem('shopJson', JSON.stringify(json))
                            },
                        })
                    return
                    break;
                case 2:
                    this.savePropState(element, false)
                    element.propsState = 1
                    break
                default:
                    break;
            }
            handleButton.getComponent(cc.Sprite).spriteFrame = this.prop_list.btns[element.propsState - 1]
            // TODO:打开弹窗
            json.props = list
            localStorage.setItem('shopJson', JSON.stringify(json))
        })
        content.addChild(_node);
    }
    getPeopleFn(element, list, json, index) {
        UtilAudio.modalAudioClick()
        this.resOpenModal({ ...element, type: 1 }, this.people_list.imgs[element.imgNum - 1])
        SetCom.global_prop.fragment -= element.price
        list[index].lock = false
        json.peoples = list
        localStorage.setItem('shopList', JSON.stringify(list))
        localStorage.setItem('shopJson', JSON.stringify(json))
        this.initialize('peoples', true)
    }
    peopleCreate(index, list, content, json) {
        content.height = Math.ceil(list.length / 2) * (this.people_pfb.data.height + 30) + 30;
        const element = list[index];
        let shop_people: any = localStorage.getItem('shop_people')
        if (shop_people) {
            shop_people = JSON.parse(shop_people)
        }
        if (element.lock) {
            let level = +cc.sys.localStorage.getItem('level') || 0
            let total_fragment = SetCom.global_prop.fragment
            let _node = cc.instantiate(this.peopleNo_pfb);
            let shop = _node.getChildByName("shop")
            let handleButton = _node.getChildByName("handleButton")
            let layout = handleButton.getChildByName("layout")
            let group = _node.getChildByName("group")
            group.getComponent(cc.Sprite).spriteFrame = this.people_list_no.groups[element.icon - 1]

            shop.getComponent(cc.Sprite).spriteFrame = this.people_list_no.imgs[element.imgNum - 1]
            if (level >= 450 && total_fragment >= element.price) {
                if (element.price) {
                    let num = 1
                    handleButton.getComponent(cc.Sprite).spriteFrame = this.people_list_no.btns[num]
                    layout.active = true
                    let money = layout.getChildByName("money")
                    money.getComponent(cc.Label).string = element.price
                } else {
                    handleButton.getComponent(cc.Sprite).spriteFrame = this.people_list_no.btns[0]
                }

                handleButton.on('click', () => {
                    UtilAudio.btnAudioClick()

                    if (element.imgNum == 1) {
                        SetCom.advertisement(
                            {
                                success: (_res) => {
                                    this.getPeopleFn(element, list, json, index)
                                },
                                fail: () => {
                                    SetCom.shareFriend(
                                        {
                                            success: (_res) => {
                                                this.getPeopleFn(element, list, json, index)
                                            },
                                        })
                                },
                            })
                        return
                    }
                    this.getPeopleFn(element, list, json, index)
                })
            } else {
                let num = 2
                handleButton.getComponent(cc.Sprite).spriteFrame = this.people_list_no.btns[num]
            }

            _node.on('click', () => {
                if (this.check_peopleId != element.id) {
                    this.check_peopleId = element.id
                    this.content.string = (level >= 450 && total_fragment >= element.price) ? element.doc : element.condition
                } else {
                    this.check_peopleId = null
                    this.content.string = ''
                }
            })
            content.addChild(_node);

        } else {
            let _node = cc.instantiate(this.people_pfb);
            let shop = _node.getChildByName("shop")
            let handleButton = _node.getChildByName("handleButton")
            let label = _node.getChildByName("label")
            let group = _node.getChildByName("group")
            let num = element.id == shop_people?.id ? 0 : 1
            shop.getComponent(cc.Sprite).spriteFrame = this.people_list.imgs[element.imgNum - 1]
            handleButton.getComponent(cc.Sprite).spriteFrame = this.people_list.btns[num]


            group.getComponent(cc.Sprite).spriteFrame = this.people_list.groups[element.icon - 1]

            label.getComponent(cc.Label).string = element.name
            handleButton.on('click', () => {
                UtilAudio.btnAudioClick()
                let shop_people: any = localStorage.getItem('shop_people')
                if (shop_people) {
                    shop_people = JSON.parse(shop_people)
                }
                let num = element.id == shop_people?.id ? 0 : 1
                if (num) {
                    let shop_people = { id: element.id, sign_num: element.sign_num }

                    localStorage.setItem('shop_people', JSON.stringify(shop_people))
                    let _content = cc.find('Canvas/bgImg/buyBg/scrollView/view/content')
                    _content.children.forEach(item => {
                        let Sprite = item.getChildByName("handleButton").getComponent(cc.Sprite)
                        if (Sprite.spriteFrame.name == '已装备@2x') Sprite.spriteFrame = this.people_list.btns[1]
                    })
                    element.propsState = 1
                    handleButton.getComponent(cc.Sprite).spriteFrame = this.people_list.btns[0]

                } else {
                    element.propsState = 2
                    handleButton.getComponent(cc.Sprite).spriteFrame = this.people_list.btns[1]
                    localStorage.removeItem('shop_people')
                }
                json.peoples = list
                localStorage.setItem('shopJson', JSON.stringify(json))
            })
            _node.on('click', () => {
                if (this.check_peopleId != element.id) {
                    this.check_peopleId = element.id
                    this.content.string = element.doc
                } else {
                    this.check_peopleId = null
                    this.content.string = ''
                }
            })
            content.addChild(_node);
        }
    }
    initialize(name: string = "props", bool_scroll?: boolean) {
        let content = this.scrollView.content;
        content?.removeAllChildren();
        let list = this.levelCfg.json[name]
        if (localStorage.getItem('shopJson')) {
            list = JSON.parse(localStorage.getItem('shopJson'))[name]
        }
        this.fragmentNum.string = SetCom.global_prop.fragment + ''
        for (let index = 0; index < list.length; index++) {
            switch (name) {
                case "props":
                    this.content.string = ''
                    this.check_peopleId = null
                    this.propCreate(index, list, content, this.levelCfg.json)
                    break;
                case "peoples":

                    this.peopleCreate(index, list, content, this.levelCfg.json)
                    break;
                default:
                    break;
            }
        }



        if (!bool_scroll) this.scrollView.scrollToTop(0)



    }
    resOpenModal(data, img: cc.SpriteFrame, img2?: cc.SpriteFrame, cb?: Function) {
        let node = cc.find("Canvas");
        if (cb) cb()
        let obj = {
            "rewardIcon": img,
            "name": data.name,
            "doc": data.doc
        }
        node.getComponent('openModal').openOpc(data.type, obj, true)
    }
    savePropState(item, bool: boolean) {
        switch (item.name) {
            case Decorate.Dropper:
                SetCom.decorate_set.isDropper = bool
                break;
            case Decorate.Beaker_small:
                SetCom.decorate_set.isBeaker_small = bool
                break;
            case Decorate.Microscope:
                SetCom.decorate_set.isMicroscope = bool
                break;
            case Decorate.robot:
                SetCom.decorate_set.isrobot = bool
                break;
            case Decorate.grass:
                SetCom.decorate_set.isgrass = bool
                break;
            case Decorate.Beaker_big:
                SetCom.decorate_set.isBeaker_big = bool
                break;
            default:
                break;
        }
    }
}
