import React, { Component } from 'react';
import "../styling/RemoveContainerList.css"
import { styled } from '@mui/material/styles';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
// import DeleteIcon from '@mui/icons-material/Delete';
import {TiDelete} from 'react-icons/ti'
import { FixedSizeList } from "react-window";

const Demo = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

class RemoveContainerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listItems:  JSON.parse(localStorage["slots"]), 
      listItemsSize: 80
    }
    this.deleteContainer = this.deleteContainer.bind(this);
    this.Row = this.Row.bind(this);
  }

componentWillReceiveProps(props) {
  // const { clickedContainer, isfileUploaded } = this.props;
  this.setState({listItems: JSON.parse(localStorage["slots"])})
  // console.log("HERE ------")
  // if (props.clickedContainer !== clickedContainer) {
  //      this.setState({listItems: JSON.parse(localStorage["slots"])})
  // }
  //   if (props.isfileUploaded !== isfileUploaded) {
  //     console.log("testing")
  //      this.setState({listItems: JSON.parse(localStorage["slots"])})
  // }
}

  deleteContainer(indexContainer) {
    var prevContainer = JSON.parse(localStorage["slots"])
    var newContainer = prevContainer.filter((container, index) => {
        return index != indexContainer
    })

    localStorage["slots"] = JSON.stringify(newContainer)
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
      <ListItemText onClick={() => this.test()}component="div">{this.state.listItems[index].name}</ListItemText>
      <TiDelete onClick={() => this.deleteContainer(index)}/>
           </ListItemButton>
      </ListItem>

    )
  }

    render() {
        return (
      <Box className="removeContainerList" sx={{ flexGrow: 1, maxWidth: 800 }}>
        <Grid item xs={12} md={6}>
          <Typography sx={{ mt: 4, mb: 2 }}  padding="10px" width="200px" variant="h8" component="div">
            Remove Container List
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
        );
    }
}

export default RemoveContainerList;