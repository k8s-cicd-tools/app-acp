import {MysqlServer} from "./MysqlServer";
import {UserRules} from "./UserRules";


export class MysqlServers {
    servers: MysqlServer[] = [];
    developerMysqlUser: string;
    userRules: UserRules;
    developerNamespace: string;

    constructor(mysql_servers_json: any, developerMysqlUser: string, userRules: UserRules, developerNamespace: string,
                databases_json: any) {
        this.developerMysqlUser = developerMysqlUser;
        this.userRules = userRules;
        this.developerNamespace = developerNamespace;
        this.servers = mysql_servers_json.map((server: any) => new MysqlServer(server.name, server.ip, server.port,
            databases_json, this.developerMysqlUser));
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
}
