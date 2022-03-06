import TransferNode from "./TransferNode";
import {MinQueue} from "heapify";
import ContainerSlot from "../components/ContainerSlot";

export default class TransferSearch {
    constructor(shipGrid, allContainers, unloadList, loadList){
        this.frontier = new MinQueue(1000000, [], [], TransferNode, Uint32Array)
        this.unloadList = unloadList
        this.loadList = loadList

        // console.log(unloadList);
        console.log(loadList);

        this.initialNode = new TransferNode(shipGrid, allContainers, 0, this.generateTruckList())
        this.visited = []
    }

    greedySearch(){
        // console.log("initialNode", this.initialNode);
        var count = 0
        this.frontier.push(this.initialNode, this.initialNode.computeHeuristic())
        this.visited.push(this.initialNode)
        while(this.frontier.size > 0){
            ++count

            let top = this.frontier.peek()
            
            if (count % 50 === 0) {
                console.log("frontier", this.frontier.size);
                console.log("visited", this.visited.length);
                console.log(count);
            }
            
            if (top.isGoalState(this.unloadList, this.loadList)) {
                top.returnCranePos()
                console.log("TOP:", top)
                var route = top.traceBackRoot();
                console.log(route)
                console.log(top.computeHeuristic())
                return [top, route];
            }

            this.frontier.pop() 
            var children = top.generateAllChildren()

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

    generateTruckList(){
        let truckList = this.getShallowAllContainers(this.loadList);
        return truckList
    }

    getShallowAllContainers(allContainers){
        let res = []
        for(let container of allContainers){
             res.push(Object.assign(new ContainerSlot([container.row,container.column], container.weight, container.name), container))
        }
        return res
    }

    isFoundInVisited(node) {
        for(let obj of this.visited) {
            // check for equality here
            if (node.isEqualTo(obj)) return true
        }
        return false
    }
}