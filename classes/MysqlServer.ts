import {Databases} from "./Databases";
import {UserRules} from "./UserRules";
import { local } from "@pulumi/command";


export class MysqlServer {
    name: string;
    ip: string;
    port: number;
    databases: Databases
    developerMysqlUser: string;
    mysqlServer_object: any;

    constructor(name: string, ip: string, port: number, databases_json: any, developerMysqlUser: string) {
        this.name = name;
        this.ip = ip;
        this.port = port;
        this.developerMysqlUser = developerMysqlUser;
        this.databases = new Databases(databases_json, developerMysqlUser, this.name, this.ip, this.port, [this.mysqlServer_object]);
    }

    create() {
        const restoreCommand = `ls -l`;
        this.mysqlServer_object = new local.Command(`mysql_server_creation_${this.name}`, {
            create: restoreCommand
        });
    }

    createDatabases() {
        this.databases.createAll();
    }

    setTableActions(userRules: UserRules, developerNamespace: string) {
        this.databases.setTableActions(userRules, developerNamespace);
    }

}