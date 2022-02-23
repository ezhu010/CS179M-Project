import Slot from "../model/Slot.js"

export default class ContainerSlot extends Slot {

    constructor(dimensions, weight, name){
        super(dimensions)
        this.weight = weight
        this.name = name
    }
}