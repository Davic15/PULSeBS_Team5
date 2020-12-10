import React from "react";
import "./UpdateBooking.css";

import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

export default function UpdateBooking() {
  return(
    <div class="container center-button">
        <h3>Active/Suspend Courses</h3>
        <div class="row">
            <div class="col-12">
                <table class="table table-bordered">
                    <thead>
                        <tr>
                            <th scope="col">Active/Suspend Course</th>
                            <th scope="col">Year/Semester</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="customCheck1" checked/>
                                <label class="custom-control-label" for="customCheck1">Active</label>
                            </div>
                            </td>
                            <td>Year 1</td>
                            <td>Active</td>
                        </tr>
                        <tr>
                            <td>
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="customCheck2"/>
                                <label class="custom-control-label" for="customCheck2">Suspended</label>
                            </div>
                            </td>
                            <td>Year 2</td>
                            <td>Suspended</td>
                        </tr>
                        <tr>
                            <td>
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input" id="customCheck3"/>
                                <label class="custom-control-label" for="customCheck3">Suspended</label>
                            </div>
                            </td>
                            <td>Year 3</td>
                            <td>Suspended</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <Button variant="primary">Modify</Button>
    </div>
  );
}
