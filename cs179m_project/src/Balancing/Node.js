
import ContainerSlot from "../components/ContainerSlot"
import UnusedSlot from "../components/UnusedSlot"

export default class Node {
    
    constructor(grid){
        this.grid = grid
    }

    generateAllChildren() {
        // console.log(this.grid)
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

    generateChildrenColumn(col) {
        let res = []
        let [hiRow, hiCol] = this.highestContainerSlot(col)
        // console.log(hiRow, hiCol)
        if (hiRow == -1 && hiCol == -1) return -1
        for (let c = 0; c <= 11; ++c){
            if(c == col){
                continue
            }
            let [lowRow, lowCol] = this.lowestUnusedSlot(c);

            if(lowRow > 7) continue
            //create new Node
            let newNode = new Node(this.grid)
            newNode.swapSlots(newNode.grid[hiRow][hiCol], newNode.grid[lowRow][lowCol])
            // console.log(this.grid)
            // console.log(newNode.grid);
            res.push(newNode)
        }
        // the location of top contianer is [row][col]
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
        let s1Row = s1.row
        let s1Col = s1.row
        let s2Row  = s2.row
        let s2Col = s2.col
        console.log(s1Row, " ", s1Col, " ", s2Row, " ", s2Col);

        // [s1, s2] = [s2, s1]
        
        // let tmpSlot = Object.assign({}, s1); // copy by value
        // // Object.assign({}, s2)
        this.grid[s1.row][s1.col] = s2
        this.grid[s2.row][s2.col] = s1
        s1.row = s2Row
        s1.col = s2Col
        s2.row = s1Row
        s2.col = s2Col
    }

    
}