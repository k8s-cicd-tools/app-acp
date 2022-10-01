import { local } from "@pulumi/command";


export class Demo3 {
    name: string = "demo3";
    namespace: string = "";
    dependsOn: any[] = [];
    database: any;
    server: any;

    constructor(dependsOn: any[]) {
        this.dependsOn = dependsOn;
    }

    create(namespace: string, database: any, server: any, dependsOn: any[]) {
        // add dependsOn
        this.dependsOn = this.dependsOn.concat(dependsOn);
        this.namespace = namespace;
        this.database = database;
        this.server = server;

        const test = new local.Command(`test app ${this.name}`, {
            create: `ls -l`,
        }, { dependsOn: this.dependsOn });

    }
}