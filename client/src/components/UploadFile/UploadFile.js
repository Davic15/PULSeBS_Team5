import React from "react";
import "./UploadFile.css";


import 'bootstrap/dist/css/bootstrap.min.css';

export default function UploadFile() {
  return(
    <div className="container">
        <div className="col-md-8 col-md-offset-2">
            <form method="POST" action="#">
                <div className="form-group text-center">
                    <h3>Upload File(s)</h3>
		            <div className="input-group input-file" name="Fichier1">
			            <span className="input-group-btn">
        		            <button className="btn btn-info btn-choose" type="button">Choose</button>
    		            </span>
    		            <input type="text" className="form-control" placeholder='Choose a file...' />
    		            <span className="input-group-btn">
       			            <button className="btn btn-primary btn-reset" type="button">Submit</button>
    		            </span>
		            </div>
	            </div>
            </form>
        </div>
    </div>
  );
}