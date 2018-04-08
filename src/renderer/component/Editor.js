// LICENSE : MIT
"use strict";
const React = require("react");
const ReactCodeMirror = require("react-codemirror");
export default class Editor extends React.Component {
    constructor(arg) {
        super(arg);
        this.state = {
            value: ""
        };

        this.onChange = value => {
            this.props.onChange(value);
        };
    }

    reset() {
        this.setState({
            value: ""
        });
    }

    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    render() {
        const extraKeys = {
            "Cmd-Enter": () => {
                this.props.onSubmit();
            }
        };
        const options = {
            extraKeys: extraKeys
        };
        return (
            <div className="Editor">
                <ReactCodeMirror
                    ref={c => (this.editor = c)}
                    value={this.state.value}
                    onChange={this.onChange}
                    options={options}
                />
            </div>
        );
    }
}
