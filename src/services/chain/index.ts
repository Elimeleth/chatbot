export class chain {
    constructor(
        private nodes: Function[],
        private args: any[]
    ) {}
    
    private getNode () {
        if (!this.nodes.length) return null
        return this.nodes.shift();
    }

    invoque () {
        const node = this.getNode();
        console.log({
            length_nodes: this.nodes.length
        })
        if (!node) return
        node(...this.args, () => this.invoque());
    }
}