import "reflect-metadata/Reflect";
import { Request, Response } from "express";
import { HttpContext } from "./http-request";

export class DependencyInjection {
    constructor(private context: HttpContext) {
        this.inject();
    }

    private inject() {
        const constructorParameterTypes: any[] = Reflect.getMetadata("design:paramtypes", this.context.controller as Object);
        if (constructorParameterTypes && constructorParameterTypes.length > 0) {
            const constructorParameters = this.getConstructorParameters(this.context.controller);
            constructorParameterTypes.forEach((val: any, index) => {
                    this.context.controllerObject[constructorParameters[index]] = new val();
                    this.circularInjection(val, this.context.controllerObject[constructorParameters[index]]);
            });
            this.context.controllerObject["request"] = this.context.request;
        }
    }

    private circularInjection(target: any, source: any) {
        const constructorParameters = this.getConstructorParameters(target);
        if (constructorParameters && constructorParameters.length > 0) {
            const constructorParameterTypes: any[] = Reflect.getMetadata("design:paramtypes", target);
            if (constructorParameterTypes && constructorParameterTypes.length > 0) {
                constructorParameterTypes.forEach((val, index) => {
                    source[constructorParameters[index]] = new val();
                });
            }
        }
    }

    private getConstructorParameters(target: any) {
        const classString = target.toString() as string;
        let constructorParameters: string[] = [];
        if (classString) {
            let args = classString.substr(classString.indexOf("constructor"));
            args = args.substring(args.indexOf("(") + 1, args.indexOf(")"));
            constructorParameters = args.replace(/ /g, "").split(",");
        }
        return constructorParameters;
    }
}