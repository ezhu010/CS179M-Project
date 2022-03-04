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
// import  from "./NaNSlot.js"
import TransferSearch from "../Transfer/TransferSearch.js";

import React from "react";
import "../styling/Slots.css"

export default class ShipGrid extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            manifestData: "",
            grid: [],
            data: null,
            row: 0,
            column: 0,
            CELLSIZE: 95,
            clickedContainer: false, 
            showGrid: false,
            isfileUploaded: false,
            manifestName: "",
            allContainers: [],
        }
    }

    componentWillMount() {
        localStorage["slots"] = JSON.stringify([])
        localStorage["addContainers"] = JSON.stringify([])
    }


    getRowAndColumnSize(line){
        let dimensions = line.substring(1, 6).split(",")
        return [Number(dimensions[0]), Number(dimensions[1])]
    }

    populateGridFromCSV() {
        // let csvData = await this.fetchCsv();
        let csvData = this.state.manifestData;
        csvData = csvData.split("\n") 
        let dimensions = this.getRowAndColumnSize(csvData.at(csvData.length - 1))
        this.setState({row: Number(dimensions[0]) })
        this.setState({column: Number(dimensions[1]) })
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
            var sendData = `Manifest ${this.state.manifestName} is opened, there are ${containerCount} containers on the ship\n`
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
    performTransfer(){
        var offLoadContainers = this.getShallowAllContainers(localStorage.getItem("slots"))
        var onLoadContainers = [] //this.getShallowAllContainers(localStorage.getItem("addContainer"))
        var tempGrid = this.getShallowGrid(this.state.grid)
        var tempAllContainers = this.getShallowAllContainers(this.state.allContainers)
        let transferSearch = new TransferSearch(tempGrid, tempAllContainers, offLoadContainers, onLoadContainers)
        transferSearch.greedySearch();
        console.log("testing")
    }

    render() {
        return(
        <div className="maingrid">  

        <ManifestUpload sendManifestData={(logData, manifestFileName) => {
                console.log("file finished")
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
        
         {   this.state.isfileUploaded ?
            this.state.grid.map(rowOfSlots => 
                rowOfSlots.map(slot => {
                    if(slot instanceof  NaNSlot){
                        return (
                            <div  className="NaNSlot" style={{
                                left: `${this.state.CELLSIZE * slot.column + 1}px`,
                                top: `${this.state.CELLSIZE * (8 - slot.row) + 1}px`,
                                width: `${this.state.CELLSIZE - 1}px`,
                                height: `${this.state.CELLSIZE - 1}px`,
                                }} key={(slot.row - 1) * 12 + (slot.column - 1)} id={(slot.row - 1) * 12 + (slot.column - 1)}>NAN
                            </div>
                        )
                    }
                    else if(slot instanceof UnusedSlot){
                        return(
                            <div  className="UnusedSlot" style={{
                                left: `${this.state.CELLSIZE * slot.column + 1}px`,
                                top: `${this.state.CELLSIZE * (8 - slot.row) + 1}px`,
                                width: `${this.state.CELLSIZE - 1}px`,
                                height: `${this.state.CELLSIZE - 1}px`,
                                }} key={(slot.row - 1) * 12 + (slot.column - 1)} id={(slot.row - 1) * 12 + (slot.column - 1)}> UNUSED
                            </div>
                        )       
                    }
                    else{
                        return(
                           <ToolTip title={<Typography fontSize={20}>{slot.name}</Typography>}>
                                <div  onClick={() => this.addToRemoveContainerList(slot)}
                                        className="ContainerSlot" style={{
                                        left: `${this.state.CELLSIZE * slot.column + 1}px`,
                                        top: `${this.state.CELLSIZE * (8 - slot.row) + 1}px`,
                                        width: `${this.state.CELLSIZE - 1}px`,
                                        height: `${this.state.CELLSIZE - 1}px`,
                                        }} key={(slot.row - 1) * 12 + (slot.column - 1)} id={(slot.row - 1) * 12 + (slot.column - 1)}> {slot.name}
                                </div>
                            </ToolTip>
                        )
                    }
                })
            ) : null
        } 
        
        <RemoveContainerList clickedContainer={this.state.clickedContainer} isfileUploaded={this.state.isfileUploaded}/>
        <AddContainerList isfileUploaded={this.state.isfileUploaded}/>
        <button className="performAlgorithm" onClick={() => {
            this.performTransfer()
        }}>Perform Offload/Onload</button>
        <Link to="/balanceShip">
         <button className="balance">Balancing</button>
    </Link>
       
        <div className="logform">            
            <Link to="/logform">
                <button type="button">Log Form</button>
            </Link>
            <Outlet />
        </div>
    </div>
        );
    }
}