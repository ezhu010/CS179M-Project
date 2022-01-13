import Slot from "../model/Slot.js"
import NaNSlot from "./NaNSlot.js"
import UnusedSlot from "./UnusedSlot"
import ContainerSlot from "./ContainerSlot"

// import  from "./NaNSlot.js"

import React from "react";
import "../styling/Slots.css"

export default class ShipGrid extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            grid: [],
            data: null,
            row: 0,
            column: 0,
            CELLSIZE: 95
        }
    }

    componentWillMount() {
        this.populateGridFromCSV()
        // this.createGrid()
    }

    fetchCsv() {
        return fetch('/data/manifest.txt').then(function (response) {
            let reader = response.body.getReader();
            let decoder = new TextDecoder('utf-8');
            return reader.read().then(function (result) {
                return decoder.decode(result.value);
            });
        });
    }

    getRowAndColumnSize(line){
        let dimensions = line.substring(1, 6).split(",")
        return [Number(dimensions[0]), Number(dimensions[1])]
    }

    async populateGridFromCSV() {
        let csvData = await this.fetchCsv();

        csvData = csvData.split("\n") 
        
        let dimensions = this.getRowAndColumnSize(csvData.at(csvData.length - 1))
        this.setState({row: Number(dimensions[0]) })
        this.setState({column: Number(dimensions[1]) })

        var col = 0
        var tmp = []
        csvData.forEach((line) => { 
            line = line.split(", ")
            let containerType = line[2];
            if(containerType == "NAN"){
                tmp.push(new NaNSlot(this.getRowAndColumnSize(line[0])))
            }
            else if(containerType == "UNUSED") {
                tmp.push(new UnusedSlot(this.getRowAndColumnSize(line[0])))
            } 
            else{
                tmp.push(new ContainerSlot(this.getRowAndColumnSize(line[0]), line[1].substring(1,6), line[2]))
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
    }

    
    render() {
        return(
        <div className="grid"> {   
            this.state.grid.map(rowOfSlots => 
                rowOfSlots.map(slot => {
                    if(slot instanceof  NaNSlot){
                        return (
                            <div  className="NaNSlot" style={{
                                left: `${this.state.CELLSIZE * slot.column + 1}px`,
                                top: `${this.state.CELLSIZE * slot.row + 1}px`,
                                width: `${this.state.CELLSIZE - 1}px`,
                                height: `${this.state.CELLSIZE - 1}px`,
                                }}>
                                    NAN
                            </div>
                        )
                    }
                    else if(slot instanceof UnusedSlot){
                        return(
                            <div  className="ContainerSlot" style={{
                                left: `${this.state.CELLSIZE * slot.column + 1}px`,
                                top: `${this.state.CELLSIZE * slot.row + 1}px`,
                                width: `${this.state.CELLSIZE - 1}px`,
                                height: `${this.state.CELLSIZE - 1}px`,
                                }}>
                                    UNUSED
                            </div>
                        )       
                    }
                    else{
                        return(
                            <div  className="ContainerSlot" style={{
                                    left: `${this.state.CELLSIZE * slot.column + 1}px`,
                                    top: `${this.state.CELLSIZE * slot.row + 1}px`,
                                    width: `${this.state.CELLSIZE - 1}px`,
                                    height: `${this.state.CELLSIZE - 1}px`,
                                    }}>
                                        {slot.name}
                            </div>
                        )
                    }
                })
            )
        } </div>
        );
    }
}