# post-tweet

Post only twitter/bluesky client application.

![Image](docs/screenshot.png)

post-tweet should be launched by [URL Scheme](https://github.com/azu/post-tweet#url-scheme).

## Feature

- Simple Post UI
- Post to Twitter
- Post to Bluesky
- Cross Posting
- URL Scehema Support - Easy to integrate with Browser

## Installation

You should create a binary on your env.

    yarn
    cp src/renderer/service.example.js src/renderer/service.js
    # edit src/renderer/service.js
    yarn dist
    # output binary

## Configuration

You need to edit `src/renderer/service.js` to enable services.

### Twitter

0. Visit https://developer.twitter.com/en/portal/dashboard
1. Create App(development App) with read and write permission
2. Generate Consumer Key and Secret
3. Generate Access Token and Secret
4. Fill the following options

```json5
{
  enabled: true,
  name: "twitter",
  indexPath: path.join(__dirname, "services/twitter/index.js"),
  options: {
    // 0. Visit https://developer.twitter.com/en/portal/dashboard
    // 1. Create App(development App) with read and write permission
    // 2. Generate Consumer Key and Secret
    // 3. Generate Access Token and Secret
    // 4. Fill the following fields
    // Consumer Keys
    appKey: "app key",
    appSecret: "app secret",
    // Authentication Tokens(Access Token and Secret).
    // Warning: Not Bearer Token
    // Post Tweets that requires access token and secret
    accessToken: "access token",
    accessSecret: "access token secret"
  }
}
```

### Bluesky

1. Visit https://bsky.app/settings/app-passwords
2. Create new App Password
3. Fill the following options

```json5
{
  enabled: true,
  name: "bluesky",
  indexPath: path.join(__dirname, "services/bluesky/index.js"),
  options: {
    // 1. Visit https://bsky.app/settings/app-passwords
    // 2. Create new App Password
    // 3. Fill the following fields
    username: "username.bsky.social",
    appPassword: "password"
  }
}
```

## Usage

1. Open app
    - Launch app and register URL Scheme
2. Input description
3. Post tweet by <kbd>Cmd+Shift+Enter</kbd> shortcut

## URL Scheme

post-tweet support `post-tweet://` schema.

:warning: You should launch the app before call URL Scheme.

You can open the app from your browser.
 `post-tweet://` schema support following parameter.

- `url`: URL
- `title`: Title
- `quote`: Quoted text

Example:

```js
const selectedText = window.getSelection().toString();
location.href = `post-tweet://?url=${encodeURIComponent(window.top.location.href)}&title=${encodeURIComponent(window.top.document.title)}&quote=${encodeURIComponent(selectedText)}`
```
## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT
