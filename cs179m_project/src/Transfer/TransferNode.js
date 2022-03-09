import ContainerSlot from "../components/ContainerSlot"
import UnusedSlot from "../components/UnusedSlot"
import NaNSlot from "../components/NaNSlot"
import _ from "lodash"


export default class TransferNode {
    constructor(grid, allContainers, cost = 0, truckList, root = null, cranePos = [8, 0]){
        this.grid = grid
        this.allContainers = allContainers;
        this.truckList = truckList
        this.cost = cost;
        this.root = root;
        this.cranePos = cranePos
    }

    generateAllChildren() {
        let res = []
        for(let col = 0; col <= 11; col++) {
            let colRes = this.generateChildrenColumn(col)
            if(colRes !== -1){
                res.push(colRes)
            }
        }
        // console.log(res)
        let children = this.generateChildrenFromTruckToShip()
        res.push(children)
        return res;
    }

    isGoalState(unloadList, loadList){
        // console.log("loadlist ", loadList)
        for (let container of loadList){
            let [x, y] = this.getContainerCoord(container)
            if (x === -1 && y === -1) return false
        }
        for (let container of unloadList){
            if (!this.foundInTruckList(container)){
                // console.log(container);
                return false
            }
        }
        return true
    }

    foundInTruckList(container){
        for (let c of this.truckList){
            if (c.name === container.name) return true
        }
        return false
    }

    getShallowGrid(grid){
        var res = []
        for(var i = 0; i < grid.length; i++){
            var temp = []
            for(var j = 0; j < grid[i].length; j++){
                if(grid[i][j] instanceof ContainerSlot){
                    temp.push(Object.assign(new ContainerSlot([i,j], grid[i][j].weight, grid[i][j].name)))
                } 
                if(grid[i][j] instanceof NaNSlot){
                    temp.push(Object.assign(new NaNSlot([i,j])))
                }
                if(grid[i][j] instanceof UnusedSlot){
                    temp.push(Object.assign(new UnusedSlot([i,j])))
                }
            }
            res.push(temp)
        }
        return res
    }

    getShallowAllContainers(allContainers){
        let res = []
        for(let container of allContainers){
             res.push(Object.assign(new ContainerSlot([container.row,container.column], container.weight, container.name), container))
        }
        return res
    }

    filterContainer(tempAllContainers, hiRow, hiCol){
        for(let i = 0; i < tempAllContainers.length; ++i){
            if (tempAllContainers[i].row == hiRow && tempAllContainers[i].column == hiCol){
                tempAllContainers.splice(i, 1)
            }
        }
    }

    generateChildrenToTruck(hiRow, hiCol) {
        let tempGrid = this.getShallowGrid(this.grid)
        let tempTruckList = this.getShallowAllContainers(this.truckList)
        let tempAllContainers = this.getShallowAllContainers(this.allContainers)
        this.filterContainer(tempAllContainers, hiRow, hiCol)
        tempTruckList.push(tempGrid[hiRow][hiCol])
        tempGrid[hiRow][hiCol] = new UnusedSlot([hiRow, hiCol])
        let cost = this.cost + this.getManhattanDistance(this.cranePos[0], this.cranePos[1], hiRow, hiCol) + this.getManhattanDistance(8, 0, hiRow, hiCol) + 2
        let newTruckNode = new TransferNode(tempGrid, tempAllContainers, cost, tempTruckList, this, [8, 0])
        return newTruckNode;
    }
    
    generateChildrenFromTruckToShip(){
        let res = []
        for (let container of this.truckList) {
            for (let c = 0; c <= 11; ++c){
                let [lowRow, lowCol] = this.lowestUnusedSlot(c);
                if(lowRow > 7) continue
                let tempGrid = this.getShallowGrid(this.grid)
                tempGrid[lowRow][lowCol] = new ContainerSlot([lowRow,lowCol], container.weight, container.name)
                let tempTruckList = this.getShallowAllContainers(this.truckList)
                for (let i = 0; i < tempTruckList.length; ++i){
                    if (tempTruckList[i].name === container.name){ 
                        tempTruckList.splice(i, 1)
                        break
                    }
                }
                let allShallowContainer = this.getShallowAllContainers(this.allContainers)
                allShallowContainer.push(Object.assign(new ContainerSlot([lowRow, lowCol], container.weight, container.name)))
                let cost = this.cost + 2 + this.getManhattanDistance(this.cranePos[0], this.cranePos[1], 8, 0) + this.getManhattanDistance(8, 0, lowRow, lowCol)
                let newNode = new TransferNode(tempGrid, allShallowContainer, cost, tempTruckList, this, [lowRow, lowCol])
                res.push(newNode)
            }
        }
        return res
    }

