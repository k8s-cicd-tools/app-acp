import * as pulumi from "@pulumi/pulumi";
import { UserRules } from "./classes/UserRules";
import { MysqlServers } from "./classes/MysqlServers";

const config = new pulumi.Config();
const developerMysqlUser= config.require('developerMysqlUser');
const developerNamespace = config.require('developerNamespace');

// Configure the MySQL Servers
const mysql_servers_json = [
    {
        "name": "server1",
        "ip": "192.168.56.31",
        "port": 3306
    }
]

// Configure the Databases
const databases_json = [
    {
        serverName: 'server1',
        name: 'database_a',
        restoreFileName: 'db.sql',
        tables: [
            {
                name: 'table1',
            },
            {
                name: 'table2',
            },
            {
                name: 'table3',
            }
        ]
    },
    // {
    //     serverName: 'server2',
    //     name: 'database_b',
    //     restoreFileName: 'db.sql',
    //     tables: [
    //         {
    //             name: 'table1',
    //         },
    //         {
    //             name: 'table2',
    //         },
    //         {
    //             name: 'table3',
    //         }
    //     ]
    // }
]

// Configure the MySQL Grants
const userRules_json = [
    {
        namespace: 'development',
        appName: 'app1',
        databaseName: 'database_a',
        tables: [
            {
                name: 'table1',
                actions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
            },
            {
                name: 'table2',
                actions: ['SELECT']
            }
        ]
    },
    {
        namespace: 'development',
        appName: 'app2',
        databaseName: 'database_a',
        tables: [
            {
                name: 'table1',
                actions: [],
            },
            {
                name: 'table2',
                actions: ['SELECT'],
            },
            {
                name: 'table3',
                actions: [],
            }
        ]
    },
    // {
    //     namespace: 'production',
    //     appName: 'app3',
    //     databaseName: 'database_b',
    //     tables: [
    //         {
    //             name: 'table1',
    //             actions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
    //         }
    //     ]
    // }
]

// create user rules
let userRules = new UserRules(userRules_json);

// create MySQL Servers
const mysqlServers = new MysqlServers(mysql_servers_json, developerMysqlUser, userRules, developerNamespace, databases_json);
mysqlServers.create();

// set table actions
mysqlServers.setTableActions();

// create databases
mysqlServers.createDatabases();










