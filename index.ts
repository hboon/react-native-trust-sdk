import {Linking} from 'react-native';
import {URL} from 'whatwg-url';
import {TrustCommand, MessagePayload, TransactionPayload} from './lib/commands';

class TrustWallet {
  apps = [{
    name: 'Trust',
    scheme: 'trust://',
    installURL: 'https://itunes.apple.com/ru/app/trust-ethereum-wallet/id1288339409'
  }]

  callbacks: {[key: string]: (value?: string | undefined) => void}= {}

  constructor() {
    // Linking.getInitialURL().then((url: string) => this.handleURL(url));
    Linking.addEventListener('url', this.handleOpenURL.bind(this));
  }
  public cleanup() {
    Linking.removeEventListener('url', this.handleOpenURL.bind(this));
    this.callbacks = {};
  }

  public installed(): boolean {
    const installed = this.apps.filter((app) => Linking.canOpenURL(app.scheme + ''));
    return installed.length > 0;
  }

  public signTransaction(payload: TransactionPayload, callback: (value?: string | undefined) => void) {
    if (!this.installed()) {
      callback('');
    }
    this.callbacks[payload.id] = callback;
    const url = TrustCommand.getURL(TrustCommand.signTransaction, payload);
    Linking.openURL(url);
  }

  public signMessage(payload: MessagePayload, callback: (value?: string | undefined) => void) {
    if (!this.installed()) {
      callback('');
    }
    this.callbacks[payload.id] = callback;
    const url = TrustCommand.getURL(TrustCommand.signMessage, payload);
    Linking.openURL(url);
  }

  private handleOpenURL(event: { url: string; }) {
    console.log(event);
    const response = TrustCommand.parseURL(event.url);
    const callback = this.callbacks[response.id];
    if (callback) {
      callback(response.result);
      delete this.callbacks[response.id];
    }
  }
}

export default TrustWallet;
export {TrustCommand, MessagePayload, TransactionPayload};