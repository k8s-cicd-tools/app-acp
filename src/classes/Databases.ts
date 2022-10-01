import {Database} from "./Database";
import * as pulumi from "@pulumi/pulumi";
import {Table} from "./Table";
import {UserRules} from "./UserRules";
import {UserRule} from "./UserRule";


export class Databases {
    databases: Database[] = [];
    serverName: string;
    serverIp: string;
    serverPort: number;
    developerMysqlUser: string;
    dependsOn: pulumi.Resource[] = [];

    constructor(databases_json: any, developerMysqlUser: string, serverName: string, serverIp: string,
                serverPort: number, rootMysqlPassword: string) {
        this.developerMysqlUser = developerMysqlUser;
        this.serverName = serverName;
        this.serverIp = serverIp;
        this.serverPort = serverPort;
        databases_json.forEach((database_json: any) => {
            //check if serverName matches
            if (database_json.serverName === serverName) {
                const tables: Table[] = [];
                database_json.tables.forEach((table_json: any) => {
                    const table = new Table(table_json.name, table_json.actions || []);
                    tables.push(table);
                });
                this.databases.push(new Database(this.serverIp, this.serverPort, database_json.name,
                    database_json.restoreFileName, tables, developerMysqlUser, rootMysqlPassword, []));
            }
        });
    }

    // set the table actions for each database
    setTableActions(userRules: UserRules, developerNamespace: string) {
        userRules.rules.forEach((rule: UserRule) => {
            this.databases.forEach((database: Database) => {
                if (rule.databaseName === database.name && rule.namespace === developerNamespace) {
                    rule.tables.forEach((table: Table) => {
                        database.setTableActions(table);
                    });
                }
            });
        });
    }

    create(dependsOn: pulumi.Resource[]) {
        this.dependsOn = dependsOn;

        this.databases.forEach((database: Database) => {
            database.create(this.dependsOn);
        });
    }

    createDeveloperUser() {
        this.databases.forEach((database: Database) => {
            database.createDeveloperUser();
        });
    }

    restore() {
        this.databases.forEach((database: Database) => {
            database.restore();
        });
    }

    createRules() {
        this.databases.forEach((database: Database) => {
            database.createRules();
        });
    }

    createAll(dependsOn: pulumi.Resource[]) {
        this.create(dependsOn);
        this.createDeveloperUser();
        this.restore();
        this.createRules();
    }

    getDependsOn() {
        let dependsOn: pulumi.Resource[] = [];
        this.databases.forEach((database: Database) => {
            dependsOn = dependsOn.concat(database.getDependsOn());
        });
        return dependsOn;
    }

    hasDatabase(name: string) {
        return this.databases.some((database: Database) => database.name === name);
    }

    getDatabaseFromName(name: string) {
        return this.databases.find((database: Database) => database.name === name);
    }
}

