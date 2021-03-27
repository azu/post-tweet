// MIT © 2017 azu
"use strict";
const React = require("react");
import { truncate } from "tweet-truncator";

export default class TweetLengthCounter extends React.Component {
    render() {
        const { title, url, comment, quote } = this.props;
        const contents = { title, url, desc: comment, quote };
        const titleSymbol = title.length > 0 ? ` "%title%"` : `%title%`;
        const status = truncate(contents, {
            template: `%desc% %quote% ${titleSymbol} %url%`
        });
        const style = {
            lineHeight: "1.2",
            backgroundColor: "white",
            overflow: "scroll",
            padding: "4px"
        };
        return (
            <p style={style} className="TweetLengthCounter">
                <b>{status.length}</b>: {status}
            </p>
        );
    }
}
