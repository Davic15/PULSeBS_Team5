import React from "react";
import "./styles.css";

import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';

export default function ContactTracingReport() {
  return(
    <div className="center-button">
      <h3>Contact Tracing Report Viewer</h3>
      <table className="table table-bordered">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Surnames</th>
                <th scope="col">Names</th>
                <th scope="col">Email</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td>Surname-one</td>
                <td>Name-one</td>
                <td>student1@gmail.com</td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td>Surname-two</td>
                <td>Name-one</td>
                <td>student2@gmail.com</td>
              </tr>
              <tr>
                <th scope="row">3</th>
                <td>Surname-three</td>
                <td>Name-three</td>
                <td>student3@gmail.com</td>
              </tr>
            </tbody>
          </table>
      <Button variant="primary">Download PDF</Button>
      <Button variant="info">Download CSV</Button>
    </div>
  );
}

