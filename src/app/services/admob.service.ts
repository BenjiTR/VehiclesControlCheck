import { Injectable } from "@angular/core";
import { AdMob, AdMobBannerSize, AdmobConsentStatus, BannerAdOptions, BannerAdPluginEvents, BannerAdPosition, BannerAdSize } from "@capacitor-community/admob";

@Injectable
({
  providedIn:'root'
})

export class AdmobService {

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

  async showBanner(): Promise<void> {
  
    AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
      // Subscribe Banner Event Listener
      return;
    });

    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (size: AdMobBannerSize) => {
      // Subscribe Change Banner Size
    });

    const options: BannerAdOptions = {
      //adId: 'ca-app-pub-7109225930546474~5137885146',
      adId: 'ca-app-pub-3940256099942544/9214589741',
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin:0,
      isTesting: true,
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

}