    generateChildrenColumn(col) {
        let res = []
        let [hiRow, hiCol] = this.highestContainerSlot(col)
        // console.log(hiRow, " ", hiCol);
        if (hiRow == -1 && hiCol == -1) return -1
        for (let c = 0; c <= 11; ++c){
            if(c == col){
                continue
            }
            let [lowRow, lowCol] = this.lowestUnusedSlot(c);
            if(lowRow > 7) continue
            let tempGrid = this.getShallowGrid(this.grid)
            let tempTruckList = this.getShallowAllContainers(this.truckList)
            let allShallowContainer = this.getShallowAllContainers(this.allContainers)
            let newNode = new TransferNode(tempGrid, allShallowContainer, this.cost + this.getManhattanDistance(this.cranePos[0], this.cranePos[1], hiRow, hiCol) + this.getManhattanDistance(hiRow, hiCol, lowRow, lowCol), tempTruckList, this, [lowRow, lowCol])
            newNode.swapSlots(newNode.grid[hiRow][hiCol], newNode.grid[lowRow][lowCol])
            res.push(newNode)
        }

        res.push(this.generateChildrenToTruck(hiRow, hiCol))

        return res;
    }

    highestContainerSlot(col){
        var row = -1;
        var foundContainer = false
        while ((row + 1) < 8 && !(this.grid[row + 1][col] instanceof UnusedSlot)){
            if (this.grid[row + 1][col] instanceof ContainerSlot) foundContainer = true
            ++row
        }

        if(row === -1 || foundContainer === false)
            return [-1, -1]

        return [row, col]
    }

    lowestUnusedSlot(col){
        let row = 0;
        while (row < 8 && !(this.grid[row][col] instanceof UnusedSlot)){
            ++row
        }
        return [row, col]
    }

    swapSlots(s1, s2){ //s1: container, s2: unused slot
        let tmpSlot = s1; 
        let s1Row = s1.row
        let s1Col = s1.column
        let s2Row = s2.row
        let s2Col = s2.column
        
        this.grid[s1.row][s1.column] = s2
        s1.column = s2.column
        s1.row = s2.row
        this.grid[s2.row][s2.column] = tmpSlot
        s2.column = s1Col
        s2.row = s1Row

        //swap allContainers
        let s1Container 
        for (let container of this.allContainers){
            if (container.row === s1Row && container.column === s1Col){
                container.row = s2Row
                container.column = s2Col
                break
            }
        }
    }
    getManhattanDistance(x1, y1, x2, y2) { //g(n)
        var xDist = Math.abs(x1 - x2)
        var yDist = Math.abs(y1 - y2)
        return yDist + xDist 
    }

    isEqualTo(node){
        for (let i = 0; i < this.grid.length; ++i){
            for (let j = 0; j < this.grid[i].length; ++j){
                if (JSON.stringify(this.grid[i][j]) !== JSON.stringify(node.grid[i][j])){
                    return false
                }
            }
        }
        return true
    }

    findRouteFromRoot() {
        let node = this;
        let res = [];
        while(node.root != null) {
            res.push(node)
            node = node.root
        }
        res.push(node)
        res = res.reverse()
        return res;
    }

    twoDigs(num) {
        if(num < 10) {
            return "0" + num
        }
        else{
            return num
        }
    }

