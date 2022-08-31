

interface Prop {
    backOff: number
    testTube: number
    reset: number
    physicalStrength: number
    fragment: number
    time: number
    upTime: number
}
interface spinIF {
    game: cc.Prefab[]
    home: cc.Prefab[]
    noGame: cc.Prefab[]
}
function debounce(fn: Function, delay: number): Function {
    let timer: any = null;
    return function () {
        let context = this;
        let args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    }
}
const { ccclass, property } = cc._decorator;
function getRandomItem(arr, cb) {
    let item = arr[~~(Math.random() * arr.length)];
    return cb(item)
}
@ccclass
export default class SetCom extends cc.Component {

    public static lostTime: number = 0;

    public static shop_people: Array<cc.SpriteFrame> = []
    public static shop_prop: Array<cc.SpriteFrame> = []
    public static spin: spinIF | {} = {}
    public static global_prop: Prop = new Proxy({
        backOff: 3,
        testTube: 3,
        reset: 3,
        physicalStrength: 10,
        fragment: 0,
        time: 0,
        upTime: 0,
    }, {
        get: function (target, propKey, receiver) {
            return Reflect.get(target, propKey, receiver);
        },
        set: function (target, propKey, value, receiver) {
            let obj = JSON.parse(JSON.stringify(target))
            obj[propKey] = value
            // console.log(target);
            // TODO： 有机会的话下面试试换成这个obj.time ??= new Date().getTime()

            if (propKey == 'physicalStrength') {
                obj.time ||= new Date().getTime()
                if (value >= 10) {
                    obj.time = 0
                }
            }
            // ------------------结束------------------

            obj.upTime = new Date().getTime()
            localStorage.setItem('global_prop', JSON.stringify(obj))
            return Reflect.set(target, propKey, value, receiver);
        }
    });

    public static decorate_set = new Proxy({
        isDropper: false,
        isBeaker_small: false,
        isMicroscope: false,
        isrobot: false,
        isgrass: false,
        isBeaker_big: false,
    }, {
        get: function (target, propKey, receiver) {
            return Reflect.get(target, propKey, receiver);
        },
        set: function (target, propKey, value, receiver) {
            let obj = JSON.parse(JSON.stringify(target))
            obj[propKey] = value
            localStorage.setItem('decorate_set', JSON.stringify(obj))
            obj.lv = localStorage.getItem('level')
            // console.log('1234567890',obj);
            SetCom.wxStorage('set', obj)
            return Reflect.set(target, propKey, value, receiver);
        }
    });

    public static audioSet = new Proxy({
        _musicPlay: true,
        _shockPlay: true,
    }, {
        get: function (target, propKey, receiver) {
            return Reflect.get(target, propKey, receiver);
        },
        set: function (target, propKey, value, receiver) {
            let obj = JSON.parse(JSON.stringify(target))
            obj[propKey] = value
            localStorage.setItem('audioSet', JSON.stringify(obj))
            return Reflect.set(target, propKey, value, receiver);
        }
    });
    static people_map = [
        { name: '街头小乞', sign_num: 1 },
        { name: '实验小白', sign_num: 2 },
        { name: '实验小胖', sign_num: 3 },
        { name: '挖煤工', sign_num: 4 },
        { name: '地中海', sign_num: 5 },
        { name: '小天才', sign_num: 6 },
        { name: '爱神斯坦', sign_num: 7 },
        { name: '智脑', sign_num: 14 },
        { name: '霍格沃兹麻瓜', sign_num: 8 },
        { name: '炼金术士', sign_num: 9 },
        { name: '红孩儿', sign_num: 10 },
        { name: '孟婆', sign_num: 11 },
        { name: '火云邪神', sign_num: 15 },
        { name: '雷霆嘎巴帝王', sign_num: 12 },
        { name: '太上老君', sign_num: 13 },
    ]
    static isShared: boolean = false
    static shareTag: string = 'keys'
    static closeTime: number = new Date().getTime();

