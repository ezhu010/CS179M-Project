import axios from 'axios';
 
import React,{Component} from 'react';
 
export default class ManifestUpload extends Component {
      constructor(props) {
        super(props);
        this.state = {
        selectedFile: null
      };
}
    
    // On file select (from the pop up)
    onFileChange = event => {
        event.preventDefault()
      // Update the state
      this.setState({ selectedFile: event.target.files[0] });
    };
    
    // On file upload (click the upload button)
    onFileUpload = (event) => {
    event.preventDefault()
    console.log(event)
      const formData = new FormData();
    //   formData.append(
    //     "myFile",
    //     this.state.selectedFile,
    //     this.state.selectedFile.name
    //   );
      console.log(this.state.selectedFile);
      console.log(formData)
      axios.post("http://localhost:8080/uploadfile", this.state.selectedFile).then((res) => { 
            if(res.status == 200){
                this.props.checkUpload()
            }
      })
            .catch(err => {
                console.error(err);
                return
        });
    };
    
    // File content to be displayed after
    // file upload is complete
    fileData = () => {
        if (this.state.selectedFile) {
         
            return (
                <div>
                    <h2>File Details:</h2>
                    <p>File Name: {this.state.selectedFile.name}</p>
                    <p>File Type: {this.state.selectedFile.type}</p>

                    <p>
                        Last Modified:{" "}
                        {this.state.selectedFile.lastModifiedDate.toDateString()}
                    </p>  
                </div>
            ); 

        } 
        else {
            return (
                <div>
                    <br/>
                    <h4>Choose before Pressing the Upload button</h4>
                </div>
            );
        }
    };
    
    render() {
      return (
        <div>
            <h1>
              GeeksforGeeks
            </h1>
            <h3>
              File Upload using React!
            </h3>
            <div>
                <form action="" method="post" onSubmit={this.onFileUpload}>
                <input type="file" onChange={this.onFileChange} />
                <input type="submit" value="Upload" />
                </form>
            </div>
          {this.fileData()}
        </div>
      );
    }
}