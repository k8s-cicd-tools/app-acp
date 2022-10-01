import {MysqlServer} from "./MysqlServer";
import {UserRules} from "./UserRules";


export class MysqlServers {
    servers: MysqlServer[] = [];
    developerMysqlUser: string;
    userRules: UserRules;
    developerNamespace: string;

    constructor(mysqlServersJson: any, developerMysqlUser: string, userRules: UserRules, developerNamespace: string,
                databasesJson: any) {
        this.developerMysqlUser = developerMysqlUser;
        this.userRules = userRules;
        this.developerNamespace = developerNamespace;
        this.servers = mysqlServersJson.map((server: any) => new MysqlServer(server.name, server.ip, server.port,
            databasesJson, this.developerMysqlUser, developerNamespace));
    }

    create() {
        this.servers.forEach((server: MysqlServer) => {
            server.create();
        });
    }

    setTableActions() {
        this.servers.forEach((server: MysqlServer) => {
            server.setTableActions(this.userRules, this.developerNamespace);
        });
    }

    createDatabases() {
        this.servers.forEach((server: MysqlServer) => {
            server.createDatabases();
        });
    }

    getServerFromDatabaseName(databaseName: string) {
        for (let server of this.servers) {
            if (server.databases.hasDatabase(databaseName)) {
                return server;
            }
        }
        return null;
    }
}
