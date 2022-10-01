import { Databases } from "./Databases";
import { UserRules } from "./UserRules";
import { Mysql } from "../apps/Mysql";
const hasha = require('hasha');


export class MysqlServer {
    name: string;
    ip: string;
    port: number;
    databases: Databases
    developerMysqlUser: string;
    mysqlServer_object: any;
    developerNamespace: string;

    constructor(name: string, ip: string, port: number, databases_json: any, developerMysqlUser: string, developerNamespace: string) {
        this.name = name;
        this.ip = ip;
        this.port = port;
        this.developerMysqlUser = developerMysqlUser;
        this.developerNamespace = developerNamespace;
        this.databases = new Databases(databases_json, developerMysqlUser, this.name, this.ip, this.port, this.getRootMysqlPassword());
    }

    getRootMysqlPassword() {
        //concatenate all the strings
        let stringToHash = this.name + this.ip + this.port.toString() + this.developerMysqlUser;
        //return the 31 character hash
        return hasha(stringToHash).substring(0, 31).toString();
    }

    create() {
        this.mysqlServer_object = new Mysql(this.name, "5.6", this.getRootMysqlPassword(), this.port, "2Gi", []);
        this.mysqlServer_object.create(this.developerNamespace, []);
    }

    createDatabases() {
        this.databases.createAll([this.mysqlServer_object.getDependsOn()]);
    }

    setTableActions(userRules: UserRules, developerNamespace: string) {
        this.databases.setTableActions(userRules, developerNamespace);
    }

    getDatabaseFromName(databaseName: string) {
        return this.databases.getDatabaseFromName(databaseName);
    }

}