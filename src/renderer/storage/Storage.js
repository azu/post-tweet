// LICENSE : MIT
"use strict";
import jetpack from "fs-jetpack";

export default class Storage {
    constructor(storeName) {
        this.storeName = storeName;
    }

    key(name) {
        return `${this.storeName}.${name}`;
    }

    get(name) {
        const item = localStorage.getItem(this.key(name));
        if (item) {
            try {
                return JSON.parse(item);
            } catch (error) {
                return null;
            }
        }
        return null;
    }

    has(name) {
        return this.get(name) != null;
    }

    set(name, value) {
        return localStorage.setItem(this.key(name), JSON.stringify(value));
    }

    delete(name) {
        return localStorage.removeItem(this.key(name));
    }
}
