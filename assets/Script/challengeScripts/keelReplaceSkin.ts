// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class KeelReplaceSkin extends cc.Component {

    @property(dragonBones.ArmatureDisplay)

    demon: dragonBones.ArmatureDisplay = null;
    replaceSkin(dbAsset, dbAtlas, armatureName = 'Armature', animation = 'newAnimation') {
        this.demon.dragonAsset = dbAsset;          //设置骨骼数据
        this.demon.dragonAtlasAsset = dbAtlas;     //设置骨骼数据所需Atlas
        this.demon.armatureName = armatureName;  //设置皮肤
        this.demon.playAnimation(animation, 0);        //播放动画
    }
    // onLoad () {}

    /** 单个加载替换 */
    oneReplace(assetUrl: string, atlasUrl: string): any {
        return new Promise((res, rej) => {
            cc.resources.load("spin/" + assetUrl, dragonBones.DragonBonesAsset, (err, dbAsset: dragonBones.DragonBonesAsset) => {
                cc.resources.load("spin/" + atlasUrl, dragonBones.DragonBonesAtlasAsset, (err, dbAtlas: dragonBones.DragonBonesAtlasAsset) => {
                    res({
                        dbAsset, dbAtlas
                    })
                })
            })
        })

    }
    /** 加载完整个文件夹替换 */
    async dynamicCreate(package_path: string) {
        debugger
        return new Promise((resolve, rej) => {
            cc.resources.loadDir(package_path, cc.Asset, (err, res: any) => {
                if (err) {
                    console.error(err);
                    rej(err)
                } else {
                    resolve(res)
                }
            });
        })

    }
    /** 加载远程龙骨 */
    loadRemote(image, ske, atlas): any {
        return new Promise((res, rej) => {
            cc.loader.load(image, (error, texture) => {
                cc.loader.load({ url: atlas, type: 'txt' }, (error, atlasJson) => {
                    cc.loader.load({ url: ske, type: 'txt' }, (error, dragonBonesJson) => {
                        var atlas = new dragonBones.DragonBonesAtlasAsset();
                        atlas.atlasJson = atlasJson;
                        atlas.texture = texture;

                        var asset = new dragonBones.DragonBonesAsset();
                        asset.dragonBonesJson = dragonBonesJson;

                        res({
                            dbAsset: asset, dbAtlas: atlas
                        })


                        // dragonDisplay.dragonAtlasAsset = atlas;
                        // dragonDisplay.dragonAsset = asset;
                        // dragonDisplay.armatureName = 'armatureName';
                        // dragonDisplay.playAnimation('walk', 0);
                    });
                });
            });
        })

        // var image = 'http://127.0.0.1:5500/assets/resources/Monster/monsterbone001_0_tex.png';
        // var ske = 'http://127.0.0.1:5500/assets/resources/Monster/monsterbone00e1_0_ske.json';
        // var atlas = 'http://127.0.0.1:5500/assets/resources/Monster/monsterbone001_0_tex.json';

    }
    // async loadRes() {
        // let assetUrl = '全人物动作json/2/home/NewProject_ske'
        // let atlasUrl = '全人物动作json/2/home/NewProject_tex'
        // let keel = cc.instantiate(this.prefab)
        // let {
        //     dbAsset, dbAtlas
        // } = await this.oneReplace(assetUrl, atlasUrl)
        // keel.getComponent(KeelReplaceSkin).replaceSkin(dbAsset, dbAtlas)

        // var image = 'http://127.0.0.1:5500/Dashboard-202209027-dev/15/game/NewProject_tex.png';
        // var ske = 'http://127.0.0.1:5500/Dashboard-202209027-dev/15/game/NewProject_ske.json';
        // var atlas = 'http://127.0.0.1:5500/Dashboard-202209027-dev/15/game/NewProject_tex.json';

        // let {
        //     dbAsset, dbAtlas
        // } = await this.loadRemote(image, ske, atlas)
        // keel.getComponent(KeelReplaceSkin).replaceSkin(dbAsset, dbAtlas)

        // let resouceArr = await this.dynamicCreate('spin/全人物动作json')
        // console.log(resouceArr);
        // keel.getComponent(KeelReplaceSkin).replaceSkin(resouceArr[8], resouceArr[10])

        // this.node.addChild(keel)
    // }
    start() {

    }

    // update (dt) {}
}
