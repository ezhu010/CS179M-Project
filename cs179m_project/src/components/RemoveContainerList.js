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
import DeleteIcon from '@mui/icons-material/Delete';
import {TiDelete} from 'react-icons/ti'
import { FixedSizeList } from "react-window";

const Demo = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));

const Row = ({index, style}) => {
    //     <ListItem key={index} component="div" disablePadding>
  //     {/* <ListItemText component="div">{item.value}</ListItemText> */}
  //     </ListItem>
}


class RemoveContainerList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      listItems:  [{value: "item1"}, {value: "item2"},{value: "item3"}], 
      // listItemsCount: 4,
      listItemsSize: 80
    }
    this.deleteContainer = this.deleteContainer.bind(this);
    this.Row = this.Row.bind(this);
  }

  deleteContainer(indexContainer) {
    console.log(indexContainer);
    var temp = this.state.listItems.filter((item, index) => {
      return index != indexContainer
    })
    console.log(temp)
    this.setState( {listItems: [...temp]})
    this.forceUpdate()
    console.log(this.state.listItems);
  }

  Row ({index, style}) {
    return(

        <ListItem key={index} component="div" disablePadding>
              <ListItemButton>
      <ListItemText component="div">{this.state.listItems[index].value}</ListItemText>
      <TiDelete onClick={() => this.deleteContainer(index)}/>
           </ListItemButton>
      </ListItem>

    )
  }

    render() {
        return (
             <Box className="removeContainerList"sx={{ flexGrow: 1, maxWidth: 700 }}>
        <Grid item xs={12} md={6}>
          <Typography sx={{ mt: 4, mb: 2 }}  padding="10px" width="200px" variant="h8" component="div">
            Remove Container List
          </Typography>
          <List>
              <Demo>
            <FixedSizeList 
                height={this.state.listItems.length * this.state.listItemsSize}
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