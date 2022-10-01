import {Table} from "./Table";
import * as pulumi from "@pulumi/pulumi";
import * as mysql from "@pulumi/mysql";
import { local } from "@pulumi/command";
const hasha = require('hasha');


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
    rootMysqlPassword: string;
    dependenciesOutput : any[] = [];

    constructor(ip: string, port: number, name: string, restoreFileName: string, tables: Table[],
                developerMysqlUser: string, rootMysqlPassword: string, dependsOn: pulumi.Resource[]) {
        this.ip = ip;
        this.port = port;
        this.name = name;
        this.restoreFileName = restoreFileName;
        this.tables = tables;
        this.developerMysqlUser = developerMysqlUser;
        this.dependsOn = dependsOn;
        this.rootMysqlPassword = rootMysqlPassword;
        this.provider = new mysql.Provider(`mysql_provider_${this.name}`, {
            endpoint: `${this.ip}:${this.port}`,
            username: 'root',
            password: rootMysqlPassword,
        });
    }

    create(dependsOn: pulumi.Resource[]) {
        //add the dependsOn to the array
        this.dependsOn = this.dependsOn.concat(dependsOn);

        this.database_object  = new mysql.Database(`database_creation_${this.name}`, {
            name: this.name
        }, { dependsOn: this.dependsOn, provider: this.provider });
    }

    getMysqlPassword() {
        //concatenate all the strings
        let stringToHash = this.ip + this.port.toString() + this.name + this.developerMysqlUser;
        //return the 31 character hash
        return hasha(stringToHash).substring(0, 31);
    }

    createDeveloperUser() {
        const developerMysqlUser = this.developerMysqlUser;
        const developerMysqlPassword = this.getMysqlPassword();

        this.user_object = new mysql.User(`user_creation_${developerMysqlUser}`, {
            host: '%',
            plaintextPassword: developerMysqlPassword,
            user: developerMysqlUser,
        }, { dependsOn: this.database_object, provider: this.provider });
    }

    restore() {
        const databaseName = this.name;
        const restoreFileName = this.restoreFileName;
        this.restore_object = new local.Command(`database_restore_${databaseName}`, {
            create: pulumi.interpolate ` mysql --user="root" --database="${databaseName}" --password="${this.rootMysqlPassword}" -h ${this.ip} --port=${this.port} < ./${restoreFileName}`,
        }, { dependsOn: this.user_object });
        this.dependenciesOutput.push(this.restore_object);
    }

    createRules() {
        this.tables.forEach((table) => {
            const tableActions = table.actions;
            const tableName = table.name;
            const databaseName = this.name;
            // for each action, update the table
            tableActions.forEach((action) => {
                const ruleName = `rule_${databaseName}_${tableName}_${action}`;
                let grnt = new mysql.Grant(ruleName, {
                    user: this.developerMysqlUser,
                    host: '%',
                    database: databaseName,
                    table: tableName,
                    privileges: [action],
                }, { dependsOn: this.restore_object, provider: this.provider });
                this.dependenciesOutput.push(grnt);
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

    getDependsOn() {
        return this.dependenciesOutput;
    }
}

