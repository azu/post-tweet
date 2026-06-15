const path = require("path");
module.exports = [
    {
        enabled: true,
        name: "twitter",
        indexPath: path.join(__dirname, "services/twitter/index.js"),
        // X (Twitter) はAPI投稿ではなく、Web Intentでブラウザを開いて投稿する方式
        // ブラウザのログイン状態をそのまま利用するため、認証情報は不要
        options: {}
    },
    {
        enabled: false,
        name: "bluesky",
        indexPath: path.join(__dirname, "services/bluesky/index.js"),
        options: {
            identifier: "<identifier>.bsky.social",
            appPassword: "<app password>"
        }
    }
];
