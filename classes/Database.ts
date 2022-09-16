import {Table} from "./Table";
import * as pulumi from "@pulumi/pulumi";
import * as mysql from "@pulumi/mysql";
import { local } from "@pulumi/command";

const config = new pulumi.Config();

// class for database
export class Database {
    ip: string;
    port: number;
    name: string;
    restoreFileName: string;
    tables: Table[];
    developerMysqlUser: string;
    database_object: any;
    restore_object: any;
    user_object: any;
    dependsOn: pulumi.Resource[] = [];
    provider: any;

    constructor(ip: string, port: number, name: string, restoreFileName: string, tables: Table[],
                developerMysqlUser: string, dependsOn: pulumi.Resource[]) {
        this.ip = ip;
        this.port = port;
        this.name = name;
        this.restoreFileName = restoreFileName;
        this.tables = tables;
        this.developerMysqlUser = developerMysqlUser;
        this.dependsOn = dependsOn;
        const rootMysqlPassword = config.requireSecret('rootMysqlPassword');
        this.provider = new mysql.Provider(`mysql_provider_${this.name}`, {
            endpoint: `${this.ip}:${this.port}`,
            username: 'root',
            password: rootMysqlPassword,
        });
    }

    create() {
        this.database_object  = new mysql.Database(`database_creation_${this.name}`, {
            name: this.name
        }, { dependsOn: this.dependsOn, provider: this.provider });
    }

    createDeveloperUser() {
        const developerMysqlUser = this.developerMysqlUser;
        const developerMysqlPassword = config.requireSecret('developerMysqlPassword');

        this.user_object = new mysql.User(`user_creation_${developerMysqlUser}`, {
            host: '%',
            plaintextPassword: developerMysqlPassword,
            user: developerMysqlUser,
        }, { dependsOn: this.database_object, provider: this.provider });
    }

    restore() {
        const databaseName = this.name;
        const restoreFileName = this.restoreFileName;
        const rootMysqlPassword = config.requireSecret('rootMysqlPassword');
        this.restore_object = new local.Command(`database_restore_${databaseName}`, {
            create: pulumi.interpolate ` mysql --user="root" --database="${databaseName}" --password="${rootMysqlPassword}" -h ${this.ip} --port=${this.port} < ./${restoreFileName}`,
        }, { dependsOn: this.user_object });
    }

    createRules() {
        this.tables.forEach((table) => {
            const tableActions = table.actions;
            const tableName = table.name;
            const databaseName = this.name;
            // for each action, update the table
            tableActions.forEach((action) => {
                const ruleName = `rule_${databaseName}_${tableName}_${action}`;
                new mysql.Grant(ruleName, {
                    user: this.developerMysqlUser,
                    host: '%',
                    database: databaseName,
                    table: tableName,
                    privileges: [action],
                }, { dependsOn: this.restore_object, provider: this.provider });
            })
        })
    }

    setTableActions(table: Table) {
        const tableActions = table.actions;
        const tableName = table.name;
        const databaseName = this.name;
        // for each action, update the table
        this.tables.forEach((table) => {
            if (table.name === tableName) {
                table.addActions(tableActions);
            }
        })
    }
}

