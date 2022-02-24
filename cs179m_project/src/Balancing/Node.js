import ContainerSlot from "../components/ContainerSlot"
import UnusedSlot from "../components/UnusedSlot"
import NaNSlot from "../components/NaNSlot"

export default class Node {
    
    constructor(grid, allContainers, cost = 0){
        this.grid = grid
        this.allContainers = allContainers;
        this.cost = cost;
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
            let newNode = new Node(tempGrid, allShallowContainer, this.cost + this.getManhattanDistance(hiRow, hiCol, lowRow, lowCol))
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
        // console.log(JSON.stringify(node.grid[0][2]))
        for (let i = 0; i < this.grid.length; ++i){
            // console.log(i)
            for (let j = 0; j < i.length; ++j){
                // console.log(object)
                if (JSON.stringify(Object.assign({}, this.grid[i][j])) !== JSON.stringify(Object.assign({}, node.grid[i][j]))) return false
            }
        }
        return true
    }
}