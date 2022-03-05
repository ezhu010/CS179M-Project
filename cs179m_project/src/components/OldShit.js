import ContainerSlot from "../components/ContainerSlot"
import UnusedSlot from "../components/UnusedSlot"
import NaNSlot from "../components/NaNSlot"

export default class TransferNode {
    constructor(grid, allContainers, cost = 0, root = null, cranePos = [8, 0]){
        this.grid = grid
        this.allContainers = allContainers;
        // this.truckList = truckList
        this.cost = cost;
        this.root = root;
        this.cranePos = cranePos
    }

    isGoalState(unloadList, loadList){
        for (let container of loadList){
            let [x, y] = this.getContainerCoord(container)
            if (x === -1 && y === -1) return false
        }
        // for (let container of unloadList){
        //     if (!this.foundInTruckList(container)) return false
        // }
        return false
        // return true
    }

    // foundInTruckList(container){
    //     console.log("Truck List: " + this.truckList)
    //     for (let c of this.truckList){
    //         if (c.name === container.name) return true
    //     }
    //     return false
    // }

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
            // let tempTruckList = this.getShallowAllContainers(this.truckList)
            let newNode = new TransferNode(tempGrid, allShallowContainer, this.cost + this.getManhattanDistance(this.cranePos[0], this.cranePos[1], hiRow, hiCol) + this.getManhattanDistance(hiRow, hiCol, lowRow, lowCol), this, [lowRow, lowCol])
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

    // generateChildrenToTruck(hiRow, hiCol) {
    //     let tempGrid = this.getShallowGrid(this.grid)
    //     let tempTruckList = this.getShallowAllContainers(this.truckList)
    //     let tempAllContainers = this.getShallowAllContainers(this.allContainers)
    //     tempAllContainers.filter(container => {
    //         return container.row !== hiRow && container.column !== hiCol
    //     })
    //     // console.log("temp grid ", tempGrid)
    //     console.log("contaienr", tempGrid[hiRow][hiCol])
    //     tempTruckList.push(tempGrid[hiRow][hiCol])
    //     // let allShallowContainer = this.getShallowAllContainers(this.allContainers)
    //     let newTruckNode = new TransferNode(tempGrid, tempAllContainers, tempTruckList, this.cost + this.getManhattanDistance(this.cranePos[0], this.cranePos[1], hiRow, hiCol) + 15, this, [8, 0])
    //     return newTruckNode;
    // }

    // generateChildrenFromTruckToShip(res){
    //     //for each colum call generateChildrenFromTruckToShipCol
    // }

    // generateChildrenFromTruckToShipCol(col){

