// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Prefab)
    prefab: cc.Prefab = null;
    onLoad() {
        let spin = cc.instantiate(this.prefab)
        let canvas = cc.find("Canvas");
        let robot = spin.getComponent(dragonBones.ArmatureDisplay);
        /* 
        this.demon.dragonAsset = dbAsset;          //设置骨骼数据

                this.demon.dragonAtlasAsset = dbAtlas;     //设置骨骼数据所需Atlas

                this.demon.armatureName = "armatureName";  //设置皮肤

                this.demon.playAnimation("run", 0); 
        */
        let robotArmature = robot.armature();
        // 远程文本
        let remoteUrl1 = "http://127.0.0.1:5500/home/NewProject_tex.json";
        let remoteUrl = "http://127.0.0.1:5500/home/NewProject_ske.json";
        /*  cc.resources.load("db/Demon_ske", dragonBones.DragonBonesAsset, (err, dbAsset: dragonBones.DragonBonesAsset) => {

            cc.resources.load("db/Demon_tex", dragonBones.DragonBonesAtlasAsset, (err, dbAtlas: dragonBones.DragonBonesAtlasAsset) => {

                this.demon.dragonAsset = dbAsset;          //设置骨骼数据

                this.demon.dragonAtlasAsset = dbAtlas;     //设置骨骼数据所需Atlas

                this.demon.armatureName = "armatureName";  //设置皮肤

                this.demon.playAnimation("run", 0);        //播放动画

            })

        }) */
        console.log(robot.dragonAsset);
        cc.resources.load(remoteUrl, dragonBones.DragonBonesAsset, (err, res) => {
            console.log(res);
            
        });
        // 远程文本
        cc.assetManager.loadRemote(remoteUrl, function (err, dbAsset) {
            cc.assetManager.loadRemote(remoteUrl1, function (err, dbAtlas) {

                
                // robot.dragonAsset = dbAsset
                console.log(dbAsset);
                console.log(dbAtlas);
                return
                // let atlas = new dragonBones.DragonBonesAtlasAsset();
                // atlas.atlasJson = dbAtlas;
                // atlas.texture = dbAsset;

                // let asset = new dragonBones.DragonBonesAsset();
                // asset.dragonBonesJson = robotArmature;

                // robotArmature.dragonAtlasAsset = dbAtlas;
                // robotArmature.dragonAsset = dbAsset;
                // this.demon.dragonAsset = dbAsset;          //设置骨骼数据
                // this.demon.dragonAtlasAsset = dbAtlas;          //设置骨骼数据所需Atlas
                // canvas.addChild(spin);
                //生成骨骼动画
                let node: cc.Node = new cc.Node();
                let armatureDisplay: dragonBones.ArmatureDisplay = node.addComponent(dragonBones.ArmatureDisplay);
                armatureDisplay.dragonAsset = dbAsset;
                // armatureDisplay.dragonAtlasAsset =dbAtlas;
                // armatureDisplay.armatureName = "role3";
                // armatureDisplay.playAnimation("move",0);
                // node.x = 100;
                // node.y = 100;
                // use string to do something
            });
            // use string to do something
        });
        canvas.addChild(spin);

        // robot.dragonAsset = 'http://127.0.0.1:5500/home/NewProject_tex.json'
        //  let robotSlot = robotArmature
        // // console.log(robotSlot);
        //   let factory = dragonBones.CCFactory.getInstance();
        //  factory.replaceSlotDisplay(
        //      this.knife.getArmatureKey(), 
        //      "weapon", 
        //      "weapon_r", 
        //      "weapon_1004c_r", 
        //      robotSlot
        //  );

    }

    // start () {

    // }

    // update (dt) {}
}