    traceBackRoot() {
        let route = this.findRouteFromRoot()
        console.log("route, ", route)
        let craneX = 9, craneY = 1;
        var res = []
        for(let i = 0; i < route.length  - 1; i++) {
            if(route[i].allContainers.length > route[i + 1].allContainers.length) {
                // moved container from ship to truck
                //console.log("moved container from ship to truck ", route[i].allContainers, route[i + 1].allContainers)
                let contianerRemoved = route[i].findContainerRemoved(route[i + 1])
                if(craneX !== contianerRemoved.row  + 1 || craneY !== contianerRemoved.column + 1) {
                    res.push("Move crane from ["+ this.twoDigs(craneX) +", " + this.twoDigs(craneY) +
                    "] to ["+ this.twoDigs((Number(contianerRemoved.row)  + 1)) + ", " + this.twoDigs((Number(contianerRemoved.column) + 1)) +  "]")
                }
                // container movement
                res.push("Move " + '"' + contianerRemoved.name + '"' + 
                " from [" + this.twoDigs((Number(contianerRemoved.row) + 1)) + ", " + this.twoDigs((Number(contianerRemoved.column) + 1)) + "] to the truck zone")
                res.push("Move crane from the truck zone to [09 , 01]")
                craneX = 9;
                craneY = 1;
            }
            else if(route[i].allContainers.length < route[i + 1].allContainers.length) {
                // break;
                // console.log("moving from truck to ship")
                // moved container from truck to ship
                let contianerRemoved = route[i + 1].findContainerRemoved(route[i])
                if(craneX !== 9 || craneY !== 1) {
                    res.push("Move crane from ["+ this.twoDigs(craneX) +", " + this.twoDigs(craneY) +
                    "] to [09, 01]")
                }
                
                res.push("Move " + '"' + contianerRemoved.name + '"' + " from the truck zone to [" + this.twoDigs((Number(contianerRemoved.row)  + 1)) + ", " + 
                this.twoDigs((Number(contianerRemoved.column) + 1)) +  "]")

                
                // // container movement
                // res.push("Move container " + contianerRemoved.name +  
                // " from [" + this.twoDigs((Number(contianerRemoved.row) + 1)) + ", " + this.twoDigs((Number(contianerRemoved.column) + 1)) + "] to the truck zone")
                // craneX = 9;
                // craneY = 1;
            }
            else {
                let contianerMoved = route[i].findContainerMoved(route[i + 1])
                // crane movement
                if(craneX !== contianerMoved[0].row  + 1 || craneY !== contianerMoved[0].column + 1){
                    res.push("Move crane from ["+ this.twoDigs(craneX) +", " + this.twoDigs(craneY) +
                    "] to ["+ this.twoDigs(Number(contianerMoved[0].row)  + 1) + ", " + this.twoDigs(Number(contianerMoved[0].column) + 1) +  "]")
                }
                // container movement
                res.push("Move " + '"' + contianerMoved[0].name +  '"' +
                " from [" + this.twoDigs((Number(contianerMoved[0].row) + 1)) + ", " + this.twoDigs((Number(contianerMoved[0].column) + 1)) + "] to [" +
                this.twoDigs((Number(contianerMoved[1].row)+ 1)) + ", " + this.twoDigs((Number(contianerMoved[1].column) + 1)) + "]")
                craneX = Number(contianerMoved[1].row) + 1;
                craneY = Number(contianerMoved[1].column) + 1;
            }
        }
        // Reset crane position at the end
        if(craneX !== 9 && craneY !== 1)
            res.push("Move crane from [" + craneX +  ", " + craneY + 
             "] to [ 09 , 01 ]")
        return res
    }

    findContainerMoved(child) {
        for(let i = 0; i < this.allContainers.length; i++) {
            for(let j = 0; j < child.allContainers.length; j++)
            if(child.allContainers[j].name === this.allContainers[i].name) {
                if(child.allContainers[j].column !== this.allContainers[i].column 
                    || child.allContainers[j].row !== this.allContainers[i].row )
                        return [this.allContainers[i], child.allContainers[j]]
            }
        }
    }

    findContainerRemoved(child) {
        const results = this.allContainers.filter(({ name: id1 }) => !child.allContainers.some(({ name: id2 }) => id2 === id1));
        return results[0]
    }

    returnCranePos(){
        this.cost += this.getManhattanDistance(this.cranePos[0], this.cranePos[1], 8, 0)
        this.cranePos = [8, 0]
    }
    
    computeHeuristic(unloadList, loadList){
        // // calculate how many of the items in loadList have been moved to the ship
        // let temp = 0;
        // for(let i = 0; i < loadList.length; i++) {
        //     for(let j = 0; j < this.allContainers.length; j++) {
        //         if(loadList[i].name === this.allContainers[i].name)
        //             temp++;
        //     }
        // }

        // // calculate how many of the items in uloadList have been moved off the ship
        // let temp2 = 0;
        // for(let i = 0; i < unloadList.length; i++) {
        //     for(let j = 0; j < this.truckList.length; j++) {
        //         if(unloadList[i].name === this.truckList[i].name)
        //             temp2++;
        //     }
        // }
        // let containersToSwap = loadList.length + unloadList.length;
        // let containersSwapped = temp + temp2;
        // // console.log("Hueristic is ", containersToSwap - containersSwapped)
        // return (containersToSwap - containersSwapped) * 2;
        return 0;
    }

    getContainerCoord(container){
        
        for (let i = 0; i < this.grid.length; ++i){
            for (let j = 0; j < this.grid[i].length; ++j){
                if (this.grid[i][j].name == container.name){
                        return [i,j]
                }
            }
        }
        // console.log("Should not get here")
        return [-1, -1]
    }
}