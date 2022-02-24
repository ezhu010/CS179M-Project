
import ContainerSlot from "../components/ContainerSlot"
import UnusedSlot from "../components/UnusedSlot"
import NaNSlot from "../components/NaNSlot"

export default class Node {
    
    constructor(grid){
        this.grid = grid
        this.allContainers = []
    }

    generateAllChildren() {
        let res = []
        for(let col = 0; col <= 11; col++) {
            let colRes = this.generateChildrenColumn(col)
            if(colRes !== -1){
                res.push(colRes)
            }
        }
        console.log(res)
        return res;
    }

    getShallowGrid(grid){
        var res = []
        for(var i = 0; i < grid.length; i++){
            var temp = []
            for(var j = 0; j < grid[i].length; j++){
                if(grid[i][j] instanceof ContainerSlot){
                    this.allContainers.push(Object.assign(new ContainerSlot([i,j], grid[i][j].weight, grid[i][j].name), grid[i][j]))
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

    generateChildrenColumn(col) {
        let res = []
        let [hiRow, hiCol] = this.highestContainerSlot(col)
        console.log(hiRow, hiCol)
        if (hiRow == -1 && hiCol == -1) return -1
        for (let c = 0; c <= 11; ++c){
            if(c == col){
                continue
            }
            let [lowRow, lowCol] = this.lowestUnusedSlot(c);
            console.log(lowRow, lowCol)
            if(lowRow > 7) continue
            //create new Node
            let tempGrid = this.getShallowGrid(this.grid)
            console.log("before", this.grid)
            let newNode = new Node(tempGrid)
            newNode.swapSlots(newNode.grid[hiRow][hiCol], newNode.grid[lowRow][lowCol])
            console.log("after", this.grid)
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

    swapSlots(s1, s2){ //s1: slot object
        console.log("Swapping: ", s1, s2)
        let tmpSlot = s1; 
        let s1Row = s1.row
        let s1Col = s1.column
        this.grid[s1.row][s1.column] = s2
        s1.column = s2.column
        s1.row = s2.row
        this.grid[s2.row][s2.column] = tmpSlot
        s2.column = s1Col
        s2.row = s1Row
    }

    howBalanced(){
        var leftSide = this.getPortSideWeight()
        var rightSide = this.getStarboardSideWeight()
        return Math.abs(leftSide - rightSide)
    }


    getPortSideWeight(){
        //left side
        var res = 0;
        for(let container of this.allContainers) {
            if(container.column < 7) 
                res += parseInt(container.weight)
        }
        return res;
    }
    getStarboardSideWeight(){
        var res = 0;
        for(let container of this.allContainers) {
            if(container.column >= 7) 
                res += parseInt(container.weight)
        }
        return res;
    }

    // getManhattanDistance(root) {

    // }
}