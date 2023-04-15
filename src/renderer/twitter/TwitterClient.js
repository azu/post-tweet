// LICENSE : MIT
"use strict";
import { truncate } from "tweet-truncator";

import TwitterSecrets from "./TwitterSecrets";
import { TwitterApi } from "twitter-api-v2";

export default class TwitterClient {
    isLogin() {
        return Boolean(
            TwitterSecrets.appKey &&
                TwitterSecrets.appSecret &&
                TwitterSecrets.accessToken &&
                TwitterSecrets.accessSecret
        );
    }

    loginAsync(callback) {
        return callback(new Error(`You should create TwitterSecrets.js and fill your consumer key and secret.`));
    }

    /**
     * @returns {TwitterApi}
     * @private
     */
    _getClient() {
        return new TwitterApi({
            appKey: TwitterSecrets.appKey,
            appSecret: TwitterSecrets.appSecret,
            accessToken: TwitterSecrets.accessToken,
            accessSecret: TwitterSecrets.accessSecret
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
        const status = truncate(contents, {
            template: `%desc% %quote% "%title%" %url% %tags%`
        });

        return this._getClient().readWrite.v2.tweet(status, {
            requestEventDebugHandler: (eventType, data) => console.log("Event", eventType, "with data", data)
        });
    }
}