    // }

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

// export default class TransferNode {
//     constructor(grid, allContainers, cost = 0, root = null, cranePos = [8, 0]){
//         this.grid = grid
//         this.allContainers = allContainers;
//         this.cost = cost;
//         this.root = root;
//         this.cranePos = cranePos
//     }

//     generateAllChildren() {
//         let res = []
//         for(let col = 0; col <= 11; col++) {
//             let colRes = this.generateChildrenColumn(col)
//             if(colRes !== -1){
//                 res.push(colRes)
//             }
//         }
//         return res;
//     }

//     getShallowGrid(grid){
//         var res = []
//         for(var i = 0; i < grid.length; i++){
//             var temp = []
//             for(var j = 0; j < grid[i].length; j++){
//                 if(grid[i][j] instanceof ContainerSlot){
//                     temp.push(Object.assign(new ContainerSlot([i,j], grid[i][j].weight, grid[i][j].name), grid[i][j]))
//                 } 
//                 if(grid[i][j] instanceof NaNSlot){
//                     temp.push(Object.assign(new NaNSlot([i,j])))
//                 }
//                 if(grid[i][j] instanceof UnusedSlot){
//                     temp.push(Object.assign(new UnusedSlot([i,j])))
//                 }
            
//             }
//             res.push(temp)
//         }
//         return res
//     }

//     getShallowAllContainers(allContainers){
//         let res = []
//         for(let container of allContainers){
//              res.push(Object.assign(new ContainerSlot([container.row,container.column], container.weight, container.name), container))
//         }
//         return res
//     }

//     generateChildrenColumn(col) {
//         let res = []
//         let [hiRow, hiCol] = this.highestContainerSlot(col)
//         // console.log(hiRow, " ", hiCol);
//         if (hiRow == -1 && hiCol == -1) return -1
//         for (let c = 0; c <= 11; ++c){
//             if(c == col){
//                 continue
//             }
//             let [lowRow, lowCol] = this.lowestUnusedSlot(c);
//             if(lowRow > 7) continue
//             let tempGrid = this.getShallowGrid(this.grid)
//             let allShallowContainer = this.getShallowAllContainers(this.allContainers)
//             let newNode = new Node(tempGrid, allShallowContainer, this.cost + this.getManhattanDistance(this.cranePos[0], this.cranePos[1], hiRow, hiCol) + this.getManhattanDistance(hiRow, hiCol, lowRow, lowCol), this, [lowRow, lowCol])
//             newNode.swapSlots(newNode.grid[hiRow][hiCol], newNode.grid[lowRow][lowCol])
//             res.push(newNode)
//         }
//         return res;
//     }

//     highestContainerSlot(col){
//         var row = -1;
//         var foundContainer = false
//         while ((row + 1) < 8 && !(this.grid[row + 1][col] instanceof UnusedSlot)){
//             if (this.grid[row + 1][col] instanceof ContainerSlot) foundContainer = true
//             ++row
//         }

//         if(row === -1 || foundContainer === false)
//             return [-1, -1]

//         return [row, col]
//     }

//     lowestUnusedSlot(col){
//         let row = 0;
//         while (row < 8 && !(this.grid[row][col] instanceof UnusedSlot)){
//             ++row
//         }
//         return [row, col]
//     }

//     swapSlots(s1, s2){ //s1: container, s2: unused slot
//         let tmpSlot = s1; 
//         let s1Row = s1.row
//         let s1Col = s1.column
//         let s2Row = s2.row
//         let s2Col = s2.column
        
//         this.grid[s1.row][s1.column] = s2
//         s1.column = s2.column
//         s1.row = s2.row
//         this.grid[s2.row][s2.column] = tmpSlot
//         s2.column = s1Col
//         s2.row = s1Row

//         //swap allContainers
//         let s1Container 
//         for (let container of this.allContainers){
//             if (container.row === s1Row && container.column === s1Col){
//                 container.row = s2Row
//                 container.column = s2Col
//                 break
//             }
//         }
//     }

//     // howBalanced(){
//     //     var leftSide = this.getPortSideWeight()
//     //     var rightSide = this.getStarboardSideWeight()
//     //     return Math.min(leftSide, rightSide) / Math.max(leftSide, rightSide)
//     // }

//     // getPortSideWeight(){
//     //     //left side
//     //     var res = 0;
//     //     this.allContainers.forEach((container) => {
//     //         if (container.column < 6){
//     //             res += parseInt(container.weight)
//     //         }
//     //     });
//     //     return res;
//     // }

//     // getStarboardSideWeight(){
//     //     var res = 0;
//     //     this.allContainers.forEach((container) => {
//     //         if (container.column >= 6){
//     //             res += parseInt(container.weight)
//     //         }
//     //     });
//     //     return res;
//     // }

//     getManhattanDistance(x1, y1, x2, y2) { //g(n)
//         var xDist = Math.abs(x1 - x2)
//         var yDist = Math.abs(y1 - y2)
//         return yDist + xDist 
//     }

//     isEqualTo(node){
//         for (let i = 0; i < this.grid.length; ++i){
//             for (let j = 0; j < this.grid[i].length; ++j){
//                 if (JSON.stringify(this.grid[i][j]) !== JSON.stringify(node.grid[i][j])){
//                     return false
//                 }
//             }
//         }
//         return true
//     }

//     findRouteFromRoot() {
//         let node = this;
//         let res = [];
//         while(node.root != null) {
//             res.push(node)
//             node = node.root
//         }
//         res.push(node)
//         res = res.reverse()
//         return res;
//     }

//     traceBackRoot() {
//         let route = this.findRouteFromRoot()
//         let craneX = 9, craneY = 1;
//         var res = []
//         for(let i = 0; i < route.length  - 1; i++) {
//             let contianerMoved = route[i].findContainerMoved(route[i + 1])
//             // crane movement
//             if(craneX !== contianerMoved[0].row  + 1 || craneY !== contianerMoved[0].column + 1)
//             res.push("Move crane from ["+ craneX +", " + craneY +
//              "] to ["+ contianerMoved[0].row  + 1 + ", " + contianerMoved[0].column + 1 +  "]")
//             // container movement
//             res.push("Move container " + contianerMoved[0].name +  
//             " from [" + contianerMoved[0].row + 1 + ", " + contianerMoved[0].column + 1 + "] to [" +
//             contianerMoved[1].row + 1 + ", " + contianerMoved[1].column + 1 + "]")
//             craneX = contianerMoved[1].row + 1;
//             craneY = contianerMoved[1].column + 1;
//         }
//         // Reset crane position at the end
//         res.push("Move crane from [" + craneX +  ", " + craneY + 
//              "] to [ 9 , 1 ]")
//         return res
//     }

//     findContainerMoved(child) {
//         for(let i = 0; i < this.allContainers.length; i++) {
//             for(let j = 0; j < child.allContainers.length; j++)
//             if(child.allContainers[j].name === this.allContainers[i].name) {
//                 if(child.allContainers[j].column !== this.allContainers[i].column 
//                     || child.allContainers[j].row !== this.allContainers[i].row )
//                         return [this.allContainers[i], child.allContainers[j]]
//             } 
//         }
//     }

//     returnCranePos(){
//         this.cost += this.getManhattanDistance(this.cranePos[0], this.cranePos[1], 8, 0)
//         this.cranePos = [8, 0]
//     }
    
//     computeHeuristic(){
//         // var count = 0;
//         // var leftSide = this.getPortSideWeight()
//         // var rightSide = this.getStarboardSideWeight()
//         // var balanceMass = (leftSide + rightSide) / 2.0;
//         // var diff = (balanceMass - Math.min(leftSide, rightSide)) // (x/y) = (x+ y)).9
//         // // sort containers of left side by mass
//         // // list.sort((a, b) => (a.color > b.color) ? 1 : -1)
//         // var containersSorted = this.allContainers.filter(a => a.column <= 5).sort((a, b) => b.weight - a.weight)
//         // let i = 0;
//         // while(diff >= 0 && i < containersSorted.length) {
//         //     diff -= containersSorted[i];
//         //     i++;
//         //     count++;
//         // }
//         // return count;
//         return 0;
//     }

//     // getContainerCoord(goalState, container){
//     //     for (let i = 0; i < goalState.grid.length; ++i){
//     //         for (let j = 0; j < goalState.grid[i].length; ++j){
//     //             if (goalState.grid[i][j].name == container.name){
//     //                     return [i,j]
//     //             }
//     //         }
//     //     }
//     //     console.log("Should not get here")
//     //     return [-1, -1]
//     // }
    
//     // computeSiftHeuristic(goalState){
//     //     var res = 0;
//     //     for(var i = 0; i < this.allContainers.length; i++){
//     //         var [x,y] = this.getContainerCoord(goalState, this.allContainers[i]);
//     //         // console.log(x,y);
//     //         if (x !== -1 && y !== -1){
//     //             res += this.getManhattanDistance(x, y, this.allContainers[i].row, this.allContainers[i].column)
//     //         }
//     //     }
//     //     console.log(res);
//     //     return res;
//     // }
// }

// import Slot from "../model/Slot.js"
// import NaNSlot from "./NaNSlot.js"
// import UnusedSlot from "./UnusedSlot"
// import ContainerSlot from "./ContainerSlot"
// import { Outlet, Link } from "react-router-dom";
// import ToolTip from "@mui/material/Tooltip"
// import Typography from '@mui/material/Typography';
// import RemoveContainerList from "./RemoveContainerList.js";
// import AddContainerList from "./AddContainerList";
// import ManifestUpload from "./ManifestUpload.js";
// import axios from 'axios';
// // import  from "./NaNSlot.js"
// import TransferSearch from "../Transfer/TransferSearch.js";

// import BalanceSearch from "../Balancing/BalanceSearch.js";

// import React from "react";
// import "../styling/Slots.css"

// export default class ShipGrid extends React.Component {

//     constructor(props){
//         super(props);
//         this.state = {
//             manifestData: "",
//             grid: [],
//             data: null,
//             row: 0,
//             column: 0,
//             CELLSIZE: 95,
//             clickedContainer: false, 
//             showGrid: false,
//             isfileUploaded: false,
//             manifestName: "",
//             allContainers: [],
//         }
//     }

//     componentWillMount() {
//         localStorage["slots"] = JSON.stringify([])
//         localStorage["addContainers"] = JSON.stringify([])
//     }


//     getRowAndColumnSize(line){
//         let dimensions = line.substring(1, 6).split(",")
//         return [Number(dimensions[0]), Number(dimensions[1])]
//     }

//     populateGridFromCSV() {
//         // let csvData = await this.fetchCsv();
//         let csvData = this.state.manifestData;
//         csvData = csvData.split("\n") 
//         let dimensions = this.getRowAndColumnSize(csvData.at(csvData.length - 1))
//         this.setState({row: Number(dimensions[0]) })
//         this.setState({column: Number(dimensions[1]) })
//         let containerCount = 0;
//         let col = 0
//         let tmp = []
//         csvData.forEach((line) => { 
//             line = line.split(", ")
//             let containerType = "";
//             if(line.length > 3) {
//                 for(let i = 2; i < line.length - 1; i++)
//                     containerType += line[i] + ", "
//                 containerType += line[line.length - 1]
//             }
//             else {
//                 containerType = line[2];
//             }
//             if(containerType.trim() === "NAN"){
//                 tmp.push(new NaNSlot(this.getRowAndColumnSize(line[0])))
//             }
//             else if(containerType.trim() === "UNUSED") {
//                 tmp.push(new UnusedSlot(this.getRowAndColumnSize(line[0])))
//             } 
//             else{
//                 this.setState({allContainers: [...this.state.allContainers,  new ContainerSlot(this.getRowAndColumnSize(line[0]), line[1].substring(1,6), containerType)]})
//                 tmp.push(new ContainerSlot(this.getRowAndColumnSize(line[0]), line[1].substring(1,6), containerType))
//                 ++containerCount    
//             }          
//             col++
//             if (col >= this.state.column) {
//                 col = 0;
//                 let tmpGrid = this.state.grid
//                 tmpGrid.push(tmp)
//                 this.setState({grid: tmpGrid})
//                 tmp = []
//             }
//         })
//             let sendData = `Manifest ${this.state.manifestName} is opened, there are ${containerCount} containers on the ship\n`
//             let manifestInfo = {}
//             manifestInfo.logData = sendData        
//             axios
//                 .post('http://localhost:8080/manifestLogWrite', manifestInfo)
//                 .then((res) => { 
//                     if(res.status == 200){
//                         // window.location.href="/";
//                     }
//                 })
//                 .catch(err => {
//                     console.error(err);
//                     return
//             });

//         //reversing the grid orientation
//         let tmpGrid = this.state.grid
//         for (let i = 0; i < tmpGrid.length; i++){
//             let tmp = tmpGrid[tmpGrid.length - 1 - i]
//             tmpGrid[tmpGrid.length - 1 - i] = tmpGrid[i];
//             tmpGrid[i] = tmp;
//         }
//         this.setState({grid: tmpGrid})
//     }

//     checkDuplicates(prevContainer, slot){
//         for(let i = 0; i < prevContainer.length; i++){
//             if(prevContainer[i].column == slot.column && prevContainer[i].row == slot.row){
//                 return true;
//             }
//         }
//         return false
//     }

//     addToRemoveContainerList(slot){
//         this.setState({clickedContainer: !this.state.clickedContainer})
//         let prevContainer = JSON.parse(localStorage["slots"]);
//         if(!this.checkDuplicates(prevContainer, slot)){
//             prevContainer.push(slot)
//             localStorage["slots"] = JSON.stringify(prevContainer);
//         }
//     }

//     getShallowGrid(grid){
//         let res = []
//         for(let i = 0; i < grid.length; i++){
//             let temp = []
//             for(let j = 0; j < grid[i].length; j++){
//                 if(grid[i][j] instanceof ContainerSlot){
//                     temp.push(Object.assign(new ContainerSlot([i,j], grid[i][j].weight, grid[i][j].name), grid[i][j]))
//                 } 
//                 if(grid[i][j] instanceof NaNSlot){
//                     temp.push(Object.assign(new NaNSlot([i,j])))
//                 }
//                 if(grid[i][j] instanceof UnusedSlot){
//                     temp.push(Object.assign(new UnusedSlot([i,j])))
//                 }
            
//             }
//             res.push(temp)
//         }
//         console.log("RES2: ", res)
//         return res
//     }

//     getShallowAllContainers(allContainers){
//         let res = []
//         for(let container of allContainers){
//             res.push(Object.assign(new ContainerSlot([container.row,container.column], container.weight, container.name), container))
//         }
//         return res
//     }

//     performTransfer(){
//         // let offLoadContainers = this.getShallowAllContainers(localStorage.getItem("slots"))
//         // let onLoadContainers = [] //this.getShallowAllContainers(localStorage.getItem("addContainer"))
//         let tempGrid = this.getShallowGrid(this.state.grid)  
//         console.log("TempGrid", tempGrid)
//         tempGrid[5][5] = "fuck me"
//         let tempAllContainers = this.getShallowAllContainers(this.state.allContainers)
//         // let transferSearch = new TransferSearch(tempGrid, tempAllContainers)
//         // transferSearch.greedySearch();
//         let balanceSearch = new BalanceSearch(tempGrid, tempAllContainers)
//         let [top, route] = balanceSearch.greedySearch()

//     }

//     render() {
//         return(
//         <div className="maingrid">  

//         <ManifestUpload sendManifestData={(logData, manifestFileName) => {
//                 console.log("file finished")
//                 localStorage.clear()
//                 localStorage["slots"] = JSON.stringify([])
//                 localStorage["addContainers"] = JSON.stringify([])
//                 this.setState({isfileUploaded: true})
//                 this.setState({manifestData: logData})
//                 this.populateGridFromCSV(this.state.manifestName)
//                 this.forceUpdate()
//         }}
//         sendManifestName={(manifestFileName) =>{
//                 this.setState({manifestName: manifestFileName})
//         }}
//         />
        
//          {   this.state.isfileUploaded ?
//             this.state.grid.map(rowOfSlots => 
//                 rowOfSlots.map(slot => {
//                     if(slot instanceof  NaNSlot){
//                         return (
//                             <div  className="NaNSlot" style={{
//                                 left: `${this.state.CELLSIZE * slot.column + 1}px`,
//                                 top: `${this.state.CELLSIZE * (8 - slot.row) + 1}px`,
//                                 width: `${this.state.CELLSIZE - 1}px`,
//                                 height: `${this.state.CELLSIZE - 1}px`,
//                                 }} key={(slot.row - 1) * 12 + (slot.column - 1)} id={(slot.row - 1) * 12 + (slot.column - 1)}>NAN
//                             </div>
//                         )
//                     }
//                     else if(slot instanceof UnusedSlot){
//                         return(
//                             <div  className="UnusedSlot" style={{
//                                 left: `${this.state.CELLSIZE * slot.column + 1}px`,
//                                 top: `${this.state.CELLSIZE * (8 - slot.row) + 1}px`,
//                                 width: `${this.state.CELLSIZE - 1}px`,
//                                 height: `${this.state.CELLSIZE - 1}px`,
//                                 }} key={(slot.row - 1) * 12 + (slot.column - 1)} id={(slot.row - 1) * 12 + (slot.column - 1)}> UNUSED
//                             </div>
//                         )       
//                     }
//                     else{
//                         return(
//                            <ToolTip title={<Typography fontSize={20}>{slot.name}</Typography>}>
//                                 <div  onClick={() => this.addToRemoveContainerList(slot)}
//                                         className="ContainerSlot" style={{
//                                         left: `${this.state.CELLSIZE * slot.column + 1}px`,
//                                         top: `${this.state.CELLSIZE * (8 - slot.row) + 1}px`,
//                                         width: `${this.state.CELLSIZE - 1}px`,
//                                         height: `${this.state.CELLSIZE - 1}px`,
//                                         }} key={(slot.row - 1) * 12 + (slot.column - 1)} id={(slot.row - 1) * 12 + (slot.column - 1)}> {slot.name}
//                                 </div>
//                             </ToolTip>
//                         )
//                     }
//                 })
//             ) : null
//         } 
        
//         {/* <RemoveContainerList clickedContainer={this.state.clickedContainer} isfileUploaded={this.state.isfileUploaded}/>
//         <AddContainerList isfileUploaded={this.state.isfileUploaded}/> */}
//         <button className="performAlgorithm" onClick={() => {
//             this.performTransfer()
//         }}>Perform Offload/Onload</button>
//         <Link to="/balanceShip">
//          <button className="balance">Balancing</button>
//     </Link>
       
//         <div className="logform">            
//             <Link to="/logform">
//                 <button type="button">Log Form</button>
//             </Link>
//             <Outlet />
//         </div>
//     </div>
//         );
//     }
// }
