import React, { Component } from 'react';
import "../styling/RemoveContainerList.css"
import { styled } from '@mui/material/styles';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';


function generate(element) {
  return [0, 1, 2].map((value) =>
    React.cloneElement(element, {
      key: value,
    }),
  );
}



const Demo = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));


class RemoveContainerList extends Component {
    render() {
        return (
             <Box className="removeContainerList"sx={{ flexGrow: 1, maxWidth: 752 }}>
        <Grid item xs={12} md={6}>
          <Typography sx={{ mt: 4, mb: 2 }}  padding="10px" width="200px" variant="h8" component="div">
            Remove Container List
          </Typography>
          <List>
              <Demo>
            <List>
              {generate(
                <ListItem>
                  <ListItemText
                    primary="Single-line item"
                  />
                </ListItem>,
              )}
            </List>
          </Demo>
            </List>
        </Grid>
             </Box>
        );
    }
}

export default RemoveContainerList;
