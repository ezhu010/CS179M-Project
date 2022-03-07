import axios from 'axios';
import Redirect from 'react-router-dom'

const LogForm = () => {
    let handleClockIn = (event) =>{
          event.preventDefault()
        var name = event.target.name.value
        // var clockStatus = event.target.clockStatus.value
        var currentdate = new Date();
        var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1)  + "/" 
                + currentdate.getFullYear() + " "  
                + (currentdate.getHours()<10 ? '0' + currentdate.getHours() : currentdate.getHours()) + ":"  
                + (currentdate.getMinutes()<10 ? '0' + currentdate.getMinutes() : currentdate.getMinutes()) + ":" 
                + (currentdate.getSeconds()<10 ? '0' + currentdate.getSeconds() : currentdate.getSeconds())
                +  " " + name + " " + "Clocked In"  
        var sendData = {
            "datetime"  :  datetime + '\n'
        }
        axios
            .post('http://localhost:8080/post', sendData)
            .then((res) => { 
                if(res.status == 200){
                    window.location.href="/";
                }
            })
            .catch(err => {
                console.error(err);
                return
        });
    }

  return (
    <div> 
        <form action="" method="post"  onSubmit={handleClockIn}>
            <label>
                Name:
                <input type="text" name="name" required />
            </label>
            <input type="Submit" value="Clock In" />
        </form>
    </div> 
    );
};

export default LogForm; 