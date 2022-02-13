import React, { useReducer } from "react";
import { Button, Icon, TextField, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

export function MaterialUIFormSubmit(props) {
  const useStyles = makeStyles((theme) => ({
    button: {
      margin: theme.spacing(1)
    },
    leftIcon: {
      marginRight: theme.spacing(1)
    },
    rightIcon: {
      marginLeft: theme.spacing(1)
    },
    iconSmall: {
      fontSize: 20
    },
    root: {
      padding: theme.spacing(3, 2)
    },
    container: {
      display: "flex",
      flexWrap: "wrap"
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      width: 400
    }
  }));

  const [formInput, setFormInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    {
      name: "",
      weight: "00000",
    }
  );

  const handleSubmit = (evt) => {
    evt.preventDefault();
    let data = { formInput }
    var container = {}
    container.name = data.formInput.name
    container.weight = data.formInput.weight
    var prevContainer = JSON.parse(localStorage.getItem("addContainers"))
    prevContainer.push(container)
    localStorage.setItem("addContainers", JSON.stringify(prevContainer))
  };

  const handleInput = (evt) => {
    const name = evt.target.name;
    const newValue = evt.target.value;
    console.log(newValue)
    setFormInput({ [name]: newValue });
  };

  const classes = useStyles();

  return (
    <div>
      <Paper className={classes.root}>
        <Typography variant="h5" component="h3">
          {props.formName}
        </Typography>
        <Typography component="p">{props.formDescription}</Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label="Container Name"
            id="margin-normal"
            name="name"
            defaultValue={formInput.name}
            className={classes.textField}
            onChange={handleInput}
          />
          <TextField
            label="Weight"
            id="margin-normal"
            name="weight"
            defaultValue={formInput.weight}
            className={classes.textField}
            onChange={handleInput}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className={classes.button}
          >
            Add Container
          </Button>
        </form>
      </Paper>
    </div>
  );
}
