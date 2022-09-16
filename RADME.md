## ACP - Access control & permissions

ACP is a module that allows you to manage access control and permissions on MySQL databases. 

This Pulumi script is designed to be run from inside a Kubernetes cluster as a service per namespace with Mysql Server instances already started. The configuration data needed to apply the permissions needed by the developer needs to be provided.

These are the tasks that it performs.
- It creates the databases.
- It creates the user.
- It restores the database contents.
- It applies the permissions configured.
- After running the script, you can modify the permissions and run it again to apply changes and remove permissions configured.
- You can add several applications that use the same tables but with different permissions and the script will apply permissions that meet all applications.

### How to get started

1. Install pulumi.
2. Clone this repo.
3. Run `$ npm install`
4. Set the pulumi stack.
```
pulumi config set --secret developerMysqlPassword YUR_PASSWORD
pulumi config set --secret rootMysqlPassword YUR_PASSWORD
pulumi config set developerMysqlUser YUR_USER
pulumi config set developerNamespace developer
```
5. Configure the mysql servers in index.ts
```
const mysql_servers_json = [
    {
        "name": "server1",
        "ip": "IP_ADDRESS",
        "port": 3306
    }
]
```
6. Configure the databases and tables in index.ts
```
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
]
```
7. Configure the user rules in index.ts
```
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
    }
]
```
5. Run `$ pulumi up` to create the resources.
![Create](./img/create.png "Create.").
6. Check the rules in the MySQL servers.
7. Change the rules in index.ts and run `$ pulumi up` to update the resources.
8. Check the rules in the MySQL servers.
9. Run `$ pulumi destroy` to delete the resources.
![Create](./img/destroy.png "Destroy.").

### Resources.

db.sql: It is a file with the database structure and data. It is used to restore the database.

```
SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

SET NAMES utf8mb4;

DROP TABLE IF EXISTS `table1`;
CREATE TABLE `table1` (
  `f1` int NOT NULL,
  `f2` int NOT NULL,
  `f3` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `table2`;
CREATE TABLE `table2` (
  `f1` int NOT NULL,
  `f2` int NOT NULL,
  `f3` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


DROP TABLE IF EXISTS `table3`;
CREATE TABLE `table3` (
  `f1` int NOT NULL,
  `f2` int NOT NULL,
  `f3` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
```
