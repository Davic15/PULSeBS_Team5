import React from "react";
import "./styles.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
    return (
    <main class="container pt-5">        
    <h2>List of students</h2>    
        <table class="table table-bordered table-definition mb-5">
            <thead class="">
                <tr>
                    <th>Student ID</th>
                    <th>Surnames</th>
                    <th>Names</th>
                    <th>Absent/Present</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>001</td>
                    <td>Macias</td>
                    <td>Franklin</td>
                    <td>
                        <label class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input"/>
                            <span class="custom-control-indicator"></span>
                        </label>
                    </td>
                </tr>
                <tr>
                    <td>002</td>
                    <td>Avellan</td>
                    <td>David</td>
                    <td>
                        <label class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input"/>
                            <span class="custom-control-indicator"></span>
                        </label>
                    </td>
                </tr>
                <tr>
                    <td>003</td>
                    <td>Rivoira</td>
                    <td>Federico</td>
                    <td>
                        <label class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input"/>
                            <span class="custom-control-indicator"></span>
                        </label>
                    </td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <th></th>
                    <th colspan="4">
                        <button class="btn btn-primary float-right">Apply</button>
                    </th>
                </tr>
            </tfoot>
        </table>
    </main>
  );
}



/*
https://github.com/rahuldhawani/react-gradient-timepicker


import TimePicker from "react-gradient-timepicker";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal } from "bootstrap";



    <Modal.Dialog>
        <Modal.Header>
            <Modal.Title>Lecture Schedule</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <form>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="inputEmail4">Day</label>
                        <select name="days" class="form-control" id="days">
                            <option value="monday">Monday</option>
                            <option value="tuesday">Tuesday</option>
                            <option value="wednesday">Wednesday</option>
                            <option value="thursday">Thursday</option>
                            <option value="friday">Friday</option>
                            <option value="saturday">Saturday</option>
                        </select>
                    </div>
                    <div class="form-group col-md-6">
                        <label for="inputPassword4">Start time</label>
                        <TimePicker
                            time="01:00"
                            theme="Bourbon"
                            className="timepicker form-control"
                            placeholder="Start Time"
                            onSet={(val) => {
                                alert("val:" + val.format12);
                            }}
                        />
                    </div>
                </div>
                <div class="form-group">
                    <label for="inputAddress">End Time</label>
                    <TimePicker
                        time="01:00"
                        theme="Bourbon"
                        className="timepicker form-control"
                        placeholder="Start Time"
                        onSet={(val) => {
                            alert("val:" + val.format12);
                        }}
                    />
                </div>
                    <div class="form-group">
                    <label for="inputAddress2">Remote</label>
                    <br />
                    <input type="checkbox" />
                    <label for="vehicle1">Yes/No</label>
                </div>
                <div class="form-row">
                    <div class="form-group col-md-6">
                        <label for="class-room">Classroom</label>
                        <select name="days" class="form-control" id="days">
                            <option value="c1">Classroom 1</option>
                            <option value="c2">Classroom 2</option>
                            <option value="c3">Classroom 3</option>
                            <option value="c4">Classroom 4</option>
                            <option value="c5">Classroom 5</option>
                            <option value="c6">Classroom 6</option>
                        </select>
                    </div>
                </div>
            </form>
        </Modal.Body>
        <Modal.Footer>
            <button type="submit" class="btn btn-primary">Apply</button>
        </Modal.Footer>
    </Modal.Dialog>
*/
