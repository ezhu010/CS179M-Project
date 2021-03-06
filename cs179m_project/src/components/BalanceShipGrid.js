import Slot from "../model/Slot.js"
import NaNSlot from "./NaNSlot.js"
import UnusedSlot from "./UnusedSlot"
import ContainerSlot from "./ContainerSlot"
import { Outlet, Link } from "react-router-dom";
import ToolTip from "@mui/material/Tooltip"
import Typography from '@mui/material/Typography';
import RemoveContainerList from "./RemoveContainerList.js";
import AddContainerList from "./AddContainerList";
import ManifestUpload from "./ManifestUpload.js";
import axios from 'axios';
import LogForm from "./LogForm.js";
import React from "react";
import "../styling/Slots.css"
import Node from "../Balancing/Node"
import BalanceSearch from "../Balancing/BalanceSearch"
import Sift from "../Balancing/Sift"
import Modal from '@mui/material/Modal';
import DownloadLink from "react-download-link";



export default class BalanceShipGrid extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            allContainers: [],
            manifestData: "",
            grid: [],
            data: null,
            row: 0,
            column: 0,
            CELLSIZE: 90,
            clickedContainer: false, 
            showGrid: false,
            isfileUploaded: false,
            manifestName: "",
            isShipBalanced: true, 
            useSift: false,
            downloadReady: false,
            showRoute: false, 
            route: [],
            routeChecked: new Set(),
            open: false,
            openComment: false,
            openLogForm: false,
            manifestDataNew: "",
            comment: "",
            checkBalanceClicked: false,
            showMinutes: false,
            minutes: 0
        }
        this.handleOpen = this.handleOpen.bind(this);
        this.handleOpenComment = this.handleOpenComment.bind(this);
        this.handleCloseComment = this.handleCloseComment.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleOpenLog = this.handleOpenLog.bind(this)
        this.handleCloseLog = this.handleCloseLog.bind(this)
    }

    handleOpenLog(){
        this.setState({openLogForm: true})
    }

    handleCloseLog(){
        this.setState({openLogForm: false})
    }

    

    handleClose(){
        this.setState({open: false})
    }

    handleCloseComment() {
        this.setState({openComment: false})
    }
    handleOpen(){
        console.log(this.state.route)
        this.setState({open: true})
    }

    handleOpenComment() {
        this.setState({openComment: true})
    }


    componentWillMount() {
        localStorage["slots"] = JSON.stringify([])
        localStorage["addContainers"] = JSON.stringify([])
    }

    getRowAndColumnSize(line){
        let dimensions = line.substring(1, 6).split(",")
        return [Number(dimensions[0] - 1), Number(dimensions[1] - 1)]
    }

    populateGridFromCSV() {
        // let csvData = await this.fetchCsv();
        let csvData = this.state.manifestData;
        csvData = csvData.split("\n") 
        let dimensions = this.getRowAndColumnSize(csvData.at(csvData.length - 1))
        console.log("dimensions", dimensions);
        this.setState({row: Number(dimensions[0]) + 1})
        this.setState({column: Number(dimensions[1]) + 1})
        var containerCount = 0;
        var col = 0
        var tmp = []
        csvData.forEach((line) => { 
            line = line.split(", ")
            let containerType = "";
            if(line.length > 3) {
                for(let i = 2; i < line.length - 1; i++)
                    containerType += line[i] + ", "
                containerType += line[line.length - 1]
            }
            else {
                containerType = line[2];
            }
            if(containerType.trim() === "NAN"){
                tmp.push(new NaNSlot(this.getRowAndColumnSize(line[0])))
            }
            else if(containerType.trim() === "UNUSED") {
                tmp.push(new UnusedSlot(this.getRowAndColumnSize(line[0])))
            } 
            else{
                this.setState({allContainers: [...this.state.allContainers,  new ContainerSlot(this.getRowAndColumnSize(line[0]), line[1].substring(1,6), containerType)]})
                tmp.push(new ContainerSlot(this.getRowAndColumnSize(line[0]), line[1].substring(1,6), containerType))
                ++containerCount    
            }          
            col++
            if (col >= this.state.column) {
                col = 0;
                let tmpGrid = this.state.grid
                tmpGrid.push(tmp)
                this.setState({grid: tmpGrid})
                tmp = []
            }
        })
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1)  + "/" 
                + currentdate.getFullYear() + " "  
                + (currentdate.getHours()<10 ? '0' + currentdate.getHours() : currentdate.getHours()) + ":"  
                + (currentdate.getMinutes()<10 ? '0' + currentdate.getMinutes() : currentdate.getMinutes()) + ":" 
                + (currentdate.getSeconds()<10 ? '0' + currentdate.getSeconds() : currentdate.getSeconds())
            var sendData = `${datetime} Manifest ${this.state.manifestName} is opened, there are ${containerCount} containers on the ship\n`
            var manifestInfo = {}
            manifestInfo.logData = sendData        
            axios
                .post('http://localhost:8080/manifestLogWrite', manifestInfo)
                .then((res) => { 
                    if(res.status == 200){
                        // window.location.href="/";
                    }
                })
                .catch(err => {
                    console.error(err);
                    return
            });

        //reversing the grid orientation
        var tmpGrid = this.state.grid
        for (var i = 0; i < tmpGrid.length; i++){
            var tmp = tmpGrid[tmpGrid.length - 1 - i]
            tmpGrid[tmpGrid.length - 1 - i] = tmpGrid[i];
            tmpGrid[i] = tmp;
        }
        this.setState({grid: tmpGrid})
    }

    checkDuplicates(prevContainer, slot){
        for(var i = 0; i < prevContainer.length; i++){
            if(prevContainer[i].column == slot.column && prevContainer[i].row == slot.row){
                return true;
            }
        }
        return false
    }

    addToRemoveContainerList(slot){
        this.setState({clickedContainer: !this.state.clickedContainer})
        var prevContainer = JSON.parse(localStorage["slots"]);
        if(!this.checkDuplicates(prevContainer, slot)){
            prevContainer.push(slot)
            localStorage["slots"] = JSON.stringify(prevContainer);
        }
    }
    
    getPortSideWeight(){
        //left side
        var res = 0;
        for(let container of this.state.allContainers) {
            if(container.column < 7) 
                res += parseInt(container.weight)
        }
        return res;
    }
    getStarboardSideWeight(){
        var res = 0;
        for(let container of this.state.allContainers) {
            if(container.column >= 7) 
                res += parseInt(container.weight)
        }
        return res;
    }

    isBalanced(){
        if(this.state.manifestData == ""){
            alert("Please upload a manifest")
            return
        }
        var leftSide = this.getPortSideWeight()
        var rightSide = this.getStarboardSideWeight()
        // console.log((leftSide == rightSide || (leftSide / rightSide >= 0.9 && leftSide / rightSide <= 1.1)));
        this.setState({isShipBalanced:(leftSide == rightSide || (leftSide / rightSide >= 0.9 && leftSide / rightSide <= 1.1))})
        this.setState({useSift: this.isPossibleToBalance()})
        this.setState({checkBalanceClicked: true})
    }
    
    findMin(arr, n)
    {
        let sum = 0;
        for (let i = 0; i < n; i++)
            sum += arr[i];
    
        let dp = new Array(n + 1);

        for (let i = 0; i <= n; i++) {
            dp[i] = new Array(sum + 1);
            for(let j = 0; j <= sum; j++) {
                
                if(j == 0)
                    dp[i][j] = true;
            }
        }
    
        for (let i = 1; i <= sum; i++)
            dp[0][i] = false;

        for (let i=1; i<=n; i++)
        {
            for (let j=1; j<=sum; j++)
            {
                dp[i][j] = dp[i-1][j];

                if (arr[i-1] <= j)
                    dp[i][j] |= dp[i-1][j-arr[i-1]];
            }
        }

        let diff = Number.MAX_VALUE;
        
        for (let j=Math.floor(sum/2); j>=0; j--)
        {

            if (dp[n][j] == true)
            {
                diff = sum-2*j;
                break;
            }
        }
        return diff;
    }
        
    isPossibleToBalance(){
        let weights = []
        let w = 0;
        for(let container of this.state.allContainers) {
            w += parseInt(container.weight)
            weights.push(parseInt(container.weight))
        }
        let minDiff = this.findMin(weights, weights.length)
        // console.log(minDiff);
        let leftSide = (w / 2) + (minDiff / 2)
        let rightSide = (w / 2) - (minDiff / 2)
        return (leftSide == rightSide || (leftSide / rightSide >= 0.9 && leftSide / rightSide <= 1.1))
    }

    performSift(){
        // console.log(this.state.allContainers)
        // 1. sort the container list by weight
        let sortedList = []
        sortedList = this.state.allContainers.sort((a, b) => parseInt(b.weight) - parseInt(a.weight))
        // console.log(sortedList)
        // console.log(this.state.grid)
        var instructionsList = [] // [{startPos: [1,6], endPos:[1,6]}    ]
        let leftSidePtr = [1, 6]
        let rightSidePtr = [1, 7]
        var startPos, endPos = []
        for(var i = 0; i < sortedList.length; i++){
            startPos = [sortedList[i].row,sortedList[i].column]
            endPos = []
            if(i % 2 == 0) {
                let gridSlot= this.state.grid[leftSidePtr[0] - 1][leftSidePtr[1] - 1]
                while(gridSlot instanceof NaNSlot) {
                    if(leftSidePtr[1] == 1) {
                        leftSidePtr[0]++
                        leftSidePtr[1] = 6
                    }
                    else
                        leftSidePtr[1]--
                    gridSlot= this.state.grid[leftSidePtr[0] -1 ][leftSidePtr[1] - 1]
                }
                endPos = leftSidePtr.slice()
                if(leftSidePtr[1] == 1) {
                    leftSidePtr[0]++
                    leftSidePtr[1] = 6
                }
                else
                    leftSidePtr[1]--
            }
            else {
                let gridSlot= this.state.grid[rightSidePtr[0] - 1][rightSidePtr[1] - 1]
                while(gridSlot instanceof NaNSlot) {
                    if(rightSidePtr[1] == 12) {
                        rightSidePtr[0]++
                        rightSidePtr[1] = 7
                    }
                    else
                        rightSidePtr[1]++
                    gridSlot= this.state.grid[rightSidePtr[0] -1 ][rightSidePtr[1] - 1]
                }
                endPos = rightSidePtr.slice()
                if(rightSidePtr[1] == 12) {
                    rightSidePtr[0]++
                    rightSidePtr[1] = 7
                }
                else
                    rightSidePtr[1]++
            }
            instructionsList.push({"startPos": startPos, "endPos": endPos, "containerName": sortedList[i].name, "grid": this.state.grid, "weight": sortedList[i].weight })
        }
        var siftGrid = this.getEmptySiftGrid(this.state.grid)
        // populate all containers list
        var siftAllContainers = []
        for(var i = 0; i < instructionsList.length; i++) {
            let item = instructionsList[i]
            let newCnt = new ContainerSlot([item.endPos[0] - 1, item.endPos[1] - 1], item.weight, item.containerName)
            siftAllContainers.push(newCnt)
        }
        // loop through instruction list and populate siftGrid
        
        for(var i = 0; i < instructionsList.length; i++){
            let item = instructionsList[i]
            // siftGrid[item.endPos[0]][item.endPos[1]] = {}
            siftGrid[item.endPos[0] - 1][item.endPos[1] - 1] = new ContainerSlot([item.endPos[0] - 1, item.endPos[1] - 1], item.weight, item.containerName)
        }
        let SIFT = new Sift(this.state.grid, siftGrid, this.state.allContainers, siftAllContainers)
        let [top, route] = SIFT.performSiftSearch()
        // top is the goal state, rerender top
        console.log("top", top.grid);
        this.setState({route: route})
        this.setState({grid: top.grid})
        this.setState({downloadReady: true})
        this.setState({showRoute: true})
        this.handleDownload(top.grid)  
        this.setState({minutes: top.cost})
        this.setState({showMinutes: true})
    }

    getEmptySiftGrid(grid){
        var res = []
        for(var i = 0; i < grid.length; i++){
            var temp = []
            for(var j = 0; j < grid[i].length; j++){
                if(grid[i][j] instanceof ContainerSlot){
                    temp.push(Object.assign(new UnusedSlot([i,j])))
                } 
                if(grid[i][j] instanceof NaNSlot){
                    temp.push(Object.assign(new NaNSlot([i,j]), grid[i][j]))
                }
                if(grid[i][j] instanceof UnusedSlot){
                    temp.push(Object.assign(new UnusedSlot([i,j])))
                }
            
            }
            res.push(temp)
        }
        console.log("empty grid", res)
        return res
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

    balanceShip(){
        if(!this.state.useSift){
            this.performSift()
        }  
        else{
            var allShallowContainer = this.getShallowAllContainers(this.state.allContainers)
            var tempGrid = this.getShallowGrid(this.state.grid)
            let balanceSearch = new BalanceSearch(tempGrid, allShallowContainer)
            let [top, route] = balanceSearch.greedySearch()
            console.log(top.grid)
            console.log(route)
            this.setState({route: route})
            this.setState({grid: top.grid})
            this.setState({downloadReady: true})
            this.setState({showRoute: true})
            this.handleDownload(top.grid)
            this.setState({minutes: top.cost})
        }
        this.setState({showMinutes: true})
    }
    
    writeFinishMessageToLog(siftBool){
        let sendData;
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1)  + "/" 
                + currentdate.getFullYear() + " "  
                + (currentdate.getHours()<10 ? '0' + currentdate.getHours() : currentdate.getHours()) + ":"  
                + (currentdate.getMinutes()<10 ? '0' + currentdate.getMinutes() : currentdate.getMinutes()) + ":" 
                + (currentdate.getSeconds()<10 ? '0' + currentdate.getSeconds() : currentdate.getSeconds())
        if (siftBool){
            sendData = {
                "logMessage"  :  datetime + " Finished balancing via SIFT. Manifest " + this.state.manifestName.substring(0, this.state.manifestName.length - 4) + "_OUTBOUND.txt was written to desktop, and a reminder pop-up was shown to the operator to send file to captain." + '\n'
            }
        }
        else {
            sendData = {
                "logMessage"  :  datetime + " Finished balancing. Manifest " + this.state.manifestName.substring(0, this.state.manifestName.length - 4) + "_OUTBOUND.txt was written to desktop, and a reminder pop-up was shown to the operator to send file to captain." + '\n'
            }
        }

        axios
            .post('http://localhost:8080/CycleLog', sendData)
            .then((res) => { 
                if(res.status == 200){
                    // window.location.href="/";
                }
            })
            .catch(err => {
                console.error(err);
                return
        });
    }
    
    getColumnNumber(column){
        if(column < 10){
            return "0" + column
        }
        else{
            return column
        }
    }

    getContainerType(container){
        if(container instanceof NaNSlot){
            return "NAN"
        }
        else if(container instanceof UnusedSlot){
            return "UNUSED"
        }
        else{
            return container.name
        }
    }

    getWeight(weight){
        if(weight == undefined){
            return "00000"
        }
        else{
            return weight
        }
    }

    handleDownload(grid){
        var res = ""
        for(var i = 0; i < grid.length; i++) {
            for(var j = 0;  j < grid[0].length; j++) {
                res += "[" +  "0" + (grid[i][j].row + 1).toString() + "," + this.getColumnNumber(grid[i][j].column + 1) +
                "], {" + this.getWeight(grid[i][j].weight)+ "}, " + this.getContainerType(grid[i][j]) + "\n"
            }
        }

        var jsonData = {
            manifestDataNew: res,
            manifestName: this.state.manifestName,
        }
        this.setState({manifestDataNew: res})
 
    }

    showInstruction(){
        this.handleOpen()
    }

    handleChange(instruction, idx, event){
        // if it has crane, return
        this.setState({routeChecked:
            this.state.routeChecked.add(idx)
        })
        console.log(instruction)
        if(instruction.includes("crane")) return;
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1)  + "/" 
                + currentdate.getFullYear() + " "  
                + (currentdate.getHours()<10 ? '0' + currentdate.getHours() : currentdate.getHours()) + ":"  
                + (currentdate.getMinutes()<10 ? '0' + currentdate.getMinutes() : currentdate.getMinutes()) + ":" 
                + (currentdate.getSeconds()<10 ? '0' + currentdate.getSeconds() : currentdate.getSeconds())
        
        instruction = instruction.replace("Move", "Moved")
        instruction = instruction.replace("\r", "") 
        let jsonObj = {
            "instruction" : datetime + " " + instruction + '\n',
        }
        axios.post('http://localhost:8080/writeInstruction', jsonObj)
        .then((res) => { 
            if(res.status == 200){
                console.log("success");
            }
        })
        .catch(err => {
            console.error(err);
            return
        });
            console.log(instruction)
    }

    finishManifest(){
        // console.log(!this.state.useSift)
        this.writeFinishMessageToLog(!this.state.useSift)
        this.handleClose()
        alert("Don't forget to email the manifest back to the captain")
    }
        submitComment(){
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1)  + "/" 
                + currentdate.getFullYear() + " "  
                + (currentdate.getHours()<10 ? '0' + currentdate.getHours() : currentdate.getHours()) + ":"  
                + (currentdate.getMinutes()<10 ? '0' + currentdate.getMinutes() : currentdate.getMinutes()) + ":" 
                + (currentdate.getSeconds()<10 ? '0' + currentdate.getSeconds() : currentdate.getSeconds())

        let sendData = {
            "logMessage" : datetime + " " + this.state.comment + '\n'
        }
        this.setState({comment: ""})
        this.handleCloseComment()
        
        axios.post('http://localhost:8080/CycleLog', sendData)
        .then((res) => { 
            if(res.status == 200){
                console.log("success");
            }
        })
        .catch(err => {
            console.error(err);
            return
        });
        alert("Your comment has been logged")
        
    }

    getComment(event){
        console.log(event.target.value);
        this.setState({comment: event.target.value })
    }

    render() {
        return(
        <div className="maingrid">  
        {this.state.showMinutes ?  
        <div className="TimerLayout" style={{
            "top": "30px", 
            "position": "absolute", 
            "left": "10px" 
            }} >
        <div >Estimated Time</div>
        <div>{this.state.minutes + " minutes"}</div> 
        </div>
        : null}
       
        <Modal 
            open={this.state.openComment}
            onClose={this.handleCloseComment}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            style={{
                background: "rgba(240, 248, 255, 0.9)",
                overlay: {
                    marginBottom: "500px",
                }
            }} 
        >
            <div className="logComment">
                    <input style={{"height":40, "width":300, "font-size": 16}} type="text" value={this.state.comment} onChange={event => this.getComment(event)} />
                    <button style={{"display":"block"}} className="ButtonLayout" onClick={() => this.submitComment()}>Comment</button>
            </div>
        </Modal>


        <Modal
            open={this.state.open}
            onClose={this.handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
             style={{
                background: "rgba(240, 248, 255, 0.9)",
                overlay: {
                    marginBottom: "700px"
                }
            }}
        >
            <div style ={{display: "flex"}}>
                <div className="instructionsList">{this.state.route.map((instruction, idx) => {
                    return <div className="instructions">
                            <input type="radio" id={idx} checked={this.state.routeChecked.has(idx)} onChange={(event) => {this.handleChange(instruction, idx, event)}}/>
                            <label > {instruction}</label>
                        </div>
                    })}
                </div>
                <div>
                     {this.state.route.length === this.state.routeChecked.size? 
                     <DownloadLink
                className="downloadButton ButtonLayout"
                style={{
                    "color":"white",
                    "text-decoration":"none",
                    "height": "18px"
                }}
                label="Save And Download"
                filename= {this.state.manifestName.substring(0, this.state.manifestName.length - 4) + "_OUTBOUND.txt"}
                exportFile={() => 
                    {
                    this.finishManifest()
                    window.location.reload(false);
                    return this.state.manifestDataNew
                    }
                }
                    />
                    : null}
                    <button className="ButtonLayout" style={{position:"absolute", top:"900px", right:"1060px"}} onClick={() => this.handleClose()}>Close</button>
                </div>
            </div>
        </Modal>    

        <ManifestUpload sendManifestData={(logData, manifestFileName) => {
            console.log("testing")
                localStorage.clear()
                localStorage["slots"] = JSON.stringify([])
                localStorage["addContainers"] = JSON.stringify([])
                this.setState({isfileUploaded: true})
                this.setState({manifestData: logData})
                this.populateGridFromCSV(this.state.manifestName)
                this.forceUpdate()
        }}
        sendManifestName={(manifestFileName) =>{
                this.setState({manifestName: manifestFileName})
        }}
        />
        
         { this.state.isfileUploaded ?
            this.state.grid.map(rowOfSlots => 
                rowOfSlots.map(slot => {
                    if(slot instanceof  NaNSlot){
                        return (
                            <div  className="NaNSlot" style={{
                                left: `${this.state.CELLSIZE * slot.column + 160}px`,
                                top: `${this.state.CELLSIZE * (7 - slot.row) + 20}px`,
                                width: `${this.state.CELLSIZE - 1}px`,
                                height: `${this.state.CELLSIZE - 1}px`,
                                }} key={(slot.row) * 12 + (slot.column)} id={(slot.row) * 12 + (slot.column)}>NAN
                            </div>
                        )
                    }
                    else if(slot instanceof UnusedSlot){
                        return(
                            <div  className="UnusedSlot" style={{
                                left: `${this.state.CELLSIZE * slot.column + 160}px`,
                                top: `${this.state.CELLSIZE * (7 - slot.row) + 20}px`,
                                width: `${this.state.CELLSIZE - 1}px`,
                                height: `${this.state.CELLSIZE - 1}px`,
                                }} key={(slot.row) * 12 + (slot.column)} id={(slot.row) * 12 + (slot.column)}> UNUSED
                            </div>
                        )       
                    }
                    else{
                        return(
                           <ToolTip title={<Typography fontSize={20}>{slot.name}</Typography>}>
                                <div
                                        className="ContainerSlot" style={{
                                        left: `${this.state.CELLSIZE * slot.column + 160}px`,
                                        top: `${this.state.CELLSIZE * (7 - slot.row) + 20}px`,
                                        width: `${this.state.CELLSIZE - 1}px`,
                                        height: `${this.state.CELLSIZE - 1}px`,
                                        }} key={(slot.row) * 12 + (slot.column)} id={(slot.row) * 12 + (slot.column)}> {slot.name}
                                </div>
                            </ToolTip>
                        )
                    }
                })
            ) : null
        } 

        <button onClick={() => this.handleOpenLog()} className="logform ButtonLayout" type="button">Log Form</button>
        <button onClick={() => {this.handleOpenComment()}} className="commentOperator ButtonLayout"> Operator Comment</button>
        {this.state.showRoute ? <button onClick={() => {this.showInstruction()}} className="showInstructionButton ButtonLayout">Show Instructions</button>: null}
         {/* <button className="performAlgorithm ButtonLayout" onClick={() => {
            this.isBalanced()
        }}>Check Balance</button>
        } */}

        {!this.state.checkBalanceClicked? <button className="performAlgorithm ButtonLayout" onClick={() => {
            this.isBalanced()
        }}>Check Balance</button> : 
        <button onClick={() => {this.balanceShip()}} className="balanceButton ButtonLayout">{!this.state.useSift ? "SIFT" : "Balance Ship"}</button> }
        <Link to="/">
            <button className="onLoadPage ButtonLayout">Onload/Offload Page</button>
        </Link>
        <div className="logform">            
            <Modal 
            open={this.state.openLogForm}
            onClose={this.handleCloseLog}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
            style={
                {
                background: "rgba(240, 248, 255, 0.9)",
                overlay: {
                    marginTop: "500px",
                }
            }}
            >
                <div className="logComment">
                <LogForm/>
                </div>
            </Modal>
            
        </div>
    </div>
        );
    }
}