    static shareFriend = debounce(function ({ success, cancel = () => { }, fail = () => { } }) {
        let textArr = [
            '@所有人，向你们发起挑战！你们能得到他吗？',
            '都说穷人家的孩子早当家，我却止于第10关！'
        ]
        let imgUrls = [
            'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/img1.jpg?sign=053b77f0b25b673f46a04073facbb640&t=1660105659',
            'https://6761-game-yun-1g16a4u31c52b0c6-1305070155.tcb.qcloud.la/img2.jpg?sign=efbd5e31c49f9f2b1793842fa7d4f713&t=1660105682'
        ]
        SetCom.successFn = success
        SetCom.cancelFn = cancel
        this.isShared = true;
        this.shareTag = "keys";
        this.closeTime = new Date().getTime();
        if (CC_WECHATGAME) {
            wx.shareAppMessage({
                title: getRandomItem(textArr, (item) => item),
                imageUrl: getRandomItem(imgUrls, (item) => item),
            })
        }
    }, 500)
    static shareFn = false
    onLoad() {
        if (typeof (wx) !== "undefined" && !SetCom.shareFn) {
            wx.onShow(function () {
                if (SetCom.isShared && SetCom.shareTag == "keys") {
                    SetCom.shareFn = true
                    let curTime = new Date().getTime();
                    if (curTime - SetCom.closeTime >= 3000) {
                        // console.log("分享成功");
                        SetCom.successFn('分享成功')

                    } else {
                        wx.showModal({

                            content: '分享到10人以上群聊才可领取奖励',

                            showCancel: false,
                            title: '分享失败',

                        })
                        console.log('分享取消');
                        
                        SetCom.cancelFn('分享取消')
                    }
                    SetCom.isShared = false;
                    SetCom.shareTag = "";
                    SetCom.closeTime = curTime;
                }
            })
        }
    }
    /**
     * 加载scene
     * @param e 
     * @param name 
     */
    onScene(e, name) {
        cc.director.loadScene(name);
    }
    /**
     * 根据等级获取称号\动画
     * @param level 关卡数
     * @returns next_num 距离下一个称号数
     *          next_level 下一个称号
     *          cur_level 当前称号
     *          nextTitle 
     *          lable 角色名
     *          spin_num 第几个动画
     */
    static getTitleOrJson(level: number) {
        let next_num = 0;
        let next_level;
        let cur_level;
        let nextTitle;
        let label;
        let arr = [
            "街头小乞",
            "实验小白",
            "实验小胖",
            "挖煤工",
            "地中海",
            "小天才",
            "爱神斯坦",
            "智脑",
        ];
        let title = ["入门", "初级", "高级", "封神"];
        let content = '已经有自我意识的机器人，致力于消灭人类'
        // 1 - 10 街头小乞
        if (level < 10) {
            content = '小乞丐也有大梦想'
            label = arr[0];
            //  1 - 2 初级
            if (level < 3) {
                next_num = 3 - level;
                next_level = title[1] + arr[0];
                nextTitle = `再过${3 - level}关，可晋升为${title[1] + arr[0]}`;//高级街头小乞
                cur_level = title[0] + arr[0];
                // 3 - 4 高级
            } else if (level < 5) {
                next_num = 5 - level;
                next_level = title[2] + arr[0];
                nextTitle = `再过${5 - level}关，可晋升为${title[2] + arr[0]}`;
                cur_level = title[1] + arr[0];
                //5-7 封神
            } else if (level < 8) {
                next_num = 8 - level;
                next_level = title[3] + arr[0];
                nextTitle = `再过${8 - level}关，可晋升为${title[3] + arr[0]}`;
                cur_level = title[2] + arr[0];
            } else {
                next_num = 10 - level;
                next_level = title[0] + arr[1];
                nextTitle = `再过${10 - level}关，可晋升为${title[0] + arr[1]}`;
                cur_level = title[3] + arr[0];
            }
            //  10 - 29 实验小白
        } else if (level < 30) {
            content = '勉强进入实验室的毫无天分的实验小白'
            label = arr[1];
            // 10 - 12 初级
            if (level < 13) {
                next_num = 13 - level;
                next_level = title[1] + arr[1];
                nextTitle = `再过${13 - level}关，可晋升为${title[1] + arr[1]}`;
                cur_level = title[0] + arr[1];
                // 13 - 17 高级
            } else if (level < 18) {
                next_num = 18 - level;
                next_level = title[2] + arr[1];
                nextTitle = `再过${18 - level}关，可晋升为${title[2] + arr[1]}`;
                cur_level = title[1] + arr[1];
                // 18 - 23 封神
            } else if (level < 24) {
                next_num = 24 - level;
                next_level = title[3] + arr[1];
                nextTitle = `再过${24 - level}关，可晋升为${title[2] + arr[1]}`;
                cur_level = title[2] + arr[1];
            } else {
                next_num = 30 - level;
                next_level = title[0] + arr[2];
                nextTitle = `再过${30 - level}关，可晋升为${title[0] + arr[2]}`;
                cur_level = title[3] + arr[1];
            }
            // 30 - 60 实验小胖
        } else if (level < 60) {
            content = '中年危机了还是初级研究员，但是心态贼好'
            label = arr[2];
            // 30 - 33 初级
            if (level < 34) {
                next_num = 34 - level;
                next_level = title[1] + arr[2];
                nextTitle = `再过${34 - level}关，可晋升为${title[1] + arr[2]}`;
                cur_level = title[0] + arr[2];
                // 34 - 38 高级
            } else if (level < 39) {
                next_num = 39 - level;
                next_level = title[2] + arr[2];
                nextTitle = `再过${39 - level}关，可晋升为${title[2] + arr[2]}`;
                cur_level = title[1] + arr[2];
                // 39 - 49 封神
            } else if (level < 49) {
                next_num = 49 - level;
                next_level = title[3] + arr[2];
                nextTitle = `再过${49 - level}关，可晋升为${title[2] + arr[2]}`;
                cur_level = title[2] + arr[2];
            } else {
                next_num = 60 - level;
                next_level = title[0] + arr[3];
                nextTitle = `再过${60 - level}关，可晋升为${title[0] + arr[3]}`;
                cur_level = title[3] + arr[2];
            }
            // 60 - 100 挖煤工
        } else if (level < 100) {
            content = '非洲来的高级研究员，以前是锅炉房挖煤的'
            label = arr[3];
            // 60 - 64 初级
            if (level < 65) {
                next_num = 65 - level;
                next_level = title[1] + arr[3];
                nextTitle = `再过${65 - level}关，可晋升为${title[1] + arr[3]}`;
                cur_level = title[0] + arr[3];
                // 65 - 72 高级
            } else if (level < 73) {
                next_num = 73 - level;
                next_level = title[2] + arr[3];
                nextTitle = `再过${73 - level}关，可晋升为${title[2] + arr[3]}`;
                cur_level = title[1] + arr[3];
                // 73 - 85 封神
            } else if (level < 86) {
                next_num = 86 - level;
                next_level = title[3] + arr[3];
                nextTitle = `再过${86 - level}关，可晋升为${title[2] + arr[3]}`;
                cur_level = title[2] + arr[3];
            } else {
                next_num = 100 - level;
                next_level = title[0] + arr[4];
                nextTitle = `再过${100 - level}关，可晋升为${title[0] + arr[4]}`;
                cur_level = title[3] + arr[3];
            }
            // 100 - 160 地中海
        } else if (level < 160) {
            content = '实验室很厉害的人物，年纪轻轻就地中海了'
            label = arr[4];
            // 100 - 107 初级
            if (level < 108) {
                next_num = 108 - level;
                next_level = title[1] + arr[4];
                nextTitle = `再过${108 - level}关，可晋升为${title[1] + arr[4]}`;
                cur_level = title[0] + arr[4];
                // 108 - 119 高级
            } else if (level < 120) {
                next_num = 120 - level;
                next_level = title[2] + arr[4];
                nextTitle = `再过${120 - level}关，可晋升为${title[2] + arr[4]}`;
                cur_level = title[1] + arr[4];
                // 120 - 149 封神
            } else if (level < 150) {
                next_num = 150 - level;
                next_level = title[3] + arr[4];
                nextTitle = `再过${150 - level}关，可晋升为${title[2] + arr[4]}`;
                cur_level = title[2] + arr[4];
            } else {
                next_num = 160 - level;
                next_level = title[0] + arr[5];
                nextTitle = `再过${160 - level}关，可晋升为${title[0] + arr[5]}`;
                cur_level = title[3] + arr[4];
            }
            // 160 - 250 小天才
        } else if (level < 250) {
            content = '实验室里天赋极强的小孩，据说很高傲'
            label = arr[5];
            // 160 - 169 初级
            if (level < 170) {
                next_num = 170 - level;
                next_level = title[1] + arr[5];
                nextTitle = `再过${171 - level}关，可晋升为${title[1] + arr[5]}`;
                cur_level = title[0] + arr[5];
                // 170 - 184 高级
            } else if (level < 185) {
                next_num = 185 - level;
                next_level = title[2] + arr[5];
                nextTitle = `再过${185 - level}关，可晋升为${title[2] + arr[5]}`;
                cur_level = title[1] + arr[5];
                // 185 - 214 封神
            } else if (level < 215) {
                next_num = 215 - level;
                next_level = title[3] + arr[5];
                nextTitle = `再过${215 - level}关，可晋升为${title[2] + arr[5]}`;
                cur_level = title[2] + arr[5];
            } else {
                next_num = 250 - level;
                next_level = title[0] + arr[6];
                nextTitle = `再过${250 - level}关，可晋升为${title[0] + arr[6]}`;
                cur_level = title[3] + arr[5];
            }
            // 250 - 350 爱神斯坦
        } else if (level < 350) {
            content = '科学界的天花板，满级人类'
            label = arr[6];
            // 250 - 259 初级
            if (level < 260) {
                next_num = 260 - level;
                next_level = title[1] + arr[6];
                nextTitle = `再过${260 - level}关，可晋升为${title[1] + arr[6]}`;
                cur_level = title[0] + arr[6];
                // 260 - 279 高级
            } else if (level < 280) {
                next_num = 280 - level;
                next_level = title[2] + arr[6];
                nextTitle = `再过${280 - level}关，可晋升为${title[2] + arr[6]}`;
                cur_level = title[1] + arr[6];
                // 280 - 309 封神
            } else if (level < 310) {
                next_num = 310 - level;
                next_level = title[3] + arr[6];
                nextTitle = `再过${310 - level}关，可晋升为${title[2] + arr[6]}`;
                cur_level = title[2] + arr[6];
            } else {
                next_num = 350 - level;
                next_level = title[0] + arr[7];
                nextTitle = `再过${350 - level}关，可晋升为${title[0] + arr[7]}`;
                cur_level = title[3] + arr[6];
            }
            // 350 - 450 智脑
        } else if (level < 450) {
            content = '已经有自我意识的机器人，致力于消灭人类'
            label = arr[7];
            // 350 - 359 初级
            if (level < 360) {
                next_num = 360 - level;
                next_level = title[1] + arr[7];
                nextTitle = `再过${360 - level}关，可晋升为${title[1] + arr[7]}`;
                cur_level = title[0] + arr[7];
                // 360 - 379 高级
            } else if (level < 380) {
                next_num = 380 - level;
                next_level = title[2] + arr[7];
                nextTitle = `再过${380 - level}关，可晋升为${title[2] + arr[7]}`;
                cur_level = title[1] + arr[7];
                // 380 - 409 封神
            } else if (level < 410) {
                next_num = 410 - level;
                next_level = title[3] + arr[7];
                nextTitle = `再过${410 - level}关，可晋升为${title[2] + arr[7]}`;
                cur_level = title[2] + arr[7];
            } else {
                // next_num = 450 - level;
                // next_level = title[0] + arr[8];
                // nextTitle = `再过${450 - level}关，可晋升为${title[0] + arr[8]}`;
                nextTitle = null;
                cur_level = title[3] + arr[7];
            }
        } else {
            cur_level = title[3] + arr[7];
            // cur_level = '已经是最高级';
        }
        return {
            next_num,
            next_level,
            cur_level,
            nextTitle,
            label,
            content,
            spin_num: arr.findIndex((item) => item === label),
        };
    }
    static getSomeSpin(level: number, str: keyof spinIF) {
        let { spin_num } = this.getTitleOrJson(level)
        if (spin_num == -1) spin_num = 7
        let data = localStorage.getItem('shop_people')
        let num;
        if (data) {
            num = JSON.parse(data)['sign_num']
        }
        switch (str) {
            case 'home':
                return (SetCom.spin as spinIF).home?.find((item) => item.name === 'home' + (num || this.people_map[spin_num].sign_num))
            case 'game':
                return (SetCom.spin as spinIF).game?.find((item) => item.name === 'game' + (num || this.people_map[spin_num].sign_num))
            case 'noGame':
                return (SetCom.spin as spinIF).noGame?.find((item) => item.name === 'noGame' + (num || this.people_map[spin_num].sign_num))
            default:
                break;
        }
    }
    /** 减体力 */
    static reducePower() {
        if (!(this.global_prop.physicalStrength--)) {
            // console.log('体力不足');
            this.global_prop.physicalStrength = 0
            return false
        }
        return true
    }

