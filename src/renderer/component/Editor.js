// LICENSE : MIT
"use strict";
import React from "react";
import { Controlled as CodeMirror } from "react-codemirror2";

export default class Editor extends React.Component {
    constructor(arg) {
        super(arg);
        this.state = {
            value: ""
        };

        this.onChange = (editor, data, value) => {
            console.log(editor, data, value);
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
                <CodeMirror
                    editorDidMount={(editor) => {
                        this.editor = editor;
                    }}
                    autoFocus={true}
                    value={this.state.value}
                    onBeforeChange={(editor, data, value) => {
                        this.setState({ value });
                    }}
                    onChange={this.onChange}
                    options={options}
                />
            </div>
        );
    }
}
