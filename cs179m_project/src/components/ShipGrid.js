import Slot from "../model/Slot.js"
import ContainerSlot from "./NaNSlot"
import NaNSlot from "./NaNSlot.js"
import React from "react";
import Papa from 'papaparse';





export default class ShipGrid extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            grid: [],
            data: null,
            row: 0,
            column: 0
        }
        this.getData = this.getData.bind(this);
    }

    componentWillMount() {
        this.getCsvData();
    }


    getData(result) {
        this.setState({data: result.data});
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

    async getCsvData() {
        let csvData = await this.fetchCsv();

        csvData = csvData.split("\n")
        csvData.forEach((line, index) => {
            line = line.split(", ")
            let containerType = line[2];
            if(containerType == "NAN"){
                // this.state.grid.push(new NaNSlot(line.split(", ")[0], line.split(", ")[1]))
            }
            if(index == csvData.length -1){
                let dimensions = line[0].substring(1, line[0].length - 1).split(",")
                this.setState({row: Number(dimensions[0]) })
                 this.setState({column: Number(dimensions[1]) })
            }

            // this.state.data.push(line.split(", "))
        })
        // console.log(csvData)
        // console.log(csvData.split(", "))

    }
    
    render() {
        return(
        <div> {this.state.row} 
                    {this.state.column}
         </div>
        );
    }
}