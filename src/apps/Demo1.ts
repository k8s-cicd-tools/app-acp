import * as k8s from "@pulumi/kubernetes";


export class Demo1 {
    name: string = "demo1";
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

        const appDemoDeployment = new k8s.apps.v1.Deployment(`${this.name} deployment`, {
            metadata: {
                name: this.name,
                namespace: this.namespace,
                labels: {
                    app: this.name
                },
            },
            spec: {
                replicas: 1,
                selector: {
                    matchLabels: {
                        app: this.name
                    },
                },
                template: {
                    metadata: {
                        labels: {
                            app: this.name
                        },
                    },
                    spec: {
                        containers: [
                            {
                                name: this.name,
                                image: "jhonwg/app-demo:1.0",
                                env: [
                                    {
                                        name: "APP_NAME",
                                        value: this.name
                                    },
                                    {
                                        name: "TABLE_NAME",
                                        value: "table1"
                                    },
                                    {
                                        name: "MYSQL_DATABASE",
                                        value: this.database.name
                                    },
                                    {
                                        name: "MYSQL_HOST",
                                        value: this.server.ip
                                    },
                                    {
                                        name: "MYSQL_USER",
                                        value: this.database.developerMysqlUser
                                    },
                                    {
                                        name: "MYSQL_PASSWORD",
                                        value: this.database.getMysqlPassword()
                                    },
                                    {
                                        name: "SELECT_RULE",
                                        value: "true"
                                    },
                                    {
                                        name: "INSERT_RULE",
                                        value: "true"
                                    },
                                    {
                                        name: "UPDATE_RULE",
                                        value: "true"
                                    },
                                    {
                                        name: "DELETE_RULE",
                                        value: "true"
                                    },
                                ]
                            },
                        ]
                    },
                },
            },
        }, {dependsOn: this.dependsOn});
    }
}