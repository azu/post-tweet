// LICENSE : MIT
"use strict";
import { Action } from "material-flux";
import keys from "./ServiceActionConst";
export { keys };
import serviceInstance from "../service-instance";

export default class ServiceAction extends Action {
    fetchTags(service) {
        const client = serviceInstance.getClient(service);
        if (!client.isLogin()) {
            console.log(service.id + " is not login");
            return;
        }
        console.log("fetchTags: " + service.id);
        return client
            .getTags()
            .then((tags) => {
                this.dispatch(keys.fetchTags, tags);
            })
            .catch((error) => {
                console.log(error);
            });
    }

    fetchContent(service, url) {
        const client = serviceInstance.getClient(service);
        if (!client.isLogin()) {
            return Promise.reject(new Error(service.id + " is not login"));
        }
        console.log("fetchContent: " + service.id);
        return client.getContent(url);
    }

    postLink(services, postData) {
        const mapCS = services.map((service) => {
            const client = serviceInstance.getClient(service);
            return {
                service,
                client
            };
        });
        const enabledCS = mapCS.filter(({ client }) => client.isLogin());
        const servicePromises = enabledCS.map(({ service, client }) => {
            console.log("postLink: " + service.id);
            return client.postLink(postData);
        });
        return Promise.all(servicePromises)
            .then(() => {
                this.dispatch(keys.postLink);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    updateTitle(title) {
        this.dispatch(keys.updateTitle, title);
    }

    updateURL(URL) {
        this.dispatch(keys.updateURL, URL);
    }

    updateViaURL(URL) {
        this.dispatch(keys.updateViaURL, URL);
    }

    updateQuote(text) {
        this.dispatch(keys.updateQuote, text);
    }

    updateComment(comment) {
        this.dispatch(keys.updateComment, comment);
    }

    login(service) {
        const client = serviceInstance.getClient(service);
        client.loginAsync((error) => {
            if (error) {
                return console.error(error);
            }
            console.log("login: " + service.id);
        });
    }

    enableService(service) {
        if (typeof service === "string") {
            throw new Error("Not ServiceId, It should be service instance");
        }
        const client = serviceInstance.getClient(service);
        if (client.isLogin()) {
            this.dispatch(keys.enableService, service);
        } else {
            client.loginAsync((error) => {
                if (error) {
                    return console.error(error);
                }
                this.dispatch(keys.enableService, service);
            });
        }
    }

    disableService(service) {
        this.dispatch(keys.disableService, service);
    }

    resetField() {
        this.dispatch(keys.resetField);
    }
}
