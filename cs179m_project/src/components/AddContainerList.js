import React, { Component } from 'react';
import "../styling/AddContainerList.css"
import { styled } from '@mui/material/styles';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import {TiDelete} from 'react-icons/ti'
import { FixedSizeList } from "react-window";
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import { MaterialUIFormSubmit } from './MaterialUIFormSubmit';

const Demo = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

class AddContainerList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            listItems: JSON.parse(localStorage["addContainers"]), 
            listItemsSize: 80,
            open: false, 
        }
        this.handleOpen = this.handleOpen.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.addContainer = this.addContainer.bind(this);
        this.Row = this.Row.bind(this);
    }

    addContainer(){
        
    }

    addButtonPressed(){
        console.log("testing")
    }

    deleteContainer(indexContainer){
        var prevContainer = JSON.parse(localStorage["addContainers"])
        var newContainer = prevContainer.filter((container, index) => {
            return index != indexContainer
        })
        localStorage["addContainers"] = JSON.stringify(newContainer)
        var temp = this.state.listItems.filter((item, index) => {
            return index != indexContainer
        })
        this.setState( {listItems: [...temp]})
        this.forceUpdate()
    }

    Row ({index, style}) {
        return(
            <ListItem key={index} component="div" style={style} disablePadding>
                <ListItemButton>
                    <ListItemText component="div">{this.state.listItems[index].name}</ListItemText>
                     <TiDelete onClick={() => this.deleteContainer(index)}/>
                </ListItemButton>
            </ListItem>
        )
    }

    handleOpen(){
        this.setState({open: true})
    }

    handleClose(){
        this.setState({ listItems: JSON.parse(localStorage.getItem("addContainers"))})
        this.setState({open: false})
    }

    render(){
        return (
            <div>
                <Modal
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                   <MaterialUIFormSubmit
                        formName="Add Container Form"
                        formDescription="This form is for adding containers. The inputs are name and weight of the container."
                    />
                </Modal>
                <Box className="addContainerList" sx={{ flexGrow: 1, maxWidth: 800 }}>
                    <Grid item xs={12} md={6}>
                        <Typography sx={{ mt: 4, mb: 2 }}  padding="10px" width="200px" variant="h8" component="div">
                            Add Container List
                        </Typography>
                        <List>
                            <Demo>
                                <FixedSizeList 
                                    height={300}
                                    width={360}
                                    itemSize={this.state.listItemsSize}
                                    itemCount={this.state.listItems.length}
                                    overscanCount={5}>
                                    {this.Row}
                                </FixedSizeList>
                            </Demo>
                        </List>
                    </Grid>
                </Box>
                <Button className="addContainerButton" onClick={()=>{this.handleOpen()}}>Test</Button>
            </div>
        )
    }
}

export default AddContainerList;