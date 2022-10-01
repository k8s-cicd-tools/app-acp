import {UserRule} from "./UserRule";
import {Table} from "./Table";


// class for UserRules
export class UserRules {
    rules: UserRule[] = [];

    constructor(json: any) {
        for (let rule of json) {
            let userRule = new UserRule(rule.namespace, rule.appName, rule.databaseName);
            for (let table of rule.tables) {
                let tableRule = new Table(table.name, table.actions);
                userRule.addTable(tableRule);
            }
            this.addRule(userRule);
        }
    }

    // add a rule to the rules array
    addRule(rule: UserRule) {
        this.rules.push(rule);
    }

}

