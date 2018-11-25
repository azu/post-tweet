# post-tweet

Post only twitter client application.

![Image](docs/screenshot.png)

post-tweet should be launched by [URL Scheme](https://github.com/azu/post-tweet#url-scheme).

## Installation

    yarn
    yarn dist
    # output binary

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
