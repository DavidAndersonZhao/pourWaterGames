import { BaseDialog } from "./base_dialog";

const {ccclass, property} = cc._decorator;

@ccclass
export class DlgSetting extends BaseDialog{
    @property(cc.Toggle)
    private check_effect:cc.Toggle = null;
    @property(cc.Toggle)
    private check_shock:cc.Toggle = null;

    static show(){
        DlgSetting.create("prefabs/dialog_setting")
    }

    initView() {
        
    }
    exitView(bundleData?: any) {
        
    }
    
    onToggle_effect(){

    }

    onToggle_shock(){
        
    }

    onBtn_like(){

    }

    onBtn_hideAd(){
        
    }
}