    static addPower(num: number) {
        this.global_prop.physicalStrength += num

    }
    start() {

    }
    static async wxStorage(key: string, value?: any) {
        if (typeof (wx) !== "undefined") {
            switch (key) {
                case 'set':
                    wx?.cloud.callFunction({
                        name: 'setGameData',
                        data: {
                            data: JSON.stringify(value)
                        }
                    })
                    break;
                case 'get':
                    let { result } = await wx?.cloud.callFunction({
                        name: 'getGameData',
                    })
                    let data = result?.data
                    if (data && data.length) {
                        return data[0].gameData
                    }
                    break;

                default:
                    break;
            }
        }
    }
    /** 加载缓存 */
    static async loadCache() {
        let global_prop = localStorage.getItem('global_prop')
        let decorate_set = localStorage.getItem('decorate_set')
        let audioSet = localStorage.getItem('audioSet')
        if (!global_prop) {
            global_prop = await SetCom.wxStorage('get')
           
        }
        if (global_prop) {
            let { lv, ...props } =  JSON.parse(global_prop)
            if(lv)localStorage.setItem('level', lv || 1)
            this.global_prop = new Proxy(props, {
                get: function (target, propKey, receiver) {
                    return Reflect.get(target, propKey, receiver);
                },
                set: function (target, propKey, value, receiver) {
                    let obj = JSON.parse(JSON.stringify(target))
                    obj[propKey] = value

                    if (propKey == 'physicalStrength') {
                        obj.time ||= new Date().getTime()
                        if (value >= 10) {
                            obj.time = 0
                        }
                    }

                    obj.upTime = new Date().getTime()

                    // console.log(target.physicalStrength, propKey, value, receiver);

                    localStorage.setItem('global_prop', JSON.stringify(obj))
                    obj.lv = localStorage.getItem('level')
                    // console.log('1234567890',obj);
                    
                    SetCom.wxStorage('set', obj)
                    return Reflect.set(target, propKey, value, receiver);
                }
            });
        }
        if (decorate_set) {
            this.decorate_set = new Proxy(JSON.parse(decorate_set), {
                get: function (target, propKey, receiver) {
                    return Reflect.get(target, propKey, receiver);
                },
                set: function (target, propKey, value, receiver) {
                    let obj = JSON.parse(JSON.stringify(target))
                    obj[propKey] = value
                    localStorage.setItem('decorate_set', JSON.stringify(obj))
                    return Reflect.set(target, propKey, value, receiver);
                }
            });
        }
        if (audioSet) {
            this.audioSet = new Proxy(JSON.parse(audioSet), {
                get: function (target, propKey, receiver) {
                    return Reflect.get(target, propKey, receiver);
                },
                set: function (target, propKey, value, receiver) {
                    let obj = JSON.parse(JSON.stringify(target))
                    obj[propKey] = value
                    localStorage.setItem('audioSet', JSON.stringify(obj))
                    return Reflect.set(target, propKey, value, receiver);
                }
            });
        }
    }
}