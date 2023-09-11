export class Chain {
    constructor(
        private nodes: Function[],
        private args: any[]
    ) {
        this.nodes = this.nodes.filter(node => node instanceof Function)
    }
    
    private getNode () {
        if (!this.nodes.length) return null
        return this.nodes.shift();
    }

    async invoque () {
        const node = this.getNode();
        
        if (!node) return
        await node(...this.args, () => this.invoque());
    }
}