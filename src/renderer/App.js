// LICENSE : MIT
"use strict";
import notie from "notie";
import { ipcRenderer } from "electron";
import React from "react";
import { render } from "react-dom";
import AppContext from "./AppContext";
import serviceManger, { getEnabledServiceIdentifiers } from "./service-instance";
import Editor from "./component/Editor";
import TweetLengthCounter from "./component/TweetLengthCounter";
import ServiceActionConst from "./Action/ServiceActionConst";

const appContext = new AppContext();

const LRU_MAX_SIZE = 30;
class LRUPostSet extends Set {
    add(value) {
        if (this.size >= LRU_MAX_SIZE) {
            const firstValue = this.values().next().value;
            this.delete(firstValue);
        }
        super.add(value);
    }
}
const lruPostSet = new LRUPostSet();
class App extends React.Component {
    constructor() {
        super();
        this.state = Object.assign(
            {
                initialized: false
            },
            appContext.ServiceStore.state
        );

        appContext.ServiceStore.onChange(() => {
            const newState = Object.assign({}, this.state, appContext.ServiceStore.state);
            this.setState(newState);
        });
    }

    componentDidMount() {
        let isInitialized = false;
        // ipc from server event
        ipcRenderer.on("beforeUpdate", (event, { title, url }) => {
            const state = this.state;
            if (title !== state.title || url !== state.URL) {
                appContext.ServiceAction.resetField();
                if (this.editor) {
                    this.editor.reset();
                }
                isInitialized = true;
            }
        });
        ipcRenderer.on("afterUpdate", (event, { title, url }) => {
            if (this.editor) {
                this.editor.focus();
            }
        });
        ipcRenderer.on("updateTitle", (event, title) => {
            appContext.ServiceAction.updateTitle(title);
        });
        ipcRenderer.on("updateQuote", (event, text) => {
            appContext.ServiceAction.updateQuote(text);
        });
        ipcRenderer.on("updateURL", (event, URL) => {
            appContext.ServiceAction.updateURL(URL);
        });
        ipcRenderer.on("afterUpdate", (event, { title, url }) => {});
        ipcRenderer.on("resetField", (event) => {
            appContext.ServiceAction.resetField();
        });
        // Enable twitter by default
        const service = serviceManger.getService("com.twitter");
        appContext.ServiceAction.enableService(service);
        // default comment
        if (this.editor) {
            this.editor.focus();
        }
    }

    postLink() {
        const { ServiceAction } = appContext;
        const isFilledEitherOneState = (state) => {
            return state.title || state.URL || state.quote || state.comment;
        };
        // Prevent to post empty content: https://github.com/azu/post-tweet/issues/1
        if (!isFilledEitherOneState(this.state)) {
            return;
        }
        const postData = {
            title: this.state.title || "",
            url: this.state.URL || "",
            viaURL: this.state.viaURL.length > 0 ? this.state.viaURL : null,
            quote: this.state.quote || "",
            comment: this.state.comment || "見てる:",
            tags: this.state.selectedTags,
            relatedItems: this.state.relatedItems
        };
        const hash = JSON.stringify(postData);
        if (lruPostSet.has(hash)) {
            notie.alert({ type: "info", text: "Already posted", time: 2 });
            return;
        }
        const services = serviceManger.selectServices(getEnabledServiceIdentifiers());
        console.log("services", services);
        console.log("postData", postData);
        ServiceAction.postLink(services, postData).then(() => {
            notie.alert({ type: "success", text: "Success!", time: 2 });
            if (this.editor) {
                this.editor.reset();
            }
            lruPostSet.add(hash);
        });
    }

    render() {
        const { ServiceAction } = appContext;
        const updateComment = ServiceAction.updateComment.bind(ServiceAction);
        const submitPostLink = this.postLink.bind(this);
        return (
            <div className="App">
                <Editor ref={(c) => (this.editor = c)} onSubmit={submitPostLink} onChange={updateComment} />
                <TweetLengthCounter
                    title={this.state.title || ""}
                    url={this.state.URL || ""}
                    quote={this.state.quote || ""}
                    comment={this.state.comment || ""}
                />
            </div>
        );
    }
}

appContext.on("dispatch", ({ eventKey }) => {
    if (eventKey === ServiceActionConst.postLink) {
        ipcRenderer.send("hide-window");
    }
});
render(<App />, document.getElementById("app"));
