export type Options = {
    hidden?: boolean;
};
export type Model = { [key: string]: { [key: string]: Options } };
export type Registry = { model: Model, exclusions: string[] };
export const registry: Registry = { model: {}, exclusions: [] };

export const initModel = (name: string, key: string) => {
    if (!registry.model[name]) {
        registry.model[name] = {};
    }
    if (!registry.model[name][key]) {
        registry.model[name][key] = { hidden: false };
    }
};

export const isHidden = (name: string, key: string) => registry.model[name] && registry.model[name][key] && registry.model[name][key].hidden || false;
