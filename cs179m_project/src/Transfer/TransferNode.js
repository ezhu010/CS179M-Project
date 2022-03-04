import ContainerSlot from "../components/ContainerSlot"
import UnusedSlot from "../components/UnusedSlot"
import NaNSlot from "../components/NaNSlot"

export default class TransferNode {
    constructor(grid, allContainers, truckList, cost = 0, root = null, cranePos = [8, 0]){
        this.grid = grid
        this.allContainers = allContainers;
        this.truckList = truckList
        this.cost = cost;
        this.root = root;
        this.cranePos = cranePos
    }

    isGoalState(unloadList, loadList){
        for (let container of loadList){
            let [x, y] = this.getContainerCoord(container)
            if (x === -1 && y === -1) return false
        }
        for (let container of unloadList){
            if (!this.foundInTruckList(container)) return false
        }
        return true
    }

    foundInTruckList(container){
        console.log("Truck List: " + this.truckList)
        for (let c of this.truckList){
            if (c.name === container.name) return true
        }
        return false
    }

    generateAllChildren() {
        let res = []
        for(let col = 0; col <= 11; col++) {
            let colRes = this.generateChildrenColumn(col)
            if(col == 2) break
            if(colRes !== -1){
                res.push(colRes)
            }
        }
        return res;
    }

    getShallowGrid(grid){
        var res = []
        console.log("Before:" , grid);
        for(var i = 0; i < grid.length; i++){
            var temp = []
            for(var j = 0; j < grid[i].length; j++){

                if(grid[i][j] instanceof ContainerSlot){
               
                    temp.push(Object.assign(new ContainerSlot([i,j], grid[i][j].weight, grid[i][j].name), grid[i][j]))
                } 
                else if(grid[i][j] instanceof NaNSlot){
                    temp.push(Object.assign(new NaNSlot([i,j])))
                }
                else if(grid[i][j] instanceof UnusedSlot){
                             if(i == 2 && j == 0){
                            console.log("WTF:" , grid[i][j])
                        }
                    temp.push(Object.assign(new UnusedSlot([i,j])))
                }
            }
            res.push(temp)
        }
        console.log("RES:" , res);
        return res
    }

    getShallowAllContainers(allContainers){
        let res = []
        for(let container of allContainers){
             res.push(Object.assign(new ContainerSlot([container.row,container.column], container.weight, container.name), container))
        }
        return res
    }

    generateChildrenColumn(col) {
        let res = []
        let [hiRow, hiCol] = this.highestContainerSlot(col)
        console.log(hiRow, " ", hiCol);
        if (hiRow == -1 && hiCol == -1) return -1
        for (let c = 0; c <= 11; ++c){
            console.log("testing here")
            if(c == col){
                continue
            }
            let [lowRow, lowCol] = this.lowestUnusedSlot(c);
            if(lowRow > 7) continue
            let tempGrid = this.getShallowGrid(this.grid)
            // console.log("grid", this.grid)
            let allShallowContainer = this.getShallowAllContainers(this.allContainers)
            let tempTruckList = this.getShallowAllContainers(this.truckList)
            let newNode = new TransferNode(tempGrid, allShallowContainer, tempTruckList, this.cost + this.getManhattanDistance(this.cranePos[0], this.cranePos[1], hiRow, hiCol) + this.getManhattanDistance(hiRow, hiCol, lowRow, lowCol), this, [lowRow, lowCol])
            // break
            newNode.swapSlots(newNode.grid[hiRow][hiCol], newNode.grid[lowRow][lowCol])
            break;
            res.push(newNode)
            
        }
        // remove from truck to ship
        // 
        // console.log("Children 0", res[0])
        // res.push(this.generateChildrenToTruck(hiRow, hiCol))
        return res;
    }

    generateChildrenToTruck(hiRow, hiCol) {
        let tempGrid = this.getShallowGrid(this.grid)
        let tempTruckList = this.getShallowAllContainers(this.truckList)
        let tempAllContainers = this.getShallowAllContainers(this.allContainers)
        tempAllContainers.filter(container => {
            return container.row !== hiRow && container.column !== hiCol
        })
        // console.log("temp grid ", tempGrid)
        console.log("contaienr", tempGrid[hiRow][hiCol])
        tempTruckList.push(tempGrid[hiRow][hiCol])
        // let allShallowContainer = this.getShallowAllContainers(this.allContainers)
        let newTruckNode = new TransferNode(tempGrid, tempAllContainers, tempTruckList, this.cost + this.getManhattanDistance(this.cranePos[0], this.cranePos[1], hiRow, hiCol) + 15, this, [8, 0])
        return newTruckNode;
    }

    generateChildrenFromTruckToShip(res){
        //for each colum call generateChildrenFromTruckToShipCol
    }

    generateChildrenFromTruckToShipCol(col){

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

    // don't write code like this...
    swapSlots(s1, s2){ //s1: container, s2: unused slot
        console.log("SWAPPING BEFORE...", s1, s2);
        let tmpSlot = s1; 
        console.log(tmpSlot);

        let s1Row = s1.row
        let s1Col = s1.column
        let s2Row = s2.row
        let s2Col = s2.column

        // console.log(this.grid[s1Row][s1Col]);
        // console.log(this.grid[s2Row][s2Col]);
        // console.log(tmpSlot);

        this.grid[s1Row][s1Col] = s2
        s1.column = s2.column
        s1.row = s2.row
        this.grid[s2.row][s2.column] = tmpSlot
        s2.column = s1Col
        s2.row = s1Row
    
        // console.log(this.grid[s1Row][s1Col]);
        // console.log(this.grid[s2Row][s2Col]);

        //swap allContainers
        let s1Container 
        for (let container of this.allContainers){
            if (container.row === s1Row && container.column === s1Col){
                container.row = s2Row
                container.column = s2Col
                break
            }
        }
        console.log("SWAPPING AFTER...", s1, s2);
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

    getManhattanDistance(x1, y1, x2, y2) { //g(n)
        var xDist = Math.abs(x1 - x2)
        var yDist = Math.abs(y1 - y2)
        return yDist + xDist 
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

    traceBackRoot() {
        let route = this.findRouteFromRoot()
        let craneX = 9, craneY = 1;
        var res = []
        for(let i = 0; i < route.length  - 1; i++) {
            let contianerMoved = route[i].findContainerMoved(route[i + 1])
            // crane movement
            if(craneX !== contianerMoved[0].row  + 1 || craneY !== contianerMoved[0].column + 1)
            res.push("Move crane from ["+ craneX +", " + craneY +
             "] to ["+ contianerMoved[0].row  + 1 + ", " + contianerMoved[0].column + 1 +  "]")
            // container movement
            res.push("Move container " + contianerMoved[0].name +  
            " from [" + contianerMoved[0].row + 1 + ", " + contianerMoved[0].column + 1 + "] to [" +
            contianerMoved[1].row + 1 + ", " + contianerMoved[1].column + 1 + "]")
            craneX = contianerMoved[1].row + 1;
            craneY = contianerMoved[1].column + 1;
        }
        // Reset crane position at the end
        res.push("Move crane from [" + craneX +  ", " + craneY + 
             "] to [ 9 , 1 ]")
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

    returnCranePos(){
        this.cost += this.getManhattanDistance(this.cranePos[0], this.cranePos[1], 8, 0)
        this.cranePos = [8, 0]
    }

    computeHeuristic() {
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
        console.log("Should not get here")
        return [-1, -1]
    }
}