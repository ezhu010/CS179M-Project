import React from "react";
 

export default class Slot extends React.Component {
    constructor(dimensions){
        super();
        this.row = dimensions[0]
        this.column = dimensions[1]
    }
}
