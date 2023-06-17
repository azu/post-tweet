// service
import ServiceManger from "./service-manager";
import ServiceDefinitions from "./service.js";

const manager = new ServiceManger();
ServiceDefinitions.forEach((definition) => {
    if (!definition.enabled) {
        return;
    }
    const { Model, Client } = require(definition.indexPath);
    manager.addService(new Model(), new Client(definition.options));
});

export default manager;
