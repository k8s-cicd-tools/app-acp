

//class for table
export class Table {
    name: string;
    actions: string[];

    constructor(name: string, actions: string[]) {
        this.name = name;
        this.actions = actions;
    }

    addActions(actions: string[]) {
        this.actions = this.actions.concat(actions);
        //remove duplicates
        this.actions = this.actions.filter((v, i, a) => a.indexOf(v) === i);
    }

}





