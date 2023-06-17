// service
import ServiceManger from "./service-manager";
import ServiceDefinitions from "./service.js";

const manager = new ServiceManger();
const serviceModels = ServiceDefinitions.map((definition) => {
    if (!definition.enabled) {
        return;
    }
    const { Model, Client } = require(definition.indexPath);
    console.log("Adding service", definition.name);
    const model = new Model();
    manager.addService(model, new Client(definition.options));
    return model;
});

export const getEnabledServiceIdentifiers = () => {
    return serviceModels.map((model) => model.id);
};
export default manager;
