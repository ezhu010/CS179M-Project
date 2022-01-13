import Slot from "../model/Slot.js"

export default class ContainerSlot extends Slot {

    constructor(dimensions, itemNumber, name){
        super(dimensions)
        this.itemNumber = itemNumber
        this.name = name
    }
}