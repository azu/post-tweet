// LICENSE : MIT
"use strict";
// service
import ServiceManger from "./service-manager";
const manager = new ServiceManger();
import { Client, Model } from "./twitter/index.js";
manager.addService(new Model(), new Client());
export default manager;
