import Slot from "../model/Slot.js"
import ContainerSlot from "./NaNSlot"
import NaNSlot from "./NaNSlot.js"
import React from "react";

export default class ShipGrid extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            grid: [],
            data: null,
            row: 0,
            column: 0
        }
        this.createGrid = this.createGrid.bind(this);
    }

    componentWillMount() {
        this.getCsvData()
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

    async getCsvData() {
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

    createGrid(){
        // await this.getCsvData();
        // var htmlTemp =  "" 
        // var count = 0
        // this.state.grid.forEach(rowOfSlots =>{
        //     rowOfSlots.forEach(slot =>{
        //         if(slot instanceof NaNSlot){
        //             htmlTemp += "<h1>Test</h1>"
        //         }
        //     })
        // })
        return (
            <h1>Test</h1>
        )
    }
    
    render() {
        return(
        <div> 
            {
                console.log(this.state.grid)
            }
         </div>
        );
    }
}