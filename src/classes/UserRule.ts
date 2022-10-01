import {Table} from "./Table";


export class UserRule {
    namespace: string;
    appName: string;
    databaseName: string;
    tables: Table[] = [];

    constructor(namespace: string, appName: string, databaseName: string) {
        this.namespace = namespace;
        this.appName = appName;
        this.databaseName = databaseName;
    }

    addTable(table: Table) {
        this.tables.push(table);
    }
}
