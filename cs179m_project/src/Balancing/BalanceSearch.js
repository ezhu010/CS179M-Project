import Node from "./Node";
import {MinQueue} from "heapify";

export default class BalanceSearch {
    constructor(shipGrid, allContainers){
        this.frontier = new MinQueue(1000000, [], [], Node, Uint32Array)
        this.initialNode = new Node(shipGrid, allContainers)
        this.visited = []
    }

    greedySearch(){
        console.time("search time")
        var count = 0
        this.frontier.push(this.initialNode, this.initialNode.computeHeuristic())
        this.visited.push(this.initialNode)
        while(this.frontier.size > 0){
            ++count

            let top = this.frontier.peek()
            
            if (count % 50 === 0) {
                console.log("frontier", this.frontier.size);
                console.log("visited", this.visited.length);
                console.log("balance %", top.howBalanced());
                console.log(count);
            }
            
            if (top.howBalanced() >= 0.9) {
                console.log("Expanded nodes:", count);
                var route = top.traceBackRoot();
                top.returnCranePos()
                console.log("TOP:", top)
                console.timeEnd("search time")
                return [top, route];
            }
            this.frontier.pop() 
            var children = top.generateAllChildren()
            // console.log(children)
            // break
            for(let child of children){
                for (let lilguy of child){
                    if(!this.isFoundInVisited(lilguy)){
                        this.frontier.push(lilguy, lilguy.cost + lilguy.computeHeuristic()) 
                        this.visited.push(lilguy)
                    }
                }
            }
        }
    }

    isFoundInVisited(node) {
        for(let obj of this.visited) {
            // check for equality here
            if (node.isEqualTo(obj)) return true
        }
        return false
    }
}