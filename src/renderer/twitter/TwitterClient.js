// LICENSE : MIT
"use strict";
import Consumer from "./TwitterConsumer";
import Twitter from "twitter";
import { truncate } from "tweet-truncator";

const Authentication = require("./TwitterAuthentication");
export default class TwitterClient {
    isLogin() {
        return Authentication.canAccess();
    }

    loginAsync(callback) {
        return Authentication.requireAccess(callback);
    }

    _getClient() {
        var credential = Authentication.getCredential();
        return new Twitter({
            consumer_key: Consumer.key,
            consumer_secret: Consumer.secret,
            access_token_key: credential.accessKey,
            access_token_secret: credential.accessSecret
        });
    }

    /**
     *
     * @param options
     * @returns {*}
     * {
            url,
            comment,
            tags = []
        }
     */
    postLink(options = {}) {
        const { title, url, comment, tags, quote } = options;
        // make contents object
        const contents = { title, url, desc: comment, tags, quote: quote || "" };
        const titleSymbol = title.length > 0 ? ` "%title%"` : `%title%`;
        const status = truncate(contents, {
            template: `%desc% %quote% ${titleSymbol} %url%`,
            maxLength: 140
        });
        return new Promise((resolve, reject) => {
            this._getClient().post("statuses/update", { status: status }, function(error, tweet, response) {
                if (error) {
                    console.error(error, response);
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
}
