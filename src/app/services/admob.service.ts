import { Injectable } from "@angular/core";
import { AdMob, AdMobBannerSize, AdmobConsentStatus, BannerAdOptions, BannerAdPluginEvents, BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";
import { AdOptions, AdLoadInfo, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from "@capacitor/core";

@Injectable
({
  providedIn:'root'
})

export class AdmobService {

  public showing:number = 0;

  async initialize(): Promise<void> {
    await AdMob.initialize();
    // const [trackingInfo, consentInfo] = await Promise.all([
    //   AdMob.trackingAuthorizationStatus(),
    //   AdMob.requestConsentInfo(),
    // ]);

    // const authorizationStatus = await AdMob.trackingAuthorizationStatus();
    // if (
    //         authorizationStatus.status === 'authorized' &&
    //         consentInfo.isConsentFormAvailable &&
    //         consentInfo.status === AdmobConsentStatus.REQUIRED
    // ) {
    //   await AdMob.showConsentForm();
    // }
    return;
  }

  async showConsent() {

    const consentInfo = await AdMob.requestConsentInfo();

    if (consentInfo.isConsentFormAvailable && consentInfo.status === AdmobConsentStatus.REQUIRED) {
      const {status} = await AdMob.showConsentForm();
    }
    return;
  }


//BANNER
  async showBanner(): Promise<void> {

    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      // Subscribe Banner Event Listener
      return;
    });

    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
      // Subscribe Change Banner Size
    });

    const options: BannerAdOptions = {
      adId: this.getBannerId(),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin:0,
      isTesting: this.gettesting(),
      // npa: true
    };
    AdMob.showBanner(options);
  }

  async hideBanner():Promise<void> {
    AdMob.hideBanner();
  }

  async resumeBanner():Promise<void> {
    AdMob.resumeBanner();
  }

  async removeBanner():Promise<void> {
    AdMob.removeBanner();
  }
//INTERSTICIAL
async showinterstitial(): Promise<void> {
  if(this.showing == 0){
    AdMob.addListener(InterstitialAdPluginEvents.Loaded, (info: AdLoadInfo) => {
      // Subscribe prepared interstitial
    });

    const options: AdOptions = {
      adId: this.getIntersticialId(),
      isTesting: this.gettesting()
      // npa: true
    };
    await AdMob.prepareInterstitial(options);
    await AdMob.showInterstitial();
    this.showing = 1;
  }
}

getBannerId(){
    if(Capacitor.getPlatform()==='ios'){
      return 'ca-app-pub-7109225930546474/1305900979'
    }else{
      return 'ca-app-pub-7109225930546474/8937529358'
    }
}

getIntersticialId(){
  if(Capacitor.getPlatform()==='ios'){
    return 'ca-app-pub-7109225930546474/1824775721'
  }else{
    return 'ca-app-pub-7109225930546474/7383858235'
  }
}

gettesting(){
  if(Capacitor.getPlatform()==='ios'){
    return true
  }else{
    return false
  }
}


}
