import axios from 'axios';
 
import React,{Component} from 'react';
 
export default class ManifestUpload extends Component {
      constructor(props) {
        super(props);
        this.state = {
        selectedFile: null
      };
}

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
}
    
    // On file select (from the pop up)
    onFileChange = event => {
      event.preventDefault()
      console.log(event.target.files[0].name)
      this.props.sendManifestName(event.target.files[0].name)
      this.getBase64(event.target.files[0]).then(
          data => {
            this.props.sendManifestData(atob(data.substr(23), ""))
          }
        );
    };
    
    // On file upload (click the upload button)
    onFileUpload = (event) => {
    event.preventDefault()
    console.log(event)
      const formData = new FormData();
     
      console.log(JSON.stringify(this.state.selectedFile));
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
    
    render() {
      return (
            <div>
                <input className="manifestupload" type="file" onChange={this.onFileChange}/>
            </div>
      );
    }
}