import ContainerSlot from "../components/ContainerSlot"
import UnusedSlot from "../components/UnusedSlot"
import NaNSlot from "../components/NaNSlot"

export default class Node {
    
    constructor(grid, allContainers, cost = 0, root = null){
        this.grid = grid
        this.allContainers = allContainers;
        this.cost = cost;
        this.root = root;
    }

    generateAllChildren() {
        let res = []
        for(let col = 0; col <= 11; col++) {
            let colRes = this.generateChildrenColumn(col)
            if(colRes !== -1){
                res.push(colRes)
            }
        }
        return res;
    }

    getShallowGrid(grid){
        var res = []
        for(var i = 0; i < grid.length; i++){
            var temp = []
            for(var j = 0; j < grid[i].length; j++){
                if(grid[i][j] instanceof ContainerSlot){
                    temp.push(Object.assign(new ContainerSlot([i,j], grid[i][j].weight, grid[i][j].name), grid[i][j]))
                } 
                if(grid[i][j] instanceof NaNSlot){
                    temp.push(Object.assign(new NaNSlot([i,j]), grid[i][j]))
                }
                if(grid[i][j] instanceof UnusedSlot){
                    temp.push(Object.assign(new UnusedSlot([i,j]), grid[i][j]))
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

    generateChildrenColumn(col) {
        let res = []
        let [hiRow, hiCol] = this.highestContainerSlot(col)
        if (hiRow == -1 && hiCol == -1) return -1
        for (let c = 0; c <= 11; ++c){
            if(c == col){
                continue
            }
            let [lowRow, lowCol] = this.lowestUnusedSlot(c);
            if(lowRow > 7) continue
            let tempGrid = this.getShallowGrid(this.grid)
            let allShallowContainer = this.getShallowAllContainers(this.allContainers)
            let newNode = new Node(tempGrid, allShallowContainer, (this.cost + this.getManhattanDistance(hiRow, hiCol, lowRow, lowCol)), this)
            newNode.swapSlots(newNode.grid[hiRow][hiCol], newNode.grid[lowRow][lowCol])
            res.push(newNode)
        }
        return res;
    }

    highestContainerSlot(col){
        let row = -1;
        while ((row + 1) < 8 && this.grid[row + 1][col] instanceof ContainerSlot){
            ++row
        }

        if(row === -1)
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

    howBalanced(){
        var leftSide = this.getPortSideWeight()
        var rightSide = this.getStarboardSideWeight()
        return Math.min(leftSide, rightSide) / Math.max(leftSide, rightSide)
    }

    // howBalanced / cost

    getPortSideWeight(){
        //left side
        var res = 0;
        this.allContainers.forEach((container) => {
            if (container.column < 6){
                res += parseInt(container.weight)
            }
        });
        return res;
    }

    getStarboardSideWeight(){
        var res = 0;
        this.allContainers.forEach((container) => {
            if (container.column >= 6){
                res += parseInt(container.weight)
            }
        });
        return res;
    }

    getManhattanDistance(x1, y1, x2, y2) { //g(n)
        var xDist = Math.abs(x1 - x2)
        var yDist = Math.abs(y1 - y2)
        return yDist + xDist 
    }

    isEqualTo(node){
        for (let i = 0; i < this.grid.length; ++i){
            for (let j = 0; j < this.grid[i].length; ++j){
                if (JSON.stringify(this.grid[i][j]) !== JSON.stringify(node.grid[i][j])) return false
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

    traceBackRoot() {
        let route = this.findRouteFromRoot()
        let craneX = 9, craneY = 1;
        for(let i = 0; i < route.length  - 1; i++) {
            let contianerMoved = route[i].findContainerMoved(route[i + 1])
            // crane movement
            if(craneX !== contianerMoved[0].row  + 1 || craneY !== contianerMoved[0].column + 1)
            console.log("Move crane from [", craneX, ", ", craneY,
             "] to [", contianerMoved[0].row  + 1, ", ", contianerMoved[0].column + 1, "]")
            // container movement
            console.log("Move container ", contianerMoved[0].name, 
            " from [", contianerMoved[0].row + 1, ", ", contianerMoved[0].column + 1, "] to [", 
            contianerMoved[1].row + 1, ", ", contianerMoved[1].column + 1, "]")
            craneX = contianerMoved[1].row + 1;
            craneY = contianerMoved[1].column + 1;
        }
        // Reset crane position at the end
        console.log("Move crane from [", craneX, ", ", craneY,
             "] to [ 9 , 1 ]")
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
}