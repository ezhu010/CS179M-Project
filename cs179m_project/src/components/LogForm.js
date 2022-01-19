import axios from 'axios';
import Redirect from 'react-router-dom'

const LogForm = () => {

    let handleClockIn = (event) =>{
        event.preventDefault()
        var name = event.target.name.value
        var clockStatus = event.target.clockStatus.value
        var currentdate = new Date();
        var datetime = name + " " + clockStatus  +  " at " + currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1)  + "/" 
                + currentdate.getFullYear() + " @ "  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
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
        <form action="../../post" method="post"  onSubmit={handleClockIn}>
            <label>
                Name:
                <input type="text" name="name" required />
            </label>
             <select required name="clockStatus">
                <option value="" selected disabled hidden>Choose here</option>
                <option>Clock In</option>
                <option>Clock Out</option>
            </select>
            <input type="submit" value="Submit" />
        </form>
    </div> 
    );
};

export default LogForm; 