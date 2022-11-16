import { UtilAudio } from "./audio_util"


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
    public static isChallenge: Boolean = false;

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
    static challengeResState = false //挑战模式资源下载状况
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
        { djName: 'DJ-街头小乞', name: '街头小乞', sign_num: 1 },
        { djName: 'DJ-实验小白', name: '实验小白', sign_num: 2 },
        { djName: 'DJ-实验小胖', name: '实验小胖', sign_num: 3 },
        { djName: 'DJ-挖煤工', name: '挖煤工', sign_num: 4 },
        { djName: 'DJ-地中海', name: '地中海', sign_num: 5 },
        { djName: 'DJ-小天才', name: '小天才', sign_num: 6 },
        { djName: 'DJ-爱神斯坦', name: '爱神斯坦', sign_num: 7 },
        { djName: 'DJ-智脑', name: '智脑', sign_num: 14 },
        { djName: 'DJ-霍格沃兹麻瓜', name: '霍格沃兹麻瓜', sign_num: 8 },
        { djName: 'DJ-炼金术士', name: '炼金术士', sign_num: 9 },
        { djName: 'DJ-红孩儿', name: '红孩儿', sign_num: 10 },
        { djName: 'DJ-孟婆', name: '孟婆', sign_num: 11 },
        { djName: 'DJ-火云邪神', name: '火云邪神', sign_num: 15 },
        { djName: 'DJ-雷霆嘎巴帝王', name: '雷霆嘎巴帝王', sign_num: 12 },
        { djName: 'DJ-太上老君', name: '太上老君', sign_num: 13 },
    ]
    static isShared: boolean = false
    static shareTag: string = 'keys'
    static loadScence: string = null
    static closeTime: number = new Date().getTime();
    static bannerAd: any = null
    static gridAd: any = null
    static successFn: Function | null = null
    static cancelFn: Function | null = null
    static failFn: Function | null = null
    static videoAd: any = null
    static resetEvent() {
        SetCom.successFn = null
        SetCom.cancelFn = null
        SetCom.failFn = null
    }
    static advertisement = debounce(function ({ success, cancel = (str?: string) => { }, fail = (str?: string) => { } }) {
        cc.director.pause();

        if (!CC_WECHATGAME) {
            success()
            if (cc.director.isPaused()) cc.director.resume()
            // console.log('广告');
            return
        }
        SetCom.successFn = success
        SetCom.cancelFn = cancel
        SetCom.failFn = fail

        // 用户触发广告后，显示激励视频广告
        SetCom.videoAd.show().catch(() => {
            // 失败重试
            SetCom.videoAd.load()
                .then(() => SetCom.videoAd.show())
                .catch(err => {
                    fail('播放失败')
                })
        })

    }, 800)
    bannerAngGridAdvertisement() {
        if (CC_WECHATGAME) {
            if (!SetCom.videoAd) {
                // 创建激励视频广告实例，提前初始化
                SetCom.videoAd = wx.createRewardedVideoAd({
                    adUnitId: 'adunit-f18152a955d3f21f'
                })


                SetCom.videoAd.onClose(res => {
                    // 用户点击了【关闭广告】按钮
                    // 小于 2.1.0 的基础库版本，res 是一个 undefined
                    if (res && res.isEnded || res === undefined) {
                        // 正常播放结束，可以下发游戏奖励
                        if (cc.director.isPaused()) cc.director.resume()
                        SetCom?.successFn('播放结束')
                        SetCom.resetEvent()
                    }
                    else {
                        if (cc.director.isPaused()) cc.director.resume()
                        // 播放中途退出，不下发游戏奖励
                        SetCom?.cancelFn('播放取消')
                        SetCom.resetEvent()
                    }
                })
                SetCom.videoAd.onError(err => {
                    SetCom?.failFn('播放失败')
                    SetCom.resetEvent()
                })
            }
            let windowSetting

            if (wx.getWindowInfo) {
                windowSetting = wx.getSystemInfoSync()
            } else {
                // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
                wx.showModal({
                    title: '提示',
                    content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
                })
            }
            SetCom.bannerAd?.destroy()
            SetCom.gridAd?.destroy()
            SetCom.bannerAd = wx.createBannerAd({
                adUnitId: 'adunit-80cfe596bb2a5337',
                adIntervals: 30, // 自动刷新频率不能小于30秒
                style: {
                    left: (windowSetting?.screenWidth - (windowSetting?.screenWidth - 70)) / 2,
                    top: windowSetting?.windowHeight - +(0.165 * windowSetting?.windowHeight).toFixed(),
                    height: 80,
                    width: windowSetting?.screenWidth - +(0.17 * windowSetting?.screenWidth).toFixed()
                }
            })
            SetCom.bannerAd.onError(err => {
                // console.log(err)
            })
            SetCom.gridAd = wx.createCustomAd({
                adUnitId: 'adunit-91dbf6a007922ac1',
                adTheme: 'white',
                gridCount: 5,
                style: {
                    left: windowSetting?.screenWidth - 40 - 20,
                    top: 85,
                    width: 80,
                    opacity: 0.8
                }
            })
            SetCom.gridAd.onError(err => {
                // console.log(err)
            })
        }
    }
    // banner广告展示
    static bannerShow(name: 'bannerAd' | 'gridAd', state: 'show' | 'hide') {
        setTimeout(() => {
            switch (state) {
                case 'show':
                    this[name]?.show()
                    break;
                case 'hide':
                    this[name]?.hide()

                    break;
                default:
                    break;
            }
        }, 300);
    }
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
        } else {
            // console.log('分享');
            success()
        }
    }, 500)
    static shareFn = false
    onLoad() {
        let userInfo = localStorage.getItem('userInfo')
        if (userInfo) SetCom.userInfo = JSON.parse(userInfo)
        this.bannerAngGridAdvertisement()
        if (CC_WECHATGAME) {
            wx.showShareMenu()
            wx.onHide(() => {
                // console.log('页面隐藏');
                cc.director.pause();
            })

        }
        if (typeof (wx) !== "undefined") {
            wx.onShow(function () {
                if (cc.director.isPaused()) cc.director.resume()
                if (SetCom.shareFn) return
                if (SetCom.isShared && SetCom.shareTag == "keys") {
                    SetCom.shareFn = true
                    let curTime = new Date().getTime();
                    if (curTime - SetCom.closeTime >= 3000) {
                        // console.log("分享成功");
                        SetCom?.successFn('分享成功')
                        SetCom.resetEvent()


                    } else {
                        wx.showModal({

                            content: '分享到10人以上群聊才可领取奖励',

                            showCancel: false,
                            title: '分享失败',

                        })

                        SetCom?.cancelFn('分享取消')
                        SetCom.resetEvent()

                    }
                    SetCom.isShared = false;
                    SetCom.shareTag = "";
                    SetCom.closeTime = curTime;
                }
            })
        }
    }
    static serviceTime: any = null
    static avatarUrl: string
    /** 添加排行榜数据 */
    static async addRankingList(data) {
        if (!window.wx) return
        let { result } = await wx?.cloud.callFunction({
            name: 'rankingList',
            data: {
                method: 'add',
                data
            }
        })
        return result
    }
    /** 获取排行榜列表 */
    static async getRankingList() {
        if (!window.wx) return
        let { result } = await wx?.cloud.callFunction({
            name: 'rankingList',
            data: {
                method: 'get',
                data: {

                }
            }
        })
        /* 
        
        {"serviceTime":"2022-11-11","txt":"查询成功","data":[{"_id":"1f154439635e73fe0048a8f05fb43d01","passTime":10,"curTime":"2022-11-11","del":0},{"_id":"b17ee42c635e76e50010f8257a7478f8","openid":"orLZt5WKijDpSg4boeVOkHottOfc","passTime":999,"curTime":"2022-11-11","del":0,"avatarUrl":"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132","city":"","country":"","gender":0,"language":"","nickName":"微信用户","province":"","creatTime":1667135205321}],
        "currentData":{"_id":"b17ee42c635e76e50010f8257a7478f8","openid":"orLZt5WKijDpSg4boeVOkHottOfc","passTime":999,"curTime":"2022-11-11","del":0,"avatarUrl":"https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132","city":"","country":"","gender":0,"language":"","nickName":"微信用户","province":"","creatTime":1667135205321,"rankingNum":1}}
        */
        this.serviceTime = result.serviceTime
        // {serviceTime,data,currentData}
        return result
    }
    static userInfo
    /** 保存用户信息 */
    saveUserInfo() {
        let _lv = cc.sys.localStorage.getItem('level') || 0
        let shop_people = localStorage.getItem('shop_people')
        function getUserInfo(userInfo) {

        }
        return new Promise((resolve, reject) => {
            try {
                // wx.getSetting({
                //     success(res) {
                //         if (res.authSetting['scope.userInfo']) {
                //             resolve('')
                //             return
                //         } else {
                //         }
                       
                //     }
                // })
                if(SetCom.userInfo){
                    resolve('')
                    return
                }
                wx.getUserProfile({
                    desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
                    fail: (err) => {
                        console.log(err)
                        reject(err)
                        wx.showModal({
                            title: '请授权后才能开始游戏',
                            showCancel: false,
                        })
                    },
                    success: async function (res) {

                        var userInfo = res.userInfo
                        var nickName = userInfo.nickName
                        var avatarUrl = userInfo.avatarUrl
                        localStorage.setItem('userInfo',JSON.stringify(userInfo))
                        SetCom.avatarUrl = avatarUrl
                        SetCom.userInfo = userInfo
                        var gender = userInfo.gender //性别 0：未知、1：男、2：女
                        let { result } = await wx?.cloud.callFunction({
                            name: 'handleUser',
                            data: {
                                method: 'add',
                                data: {
                                    nickName,
                                    avatarUrl,
                                    gender,
                                    _lv,
                                    shop_people,
                                    needPushMsg: true,//需要消息推送
                                }
                            }
                        })
                        if (result.txt === "添加成功") {
                            resolve(result.txt)
                        } else {
                            reject('添加失败')
                        }
                    }
                })
            } catch (error) {
                reject(error)
            }
        })

    }
    /**
     * 加载scene
     * @param e 
     * @param name 
     */
    onScene(e, name) {
        // if (['shop'].includes(name)) {
        UtilAudio.btnAudioClick()
        // }
        if (name === 'rankList' && window.wx) {
            this.saveUserInfo().then(() => {
                if(!SetCom.challengeResState) {
                    if (CC_WECHATGAME) {
                        wx.showToast({
                            title: '请稍后。。。挑战资源加载中',
                            icon: 'none'
                        })
                    }
                }
                cc.director.loadScene(name);
            }).catch(() => {
                console.log('获取用户信息失败,无法开始游戏');
            })
        } else {
            cc.director.loadScene(name);
        }
    }
    customerService() {
        if (wx) wx.openCustomerServiceConversation()
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
    static getDJSpinName(level: number, shop_people?) {
        let { spin_num } = this.getTitleOrJson(level)
        if (spin_num == -1) spin_num = 7
        let data = shop_people || localStorage.getItem('shop_people')
        let num;
        if (data) {
            num = JSON.parse(data)['sign_num']
        }
        num ||= this.people_map[spin_num].sign_num
        return this.people_map[spin_num].name
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
            let { lv, ...props } = JSON.parse(global_prop)
            if (lv) localStorage.setItem('level', lv || 1)
            if (lv >= 3702) localStorage.setItem('level', '3702')
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