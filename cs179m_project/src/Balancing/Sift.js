import Node from "./Node";
import {MinQueue} from "heapify";

export default class Sift {
    constructor(initialShipGrid, goalShipGrid, initialAllContainers, goalAllContainers){
        this.frontier = new MinQueue(1000000, [], [], Node, Uint32Array)
        this.initialNode = new Node(initialShipGrid, initialAllContainers)
        this.goalState = new Node(goalShipGrid, goalAllContainers)
        this.visited = []
    }

    performSiftSearch(){
        var count = 0
        console.log(this.goalState)
        this.frontier.push(this.initialNode, this.initialNode.computeSiftHeuristic(this.goalState))
        this.visited.push(this.initialNode)
        while(this.frontier.size > 0) {
            let top = this.frontier.peek()
            if (count % 50 === 0) {
                console.log("frontier", this.frontier.size);
                console.log("visited", this.visited.length);
                console.log(count);
            }
            this.frontier.pop() 
            if (top.isEqualTo(this.goalState)){
                let route = top.traceBackRoot()
                top.returnCranePos()
                console.log("TOP: ", top);
                return [top, route]
            }
            var children = top.generateAllChildren()
            for(let child of children){
                for (let lilguy of child){
                    if(!this.isFoundInVisited(lilguy)){
                        this.frontier.push(lilguy, lilguy.cost + lilguy.computeSiftHeuristic(this.goalState)) 
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