import Node from "./Node";
import {MinQueue} from "heapify";

export default class BalanceSearch {
    constructor(shipGrid, allContainers){
        this.frontier = new MinQueue(1000000, [], [], Node, Uint32Array)
        this.initialNode = new Node(shipGrid, allContainers)
        this.visited = []
    }

    greedySearch(){
        this.frontier.push(this.initialNode, 0)
        this.visited.push(this.initialNode)
        while(this.frontier.size > 0){
            let top = this.frontier.peek()
            if (top.howBalanced() >= 0.9) {
                console.log("TOP: ", top)
                return top
            }
            this.frontier.pop() 
            var children = top.generateAllChildren()
            // console.log("CHILDREN", children)
            for(let child of children){
                for (let lilguy of child){
                    if(!this.isFound(lilguy)){
                        this.frontier.push(lilguy, lilguy.cost) 
                        this.visited.push(lilguy)
                        console.log("VISITED", this.visited)
                    }
                }
            }
        }
    }

    isFound(node) {
        for(let obj of this.visited) {
            // check for equality here
            if (node.isEqualTo(obj)) return true
        }
        return false
    }
}