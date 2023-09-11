export class Chain {
    constructor(
        private nodes: Function[],
        private args: any[]
    ) {
        this.nodes = this.nodes.filter(node => node instanceof Function)
    }
    
    private getNode () {
        console.log('nodes', this.nodes)
        if (!this.nodes.length) return null
        return this.nodes.shift();
    }

    async invoque () {
        const node = this.getNode();
        console.log({
            length_nodes: this.nodes.length
        })
        if (!node) return
        await node(...this.args, () => this.invoque());
    }
}