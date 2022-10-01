import * as pulumi from "@pulumi/pulumi";
import { UserRules } from "./src/classes/UserRules";
import { MysqlServers } from "./src/classes/MysqlServers";
import { Demo1 } from "./src/apps/Demo1";
import { Demo2 } from "./src/apps/Demo2";
import { Demo3 } from "./src/apps/Demo3";
import { local } from "@pulumi/command";
const { exec } = require('child_process');
import * as fs from "fs";


const developerMysqlUser = process.env.DEVELOPER_MYSQL_USER;
const developerNamespace = process.env.DEVELOPER_NAMESPACE;
const pulumiBackendUrl = process.env.PULUMI_BACKEND_URL;

//validate environment variables
if (!developerMysqlUser) {
    throw new Error("DEVELOPER_MYSQL_USER is not set");
}
if (!developerNamespace) {
    throw new Error("DEVELOPER_NAMESPACE is not set");
}
if (!pulumiBackendUrl) {
    throw new Error("PULUMI_BUCKET_NAME is not set");
}


let appList: any[] = [];
appList.push(new Demo1([]));
appList.push(new Demo2([]));
appList.push(new Demo3([]));


const downloadComand = `aws s3 cp ${pulumiBackendUrl}/acp/rules /home/pulumi/data/ --recursive`;
const cleanCommand = `rm /home/pulumi/data/*.json`;
const donwloadObject = new local.Command(`download_rules`, {
    create: downloadComand,
    delete: cleanCommand
});

exec(downloadComand, (err: any, stdout: any, stderr: any) => {
    console.log("downloaded rules");
});

pulumi.all([donwloadObject.stdout]).apply(
    ([stdout]) => {
        const mysqlServersJson = JSON.parse(fs.readFileSync('/home/pulumi/data/mysqlServers.json', 'utf8'));
        const databasesJson = JSON.parse(fs.readFileSync('/home/pulumi/data/databases.json', 'utf8'));
        const userRulesJson = JSON.parse(fs.readFileSync('/home/pulumi/data/userRules.json', 'utf8'));
        let userRules = new UserRules(userRulesJson);
        let mysqlServers = new MysqlServers(mysqlServersJson, developerMysqlUser, userRules, developerNamespace, databasesJson);
        mysqlServers.create();
        mysqlServers.setTableActions();
        mysqlServers.createDatabases();

        //check the apps and create them
        userRules.rules.forEach((rule: any) => {
            const appName = rule.appName;
            const databaseName = rule.databaseName;
            let server = mysqlServers.getServerFromDatabaseName(databaseName);
            if (server) {
                let app = appList.find((app: any) => app.name === appName);
                let database = server.getDatabaseFromName(databaseName);
                if (app && database) {
                    app.create(developerNamespace, database, server, database.getDependsOn());
                }
            }
        });
    });


