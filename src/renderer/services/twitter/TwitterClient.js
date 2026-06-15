// LICENSE : MIT
"use strict";
import { shell } from "electron";
import { truncate } from "tweet-truncator";

export default class TwitterClient {
    constructor(serviceOptions) {
        this.serviceOptions = serviceOptions || {};
    }

    isLogin() {
        return true;
    }

    loginAsync(callback) {
        callback();
    }

    postLink(options = {}) {
        const { title, url, comment, tags, quote } = options;
        const contents = { title, url, desc: comment, tags, quote: quote || "" };
        const status = truncate(contents, {
            template: `%desc% %quote% "%title%" %url% %tags%`
        });
        const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(status)}`;
        return shell.openExternal(intentUrl);
    }
}
